import { z } from 'zod';
import type { RequestHandler } from 'express';
import { Provincia } from '../models/provincia';
import type { CreateProvinciaInput, UpdateProvinciaInput } from '../schemas/provincia.schema';
import { paginationSchema } from '../schemas/common.schema';
import { Avaliacao } from '../models/avaliacao';
import { HttpError } from '../utils/error.utils';
import { formatResponse } from '../utils/response.utils';

// Schema para validar um array de criação de províncias (usado internamente)
const createProvinciasSchema = z.array(
  z.object({
    nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    codigo: z.string().optional(),
    regiao: z.string().optional(),
  })
).min(1, 'Pelo menos uma província é necessária');

/**
 * Cria múltiplas províncias em massa
 */
export const createProvinciasEmMassa: RequestHandler = async (req, res, next) => {
  try {
    const provinciasData = createProvinciasSchema.parse(req.body);

    const nomes = provinciasData.map(p => p.nome);
    const nomesExistentes = await Provincia.find({ nome: { $in: nomes } }).select('nome').lean();
    if (nomesExistentes.length > 0) {
      const nomesConflitantes = nomesExistentes.map(p => p.nome);
      throw new HttpError(
        `Já existem províncias com os seguintes nomes: ${nomesConflitantes.join(', ')}`,
        409,
        'DUPLICATE_RESOURCE'
      );
    }

    const provincias = await Provincia.insertMany(provinciasData);

    res.status(201).json(formatResponse(
      provincias,
      undefined,
      `Províncias criadas com sucesso (${provincias.length})`
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * Cria uma nova província
 */
export const createProvincia: RequestHandler = async (req, res, next) => {
  try {
    const provinciaData = req.body as CreateProvinciaInput;

    const exists = await Provincia.findOne({ nome: provinciaData.nome });
    if (exists) {
      throw new HttpError(`Já existe uma província com o nome ${provinciaData.nome}`, 409, 'DUPLICATE_RESOURCE');
    }

    const provincia = await Provincia.create(provinciaData);

    res.status(201).json(formatResponse(provincia));
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém todas as províncias com opção de paginação e filtros
 */
export const getAllProvincias: RequestHandler = async (req, res, next) => {
  try {
    // Extrair parâmetros de paginação
    const { page, limit } = paginationSchema.parse({
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 10)
    });

    // Construir filtros dinâmicos com base nos query params
    const filter: any = {};
    if (req.query.regiao) {
      filter.regiao = req.query.regiao;
    }

    const total = await Provincia.countDocuments(filter);

    const provincias = await Provincia.find(filter)
      .sort({ nome: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json(formatResponse(
      provincias,
      { page, limit, total }
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém uma província pelo ID
 */
export const getProvinciaById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const provincia = await Provincia.findById(id);

    if (!provincia) {
      throw new HttpError('Província não encontrada', 404, 'NOT_FOUND');
    }

    res.status(200).json(formatResponse(provincia));
  } catch (error) {
    next(error);
  }
};

/**
 * Atualiza uma província pelo ID
 */
export const updateProvincia: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateProvinciaInput;

    const provincia = await Provincia.findById(id);
    if (!provincia) {
      throw new HttpError('Província não encontrada para atualização', 404, 'NOT_FOUND');
    }

    if (updateData.nome && updateData.nome !== provincia.nome) {
      const exists = await Provincia.findOne({ nome: updateData.nome, _id: { $ne: id } });
      if (exists) {
        throw new HttpError(`Já existe outra província com o nome ${updateData.nome}`, 409, 'DUPLICATE_RESOURCE');
      }
    }

    const updatedProvincia = await Provincia.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedProvincia) {
      throw new HttpError('Falha ao atualizar a província, recurso não encontrado após tentativa de atualização.', 404, 'NOT_FOUND');
    }

    res.status(200).json(formatResponse(updatedProvincia));
  } catch (error) {
    next(error);
  }
};

/**
 * Remove uma província pelo ID
 */
export const deleteProvincia: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const provincia = await Provincia.findById(id);
    if (!provincia) {
      throw new HttpError('Província não encontrada para remoção', 404, 'NOT_FOUND');
    }

    const avaliacoesComProvincia = await Avaliacao.countDocuments({ provincia: id });
    if (avaliacoesComProvincia > 0) {
      throw new HttpError(
        `Esta província não pode ser removida pois está associada a ${avaliacoesComProvincia} avaliação(ões)`,
        409,
        'RESOURCE_IN_USE'
      );
    }

    await Provincia.findByIdAndDelete(id);

    res.status(200).json(formatResponse(null, undefined, 'Província removida com sucesso'));
  } catch (error) {
    next(error);
  }
};

/**
 * Busca províncias por termo de pesquisa
 */
export const searchProvincias: RequestHandler = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim() === '') {
      throw new HttpError('Termo de busca (parâmetro "q") é obrigatório e não pode ser vazio', 400, 'INVALID_QUERY_PARAM');
    }

    const searchTerm = q.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(searchTerm, 'i');

    const provincias = await Provincia.find({
      $or: [
        { nome: { $regex: regex } },
        { codigo: { $regex: regex } },
        { regiao: { $regex: regex } }
      ]
    })
    .limit(50);

    res.status(200).json(formatResponse(
      provincias,
      undefined,
      `Resultados da busca para "${q}"`
    ));
  } catch (error) {
    next(error);
  }
};