import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { Disciplina } from '../models/disciplina';
import type { CreateDisciplinaInput, UpdateDisciplinaInput } from '../schemas/disciplina.schema';
import { paginationSchema } from '../schemas/common.schema';
import { Avaliacao } from '../models/avaliacao';

/**
 * Cria uma nova disciplina
 */
export const createDisciplina: RequestHandler = async (req, res, next) => {
  try {
    const disciplinaData = req.body as CreateDisciplinaInput;
    
    // Verificar se já existe uma disciplina com o mesmo código
    const exists = await Disciplina.findOne({ codigo: disciplinaData.codigo });
    if (exists) {
      res.status(409).json({
        status: 'error',
        message: `Já existe uma disciplina com o código ${disciplinaData.codigo}`
      });
      return;
    }
    
    const disciplina = await Disciplina.create(disciplinaData);
    
    res.status(201).json({
      status: 'success',
      data: disciplina
    });
  } catch (error) {
    console.error('Erro ao criar disciplina:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao criar disciplina'
    });
  }
};

/**
 * Obtém todas as disciplinas com opção de paginação
 */
export const getAllDisciplinas: RequestHandler = async (req, res, next) => {
  try {
    // Parseamos aqui manualmente porque o middleware de validação já foi chamado
    const { page, limit } = paginationSchema.parse({
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 10)
    });
    
    // Consulta para obter o total de disciplinas
    const total = await Disciplina.countDocuments();
    
    // Consulta paginada
    const disciplinas = await Disciplina.find()
      .sort({ nome: 1 }) // Ordenar por nome
      .skip((page - 1) * limit)
      .limit(limit);
    
    // MODIFICADO: Estrutura de resposta consistente
    res.status(200).json({
      data: disciplinas,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(total / limit),
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(total / limit) ? page + 1 : null
      }
    });
  } catch (error) {
    console.error('Erro ao buscar disciplinas:', error);
    res.status(500).json({
      message: 'Erro ao buscar disciplinas'
    });
  }
};


/**
 * Obtém uma disciplina pelo ID
 */
export const getDisciplinaById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const disciplina = await Disciplina.findById(id);
    
    if (!disciplina) {
      res.status(404).json({
        status: 'error',
        message: 'Disciplina não encontrada'
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: disciplina
    });
  } catch (error) {
    console.error('Erro ao buscar disciplina:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar disciplina'
    });
  }
};

/**
 * Atualiza uma disciplina pelo ID
 */
export const updateDisciplina: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateDisciplinaInput;
    
    // Verificar se a disciplina existe
    const disciplina = await Disciplina.findById(id);
    if (!disciplina) {
      res.status(404).json({
        status: 'error',
        message: 'Disciplina não encontrada'
      });
      return;
    }
    
    // Se estiver atualizando o código, verificar se já existe outro com esse código
    if (updateData.codigo && updateData.codigo !== disciplina.codigo) {
      const exists = await Disciplina.findOne({ 
        codigo: updateData.codigo, 
        _id: { $ne: id } 
      });
      
      if (exists) {
        res.status(409).json({
          status: 'error',
          message: `Já existe uma disciplina com o código ${updateData.codigo}`
        });
        return;
      }
    }
    
    // Atualizar a disciplina
    const updatedDisciplina = await Disciplina.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: updatedDisciplina
    });
  } catch (error) {
    console.error('Erro ao atualizar disciplina:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar disciplina'
    });
  }
};

/**
 * Remove uma disciplina pelo ID
 */
export const deleteDisciplina: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se a disciplina existe
    const disciplina = await Disciplina.findById(id);
    if (!disciplina) {
      res.status(404).json({
        status: 'error',
        message: 'Disciplina não encontrada'
      });
      return;
    }
    
    // Verificar se a disciplina está sendo usada em avaliações
    const avaliacoesComDisciplina = await Avaliacao.countDocuments({ disciplina: id });
    if (avaliacoesComDisciplina > 0) {
      res.status(409).json({
        status: 'error',
        message: 'Esta disciplina não pode ser removida pois está sendo usada em avaliações'
      });
      return;
    }
    
    // Remover a disciplina
    await Disciplina.findByIdAndDelete(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Disciplina removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover disciplina:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao remover disciplina'
    });
  }
};

/**
 * Busca disciplinas por termo de pesquisa
 */
export const searchDisciplinas: RequestHandler = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      res.status(400).json({
        message: 'Termo de busca inválido'
      });
      return;
    }
    
    // Buscar disciplinas que contenham o termo de busca no nome, código ou descrição
    const disciplinas = await Disciplina.find({
      $or: [
        { nome: { $regex: q, $options: 'i' } },
        { codigo: { $regex: q, $options: 'i' } },
        { descricao: { $regex: q, $options: 'i' } }
      ]
    });
    
    const total = disciplinas.length;
    
    // MODIFICADO: Estrutura de resposta consistente
    res.status(200).json({
      data: disciplinas,
      pagination: {
        total,
        totalPages: 1,
        currentPage: 1,
        limit: total,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null
      }
    });
  } catch (error) {
    console.error('Erro ao buscar disciplinas:', error);
    res.status(500).json({
      message: 'Erro ao buscar disciplinas'
    });
  }
};

/**
 * Cria múltiplas disciplinas em massa
 */
export const createDisciplinasEmMassa: RequestHandler = async (req, res, next) => {
  try {
    const disciplinasData = req.body;
    
    // Validar se o body é um array
    if (!Array.isArray(disciplinasData)) {
      res.status(400).json({
        status: 'error',
        message: 'O body deve ser um array de disciplinas'
      });
      return;
    }
    
    // Verificar códigos duplicados no array enviado
    const codigos = disciplinasData.map(d => d.codigo);
    const codigosUnicos = new Set(codigos);
    if (codigos.length !== codigosUnicos.size) {
      res.status(400).json({
        status: 'error',
        message: 'O array contém códigos duplicados'
      });
      return;
    }
    
    // Verificar se já existem disciplinas com os mesmos códigos
    const codigosExistentes = await Disciplina.find({ codigo: { $in: codigos } }).select('codigo').lean();
    if (codigosExistentes.length > 0) {
      res.status(409).json({
        status: 'error',
        message: 'Algumas disciplinas já existem',
        data: codigosExistentes.map(d => d.codigo)
      });
      return;
    }
    
    // Criar as disciplinas
    const disciplinas = await Disciplina.insertMany(disciplinasData);
    
    res.status(201).json({
      status: 'success',
      data: disciplinas,
      meta: {
        total: disciplinas.length
      }
    });
  } catch (error) {
    console.error('Erro ao criar disciplinas em massa:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao criar disciplinas em massa'
    });
  }
};