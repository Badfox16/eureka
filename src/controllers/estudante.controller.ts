import type { RequestHandler } from 'express';
import { Estudante } from '../models/estudante';
import type { CreateEstudanteInput, UpdateEstudanteInput } from '../schemas/estudante.schema';
import { paginationSchema } from '../schemas/common.schema';
import { Resposta } from '../models/respostas';

/**
 * Cria um novo estudante
 */
export const createEstudante: RequestHandler = async (req, res, next) => {
  try {
    const estudanteData = req.body as CreateEstudanteInput;
    
    // Verificar se já existe um estudante com o mesmo email
    const exists = await Estudante.findOne({ email: estudanteData.email });
    if (exists) {
      res.status(409).json({
        status: 'error',
        message: `Já existe um estudante com o email ${estudanteData.email}`
      });
      return;
    }
    
    const estudante = await Estudante.create(estudanteData);
    
    res.status(201).json({
      status: 'success',
      data: estudante
    });
  } catch (error) {
    console.error('Erro ao criar estudante:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao criar estudante'
    });
  }
};

/**
 * Obtém todos os estudantes com opção de paginação e filtro
 */
export const getAllEstudantes: RequestHandler = async (req, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse({
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 10)
    });
    
    // Filtros opcionais
    const filtro: any = {};
    
    // Filtrar por classe
    if (req.query.classe && ['11', '12'].includes(req.query.classe as string)) {
      filtro.classe = Number(req.query.classe);
    }
    
    // Filtrar por província
    if (req.query.provincia && typeof req.query.provincia === 'string') {
      filtro.provincia = { $regex: req.query.provincia, $options: 'i' };
    }
    
    // Filtrar por escola
    if (req.query.escola && typeof req.query.escola === 'string') {
      filtro.escola = { $regex: req.query.escola, $options: 'i' };
    }
    
    // Consulta para obter o total de estudantes com filtros
    const total = await Estudante.countDocuments(filtro);
    
    // Consulta paginada com filtros
    const estudantes = await Estudante.find(filtro)
      .sort({ nome: 1 }) // Ordenar por nome
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.status(200).json({
      status: 'success',
      data: estudantes,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        filtros: Object.keys(filtro).length > 0 ? filtro : 'nenhum'
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estudantes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar estudantes'
    });
  }
};

/**
 * Obtém um estudante pelo ID
 */
export const getEstudanteById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const estudante = await Estudante.findById(id);
    
    if (!estudante) {
      res.status(404).json({
        status: 'error',
        message: 'Estudante não encontrado'
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: estudante
    });
  } catch (error) {
    console.error('Erro ao buscar estudante:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar estudante'
    });
  }
};

/**
 * Atualiza um estudante pelo ID
 */
export const updateEstudante: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateEstudanteInput;
    
    // Verificar se o estudante existe
    const estudante = await Estudante.findById(id);
    if (!estudante) {
      res.status(404).json({
        status: 'error',
        message: 'Estudante não encontrado'
      });
      return;
    }
    
    // Se estiver atualizando o email, verificar se já existe outro com esse email
    if (updateData.email && updateData.email !== estudante.email) {
      const exists = await Estudante.findOne({ 
        email: updateData.email, 
        _id: { $ne: id } 
      });
      
      if (exists) {
        res.status(409).json({
          status: 'error',
          message: `Já existe um estudante com o email ${updateData.email}`
        });
        return;
      }
    }
    
    // Atualizar o estudante
    const updatedEstudante = await Estudante.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: updatedEstudante
    });
  } catch (error) {
    console.error('Erro ao atualizar estudante:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar estudante'
    });
  }
};

/**
 * Remove um estudante pelo ID
 */
export const deleteEstudante: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se o estudante existe
    const estudante = await Estudante.findById(id);
    if (!estudante) {
      res.status(404).json({
        status: 'error',
        message: 'Estudante não encontrado'
      });
      return;
    }
    
    // Verificar se o estudante tem respostas associadas
    const temRespostas = estudante.respostas && estudante.respostas.length > 0;
    
    // Se tem respostas, remover todas as respostas primeiro
    if (temRespostas) {
      await Resposta.deleteMany({ estudante: id });
    }
    
    // Remover o estudante
    await Estudante.findByIdAndDelete(id);
    
    res.status(200).json({
      status: 'success',
      message: `Estudante removido com sucesso${temRespostas ? ' (incluindo todas as suas respostas)' : ''}`
    });
  } catch (error) {
    console.error('Erro ao remover estudante:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao remover estudante'
    });
  }
};

/**
 * Busca estudantes por termo de pesquisa
 */
export const searchEstudantes: RequestHandler = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'Termo de busca inválido'
      });
      return;
    }
    
    // Buscar estudantes que contenham o termo de busca no nome, email, escola ou província
    const estudantes = await Estudante.find({
      $or: [
        { nome: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { escola: { $regex: q, $options: 'i' } },
        { provincia: { $regex: q, $options: 'i' } }
      ]
    });
    
    res.status(200).json({
      status: 'success',
      data: estudantes,
      meta: {
        total: estudantes.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estudantes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar estudantes'
    });
  }
};

/**
 * Obtém todas as respostas de um estudante
 */
export const getRespostasEstudante: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se o estudante existe
    const estudante = await Estudante.findById(id);
    if (!estudante) {
      res.status(404).json({
        status: 'error',
        message: 'Estudante não encontrado'
      });
      return;
    }
    
    // Buscar todas as respostas do estudante com informações das questões
    const respostas = await Resposta.find({ estudante: id })
      .populate({
        path: 'questao',
        populate: {
          path: 'avaliacao',
          populate: 'disciplina'
        }
      })
      .sort({ createdAt: -1 }); // Ordenar por data de criação (mais recentes primeiro)
    
    res.status(200).json({
      status: 'success',
      data: respostas,
      meta: {
        total: respostas.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar respostas do estudante:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar respostas do estudante'
    });
  }
};

/**
 * Obtém estatísticas de desempenho do estudante
 */
export const getEstatisticasEstudante: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se o estudante existe
    const estudante = await Estudante.findById(id);
    if (!estudante) {
      res.status(404).json({
        status: 'error',
        message: 'Estudante não encontrado'
      });
      return;
    }
    
    // Buscar respostas do estudante
    const respostas = await Resposta.find({ estudante: id })
      .populate({
        path: 'questao',
        populate: {
          path: 'avaliacao',
          populate: 'disciplina'
        }
      });
    
    // Calcular estatísticas gerais
    const totalRespostas = respostas.length;
    const respostasCorretas = respostas.filter(r => r.estaCorreta).length;
    const percentualAcerto = totalRespostas > 0 ? (respostasCorretas / totalRespostas) * 100 : 0;
    
    // Estatísticas por disciplina
    const estatisticasPorDisciplina: Record<string, {
      nome: string,
      total: number,
      corretas: number,
      percentual: number
    }> = {};
    
    // Agrupar respostas por disciplina e calcular estatísticas
    respostas.forEach(resposta => {
      const questao = resposta.questao as any; // Usando any devido ao populate aninhado
      if (!questao || !questao.avaliacao || !questao.avaliacao.disciplina) return;
      
      const disciplina = questao.avaliacao.disciplina;
      const disciplinaId = disciplina._id.toString();
      
      if (!estatisticasPorDisciplina[disciplinaId]) {
        estatisticasPorDisciplina[disciplinaId] = {
          nome: disciplina.nome,
          total: 0,
          corretas: 0,
          percentual: 0
        };
      }
      
      estatisticasPorDisciplina[disciplinaId].total += 1;
      if (resposta.estaCorreta) {
        estatisticasPorDisciplina[disciplinaId].corretas += 1;
      }
    });
    
    // Calcular percentuais para cada disciplina
    Object.values(estatisticasPorDisciplina).forEach(stats => {
      stats.percentual = stats.total > 0 ? (stats.corretas / stats.total) * 100 : 0;
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        geral: {
          totalRespostas,
          respostasCorretas,
          percentualAcerto: Math.round(percentualAcerto * 100) / 100 // Arredondar para 2 casas decimais
        },
        disciplinas: Object.values(estatisticasPorDisciplina).map(stats => ({
          ...stats,
          percentual: Math.round(stats.percentual * 100) / 100 // Arredondar para 2 casas decimais
        }))
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas do estudante:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao obter estatísticas do estudante'
    });
  }
};