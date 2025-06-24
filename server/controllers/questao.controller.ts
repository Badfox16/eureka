import type { RequestHandler } from 'express';
import { removeFile } from '../utils/s3-helper';
import { formatResponse } from '../utils/response.utils';
import mongoose from 'mongoose';
import { HttpError } from '../utils/error.utils';
import { Questao } from '../models/questao';
import { Avaliacao } from '../models/avaliacao';
import type { CreateQuestaoInput, UpdateQuestaoInput } from '../schemas/questao.schema';
import path from 'path';
import fs from 'fs';
import { s3BaseUrl } from '../config/aws';
// Função auxiliar para remover arquivo do disco local
const removeLocalFile = removeFile;

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

    res.status(201).json(formatResponse(questao, undefined, 'Questão criada com sucesso'));
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

    const total = await Questao.countDocuments(filtro);

    const questoes = await Questao.find(filtro)
      .populate({
        path: 'avaliacao',
        populate: { path: 'disciplina', select: 'nome codigo' }
      })
      .sort({ avaliacao: 1, numero: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

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

    res.status(200).json(formatResponse(questao));
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

    res.status(200).json(formatResponse(updatedQuestao, undefined, 'Questão atualizada com sucesso'));
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

    res.status(200).json(formatResponse(null, undefined, 'Questão removida com sucesso'));
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

    res.status(200).json(formatResponse(questoes, {
      total: questoes.length,
      totalPages: 1,
      currentPage: 1,
      limit: 50
    }));
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

    res.status(201).json(formatResponse(
      questoesCriadas, 
      undefined,
      `${questoesCriadas.length} questões importadas com sucesso. ${rejeitadas.length} foram rejeitadas.`
    ));
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
    const { imagemTemporariaUrl } = req.body;
    const file = req.file;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('ID de questão inválido', 400, 'INVALID_ID');
    }

    // Verificar se pelo menos um dos parâmetros foi fornecido
    if (!file && !imagemTemporariaUrl) {
      throw new HttpError(
        'É necessário fornecer um arquivo ou uma URL de imagem temporária', 
        400, 
        'NO_IMAGE_PROVIDED'
      );
    }

    // Buscar a questão
    const questaoOriginal = await Questao.findById(id);
    console.log(questaoOriginal?.numero);
    
    if (!questaoOriginal) {
      throw new HttpError(
        'Questão não encontrada para associar a imagem',
        404,
        'RESOURCE_NOT_FOUND'
      );
    }

    let imageUrl = '';

    if (file) {
      // Caso 1: Upload de nova imagem
      if ('location' in file && typeof file.location === 'string') {
        // Usando S3 com a location diretamente (quando disponível)
        imageUrl = file.location;
        console.log('Upload S3 com location:', file.location);
        console.log('URL completa:', imageUrl);
      } else if ('key' in file && typeof file.key === 'string') {
        // Usando S3 com o novo multerS3 sem ACL (que retorna a key em vez de location)
        imageUrl = `${s3BaseUrl}${file.key}`;
        console.log('Upload S3 com key:', file.key);
        console.log('URL completa:', imageUrl);
      } else {
        // Usando armazenamento local
        imageUrl = `/uploads/${file.filename}`;
        console.log('Upload local:', file.path);
        console.log('URL relativa:', imageUrl);
      }
    } else {
      // Caso 2: Usando imagem temporária existente
      imageUrl = imagemTemporariaUrl;
      console.log(imageUrl);
      
      // Verificar se a imagem temporária existe
      const caminhoAbsoluto = path.resolve(
        __dirname, '..', '..', 'tmp', 'uploads', 
        path.basename(imagemTemporariaUrl)
      );
      
      if (!fs.existsSync(caminhoAbsoluto)) {
        throw new HttpError(
          'Imagem temporária não encontrada', 
          404, 
          'FILE_NOT_FOUND'
        );
      }
    }

    // Remover a imagem antiga, se existir e for diferente da temporária
    if (questaoOriginal.imagemEnunciadoUrl && 
        questaoOriginal.imagemEnunciadoUrl !== imageUrl) {
      try {
        await removeFile(questaoOriginal.imagemEnunciadoUrl);
        console.log('Imagem antiga removida:', questaoOriginal.imagemEnunciadoUrl);
      } catch (error) {
        console.error('Erro ao remover imagem antiga:', error);
        // Não interromper o fluxo se falhar ao remover a imagem antiga
      }
    }

    // Atualizar o documento no MongoDB com a nova URL
    const questaoAtualizada = await Questao.findByIdAndUpdate(
      id,
      { $set: { imagemEnunciadoUrl: imageUrl } },
      { new: true }
    );

     console.log('Questão atualizada:', {
      id: questaoAtualizada?._id,
      numero: questaoAtualizada?.numero,
      temImagem: !!questaoAtualizada?.imagemEnunciadoUrl,
      imagemUrl: questaoAtualizada?.imagemEnunciadoUrl
    });

    if (!questaoAtualizada) {
      throw new HttpError(
        'Falha ao atualizar a questão com a URL da imagem',
        500,
        'UPDATE_FAILED'
      );
    }

    res.status(200).json(formatResponse(
      { imageUrl },
      undefined,
      'Imagem do enunciado atualizada com sucesso'
    ));
  } catch (error) {
    console.error('Erro no upload de imagem:', error);
    next(error);
  }
};

/**
 * Upload ou associação de imagem para uma alternativa específica
 * Aceita tanto um novo upload quanto uma URL temporária existente
 */
export const uploadImagemAlternativa: RequestHandler = async (req, res, next) => {
  try {
    const { id, letra } = req.params;
    const { imagemTemporariaUrl } = req.body;
    const file = req.file;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('ID de questão inválido', 400, 'INVALID_ID');
    }

    if (!letra || !/^[A-E]$/i.test(letra)) {
      throw new HttpError('Letra da alternativa é inválida (A-E)', 400, 'INVALID_PARAMETER');
    }

    // Verificar se pelo menos um dos parâmetros foi fornecido
    if (!file && !imagemTemporariaUrl) {
      throw new HttpError(
        'É necessário fornecer um arquivo ou uma URL de imagem temporária', 
        400, 
        'NO_IMAGE_PROVIDED'
      );
    }

    // Buscar a questão
    const questao = await Questao.findById(id);
    if (!questao) {
      throw new HttpError('Questão não encontrada', 404, 'RESOURCE_NOT_FOUND');
    }

    // Encontrar a alternativa com a letra correspondente
    const alternativaIndex = questao.alternativas.findIndex(alt => 
      alt.letra.toUpperCase() === letra.toUpperCase()
    );
    
    if (alternativaIndex === -1) {
      throw new HttpError('Alternativa não encontrada', 404, 'RESOURCE_NOT_FOUND');
    }

    let imageUrl = '';

    if (file) {
      // Caso 1: Upload de nova imagem
      if ('location' in file && typeof file.location === 'string') {
        // Usando S3 com a location diretamente (quando disponível)
        imageUrl = file.location;
      } else if ('key' in file && typeof file.key === 'string') {
        // Usando S3 com o novo multerS3 sem ACL (que retorna a key em vez de location)
        imageUrl = `${s3BaseUrl}${file.key}`;
        console.log('Upload S3 com key:', file.key);
        console.log('URL completa:', imageUrl);
      } else {
        // Usando armazenamento local
        imageUrl = `/uploads/${file.filename}`;
        console.log('Upload local:', file.path);
        console.log('URL relativa:', imageUrl);
      }
    } else {
      // Caso 2: Usando imagem temporária existente
      imageUrl = imagemTemporariaUrl;
      
      // Verificar se a imagem temporária existe
      const caminhoAbsoluto = path.resolve(
        __dirname, '..', '..', 'tmp', 'uploads', 
        path.basename(imagemTemporariaUrl)
      );
      
      if (!fs.existsSync(caminhoAbsoluto)) {
        throw new HttpError(
          'Imagem temporária não encontrada', 
          404, 
          'FILE_NOT_FOUND'
        );
      }
    }

    // Remover a imagem antiga, se existir e for diferente da temporária
    if (questao.alternativas[alternativaIndex].imagemUrl && 
        questao.alternativas[alternativaIndex].imagemUrl !== imageUrl) {
      await removeFile(questao.alternativas[alternativaIndex].imagemUrl);
    }

    // Atualizar a URL da imagem da alternativa
    questao.alternativas[alternativaIndex].imagemUrl = imageUrl;
    await questao.save();

    res.status(200).json(formatResponse(
      { imageUrl },
      undefined,
      `Imagem da alternativa ${letra.toUpperCase()} atualizada com sucesso`
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * Upload temporário de imagem para novas questões
 * Usado para pré-visualização antes de criar a questão
 */
export const uploadTempImagem: RequestHandler = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      throw new HttpError('Nenhum arquivo enviado', 400, 'NO_FILE_UPLOADED');
    }

    // For temporary uploads, we're always using local storage
    const filename = file.filename;
    const imageUrl = `/uploads/${filename}`;

    // Return the image URL to the client using formatResponse
    res.status(200).json(formatResponse(
      { imageUrl },
      undefined,
      'Imagem temporária carregada com sucesso'
    ));
  } catch (error) {
    next(error);
  }
};