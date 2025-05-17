import type { RequestHandler } from 'express';
import { Questao } from '../models/questao'; //
import { Avaliacao } from '../models/avaliacao'; //
import type { CreateQuestaoInput, UpdateQuestaoInput, Alternativa } from '../schemas/questao.schema'; //
import { paginationSchema } from '../schemas/common.schema'; //
import fs from 'fs'; // Para manipulação de arquivos (ex: deletar imagem)
import path from 'path'; // Para manipulação de caminhos
import multer from 'multer'; // Para tratar erros específicos do Multer

// --- Classe de Erro Personalizada ---
class HttpError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

// --- Funções Auxiliares ---

// Função para remover arquivo do disco local
const removeLocalFile = (filename: string | undefined | null) => {
    if (!filename) return; // Ignora se não houver nome de arquivo

    // Constrói o caminho completo baseado na URL relativa (/uploads/...)
    // Assume que a URL sempre começa com /uploads/
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
            // Não lançar erro aqui para não interromper o fluxo principal (ex: deleção da questão)
        }
    } else {
        console.warn(`⚠️ Formato de URL de arquivo local inesperado, não foi possível remover: ${filename}`);
    }
};


// --- Controladores CRUD ---

/**
 * Cria uma nova questão
 */
export const createQuestao: RequestHandler = async (req, res, next) => {
  try {
    const questaoData = req.body as CreateQuestaoInput; //

    // Verificar se a avaliação existe
    const avaliacao = await Avaliacao.findById(questaoData.avaliacao); //
    if (!avaliacao) {
      throw new HttpError('Avaliação associada não encontrada', 404, 'RELATED_RESOURCE_NOT_FOUND'); //
    }

    // Verificar se já existe uma questão com o mesmo número na mesma avaliação
    const exists = await Questao.findOne({
      numero: questaoData.numero, //
      avaliacao: questaoData.avaliacao //
    }); //
    if (exists) {
      throw new HttpError(`Já existe uma questão com o número ${questaoData.numero} nesta avaliação`, 409, 'DUPLICATE_RESOURCE'); //
    }

    // NOTA: As URLs de imagem (imagemEnunciadoUrl, alternativas.imagemUrl)
    // normalmente NÃO seriam definidas diretamente aqui. Elas são definidas
    // pelas rotas de upload separadas. Se você permitir defini-las aqui,
    // adicione validação extra para garantir que as URLs sejam válidas.
    // Por segurança, vamos garantir que elas não sejam definidas indevidamente na criação.
    delete (questaoData as any).imagemEnunciadoUrl;
    questaoData.alternativas.forEach(alt => delete (alt as any).imagemUrl);


    // Criar a questão
    const questao = await Questao.create(questaoData); //

    // Adicionar a questão à avaliação
    await Avaliacao.findByIdAndUpdate(
      questaoData.avaliacao,
      { $push: { questoes: questao._id } } //
    ); //

    res.status(201).json({
      status: 'success',
      data: questao
    });
  } catch (error) {
    next(error); //
  }
};

/**
 * Obtém todas as questões com opção de paginação e filtros
 */
export const getAllQuestoes: RequestHandler = async (req, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse({
      page: Number(req.query.page || 1), //
      limit: Number(req.query.limit || 10) //
    }); //

    // Filtros opcionais
    const filtro: any = {};
    if (req.query.avaliacao && typeof req.query.avaliacao === 'string') { //
      filtro.avaliacao = req.query.avaliacao; //
    }
    if (req.query.disciplina && typeof req.query.disciplina === 'string') { //
      const avaliacoes = await Avaliacao.find({ disciplina: req.query.disciplina }).select('_id'); //
      if (!avaliacoes.length) {
        // Retorna vazio se não houver avaliações para a disciplina
        res.status(200).json({ status: 'success', data: [], meta: { total: 0, page, limit, pages: 0 } });
        return;
      }
      filtro.avaliacao = { $in: avaliacoes.map(a => a._id) }; //
    }

    const total = await Questao.countDocuments(filtro); //
    const questoes = await Questao.find(filtro) //
      .populate({ // Popula avaliação e a disciplina dentro da avaliação
          path: 'avaliacao',
          populate: { path: 'disciplina', select: 'nome codigo' } // Seleciona campos específicos
      })
      .sort({ avaliacao: 1, numero: 1 }) //
      .skip((page - 1) * limit) //
      .limit(limit); //

    res.status(200).json({
      status: 'success',
      data: questoes,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) //
      }
    });
  } catch (error) {
    next(error); //
  }
};

/**
 * Obtém uma questão pelo ID
 */
export const getQuestaoById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params; // Validado pelo middleware validateId

    const questao = await Questao.findById(id).populate({ //
      path: 'avaliacao', //
      populate: { path: 'disciplina' } //
    }); //

    if (!questao) {
      throw new HttpError('Questão não encontrada', 404, 'NOT_FOUND'); //
    }

    res.status(200).json({
      status: 'success',
      data: questao
    });
  } catch (error) {
    next(error); //
  }
};

/**
 * Atualiza uma questão pelo ID
 */
export const updateQuestao: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params; // Validado
    const updateData = req.body as UpdateQuestaoInput; // Validado

    // Buscar a questão original para comparações e obter referência da avaliação antiga
    const questaoOriginal = await Questao.findById(id); //
    if (!questaoOriginal) {
      throw new HttpError('Questão não encontrada para atualização', 404, 'NOT_FOUND'); //
    }

    // Impedir atualização direta das URLs de imagem por aqui (devem usar rotas de upload)
    delete (updateData as any).imagemEnunciadoUrl;
    if (updateData.alternativas) {
        updateData.alternativas.forEach(alt => delete (alt as any).imagemUrl);
    }

    // Validar unicidade se número ou avaliação forem alterados
    const numeroAlterado = updateData.numero !== undefined && updateData.numero !== questaoOriginal.numero; //
    const avaliacaoAlterada = updateData.avaliacao && updateData.avaliacao.toString() !== questaoOriginal.avaliacao.toString(); //

    if (numeroAlterado || avaliacaoAlterada) {
      const novaAvaliacaoId = avaliacaoAlterada ? updateData.avaliacao!.toString() : questaoOriginal.avaliacao.toString(); //
      const novoNumero = numeroAlterado ? updateData.numero! : questaoOriginal.numero; //

      const exists = await Questao.findOne({
        numero: novoNumero, //
        avaliacao: novaAvaliacaoId, //
        _id: { $ne: id } // Excluir a própria questão
      }); //
      if (exists) {
        throw new HttpError(`Já existe uma questão com o número ${novoNumero} na avaliação destino`, 409, 'DUPLICATE_RESOURCE'); //
      }
    }

    // Validar alternativas se estiverem sendo atualizadas
    if (updateData.alternativas) {
      const temAlternativaCorreta = updateData.alternativas.some(alt => alt.correta); //
      const numCorretas = updateData.alternativas.filter(alt => alt.correta).length;
      if (!temAlternativaCorreta || numCorretas > 1) {
         throw new HttpError('Deve haver exatamente uma alternativa correta', 400, 'VALIDATION_ERROR'); //
      }
    }

    // Se a avaliação foi alterada, atualizar referências nas avaliações
    if (avaliacaoAlterada) {
      // Remover da avaliação antiga
      await Avaliacao.findByIdAndUpdate(
        questaoOriginal.avaliacao, //
        { $pull: { questoes: id } } //
      ); //
      // Adicionar à nova avaliação (verificar se a nova avaliação existe)
      const novaAvaliacao = await Avaliacao.findByIdAndUpdate(
        updateData.avaliacao!, //
        { $push: { questoes: id } } //
      ); //
      if (!novaAvaliacao) {
          // Reverter a remoção da avaliação antiga seria complexo, melhor lançar erro.
           throw new HttpError('Nova avaliação de destino não encontrada ao tentar mover a questão', 404, 'RELATED_RESOURCE_NOT_FOUND');
      }
    }

    // Atualizar a questão
    const updatedQuestao = await Questao.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } //
    ); //

     if (!updatedQuestao) {
        // Caso raro onde a questão desaparece entre o find e o update
        throw new HttpError('Falha ao atualizar a questão, recurso não encontrado após tentativa.', 404, 'NOT_FOUND');
    }

    res.status(200).json({
      status: 'success',
      data: updatedQuestao
    });
  } catch (error) {
    next(error); //
  }
};

/**
 * Remove uma questão pelo ID
 */
export const deleteQuestao: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params; // Validado

    // Buscar a questão para obter URLs de imagem e referência da avaliação
    const questao = await Questao.findById(id); //
    if (!questao) {
      throw new HttpError('Questão não encontrada para remoção', 404, 'NOT_FOUND'); //
    }

    // Remover a referência da questão na avaliação
    await Avaliacao.findByIdAndUpdate(
      questao.avaliacao, //
      { $pull: { questoes: id } } //
    ); //

    // Remover a questão do banco de dados
    await Questao.findByIdAndDelete(id); //

    // --- Remover imagens associadas do disco local ---
    removeLocalFile(questao.imagemEnunciadoUrl);
    if (questao.alternativas) {
        questao.alternativas.forEach(alt => removeLocalFile(alt.imagemUrl));
    }
    // --- Fim da remoção de imagens ---

    res.status(200).json({
      status: 'success',
      message: 'Questão removida com sucesso' //
    });
  } catch (error) {
    next(error); //
  }
};


// --- Controladores Adicionais ---

/**
 * Busca questões por termo de pesquisa no enunciado, explicação ou alternativas
 */
export const searchQuestoes: RequestHandler = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim() === '') { //
      throw new HttpError('Termo de busca (parâmetro "q") é obrigatório', 400, 'INVALID_QUERY_PARAM'); //
    }
    const searchTerm = q.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // Escapar regex
    const regex = new RegExp(searchTerm, 'i'); // Case-insensitive

    const questoes = await Questao.find({
      $or: [
        { enunciado: { $regex: regex } }, //
        { explicacao: { $regex: regex } }, //
        { 'alternativas.texto': { $regex: regex } } //
      ]
    }).populate({ //
      path: 'avaliacao', //
      populate: { path: 'disciplina' } //
    }).limit(50); // Limitar resultados da busca

    res.status(200).json({
      status: 'success',
      data: questoes,
      meta: {
        total: questoes.length,
        searchTerm: q
      }
    });
  } catch (error) {
    next(error); //
  }
};

/**
 * Importa questões em massa para uma avaliação
 */
export const importarQuestoes: RequestHandler = async (req, res, next) => {
  try {
    const { avaliacaoId } = req.params; // Validado
    // Validar o corpo da requisição aqui ou usar um schema Zod específico no middleware
     if (!Array.isArray(req.body.questoes) || req.body.questoes.length === 0) {
         throw new HttpError('O corpo da requisição deve conter um array "questoes" não vazio.', 400, 'VALIDATION_ERROR');
     }
    const questoesInput = req.body.questoes as CreateQuestaoInput[]; //

    // Verificar se a avaliação existe
    const avaliacao = await Avaliacao.findById(avaliacaoId); //
    if (!avaliacao) {
      throw new HttpError('Avaliação de destino não encontrada', 404, 'RELATED_RESOURCE_NOT_FOUND'); //
    }

    // Verificar números de questões já existentes nesta avaliação
    const numerosExistentes = await Questao.find({ avaliacao: avaliacaoId }).select('numero').lean(); //
    const numerosSet = new Set(numerosExistentes.map(q => q.numero)); //

    const questoesParaInserir: CreateQuestaoInput[] = [];
    const rejeitadas: { numero: number, motivo: string }[] = [];

    for (const qInput of questoesInput) {
        // Validação básica da questão individual (poderia usar Zod aqui também)
        if (numerosSet.has(qInput.numero)) {
            rejeitadas.push({ numero: qInput.numero, motivo: 'Número duplicado nesta avaliação' });
        } else if (!qInput.numero || !qInput.enunciado || !Array.isArray(qInput.alternativas) || qInput.alternativas.length < 2) {
             rejeitadas.push({ numero: qInput.numero || -1, motivo: 'Dados incompletos ou inválidos' });
        } else if (qInput.alternativas.filter(a => a.correta).length !== 1) {
             rejeitadas.push({ numero: qInput.numero, motivo: 'Deve ter exatamente uma alternativa correta' });
        } else {
            // Garante que URLs de imagem não sejam importadas diretamente
             delete (qInput as any).imagemEnunciadoUrl;
             qInput.alternativas.forEach(alt => delete (alt as any).imagemUrl);

            questoesParaInserir.push({ ...qInput, avaliacao: avaliacaoId }); // Adiciona ID da avaliação
            numerosSet.add(qInput.numero); // Adiciona ao set para evitar duplicação dentro do lote
        }
    }


    if (questoesParaInserir.length === 0) {
      throw new HttpError('Nenhuma questão válida para importar.', 400, 'VALIDATION_ERROR');
    }

    // Criar as questões válidas
    const questoesCriadas = await Questao.insertMany(questoesParaInserir); //

    // Atualizar a avaliação com as novas questões
    await Avaliacao.findByIdAndUpdate(
      avaliacaoId,
      { $push: { questoes: { $each: questoesCriadas.map(q => q._id) } } } //
    ); //

    res.status(201).json({
      status: 'success',
      message: `${questoesCriadas.length} questões importadas com sucesso. ${rejeitadas.length} foram rejeitadas.`, //
      data: questoesCriadas,
      meta: {
        importadas: questoesCriadas.length,
        rejeitadas: rejeitadas.length > 0 ? rejeitadas : undefined
      }
    });
  } catch (error) {
    next(error); //
  }
};


// --- Controladores de Upload de Imagem ---

/**
 * Upload de imagem para o enunciado da questão
 */
export const uploadImagemEnunciado: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params; // Validado
        const file = req.file; // Arquivo via Multer

        if (!file) {
            throw new HttpError('Nenhum arquivo foi enviado.', 400, 'MISSING_FILE');
        }

        const filename = file.filename; // Nome do arquivo salvo no disco
        const imageUrl = `/uploads/${filename}`; // URL relativa

        // Buscar questão para garantir que existe e remover imagem antiga se houver
        const questaoOriginal = await Questao.findById(id);
        if (!questaoOriginal) {
             // Se não encontrou a questão, remove o arquivo que acabou de ser salvo
             removeLocalFile(imageUrl);
            throw new HttpError('Questão não encontrada para associar a imagem.', 404, 'NOT_FOUND');
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
            // Caso raro, mas se falhar, remover o arquivo recém-criado
            removeLocalFile(imageUrl);
            throw new HttpError('Falha ao atualizar a questão com a URL da imagem.', 500, 'UPDATE_FAILED');
        }

        res.status(200).json({
            status: 'success',
            message: 'Imagem do enunciado carregada com sucesso.',
            data: { imageUrl }
        });

    } catch (error) {
        // Capturar erros do Multer ou outros
        if (error instanceof multer.MulterError) {
             next(new HttpError(`Erro no upload: ${error.message}`, 400, `UPLOAD_ERROR_${error.code}`));
        } else {
            // Se req.file existir mesmo com erro (ex: HttpError lançado antes), remover o arquivo
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
        const { id, letra } = req.params; // Validado ID, 'letra' é string
        const file = req.file;

        if (!file) {
            throw new HttpError('Nenhum arquivo foi enviado.', 400, 'MISSING_FILE');
        }
         if (!letra || letra.length !== 1) {
             removeLocalFile(`/uploads/${file.filename}`); // Remove arquivo recém-criado
             throw new HttpError('A letra da alternativa é inválida.', 400, 'INVALID_PARAM');
         }

        const filename = file.filename;
        const imageUrl = `/uploads/${filename}`;

        // Encontrar a questão e a alternativa específica
        const questao = await Questao.findById(id);
        if (!questao) {
             removeLocalFile(imageUrl);
            throw new HttpError('Questão não encontrada.', 404, 'NOT_FOUND');
        }

        const alternativaIndex = questao.alternativas.findIndex(alt => alt.letra.toUpperCase() === letra.toUpperCase()); //
        if (alternativaIndex === -1) {
            removeLocalFile(imageUrl);
            throw new HttpError(`Alternativa com a letra '${letra}' não encontrada nesta questão.`, 404, 'RELATED_RESOURCE_NOT_FOUND');
        }

        // Remove a imagem antiga da alternativa, se existir
        const alternativaOriginal = questao.alternativas[alternativaIndex];
        removeLocalFile(alternativaOriginal.imagemUrl);

        // Atualizar apenas a URL da imagem da alternativa específica
        // Usar notação de ponto para atualizar elemento do array
        const updateField = `alternativas.${alternativaIndex}.imagemUrl`;
        const updateResult = await Questao.updateOne(
            { _id: id, 'alternativas.letra': alternativaOriginal.letra }, // Garantir que a alternativa ainda existe
            { $set: { [updateField]: imageUrl } }
        );

        if (updateResult.modifiedCount === 0) {
            // Se nada foi modificado (talvez a alternativa foi removida concorrentemente?)
            removeLocalFile(imageUrl);
             throw new HttpError('Falha ao atualizar a URL da imagem da alternativa.', 500, 'UPDATE_FAILED');
        }

        res.status(200).json({
            status: 'success',
            message: `Imagem da alternativa '${alternativaOriginal.letra}' carregada com sucesso.`,
            data: { imageUrl }
        });

    } catch (error) {
         if (error instanceof multer.MulterError) {
             next(new HttpError(`Erro no upload: ${error.message}`, 400, `UPLOAD_ERROR_${error.code}`));
         } else {
            if (req.file) {
                 removeLocalFile(`/uploads/${req.file.filename}`);
            }
            next(error);
         }
    }
};