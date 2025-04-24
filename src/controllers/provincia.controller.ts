// import type { RequestHandler } from 'express'; <-- Remova esta importação
import { Provincia } from '../models/provincia';
import type { CreateProvinciaInput, UpdateProvinciaInput } from '../schemas/provincia.schema';
import { paginationSchema } from '../schemas/common.schema';
import { Avaliacao } from '../models/avaliacao';
import { z } from 'zod';
import type { CustomRequestHandler } from '../middlewares/customHandler'; // Importe o tipo personalizado

// Schema para validar um array de criação de províncias
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
export const createProvinciasEmMassa: CustomRequestHandler = async (req, res, next) => {
  try {
    const provinciasData = createProvinciasSchema.parse(req.body);

    // Verificar se já existem províncias com os mesmos nomes
    const nomesExistentes = await Provincia.find({ nome: { $in: provinciasData.map(p => p.nome) } }).select('nome').lean();
    if (nomesExistentes.length > 0) {
      const nomesConflitantes = nomesExistentes.map(p => p.nome);
      return res.status(409).json({
        status: 'error',
        message: 'Algumas províncias já existem',
        data: nomesConflitantes
      });
    }

    const provincias = await Provincia.insertMany(provinciasData);

    return res.status(201).json({
      status: 'success',
      data: provincias,
      meta: {
        total: provincias.length
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Se for um erro de validação do Zod, retorna uma resposta formatada
      return res.status(400).json({
        status: 'error',
        message: 'Erro de validação',
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    next(error);
  }
};

/**
 * Cria uma nova província
 */
export const createProvincia: CustomRequestHandler = async (req, res, next) => {
  try {
    const provinciaData = req.body as CreateProvinciaInput;
    
    // Verificar se já existe uma província com o mesmo nome
    const exists = await Provincia.findOne({ nome: provinciaData.nome });
    if (exists) {
      return res.status(409).json({
        status: 'error',
        message: `Já existe uma província com o nome ${provinciaData.nome}`
      });
    }
    
    const provincia = await Provincia.create(provinciaData);
    
    return res.status(201).json({
      status: 'success',
      data: provincia
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém todas as províncias com opção de paginação
 */
export const getAllProvincias: CustomRequestHandler = async (req, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse({
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 10)
    });
    
    const total = await Provincia.countDocuments();
    
    const provincias = await Provincia.find()
      .sort({ nome: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    return res.status(200).json({
      status: 'success',
      data: provincias,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém uma província pelo ID
 */
export const getProvinciaById: CustomRequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const provincia = await Provincia.findById(id);
    
    if (!provincia) {
      return res.status(404).json({
        status: 'error',
        message: 'Provincia não encontrada'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: provincia
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Atualiza uma província pelo ID
 */
export const updateProvincia: CustomRequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateProvinciaInput;
    
    const provincia = await Provincia.findById(id);
    if (!provincia) {
      return res.status(404).json({
        status: 'error',
        message: 'Provincia não encontrada'
      });
    }
    
    if (updateData.nome && updateData.nome !== provincia.nome) {
      const exists = await Provincia.findOne({ nome: updateData.nome, _id: { $ne: id } });
      if (exists) {
        return res.status(409).json({
          status: 'error',
          message: `Já existe uma província com o nome ${updateData.nome}`
        });
      }
    }
    
    const updatedProvincia = await Provincia.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    
    return res.status(200).json({
      status: 'success',
      data: updatedProvincia
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove uma província pelo ID
 */
export const deleteProvincia: CustomRequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const provincia = await Provincia.findById(id);
    if (!provincia) {
      return res.status(404).json({
        status: 'error',
        message: 'Provincia não encontrada'
      });
    }
    
    // Verificar se a província está sendo usada em avaliações (se necessário)
    const avaliacoesComProvincia = await Avaliacao.countDocuments({ provincia: id });
    if (avaliacoesComProvincia > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'Esta província não pode ser removida pois está sendo usada em avaliações'
      });
    }
    
    await Provincia.findByIdAndDelete(id);
    
    return res.status(200).json({
      status: 'success',
      message: 'Provincia removida com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Busca províncias por termo de pesquisa
 */
export const searchProvincias: CustomRequestHandler = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Termo de busca inválido'
      });
    }
    
    const provincias = await Provincia.find({
      $or: [
        { nome: { $regex: q, $options: 'i' } },
        { codigo: { $regex: q, $options: 'i' } },
        { regiao: { $regex: q, $options: 'i' } }
      ]
    });
    
    return res.status(200).json({
      status: 'success',
      data: provincias,
      meta: {
        total: provincias.length
      }
    });
  } catch (error) {
    next(error);
  }
};