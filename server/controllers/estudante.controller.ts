import type { Request, Response, NextFunction } from 'express';
import { Estudante } from '../models/estudante';
import { Usuario, TipoUsuario } from '../models/usuario';
import { EstudanteQuiz } from '../models/estudanteQuiz';
import { 
  createEstudanteSchema, 
  updateEstudanteSchema, 
  updatePasswordSchema 
} from '../schemas/estudante.schema';
import { paginationSchema } from '../schemas/common.schema';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { HttpError } from '../utils/error.utils';
import { formatResponse } from '../utils/response.utils';

// Manter todas as funções auxiliares originais intactas
const generatePassword = () => {
  const length = 8;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

/**
 * Cria um novo estudante (juntamente com um novo usuário)
 */
export const createEstudante = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar entrada com Zod - manter a lógica original
    const validatedData = createEstudanteSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      throw new HttpError(
        'Dados inválidos',
        400,
        'VALIDATION_ERROR',
        validatedData.error.format()
      );
    }
    
    const estudanteData = validatedData.data;
    
    // Verificações originais
    const existsEstudante = await Estudante.findOne({ email: estudanteData.email });
    if (existsEstudante) {
      throw new HttpError(
        `Já existe um estudante com o email ${estudanteData.email}`,
        409,
        'DUPLICATE_EMAIL'
      );
    }
    
    const existsUsuario = await Usuario.findOne({ email: estudanteData.email });
    if (existsUsuario) {
      throw new HttpError(
        `Já existe um usuário com o email ${estudanteData.email}`,
        409,
        'DUPLICATE_EMAIL'
      );
    }
    
    // Criar um usuário para o estudante - manter a lógica original
    const saltRounds = 10;
    const password = estudanteData.password || generatePassword();
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const novoUsuario = await Usuario.create({
      nome: estudanteData.nome,
      email: estudanteData.email,
      password: hashedPassword,
      tipo: TipoUsuario.NORMAL
    });
    
    // Criar o estudante - manter a lógica original
    const estudante = await Estudante.create({
      nome: estudanteData.nome,
      email: estudanteData.email,
      classe: estudanteData.classe,
      escola: estudanteData.escola,
      provincia: estudanteData.provincia,
      usuario: novoUsuario._id
    });
    
    // Remover senha do objeto de resposta - manter a lógica original
    const usuarioResponse = {
      _id: novoUsuario._id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      tipo: novoUsuario.tipo
    };
    
    // Determinar se deve retornar a senha temporária na resposta
    const senhaTemporaria = estudanteData.password ? undefined : password;
    
    // Apenas alterar o formato da resposta
    res.status(201).json(formatResponse({
      estudante,
      usuario: usuarioResponse,
      senhaTemporaria
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém todos os estudantes com opção de paginação e filtros
 */
export const getAllEstudantes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar parâmetros de paginação - manter a lógica original
    const validatedQuery = paginationSchema.parse(req.query);
    const { page, limit } = validatedQuery;
    
    // Filtros originais
    const filtro: any = {};
    
    if (req.query.nome) {
      filtro.nome = { $regex: req.query.nome, $options: 'i' };
    }
    
    if (req.query.email) {
      filtro.email = { $regex: req.query.email, $options: 'i' };
    }
    
    if (req.query.classe) {
      filtro.classe = parseInt(req.query.classe as string);
    }
    
    if (req.query.escola) {
      filtro.escola = { $regex: req.query.escola, $options: 'i' };
    }
    
    if (req.query.provincia) {
      filtro.provincia = req.query.provincia;
    }
    
    if (req.query.ativo !== undefined) {
      filtro.ativo = req.query.ativo === 'true';
    }
    
    // Consulta original
    const total = await Estudante.countDocuments(filtro);
    
    const estudantes = await Estudante.find(filtro)
      .populate('usuario', 'nome email tipo')
      .sort({ nome: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    // Apenas alterar o formato da resposta
    res.status(200).json(formatResponse(estudantes, {
      page,
      limit,
      total
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém um estudante pelo ID
 */
export const getEstudanteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('ID de estudante inválido', 400, 'INVALID_ID');
    }
    
    // Consulta original
    const estudante = await Estudante.findById(id).populate('usuario', 'nome email tipo');
    
    if (!estudante) {
      throw new HttpError('Estudante não encontrado', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Apenas alterar o formato da resposta
    res.status(200).json(formatResponse(estudante));
  } catch (error) {
    next(error);
  }
};

/**
 * Atualiza um estudante pelo ID
 */
export const updateEstudante = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('ID de estudante inválido', 400, 'INVALID_ID');
    }
    
    // Validação original
    const validatedData = updateEstudanteSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      throw new HttpError(
        'Dados inválidos',
        400,
        'VALIDATION_ERROR',
        validatedData.error.format()
      );
    }
    
    const updateData = validatedData.data;
    
    // Verificação original
    const estudante = await Estudante.findById(id);
    if (!estudante) {
      throw new HttpError('Estudante não encontrado', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Verificações de email - manter a lógica original
    if (updateData.email && updateData.email !== estudante.email) {
      const emailExists = await Estudante.findOne({ 
        email: updateData.email,
        _id: { $ne: id }
      });
      
      if (emailExists) {
        throw new HttpError(
          `O email ${updateData.email} já está em uso por outro estudante`,
          409,
          'DUPLICATE_EMAIL'
        );
      }
      
      const emailExistsUser = await Usuario.findOne({
        email: updateData.email,
        _id: { $ne: estudante.usuario }
      });
      
      if (emailExistsUser) {
        throw new HttpError(
          `O email ${updateData.email} já está em uso por outro usuário`,
          409,
          'DUPLICATE_EMAIL'
        );
      }
      
      // Atualizar o email no usuário
      await Usuario.findByIdAndUpdate(estudante.usuario, {
        email: updateData.email
      });
    }
    
    // Atualizar nome no usuário - manter a lógica original
    if (updateData.nome) {
      await Usuario.findByIdAndUpdate(estudante.usuario, {
        nome: updateData.nome
      });
    }
    
    // Atualizar o estudante - manter a lógica original
    const updatedEstudante = await Estudante.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('usuario', 'nome email tipo');
    
    // Apenas alterar o formato da resposta
    res.status(200).json(formatResponse(updatedEstudante));
  } catch (error) {
    next(error);
  }
};

/**
 * Remove um estudante pelo ID
 */
export const deleteEstudante = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('ID de estudante inválido', 400, 'INVALID_ID');
    }
    
    // Verificação original
    const estudante = await Estudante.findById(id);
    if (!estudante) {
      throw new HttpError('Estudante não encontrado', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Manter a lógica original de transação
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Remover todos os quizzes do estudante
      await EstudanteQuiz.deleteMany({ estudante: id }).session(session);
      
      // Remover o estudante
      await Estudante.findByIdAndDelete(id).session(session);
      
      // Remover o usuário associado
      await Usuario.findByIdAndDelete(estudante.usuario).session(session);
      
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
    
    // Apenas alterar o formato da resposta
    res.status(200).json(formatResponse(
      null,
      null,
      'Estudante e seus dados associados foram removidos com sucesso'
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * Busca estudantes por termo de pesquisa
 */
export const searchEstudantes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      throw new HttpError('Termo de busca é obrigatório', 400, 'MISSING_QUERY_PARAM');
    }
    
    // Manter a lógica de busca original
    const searchTerm = q.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(searchTerm, 'i');
    
    const estudantes = await Estudante.find({
      $or: [
        { nome: { $regex: regex } },
        { email: { $regex: regex } },
        { escola: { $regex: regex } }
      ]
    }).populate('usuario', 'nome email tipo').limit(50);
    
    // Apenas alterar o formato da resposta
    res.status(200).json(formatResponse(estudantes, {
      page: 1,
      limit: 50,
      total: estudantes.length
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém os quizzes realizados por um estudante
 */
export const getQuizzesEstudante = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('ID de estudante inválido', 400, 'INVALID_ID');
    }
    
    // Verificação original
    const estudante = await Estudante.findById(id);
    if (!estudante) {
      throw new HttpError('Estudante não encontrado', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Manter a lógica original de filtros
    const filtro: any = { estudante: id };
    if (req.query.disciplina) {
      filtro.disciplina = req.query.disciplina;
    }
    
    if (req.query.finalizado !== undefined) {
      filtro.finalizado = req.query.finalizado === 'true';
    }
    
    // Paginação original
    const validatedQuery = paginationSchema.parse(req.query);
    const { page, limit } = validatedQuery;
    
    const total = await EstudanteQuiz.countDocuments(filtro);
    
    const quizzes = await EstudanteQuiz.find(filtro)
      .populate('disciplina', 'nome codigo')
      .populate('avaliacao', 'titulo tipo ano classe')
      .sort({ dataInicio: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    // Apenas alterar o formato da resposta
    res.status(200).json(formatResponse(quizzes, {
      page,
      limit,
      total
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém estatísticas de desempenho por disciplina
 */
export const getEstatisticasPorDisciplina = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('ID de estudante inválido', 400, 'INVALID_ID');
    }
    
    // Verificação original
    const estudante = await Estudante.findById(id);
    if (!estudante) {
      throw new HttpError('Estudante não encontrado', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Manter a lógica original da agregação
    const estatisticasPorDisciplina = await EstudanteQuiz.aggregate([
      {
        $match: {
          estudante: new mongoose.Types.ObjectId(id),
          finalizado: true
        }
      },
      {
        $group: {
          _id: '$disciplina',
          totalQuizzes: { $sum: 1 },
          acertos: { $sum: '$acertos' },
          totalQuestoes: { $sum: '$totalQuestoes' },
          tempoMedio: { $avg: '$tempoGasto' },
          melhorPontuacao: { $max: '$percentualAcertos' },
          piorPontuacao: { $min: '$percentualAcertos' },
          pontuacaoMedia: { $avg: '$percentualAcertos' }
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
          disciplinaId: '$_id',
          disciplinaNome: '$disciplinaInfo.nome',
          disciplinaCodigo: '$disciplinaInfo.codigo',
          totalQuizzes: 1,
          acertos: 1,
          totalQuestoes: 1,
          tempoMedio: 1,
          melhorPontuacao: 1,
          piorPontuacao: 1,
          pontuacaoMedia: 1
        }
      },
      {
        $sort: { pontuacaoMedia: -1 }
      }
    ]);
    
    // Apenas alterar o formato da resposta
    res.status(200).json(formatResponse(estatisticasPorDisciplina));
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém a evolução do desempenho do estudante ao longo do tempo
 */
export const getEvolucaoDesempenho = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('ID de estudante inválido', 400, 'INVALID_ID');
    }
    
    // Verificação original
    const estudante = await Estudante.findById(id);
    if (!estudante) {
      throw new HttpError('Estudante não encontrado', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Manter a lógica original de filtros
    const match: any = {
      estudante: new mongoose.Types.ObjectId(id),
      finalizado: true
    };
    
    if (req.query.disciplina && mongoose.Types.ObjectId.isValid(req.query.disciplina as string)) {
      match.disciplina = new mongoose.Types.ObjectId(req.query.disciplina as string);
    }
    
    // Manter a agregação original
    const evolucaoDesempenho = await EstudanteQuiz.aggregate([
      {
        $match: match
      },
      {
        $project: {
          disciplina: 1,
          dataInicio: 1,
          percentualAcertos: 1,
          acertos: 1,
          totalQuestoes: 1,
          tempoGasto: 1,
          ano: { $year: '$dataInicio' },
          mes: { $month: '$dataInicio' },
          dia: { $dayOfMonth: '$dataInicio' }
        }
      },
      {
        $sort: { dataInicio: 1 }
      },
      {
        $lookup: {
          from: 'disciplinas',
          localField: 'disciplina',
          foreignField: '_id',
          as: 'disciplinaInfo'
        }
      },
      {
        $unwind: {
          path: '$disciplinaInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          dataInicio: 1,
          percentualAcertos: 1,
          acertos: 1,
          totalQuestoes: 1,
          tempoGasto: 1,
          ano: 1,
          mes: 1,
          dia: 1,
          disciplinaId: '$disciplina',
          disciplinaNome: '$disciplinaInfo.nome',
          disciplinaCodigo: '$disciplinaInfo.codigo'
        }
      }
    ]);
    
    // Apenas alterar o formato da resposta
    res.status(200).json(formatResponse(evolucaoDesempenho));
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém o perfil do estudante autenticado
 */
export const getPerfilEstudante = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new HttpError('Usuário não autenticado', 401, 'UNAUTHORIZED');
    }
    
    // Consulta original
    const estudante = await Estudante.findOne({ usuario: userId })
      .populate('usuario', '-password');
    
    if (!estudante) {
      throw new HttpError('Perfil de estudante não encontrado', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Apenas alterar o formato da resposta
    res.status(200).json(formatResponse(estudante));
  } catch (error) {
    next(error);
  }
};

/**
 * Atualiza a senha do estudante
 */
export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('ID de estudante inválido', 400, 'INVALID_ID');
    }
    
    // Validação original
    const validatedData = updatePasswordSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      throw new HttpError(
        'Dados inválidos',
        400,
        'VALIDATION_ERROR',
        validatedData.error.format()
      );
    }
    
    const { password, confirmPassword } = validatedData.data;
    
    if (password !== confirmPassword) {
      throw new HttpError(
        'As senhas não coincidem',
        400,
        'PASSWORD_MISMATCH'
      );
    }
    
    // Verificação original
    const estudante = await Estudante.findById(id);
    if (!estudante) {
      throw new HttpError('Estudante não encontrado', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // Lógica original
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    await Usuario.findByIdAndUpdate(estudante.usuario, {
      password: hashedPassword
    });
    
    // Apenas alterar o formato da resposta
    res.status(200).json(formatResponse(
      null,
      null,
      'Senha atualizada com sucesso'
    ));
  } catch (error) {
    next(error);
  }
};