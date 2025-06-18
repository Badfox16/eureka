import type { RequestHandler } from 'express';
import { Questao } from '../models/questao';
import { Avaliacao } from '../models/avaliacao';
import type { CreateQuestaoInput, UpdateQuestaoInput } from '../schemas/questao.schema';
import { HttpError } from '../utils/error.utils';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import mongoose from 'mongoose';

// Função para formatar a resposta padrão
const formatResponse = (data: any, paginationData?: any) => {
  const response: any = { data };
  
  if (paginationData) {
    const { page, limit, total } = paginationData;
    const totalPages = Math.ceil(total / limit);
    
    response.pagination = {
      total,
      totalPages,
      currentPage: page,
      limit,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null
    };
  }
  
  return response;
};

// Função auxiliar para remover arquivo do disco local
const removeLocalFile = (filename: string | undefined | null) => {
  if (!filename) return;

  if (filename.startsWith('/uploads/')) {
    const actualFilename = filename.substring('/uploads/'.length);
    const filePath = path.resolve(__dirname, '..', '..', 'tmp', 'uploads', actualFilename);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Arquivo local removido: ${filePath}`);
      }
    } catch (err) {
      console.error(`❌ Erro ao remover arquivo local ${filePath}:`, err);
    }
  } else {
    console.warn(`⚠️ Formato de URL de arquivo local inesperado, não foi possível remover: ${filename}`);
  }
};

/**
 * Cria uma nova questão
 */
export const createQuestao: RequestHandler = async (req, res, next) => {
  try {
    const questaoData = req.body as CreateQuestaoInput;

    // Verificar se a avaliação existe
    const avaliacao = await Avaliacao.findById(questaoData.avaliacao);
    if (!avaliacao) {
      throw new HttpError('Avaliação associada não encontrada', 404, 'RELATED_RESOURCE_NOT_FOUND');
    }

    // Verificar se já existe uma questão com o mesmo número na mesma avaliação
    const exists = await Questao.findOne({
      numero: questaoData.numero,
      avaliacao: questaoData.avaliacao
    });
    
    if (exists) {
      throw new HttpError(
        `Já existe uma questão com o número ${questaoData.numero} nesta avaliação`, 
        409, 
        'DUPLICATE_RESOURCE'
      );
    }

    // Remover URLs de imagem (devem ser definidas por upload separado)
    delete (questaoData as any).imagemEnunciadoUrl;
    questaoData.alternativas.forEach(alt => delete (alt as any).imagemUrl);

    // Criar a questão
    const questao = await Questao.create(questaoData);

    // Adicionar a questão à avaliação
    await Avaliacao.findByIdAndUpdate(
      questaoData.avaliacao,
      { $push: { questoes: questao._id } }
    );

    res.status(201).json({ data: questao });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém todas as questões com opção de paginação e filtros
 */
export const getAllQuestoes: RequestHandler = async (req, res, next) => {
  try {
    // Parâmetros de paginação
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Filtros opcionais
    const filtro: any = {};
    
    // Filtro por avaliação
    if (req.query.avaliacao && typeof req.query.avaliacao === 'string') {
      if (mongoose.Types.ObjectId.isValid(req.query.avaliacao)) {
        filtro.avaliacao = req.query.avaliacao;
      } else {
        throw new HttpError('ID de avaliação inválido', 400, 'INVALID_ID');
      }
    }
    
    // Filtro por disciplina (através das avaliações)
    if (req.query.disciplina && typeof req.query.disciplina === 'string') {
      if (mongoose.Types.ObjectId.isValid(req.query.disciplina)) {
        const avaliacoes = await Avaliacao.find({ disciplina: req.query.disciplina }).select('_id');
        if (!avaliacoes.length) {
          // Retorna vazio se não houver avaliações para a disciplina
          res.status(200).json({ 
            data: [], 
            pagination: {
              total: 0,
              totalPages: 0,
              currentPage: page,
              limit,
              hasPrevPage: false,
              hasNextPage: false,
              prevPage: null,
              nextPage: null
            }
          });
          return;
        }
        filtro.avaliacao = { $in: avaliacoes.map(a => a._id) };
      } else {
        throw new HttpError('ID de disciplina inválido', 400, 'INVALID_ID');
      }
    }

    // Busca por texto, se fornecido
    if (req.query.search && typeof req.query.search === 'string') {
      const searchTerm = req.query.search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(searchTerm, 'i');
      
      filtro.$or = [
        { enunciado: { $regex: regex } },
        { explicacao: { $regex: regex } },
        { 'alternativas.texto': { $regex: regex } }
      ];
    }

    // Log do filtro para debug
    console.log('Filtro aplicado:', JSON.stringify(filtro, null, 2));

    const total = await Questao.countDocuments(filtro);
    console.log('Total de questões encontradas:', total);

    const questoes = await Questao.find(filtro)
      .populate({
        path: 'avaliacao',
        populate: { path: 'disciplina', select: 'nome codigo' }
      })
      .sort({ avaliacao: 1, numero: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log('Número de questões retornadas nesta página:', questoes.length);

    res.status(200).json(formatResponse(questoes, { page, limit, total }));
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém uma questão pelo ID
 */
export const getQuestaoById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('ID de questão inválido', 400, 'INVALID_ID');
    }

    const questao = await Questao.findById(id).populate({
      path: 'avaliacao',
      populate: { path: 'disciplina' }
    });

    if (!questao) {
      throw new HttpError('Questão não encontrada', 404, 'RESOURCE_NOT_FOUND');
    }

    res.status(200).json({ data: questao });
  } catch (error) {
    next(error);
  }
};

/**
 * Atualiza uma questão pelo ID
 */
export const updateQuestao: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateQuestaoInput;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('ID de questão inválido', 400, 'INVALID_ID');
    }

    // Buscar a questão original para comparações
    const questaoOriginal = await Questao.findById(id);
    if (!questaoOriginal) {
      throw new HttpError('Questão não encontrada para atualização', 404, 'RESOURCE_NOT_FOUND');
    }

    // Impedir atualização direta das URLs de imagem
    delete (updateData as any).imagemEnunciadoUrl;
    if (updateData.alternativas) {
      updateData.alternativas.forEach(alt => delete (alt as any).imagemUrl);
    }

    // Validar unicidade se número ou avaliação forem alterados
    const numeroAlterado = updateData.numero !== undefined && updateData.numero !== questaoOriginal.numero;
    const avaliacaoAlterada = updateData.avaliacao && updateData.avaliacao.toString() !== questaoOriginal.avaliacao.toString();

    if (numeroAlterado || avaliacaoAlterada) {
      const novaAvaliacaoId = avaliacaoAlterada 
        ? updateData.avaliacao!.toString() 
        : questaoOriginal.avaliacao.toString();
      
      const novoNumero = numeroAlterado 
        ? updateData.numero! 
        : questaoOriginal.numero;

      const exists = await Questao.findOne({
        numero: novoNumero,
        avaliacao: novaAvaliacaoId,
        _id: { $ne: id } // Excluir a própria questão
      });
      
      if (exists) {
        throw new HttpError(
          `Já existe uma questão com o número ${novoNumero} na avaliação destino`, 
          409, 
          'DUPLICATE_RESOURCE'
        );
      }
    }

    // Validar alternativas se estiverem sendo atualizadas
    if (updateData.alternativas) {
      const temAlternativaCorreta = updateData.alternativas.some(alt => alt.correta);
      const numCorretas = updateData.alternativas.filter(alt => alt.correta).length;
      
      if (!temAlternativaCorreta || numCorretas > 1) {
        throw new HttpError(
          'Deve haver exatamente uma alternativa correta',
          400,
          'VALIDATION_ERROR'
        );
      }
    }

    // Se a avaliação foi alterada, atualizar referências nas avaliações
    if (avaliacaoAlterada) {
      // Verificar se a nova avaliação existe
      const novaAvaliacaoExiste = await Avaliacao.exists({ _id: updateData.avaliacao });
      if (!novaAvaliacaoExiste) {
        throw new HttpError(
          'Nova avaliação de destino não encontrada',
          404,
          'RELATED_RESOURCE_NOT_FOUND'
        );
      }

      // Remover da avaliação antiga
      await Avaliacao.findByIdAndUpdate(
        questaoOriginal.avaliacao,
        { $pull: { questoes: id } }
      );
      
      // Adicionar à nova avaliação
      await Avaliacao.findByIdAndUpdate(
        updateData.avaliacao!,
        { $push: { questoes: id } }
      );
    }

    // Atualizar a questão
    const updatedQuestao = await Questao.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ data: updatedQuestao });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove uma questão pelo ID
 */
export const deleteQuestao: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('ID de questão inválido', 400, 'INVALID_ID');
    }

    // Buscar a questão para obter URLs de imagem e referência da avaliação
    const questao = await Questao.findById(id);
    if (!questao) {
      throw new HttpError('Questão não encontrada para remoção', 404, 'RESOURCE_NOT_FOUND');
    }

    // Remover a referência da questão na avaliação
    await Avaliacao.findByIdAndUpdate(
      questao.avaliacao,
      { $pull: { questoes: id } }
    );

    // Remover a questão do banco de dados
    await Questao.findByIdAndDelete(id);

    // Remover imagens associadas do disco local
    removeLocalFile(questao.imagemEnunciadoUrl);
    if (questao.alternativas) {
      questao.alternativas.forEach(alt => removeLocalFile(alt.imagemUrl));
    }

    res.status(200).json({
      data: null,
      message: 'Questão removida com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Busca questões por termo de pesquisa
 */
export const searchQuestoes: RequestHandler = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim() === '') {
      throw new HttpError(
        'Termo de busca (parâmetro "q") é obrigatório',
        400,
        'INVALID_QUERY_PARAM'
      );
    }
    
    const searchTerm = q.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(searchTerm, 'i');

    const questoes = await Questao.find({
      $or: [
        { enunciado: { $regex: regex } },
        { explicacao: { $regex: regex } },
        { 'alternativas.texto': { $regex: regex } }
      ]
    }).populate({
      path: 'avaliacao',
      populate: { path: 'disciplina' }
    }).limit(50);

    res.status(200).json({
      data: questoes,
      pagination: {
        total: questoes.length,
        totalPages: 1,
        currentPage: 1,
        limit: 50,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Importa questões em massa para uma avaliação
 */
export const importarQuestoes: RequestHandler = async (req, res, next) => {
  try {
    const { avaliacaoId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(avaliacaoId)) {
      throw new HttpError('ID de avaliação inválido', 400, 'INVALID_ID');
    }

    if (!Array.isArray(req.body.questoes) || req.body.questoes.length === 0) {
      throw new HttpError(
        'O corpo da requisição deve conter um array "questoes" não vazio',
        400,
        'VALIDATION_ERROR'
      );
    }
    
    const questoesInput = req.body.questoes as CreateQuestaoInput[];

    // Verificar se a avaliação existe
    const avaliacao = await Avaliacao.findById(avaliacaoId);
    if (!avaliacao) {
      throw new HttpError(
        'Avaliação de destino não encontrada',
        404,
        'RELATED_RESOURCE_NOT_FOUND'
      );
    }

    // Verificar números de questões já existentes nesta avaliação
    const numerosExistentes = await Questao.find({ avaliacao: avaliacaoId }).select('numero').lean();
    const numerosSet = new Set(numerosExistentes.map(q => q.numero));

    const questoesParaInserir: CreateQuestaoInput[] = [];
    const rejeitadas: { numero: number, motivo: string }[] = [];

    for (const qInput of questoesInput) {
      // Validação básica da questão individual
      if (numerosSet.has(qInput.numero)) {
        rejeitadas.push({ 
          numero: qInput.numero, 
          motivo: 'Número duplicado nesta avaliação' 
        });
      } else if (!qInput.numero || !qInput.enunciado || !Array.isArray(qInput.alternativas) || qInput.alternativas.length < 2) {
        rejeitadas.push({ 
          numero: qInput.numero || -1, 
          motivo: 'Dados incompletos ou inválidos' 
        });
      } else if (qInput.alternativas.filter(a => a.correta).length !== 1) {
        rejeitadas.push({ 
          numero: qInput.numero, 
          motivo: 'Deve ter exatamente uma alternativa correta' 
        });
      } else {
        // Garantir que URLs de imagem não sejam importadas diretamente
        delete (qInput as any).imagemEnunciadoUrl;
        qInput.alternativas.forEach(alt => delete (alt as any).imagemUrl);

        questoesParaInserir.push({ ...qInput, avaliacao: avaliacaoId });
        numerosSet.add(qInput.numero); // Adiciona ao set para evitar duplicação dentro do lote
      }
    }

    if (questoesParaInserir.length === 0) {
      throw new HttpError(
        'Nenhuma questão válida para importar',
        400,
        'VALIDATION_ERROR',
        { rejeitadas }
      );
    }

    // Criar as questões válidas
    const questoesCriadas = await Questao.insertMany(questoesParaInserir);

    // Atualizar a avaliação com as novas questões
    await Avaliacao.findByIdAndUpdate(
      avaliacaoId,
      { $push: { questoes: { $each: questoesCriadas.map(q => q._id) } } }
    );

    res.status(201).json({
      data: questoesCriadas,
      message: `${questoesCriadas.length} questões importadas com sucesso. ${rejeitadas.length} foram rejeitadas.`,
      meta: {
        importadas: questoesCriadas.length,
        rejeitadas: rejeitadas.length > 0 ? rejeitadas : undefined
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload de imagem para o enunciado da questão
 */
export const uploadImagemEnunciado: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      if (file) removeLocalFile(`/uploads/${file.filename}`);
      throw new HttpError('ID de questão inválido', 400, 'INVALID_ID');
    }

    if (!file) {
      throw new HttpError('Nenhum arquivo foi enviado', 400, 'MISSING_FILE');
    }

    const filename = file.filename;
    const imageUrl = `/uploads/${filename}`;

    // Buscar questão para garantir que existe e remover imagem antiga se houver
    const questaoOriginal = await Questao.findById(id);
    if (!questaoOriginal) {
      removeLocalFile(imageUrl);
      throw new HttpError(
        'Questão não encontrada para associar a imagem',
        404,
        'RESOURCE_NOT_FOUND'
      );
    }

    // Remove a imagem antiga do disco, se existir
    removeLocalFile(questaoOriginal.imagemEnunciadoUrl);

    // Atualizar o documento Questao no MongoDB com a nova URL
    const questaoAtualizada = await Questao.findByIdAndUpdate(
      id,
      { $set: { imagemEnunciadoUrl: imageUrl } },
      { new: true }
    );

    if (!questaoAtualizada) {
      removeLocalFile(imageUrl);
      throw new HttpError(
        'Falha ao atualizar a questão com a URL da imagem',
        500,
        'UPDATE_FAILED'
      );
    }

    res.status(200).json({
      data: { imageUrl },
      message: 'Imagem do enunciado carregada com sucesso'
    });
  } catch (error) {
    // Capturar erros do Multer ou outros
    if (error instanceof multer.MulterError) {
      next(new HttpError(
        `Erro no upload: ${error.message}`,
        400,
        `UPLOAD_ERROR_${error.code}`
      ));
    } else {
      // Se req.file existir mesmo com erro, remover o arquivo
      if (req.file) {
        removeLocalFile(`/uploads/${req.file.filename}`);
      }
      next(error);
    }
  }
};

/**
 * Upload de imagem para uma alternativa específica
 */
export const uploadImagemAlternativa: RequestHandler = async (req, res, next) => {
  try {
    const { id, letra } = req.params;
    const file = req.file;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      if (file) removeLocalFile(`/uploads/${file.filename}`);
      throw new HttpError('ID de questão inválido', 400, 'INVALID_ID');
    }

    if (!file) {
      throw new HttpError('Nenhum arquivo foi enviado', 400, 'MISSING_FILE');
    }

    if (!letra || letra.length !== 1) {
      removeLocalFile(`/uploads/${file.filename}`);
      throw new HttpError('A letra da alternativa é inválida', 400, 'INVALID_PARAM');
    }

    const filename = file.filename;
    const imageUrl = `/uploads/${filename}`;

    // Encontrar a questão e a alternativa específica
    const questao = await Questao.findById(id);
    if (!questao) {
      removeLocalFile(imageUrl);
      throw new HttpError('Questão não encontrada', 404, 'RESOURCE_NOT_FOUND');
    }

    const alternativaIndex = questao.alternativas.findIndex(
      alt => alt.letra.toUpperCase() === letra.toUpperCase()
    );
    
    if (alternativaIndex === -1) {
      removeLocalFile(imageUrl);
      throw new HttpError(
        `Alternativa com a letra '${letra}' não encontrada nesta questão`,
        404,
        'RELATED_RESOURCE_NOT_FOUND'
      );
    }

    // Remove a imagem antiga da alternativa, se existir
    const alternativaOriginal = questao.alternativas[alternativaIndex];
    removeLocalFile(alternativaOriginal.imagemUrl);

    // Atualizar apenas a URL da imagem da alternativa específica
    const updateField = `alternativas.${alternativaIndex}.imagemUrl`;
    const updateResult = await Questao.updateOne(
      { _id: id, 'alternativas.letra': alternativaOriginal.letra },
      { $set: { [updateField]: imageUrl } }
    );

    if (updateResult.modifiedCount === 0) {
      removeLocalFile(imageUrl);
      throw new HttpError(
        'Falha ao atualizar a URL da imagem da alternativa',
        500,
        'UPDATE_FAILED'
      );
    }

    res.status(200).json({
      data: { imageUrl },
      message: `Imagem da alternativa '${alternativaOriginal.letra}' carregada com sucesso`
    });
  } catch (error) {
    if (error instanceof multer.MulterError) {
      next(new HttpError(
        `Erro no upload: ${error.message}`,
        400,
        `UPLOAD_ERROR_${error.code}`
      ));
    } else {
      if (req.file) {
        removeLocalFile(`/uploads/${req.file.filename}`);
      }
      next(error);
    }
  }
};