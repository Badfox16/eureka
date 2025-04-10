import type { RequestHandler } from 'express';
import { Avaliacao, TipoAvaliacao, Trimestre, Epoca } from '../models/avaliacao';
import { Disciplina } from '../models/disciplina';
import { Questao } from '../models/questao';
import type { CreateAvaliacaoInput, UpdateAvaliacaoInput } from '../schemas/avaliacao.schema';
import { paginationSchema } from '../schemas/common.schema';

/**
 * Cria uma nova avaliação
 */
export const createAvaliacao: RequestHandler = async (req, res, next) => {
  try {
    const avaliacaoData = req.body as CreateAvaliacaoInput;
    
    // Verificar se a disciplina existe
    const disciplina = await Disciplina.findById(avaliacaoData.disciplina);
    if (!disciplina) {
      res.status(404).json({
        status: 'error',
        message: 'Disciplina não encontrada'
      });
      return;
    }
    
    // Verificar campos específicos com base no tipo
    if (avaliacaoData.tipo === TipoAvaliacao.AP) {
      if (!avaliacaoData.trimestre) {
        res.status(400).json({
          status: 'error',
          message: 'O campo trimestre é obrigatório para avaliações provinciais (AP)'
        });
        return;
      }
    } else if (avaliacaoData.tipo === TipoAvaliacao.EXAME) {
      if (!avaliacaoData.epoca) {
        res.status(400).json({
          status: 'error',
          message: 'O campo época é obrigatório para exames'
        });
        return;
      }
    }
    
    // Verificar se já existe uma avaliação similar
    const queryFiltro: any = {
      tipo: avaliacaoData.tipo,
      disciplina: avaliacaoData.disciplina,
      ano: avaliacaoData.ano,
      classe: avaliacaoData.classe
    };
    
    if (avaliacaoData.tipo === TipoAvaliacao.AP && avaliacaoData.trimestre) {
      queryFiltro.trimestre = avaliacaoData.trimestre;
    }
    
    if (avaliacaoData.tipo === TipoAvaliacao.EXAME && avaliacaoData.epoca) {
      queryFiltro.epoca = avaliacaoData.epoca;
    }
    
    const exists = await Avaliacao.findOne(queryFiltro);
    if (exists) {
      res.status(409).json({
        status: 'error',
        message: 'Já existe uma avaliação com as mesmas características'
      });
      return;
    }
    
    // Criar a avaliação
    const avaliacao = await Avaliacao.create(avaliacaoData);
    
    res.status(201).json({
      status: 'success',
      data: avaliacao
    });
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao criar avaliação'
    });
  }
};

/**
 * Obtém todas as avaliações com opção de paginação e filtros
 */
export const getAllAvaliacoes: RequestHandler = async (req, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse({
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 10)
    });
    
    // Filtros opcionais
    const filtro: any = {};
    
    // Filtrar por tipo
    if (req.query.tipo && Object.values(TipoAvaliacao).includes(req.query.tipo as TipoAvaliacao)) {
      filtro.tipo = req.query.tipo;
    }
    
    // Filtrar por disciplina
    if (req.query.disciplina && typeof req.query.disciplina === 'string') {
      filtro.disciplina = req.query.disciplina;
    }
    
    // Filtrar por ano
    if (req.query.ano && !isNaN(Number(req.query.ano))) {
      filtro.ano = Number(req.query.ano);
    }
    
    // Filtrar por classe
    if (req.query.classe && ['11', '12'].includes(req.query.classe as string)) {
      filtro.classe = Number(req.query.classe);
    }
    
    // Filtrar por trimestre (para AP)
    if (req.query.trimestre && Object.values(Trimestre).includes(req.query.trimestre as Trimestre)) {
      filtro.trimestre = req.query.trimestre;
    }
    
    // Filtrar por época (para exames)
    if (req.query.epoca && Object.values(Epoca).includes(req.query.epoca as Epoca)) {
      filtro.epoca = req.query.epoca;
    }
    
    // Consulta para obter o total de avaliações com filtros
    const total = await Avaliacao.countDocuments(filtro);
    
    // Consulta paginada com filtros
    const avaliacoes = await Avaliacao.find(filtro)
      .populate('disciplina', 'nome codigo')
      .sort({ ano: -1, tipo: 1 }) // Ordenar por ano (decrescente) e tipo
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.status(200).json({
      status: 'success',
      data: avaliacoes,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        filtros: Object.keys(filtro).length > 0 ? filtro : 'nenhum'
      }
    });
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar avaliações'
    });
  }
};

/**
 * Obtém uma avaliação pelo ID
 */
export const getAvaliacaoById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const avaliacao = await Avaliacao.findById(id)
      .populate('disciplina')
      .populate('questoes');
    
    if (!avaliacao) {
      res.status(404).json({
        status: 'error',
        message: 'Avaliação não encontrada'
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: avaliacao
    });
  } catch (error) {
    console.error('Erro ao buscar avaliação:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar avaliação'
    });
  }
};

/**
 * Atualiza uma avaliação pelo ID
 */
export const updateAvaliacao: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateAvaliacaoInput;
    
    // Verificar se a avaliação existe
    const avaliacao = await Avaliacao.findById(id);
    if (!avaliacao) {
      res.status(404).json({
        status: 'error',
        message: 'Avaliação não encontrada'
      });
      return;
    }
    
    // Se estiver alterando a disciplina, verificar se a nova disciplina existe
    if (updateData.disciplina && updateData.disciplina.toString() !== avaliacao.disciplina.toString()) {
      const disciplina = await Disciplina.findById(updateData.disciplina);
      if (!disciplina) {
        res.status(404).json({
          status: 'error',
          message: 'Disciplina não encontrada'
        });
        return;
      }
    }
    
    // Verificar campos específicos com base no tipo
    const tipo = updateData.tipo || avaliacao.tipo;
    
    if (tipo === TipoAvaliacao.AP) {
      if (!updateData.trimestre && !avaliacao.trimestre) {
        res.status(400).json({
          status: 'error',
          message: 'O campo trimestre é obrigatório para avaliações provinciais (AP)'
        });
        return;
      }
    } else if (tipo === TipoAvaliacao.EXAME) {
      if (!updateData.epoca && !avaliacao.epoca) {
        res.status(400).json({
          status: 'error',
          message: 'O campo época é obrigatório para exames'
        });
        return;
      }
    }
    
    // Verificar se já existe uma avaliação similar (exceto esta)
    if (updateData.tipo || updateData.disciplina || updateData.ano || 
        updateData.classe || updateData.trimestre || updateData.epoca) {
      
      const queryFiltro: any = {
        _id: { $ne: id }
      };
      
      if (updateData.tipo) queryFiltro.tipo = updateData.tipo;
      else queryFiltro.tipo = avaliacao.tipo;
      
      if (updateData.disciplina) queryFiltro.disciplina = updateData.disciplina;
      else queryFiltro.disciplina = avaliacao.disciplina;
      
      if (updateData.ano) queryFiltro.ano = updateData.ano;
      else queryFiltro.ano = avaliacao.ano;
      
      if (updateData.classe) queryFiltro.classe = updateData.classe;
      else queryFiltro.classe = avaliacao.classe;
      
      if (tipo === TipoAvaliacao.AP) {
        if (updateData.trimestre) queryFiltro.trimestre = updateData.trimestre;
        else if (avaliacao.trimestre) queryFiltro.trimestre = avaliacao.trimestre;
      }
      
      if (tipo === TipoAvaliacao.EXAME) {
        if (updateData.epoca) queryFiltro.epoca = updateData.epoca;
        else if (avaliacao.epoca) queryFiltro.epoca = avaliacao.epoca;
      }
      
      const exists = await Avaliacao.findOne(queryFiltro);
      if (exists) {
        res.status(409).json({
          status: 'error',
          message: 'Já existe uma avaliação com as mesmas características'
        });
        return;
      }
    }
    
    // Atualizar a avaliação
    const updatedAvaliacao = await Avaliacao.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('disciplina');
    
    res.status(200).json({
      status: 'success',
      data: updatedAvaliacao
    });
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar avaliação'
    });
  }
};

/**
 * Remove uma avaliação pelo ID
 */
export const deleteAvaliacao: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se a avaliação existe
    const avaliacao = await Avaliacao.findById(id);
    if (!avaliacao) {
      res.status(404).json({
        status: 'error',
        message: 'Avaliação não encontrada'
      });
      return;
    }
    
    // Verificar se a avaliação tem questões associadas
    const questoesCount = avaliacao.questoes?.length || 0;
    
    if (questoesCount > 0) {
      // Remover todas as questões associadas
      await Questao.deleteMany({ avaliacao: id });
    }
    
    // Remover a avaliação
    await Avaliacao.findByIdAndDelete(id);
    
    res.status(200).json({
      status: 'success',
      message: `Avaliação removida com sucesso${questoesCount > 0 ? ` (incluindo ${questoesCount} questões)` : ''}`
    });
  } catch (error) {
    console.error('Erro ao remover avaliação:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao remover avaliação'
    });
  }
};

/**
 * Busca avaliações por termo de pesquisa
 */
export const searchAvaliacoes: RequestHandler = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'Termo de busca inválido'
      });
      return;
    }
    
    // Buscar disciplinas com o termo de busca
    const disciplinas = await Disciplina.find({ 
      $or: [
        { nome: { $regex: q, $options: 'i' } },
        { codigo: { $regex: q, $options: 'i' } }
      ]
    });
    
    const disciplinaIds = disciplinas.map(d => d._id);
    
    // Buscar avaliações que contenham o termo como número ou tenham disciplinas com o termo
    const avaliacoes = await Avaliacao.find({
      $or: [
        { disciplina: { $in: disciplinaIds } },
        { ano: isNaN(Number(q)) ? -1 : Number(q) }
      ]
    }).populate('disciplina');
    
    res.status(200).json({
      status: 'success',
      data: avaliacoes,
      meta: {
        total: avaliacoes.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar avaliações'
    });
  }
};

/**
 * Obtém estatísticas sobre avaliações
 */
export const getEstatisticasAvaliacoes: RequestHandler = async (req, res, next) => {
  try {
    // Total por tipo de avaliação
    const totalPorTipo = await Avaliacao.aggregate([
      {
        $group: {
          _id: '$tipo',
          total: { $sum: 1 }
        }
      }
    ]);
    
    // Total por disciplina
    const totalPorDisciplina = await Avaliacao.aggregate([
      {
        $group: {
          _id: '$disciplina',
          total: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'disciplinas',
          localField: '_id',
          foreignField: '_id',
          as: 'disciplinaInfo'
        }
      },
      {
        $unwind: '$disciplinaInfo'
      },
      {
        $project: {
          disciplinaNome: '$disciplinaInfo.nome',
          disciplinaCodigo: '$disciplinaInfo.codigo',
          total: 1
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);
    
    // Total por ano
    const totalPorAno = await Avaliacao.aggregate([
      {
        $group: {
          _id: '$ano',
          total: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);
    
    // Total de questões por avaliação (média)
    const questoesPorAvaliacao = await Avaliacao.aggregate([
      {
        $project: {
          numQuestoes: { $size: { $ifNull: ['$questoes', []] } }
        }
      },
      {
        $group: {
          _id: null,
          media: { $avg: '$numQuestoes' },
          min: { $min: '$numQuestoes' },
          max: { $max: '$numQuestoes' },
          total: { $sum: '$numQuestoes' }
        }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        porTipo: totalPorTipo,
        porDisciplina: totalPorDisciplina,
        porAno: totalPorAno,
        questoes: questoesPorAvaliacao.length > 0 ? questoesPorAvaliacao[0] : { media: 0, min: 0, max: 0, total: 0 }
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas de avaliações:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao obter estatísticas de avaliações'
    });
  }
};