import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { Disciplina } from '../models/disciplina';
import type { CreateDisciplinaInput, UpdateDisciplinaInput } from '../schemas/disciplina.schema';
import { paginationSchema } from '../schemas/common.schema';
import { Avaliacao } from '../models/avaliacao';
import { formatResponse } from '../utils/response.utils'; // Adicione este import

/**
 * Cria uma nova disciplina
 */
export const createDisciplina: RequestHandler = async (req, res, next) => {
  try {
    const disciplinaData = req.body as CreateDisciplinaInput;
    
    // Verificar se já existe uma disciplina com o mesmo código
    const exists = await Disciplina.findOne({ codigo: disciplinaData.codigo });
    if (exists) {
      res.status(409).json(formatResponse(
        null,
        undefined,
        `Já existe uma disciplina com o código ${disciplinaData.codigo}`
      ));
      return;
    }
    
    const disciplina = await Disciplina.create(disciplinaData);
    
    res.status(201).json(formatResponse(disciplina));
  } catch (error) {
    console.error('Erro ao criar disciplina:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao criar disciplina'));
  }
};

/**
 * Obtém todas as disciplinas com opção de paginação
 */
export const getAllDisciplinas: RequestHandler = async (req, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse({
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 10)
    });
    
    const total = await Disciplina.countDocuments();
    const disciplinas = await Disciplina.find()
      .sort({ nome: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json(formatResponse(
      disciplinas,
      { page, limit, total }
    ));
  } catch (error) {
    console.error('Erro ao buscar disciplinas:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao buscar disciplinas'));
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
      res.status(404).json(formatResponse(null, undefined, 'Disciplina não encontrada'));
      return;
    }
    res.status(200).json(formatResponse(disciplina));
  } catch (error) {
    console.error('Erro ao buscar disciplina:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao buscar disciplina'));
  }
};

/**
 * Atualiza uma disciplina pelo ID
 */
export const updateDisciplina: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateDisciplinaInput;
    const disciplina = await Disciplina.findById(id);
    if (!disciplina) {
      res.status(404).json(formatResponse(null, undefined, 'Disciplina não encontrada'));
      return;
    }
    if (updateData.codigo && updateData.codigo !== disciplina.codigo) {
      const exists = await Disciplina.findOne({ 
        codigo: updateData.codigo, 
        _id: { $ne: id } 
      });
      if (exists) {
        res.status(409).json(formatResponse(
          null,
          undefined,
          `Já existe uma disciplina com o código ${updateData.codigo}`
        ));
        return;
      }
    }
    const updatedDisciplina = await Disciplina.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    res.status(200).json(formatResponse(updatedDisciplina));
  } catch (error) {
    console.error('Erro ao atualizar disciplina:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao atualizar disciplina'));
  }
};

/**
 * Remove uma disciplina pelo ID
 */
export const deleteDisciplina: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const disciplina = await Disciplina.findById(id);
    if (!disciplina) {
      res.status(404).json(formatResponse(null, undefined, 'Disciplina não encontrada'));
      return;
    }
    const avaliacoesComDisciplina = await Avaliacao.countDocuments({ disciplina: id });
    if (avaliacoesComDisciplina > 0) {
      res.status(409).json(formatResponse(
        null,
        undefined,
        'Esta disciplina não pode ser removida pois está sendo usada em avaliações'
      ));
      return;
    }
    await Disciplina.findByIdAndDelete(id);
    res.status(200).json(formatResponse(null, undefined, 'Disciplina removida com sucesso'));
  } catch (error) {
    console.error('Erro ao remover disciplina:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao remover disciplina'));
  }
};

/**
 * Busca disciplinas por termo de pesquisa
 */
export const searchDisciplinas: RequestHandler = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      res.status(400).json(formatResponse(null, undefined, 'Termo de busca inválido'));
      return;
    }
    const disciplinas = await Disciplina.find({
      $or: [
        { nome: { $regex: q, $options: 'i' } },
        { codigo: { $regex: q, $options: 'i' } },
        { descricao: { $regex: q, $options: 'i' } }
      ]
    });
    const total = disciplinas.length;
    res.status(200).json(formatResponse(
      disciplinas,
      { page: 1, limit: total, total }
    ));
  } catch (error) {
    console.error('Erro ao buscar disciplinas:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao buscar disciplinas'));
  }
};

/**
 * Cria múltiplas disciplinas em massa
 */
export const createDisciplinasEmMassa: RequestHandler = async (req, res, next) => {
  try {
    const disciplinasData = req.body;
    if (!Array.isArray(disciplinasData)) {
      res.status(400).json(formatResponse(null, undefined, 'O body deve ser um array de disciplinas'));
      return;
    }
    const codigos = disciplinasData.map(d => d.codigo);
    const codigosUnicos = new Set(codigos);
    if (codigos.length !== codigosUnicos.size) {
      res.status(400).json(formatResponse(null, undefined, 'O array contém códigos duplicados'));
      return;
    }
    const codigosExistentes = await Disciplina.find({ codigo: { $in: codigos } }).select('codigo').lean();
    if (codigosExistentes.length > 0) {
      res.status(409).json(formatResponse(
        codigosExistentes.map(d => d.codigo),
        undefined,
        'Algumas disciplinas já existem'
      ));
      return;
    }
    const disciplinas = await Disciplina.insertMany(disciplinasData);
    res.status(201).json(formatResponse(
      disciplinas,
      undefined,
      `Disciplinas criadas com sucesso (${disciplinas.length})`
    ));
  } catch (error) {
    console.error('Erro ao criar disciplinas em massa:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao criar disciplinas em massa'));
  }
};