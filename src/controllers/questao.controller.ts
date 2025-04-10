import type { RequestHandler } from 'express';
import { Questao } from '../models/questao';
import { Avaliacao } from '../models/avaliacao';
import type { CreateQuestaoInput, UpdateQuestaoInput } from '../schemas/questao.schema';
import { paginationSchema } from '../schemas/common.schema';

/**
 * Cria uma nova questão
 */
export const createQuestao: RequestHandler = async (req, res, next) => {
  try {
    const questaoData = req.body as CreateQuestaoInput;
    
    // Verificar se a avaliação existe
    const avaliacao = await Avaliacao.findById(questaoData.avaliacao);
    if (!avaliacao) {
      res.status(404).json({
        status: 'error',
        message: 'Avaliação não encontrada'
      });
      return;
    }
    
    // Verificar se já existe uma questão com o mesmo número na mesma avaliação
    const exists = await Questao.findOne({ 
      numero: questaoData.numero,
      avaliacao: questaoData.avaliacao
    });
    
    if (exists) {
      res.status(409).json({
        status: 'error',
        message: `Já existe uma questão com o número ${questaoData.numero} nesta avaliação`
      });
      return;
    }
    
    // Criar a questão
    const questao = await Questao.create(questaoData);
    
    // Adicionar a questão à avaliação
    await Avaliacao.findByIdAndUpdate(
      questaoData.avaliacao,
      { $push: { questoes: questao._id } }
    );
    
    res.status(201).json({
      status: 'success',
      data: questao
    });
  } catch (error) {
    console.error('Erro ao criar questão:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao criar questão'
    });
  }
};

/**
 * Obtém todas as questões com opção de paginação e filtros
 */
export const getAllQuestoes: RequestHandler = async (req, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse({
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 10)
    });
    
    // Filtros opcionais
    const filtro: any = {};
    
    // Filtrar por avaliação
    if (req.query.avaliacao && typeof req.query.avaliacao === 'string') {
      filtro.avaliacao = req.query.avaliacao;
    }
    
    // Filtrar por disciplina (através da avaliação)
    if (req.query.disciplina && typeof req.query.disciplina === 'string') {
      // Buscar avaliações da disciplina
      const avaliacoes = await Avaliacao.find({ 
        disciplina: req.query.disciplina 
      }).select('_id');
      
      // Se não houver avaliações, retornar lista vazia
      if (!avaliacoes.length) {
        res.status(200).json({
          status: 'success',
          data: [],
          meta: {
            total: 0,
            page,
            limit,
            pages: 0
          }
        });
        return;
      }
      
      // Filtrar por IDs de avaliação
      filtro.avaliacao = { $in: avaliacoes.map(a => a._id) };
    }
    
    // Consulta para obter o total de questões com filtros
    const total = await Questao.countDocuments(filtro);
    
    // Consulta paginada com filtros
    const questoes = await Questao.find(filtro)
      .populate('avaliacao')
      .sort({ avaliacao: 1, numero: 1 }) // Ordenar por avaliação e número da questão
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.status(200).json({
      status: 'success',
      data: questoes,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar questões'
    });
  }
};

/**
 * Obtém uma questão pelo ID
 */
export const getQuestaoById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const questao = await Questao.findById(id).populate({
      path: 'avaliacao',
      populate: { path: 'disciplina' }
    });
    
    if (!questao) {
      res.status(404).json({
        status: 'error',
        message: 'Questão não encontrada'
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: questao
    });
  } catch (error) {
    console.error('Erro ao buscar questão:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar questão'
    });
  }
};

/**
 * Atualiza uma questão pelo ID
 */
export const updateQuestao: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateQuestaoInput;
    
    // Verificar se a questão existe
    const questao = await Questao.findById(id);
    if (!questao) {
      res.status(404).json({
        status: 'error',
        message: 'Questão não encontrada'
      });
      return;
    }
    
    // Se estiver atualizando o número ou a avaliação, verificar unicidade
    if ((updateData.numero !== undefined && updateData.numero !== questao.numero) ||
        (updateData.avaliacao && updateData.avaliacao.toString() !== questao.avaliacao.toString())) {
      
      const novaAvaliacao = updateData.avaliacao?.toString() || questao.avaliacao.toString();
      const novoNumero = updateData.numero !== undefined ? updateData.numero : questao.numero;
      
      const exists = await Questao.findOne({ 
        numero: novoNumero,
        avaliacao: novaAvaliacao,
        _id: { $ne: id } // Excluir a própria questão da verificação
      });
      
      if (exists) {
        res.status(409).json({
          status: 'error',
          message: `Já existe uma questão com o número ${novoNumero} nesta avaliação`
        });
        return;
      }
      
      // Se a avaliação foi alterada, precisamos atualizar as referências
      if (updateData.avaliacao && updateData.avaliacao.toString() !== questao.avaliacao.toString()) {
        // Remover da avaliação antiga
        await Avaliacao.findByIdAndUpdate(
          questao.avaliacao,
          { $pull: { questoes: id } }
        );
        
        // Adicionar à nova avaliação
        await Avaliacao.findByIdAndUpdate(
          updateData.avaliacao,
          { $push: { questoes: id } }
        );
      }
    }
    
    // Validar alternativas se estiver atualizando
    if (updateData.alternativas) {
      const temAlternativaCorreta = updateData.alternativas.some(alt => alt.correta);
      if (!temAlternativaCorreta) {
        res.status(400).json({
          status: 'error',
          message: 'Deve haver pelo menos uma alternativa correta'
        });
        return;
      }
    }
    
    // Atualizar a questão
    const updatedQuestao = await Questao.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: updatedQuestao
    });
  } catch (error) {
    console.error('Erro ao atualizar questão:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar questão'
    });
  }
};

/**
 * Remove uma questão pelo ID
 */
export const deleteQuestao: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se a questão existe
    const questao = await Questao.findById(id);
    if (!questao) {
      res.status(404).json({
        status: 'error',
        message: 'Questão não encontrada'
      });
      return;
    }
    
    // Remover a referência da questão na avaliação
    await Avaliacao.findByIdAndUpdate(
      questao.avaliacao,
      { $pull: { questoes: id } }
    );
    
    // Remover a questão
    await Questao.findByIdAndDelete(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Questão removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover questão:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao remover questão'
    });
  }
};

/**
 * Busca questões por termo de pesquisa no enunciado
 */
export const searchQuestoes: RequestHandler = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'Termo de busca inválido'
      });
      return;
    }
    
    // Buscar questões que contenham o termo de busca no enunciado ou explicação
    const questoes = await Questao.find({
      $or: [
        { enunciado: { $regex: q, $options: 'i' } },
        { explicacao: { $regex: q, $options: 'i' } },
        { 'alternativas.texto': { $regex: q, $options: 'i' } }
      ]
    }).populate({
      path: 'avaliacao',
      populate: { path: 'disciplina' }
    });
    
    res.status(200).json({
      status: 'success',
      data: questoes,
      meta: {
        total: questoes.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar questões'
    });
  }
};

/**
 * Importa questões em massa para uma avaliação
 */
export const importarQuestoes: RequestHandler = async (req, res, next) => {
  try {
    const { avaliacaoId } = req.params;
    const questoes = req.body.questoes as CreateQuestaoInput[];
    
    // Verificar se a avaliação existe
    const avaliacao = await Avaliacao.findById(avaliacaoId);
    if (!avaliacao) {
      res.status(404).json({
        status: 'error',
        message: 'Avaliação não encontrada'
      });
      return;
    }
    
    // Verificar se há questões para importar
    if (!Array.isArray(questoes) || questoes.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Nenhuma questão para importar'
      });
      return;
    }
    
    // Verificar números de questões já existentes
    const numerosExistentes = await Questao.find({ avaliacao: avaliacaoId })
      .select('numero')
      .lean();
    
    const numerosSet = new Set(numerosExistentes.map(q => q.numero));
    
    // Filtrar questões com números já existentes
    const questoesUnicas = questoes.filter(q => !numerosSet.has(q.numero));
    const questoesRejeitadas = questoes.filter(q => numerosSet.has(q.numero));
    
    if (questoesUnicas.length === 0) {
      res.status(409).json({
        status: 'error',
        message: 'Todas as questões já existem para esta avaliação',
        rejeitadas: questoesRejeitadas.map(q => q.numero)
      });
      return;
    }
    
    // Adicionar o ID da avaliação a cada questão
    const questoesPreparadas = questoesUnicas.map(q => ({
      ...q,
      avaliacao: avaliacaoId
    }));
    
    // Criar as questões
    const questoesCriadas = await Questao.insertMany(questoesPreparadas);
    
    // Atualizar a avaliação com as novas questões
    await Avaliacao.findByIdAndUpdate(
      avaliacaoId,
      { $push: { questoes: { $each: questoesCriadas.map(q => q._id) } } }
    );
    
    res.status(201).json({
      status: 'success',
      message: `${questoesCriadas.length} questões importadas com sucesso`,
      data: questoesCriadas,
      meta: {
        total: questoesCriadas.length,
        rejeitadas: questoesRejeitadas.length > 0 
          ? questoesRejeitadas.map(q => q.numero) 
          : []
      }
    });
  } catch (error) {
    console.error('Erro ao importar questões:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao importar questões'
    });
  }
};