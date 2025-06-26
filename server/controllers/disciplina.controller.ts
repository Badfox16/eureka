import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { Disciplina } from '../models/disciplina';
import type { CreateDisciplinaInput, UpdateDisciplinaInput } from '../schemas/disciplina.schema';
import { paginationSchema } from '../schemas/common.schema';
import { Avaliacao } from '../models/avaliacao';
import { formatResponse } from '../utils/response.utils'; 

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
    console.error('Erro ao buscar disciplina por ID:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao buscar disciplina por ID'));
  }
};

export const updateDisciplina: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateDisciplinaInput;
    const disciplina = await Disciplina.findByIdAndUpdate(id, updateData, { new: true });
    if (!disciplina) {
      res.status(404).json(formatResponse(null, undefined, 'Disciplina não encontrada'));
      return;
    }
    res.status(200).json(formatResponse(disciplina));
  } catch (error) {
    console.error('Erro ao atualizar disciplina:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao atualizar disciplina'));
  }
};

export const deleteDisciplina: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const disciplina = await Disciplina.findByIdAndDelete(id);
    if (!disciplina) {
      res.status(404).json(formatResponse(null, undefined, 'Disciplina não encontrada'));
      return;
    }
    res.status(200).json(formatResponse(null, undefined, 'Disciplina excluída com sucesso'));
  } catch (error) {
    console.error('Erro ao excluir disciplina:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao excluir disciplina'));
  }
};

export const searchDisciplinas: RequestHandler = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    if (!q || typeof q !== 'string') {
      res.status(400).json(formatResponse(null, undefined, 'Termo de pesquisa não fornecido'));
      return;
    }
    const query = {
      nome: { $regex: q, $options: 'i' }
    };
    const total = await Disciplina.countDocuments(query);
    const disciplinas = await Disciplina.find(query)
      .sort({ nome: 1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);
    res.status(200).json(formatResponse(
      disciplinas,
      { page: +page, limit: +limit, total }
    ));
  } catch (error) {
    console.error('Erro ao pesquisar disciplinas:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao pesquisar disciplinas'));
  }
};

export const createDisciplinasEmMassa: RequestHandler = async (req, res, next) => {
  try {
    const { disciplinas } = req.body;
    if (!Array.isArray(disciplinas) || disciplinas.length === 0) {
      res.status(400).json(formatResponse(null, undefined, 'Nenhuma disciplina fornecida'));
      return;
    }
    // Verificar duplicidade de códigos
    const codigos = disciplinas.map((d: any) => d.codigo);
    const existentes = await Disciplina.find({ codigo: { $in: codigos } });
    if (existentes.length > 0) {
      res.status(409).json(formatResponse(null, undefined, `Já existem disciplinas com os códigos: ${existentes.map(e => e.codigo).join(', ')}`));
      return;
    }
    const novasDisciplinas = await Disciplina.insertMany(disciplinas);
    res.status(201).json(formatResponse(novasDisciplinas));
  } catch (error) {
    console.error('Erro ao criar disciplinas em massa:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao criar disciplinas em massa'));
  }
};