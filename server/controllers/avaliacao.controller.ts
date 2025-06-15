import type { RequestHandler } from 'express';
import { Avaliacao, TipoAvaliacao, Trimestre, Epoca, VarianteProva, AreaEstudo } from '../models/avaliacao';
import { Disciplina } from '../models/disciplina';
import { Questao } from '../models/questao';
import { Provincia } from '../models/provincia';
import type { CreateAvaliacaoInput, UpdateAvaliacaoInput } from '../schemas/avaliacao.schema';
import { paginationSchema } from '../schemas/common.schema';
import { Error as MongooseError } from 'mongoose';
import { HttpError } from '../utils/error.utils';
import { formatResponse } from '../utils/response.utils';

/**
 * Cria uma nova avaliação
 */
export const createAvaliacao: RequestHandler = async (req, res, next) => {
  try {
    // Validar os dados da avaliação
    const avaliacaoData = req.body as CreateAvaliacaoInput;

    // Verificar se a disciplina existe
    const disciplina = await Disciplina.findById(avaliacaoData.disciplina);
    if (!disciplina) {
      throw new HttpError('Disciplina não encontrada', 404, 'RELATED_RESOURCE_NOT_FOUND');
    }

    // Verificar campos específicos com base no tipo
    if (avaliacaoData.tipo === TipoAvaliacao.AP) {
      if (!avaliacaoData.trimestre || !avaliacaoData.provincia) {
        throw new HttpError(
          'Os campos trimestre e provincia são obrigatórios para avaliações provinciais (AP)', 
          400, 
          'MISSING_REQUIRED_FIELDS'
        );
      }
      // Verificar se a provincia existe
      const provincia = await Provincia.findById(avaliacaoData.provincia);
      if (!provincia) {
        throw new HttpError('Provincia não encontrada', 404, 'RELATED_RESOURCE_NOT_FOUND');
      }
    } else if (avaliacaoData.tipo === TipoAvaliacao.EXAME) {
      if (!avaliacaoData.epoca) {
        throw new HttpError(
          'O campo época é obrigatório para exames', 
          400, 
          'MISSING_REQUIRED_FIELDS'
        );
      }
    }

    // Verificar se já existe uma avaliação similar
    const queryFiltro: any = {
      tipo: avaliacaoData.tipo,
      disciplina: avaliacaoData.disciplina,
      ano: avaliacaoData.ano,
      classe: avaliacaoData.classe
    };

    if (avaliacaoData.areaEstudo) {
      queryFiltro.areaEstudo = avaliacaoData.areaEstudo;
    }

    if (avaliacaoData.variante) {
      queryFiltro.variante = avaliacaoData.variante;
    }

    if (avaliacaoData.tipo === TipoAvaliacao.AP) {
      if (avaliacaoData.trimestre) queryFiltro.trimestre = avaliacaoData.trimestre;
      if (avaliacaoData.provincia) queryFiltro.provincia = avaliacaoData.provincia;
    }

    if (avaliacaoData.tipo === TipoAvaliacao.EXAME && avaliacaoData.epoca) {
      queryFiltro.epoca = avaliacaoData.epoca;
    }

    try {
      const exists = await Avaliacao.findOne(queryFiltro);
      if (exists) {
        throw new HttpError(
          'Já existe uma avaliação com as mesmas características', 
          409, 
          'DUPLICATE_RESOURCE'
        );
      }
    } catch (error: any) {
      if (error instanceof MongooseError.ValidationError) {
        // Tratar erros de validação do Mongoose
        return next(error);
      }
      throw error; // Re-lançar outros erros
    }

    // Criar a avaliação
    const avaliacao = await Avaliacao.create(avaliacaoData);

    res.status(201).json(formatResponse(avaliacao));
  } catch (error) {
    next(error);
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
    if (req.query.classe && ['10', '11', '12'].includes(req.query.classe as string)) {
      filtro.classe = Number(req.query.classe);
    }

    // Filtrar por trimestre (para AP)
    if (req.query.trimestre && Object.values(Trimestre).includes(req.query.trimestre as Trimestre)) {
      filtro.trimestre = req.query.trimestre;
    }

    // Filtrar por provincia (para AP)
    if (req.query.provincia && typeof req.query.provincia === 'string') {
      try {
        const provincia = await Provincia.findOne({ nome: req.query.provincia });
        if (provincia) {
          filtro.provincia = provincia._id;
        } else {
          res.status(200).json(formatResponse([], {
            total: 0, 
            page, 
            limit, 
            pages: 0
          }));
          return;
        }
      } catch (error) {
        return next(error);
      }
    }

    // Filtrar por época (para exames)
    if (req.query.epoca && Object.values(Epoca).includes(req.query.epoca as Epoca)) {
      filtro.epoca = req.query.epoca;
    }

    // Filtrar por variante de prova
    if (req.query.variante && Object.values(VarianteProva).includes(req.query.variante as VarianteProva)) {
      filtro.variante = req.query.variante;
    }

    // Filtrar por área de estudo
    if (req.query.areaEstudo && Object.values(AreaEstudo).includes(req.query.areaEstudo as AreaEstudo)) {
      filtro.areaEstudo = req.query.areaEstudo;
    }

    // Consulta para obter o total de avaliações com filtros
    const total = await Avaliacao.countDocuments(filtro);

    // Consulta paginada com filtros
    const avaliacoes = await Avaliacao.find(filtro)
      .populate('disciplina', 'nome codigo')
      .populate('provincia', 'nome')
      .sort({ ano: -1, tipo: 1 }) // Ordenar por ano (decrescente) e tipo
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json(formatResponse(avaliacoes, {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      filtros: Object.keys(filtro).length > 0 ? filtro : 'nenhum'
    }));
  } catch (error) {
    next(error);
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
      .populate('provincia')
      .populate('questoes');

    if (!avaliacao) {
      throw new HttpError('Avaliação não encontrada', 404, 'RESOURCE_NOT_FOUND');
    }

    res.status(200).json(formatResponse(avaliacao));
  } catch (error) {
    next(error);
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
      throw new HttpError('Avaliação não encontrada', 404, 'RESOURCE_NOT_FOUND');
    }

    // Se estiver alterando a disciplina, verificar se a nova disciplina existe
    if (updateData.disciplina && updateData.disciplina.toString() !== avaliacao.disciplina.toString()) {
      const disciplina = await Disciplina.findById(updateData.disciplina);
      if (!disciplina) {
        throw new HttpError('Disciplina não encontrada', 404, 'RELATED_RESOURCE_NOT_FOUND');
      }
    }

    // Verificar campos específicos com base no tipo
    const tipo = updateData.tipo || avaliacao.tipo;

    if (tipo === TipoAvaliacao.AP) {
      if (!updateData.trimestre && !avaliacao.trimestre) {
        throw new HttpError(
          'O campo trimestre é obrigatório para avaliações provinciais (AP)', 
          400, 
          'MISSING_REQUIRED_FIELDS'
        );
      }
      if (updateData.provincia && updateData.provincia.toString() !== avaliacao.provincia?.toString()) {
        // Se estiver alterando a provincia, verificar se a nova provincia existe
        const provincia = await Provincia.findById(updateData.provincia);
        if (!provincia) {
          throw new HttpError('Provincia não encontrada', 404, 'RELATED_RESOURCE_NOT_FOUND');
        }
      } else if (avaliacao.provincia && !updateData.provincia) {
        const provincia = await Provincia.findById(avaliacao.provincia);
        if (!provincia) {
          throw new HttpError('Provincia não encontrada', 404, 'RELATED_RESOURCE_NOT_FOUND');
        }
      }
    } else if (tipo === TipoAvaliacao.EXAME) {
      if (!updateData.epoca && !avaliacao.epoca) {
        throw new HttpError(
          'O campo época é obrigatório para exames', 
          400, 
          'MISSING_REQUIRED_FIELDS'
        );
      }
    }

    // Verificar se já existe uma avaliação similar (exceto esta)
    if (updateData.tipo || updateData.disciplina || updateData.ano ||
      updateData.classe || updateData.trimestre || updateData.epoca ||
      updateData.provincia || updateData.variante || updateData.areaEstudo) {

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

      if (updateData.variante) queryFiltro.variante = updateData.variante;
      else if (avaliacao.variante) queryFiltro.variante = avaliacao.variante;

      if (updateData.areaEstudo) queryFiltro.areaEstudo = updateData.areaEstudo;
      else if (avaliacao.areaEstudo) queryFiltro.areaEstudo = avaliacao.areaEstudo;

      if (tipo === TipoAvaliacao.AP) {
        if (updateData.trimestre) queryFiltro.trimestre = updateData.trimestre;
        else if (avaliacao.trimestre) queryFiltro.trimestre = avaliacao.trimestre;
        if (updateData.provincia) queryFiltro.provincia = updateData.provincia;
        else if (avaliacao.provincia) queryFiltro.provincia = avaliacao.provincia;
      }

      if (tipo === TipoAvaliacao.EXAME) {
        if (updateData.epoca) queryFiltro.epoca = updateData.epoca;
        else if (avaliacao.epoca) queryFiltro.epoca = avaliacao.epoca;
      }

      const exists = await Avaliacao.findOne(queryFiltro);
      if (exists) {
        throw new HttpError(
          'Já existe uma avaliação com as mesmas características', 
          409, 
          'DUPLICATE_RESOURCE'
        );
      }
    }

    // Atualizar a avaliação
    const updatedAvaliacao = await Avaliacao.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('disciplina').populate('provincia');

    res.status(200).json(formatResponse(updatedAvaliacao));
  } catch (error) {
    next(error);
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
      throw new HttpError('Avaliação não encontrada', 404, 'RESOURCE_NOT_FOUND');
    }

    // Verificar se a avaliação tem questões associadas
    const questoesCount = avaliacao.questoes?.length || 0;

    if (questoesCount > 0) {
      // Remover todas as questões associadas
      await Questao.deleteMany({ avaliacao: id });
    }

    // Remover a avaliação
    await Avaliacao.findByIdAndDelete(id);

    const message = `Avaliação removida com sucesso${questoesCount > 0 ? 
      ` (incluindo ${questoesCount} questões)` : ''}`;
      
    res.status(200).json(formatResponse(
      null, 
      { questoesRemovidas: questoesCount },
      message
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * Busca avaliações por termo de pesquisa
 */
export const searchAvaliacoes: RequestHandler = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim() === '') {
      throw new HttpError('Termo de busca inválido', 400, 'INVALID_QUERY_PARAM');
    }

    // Escapar caracteres especiais para regex
    const searchTerm = q.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(searchTerm, 'i');

    // Buscar disciplinas com o termo de busca
    const disciplinas = await Disciplina.find({
      $or: [
        { nome: { $regex: regex } },
        { codigo: { $regex: regex } }
      ]
    });

    const disciplinaIds = disciplinas.map(d => d._id);

    // Buscar avaliações que contenham o termo 
    // ou disciplinas com o termo ou áreas de estudo com o termo
    const avaliacoes = await Avaliacao.find({
      $or: [
        { disciplina: { $in: disciplinaIds } },
        { ano: isNaN(Number(q)) ? -1 : Number(q) },
        { areaEstudo: { $regex: regex } },
        { titulo: { $regex: regex } }
      ]
    }).populate('disciplina').populate('provincia');

    res.status(200).json(formatResponse(avaliacoes, {
      total: avaliacoes.length,
      searchTerm: q
    }));
  } catch (error) {
    next(error);
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

    // Novos agregados: Total por área de estudo
    const totalPorAreaEstudo = await Avaliacao.aggregate([
      {
        $group: {
          _id: '$areaEstudo',
          total: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Novos agregados: Total por variante
    const totalPorVariante = await Avaliacao.aggregate([
      {
        $group: {
          _id: '$variante',
          total: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
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

    const estatisticas = {
      porTipo: totalPorTipo,
      porDisciplina: totalPorDisciplina,
      porAno: totalPorAno,
      porAreaEstudo: totalPorAreaEstudo,
      porVariante: totalPorVariante,
      questoes: questoesPorAvaliacao.length > 0 ? questoesPorAvaliacao[0] : { media: 0, min: 0, max: 0, total: 0 }
    };

    res.status(200).json(formatResponse(estatisticas));
  } catch (error) {
    next(error);
  }
};