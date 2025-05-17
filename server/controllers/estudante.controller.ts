import type { Request, Response, NextFunction } from 'express';
import { Estudante } from '../models/estudante';
import { EstudanteQuiz } from '../models/estudanteQuiz';
import { QuizResposta } from '../models/quizResposta';
import { createEstudanteSchema, type CreateEstudanteInput, type UpdateEstudanteInput } from '../schemas/estudante.schema';
import { paginationSchema } from '../schemas/common.schema';
import { Usuario, TipoUsuario } from '../models/usuario';
import bcrypt from 'bcrypt';
import { generatePassword } from '../utils/password-generator';
import { CustomError } from '../middlewares/errorHandler';

/**
 * Cria um novo estudante
 */
export const createEstudante = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar entrada com Zod
    const validatedData = createEstudanteSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Dados inválidos',
        errors: validatedData.error.format()
      });
    }
    
    const estudanteData = validatedData.data;
    
    // Verificar se já existe um estudante com o mesmo email
    const existsEstudante = await Estudante.findOne({ email: estudanteData.email });
    if (existsEstudante) {
      return res.status(409).json({
        status: 'error',
        message: `Já existe um estudante com o email ${estudanteData.email}`
      });
    }
    
    // Verificar se já existe um usuário com o mesmo email
    const existsUsuario = await Usuario.findOne({ email: estudanteData.email });
    if (existsUsuario) {
      return res.status(409).json({
        status: 'error',
        message: `Já existe um usuário com o email ${estudanteData.email}`
      });
    }
    
    // Criar um usuário para o estudante
    const saltRounds = 10;
    // Use a senha fornecida ou gere uma senha aleatória
    const password = estudanteData.password || generatePassword();
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const novoUsuario = await Usuario.create({
      nome: estudanteData.nome,
      email: estudanteData.email,
      password: hashedPassword,
      tipo: TipoUsuario.NORMAL // Estudantes são usuários normais
    });
    
    // Criar o estudante associado ao usuário
    const estudante = await Estudante.create({
      nome: estudanteData.nome,
      email: estudanteData.email,
      classe: estudanteData.classe,
      escola: estudanteData.escola,
      provincia: estudanteData.provincia,
      usuario: novoUsuario._id
    });
    
    // Remover senha do objeto de resposta
    const usuarioResponse = {
      _id: novoUsuario._id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      tipo: novoUsuario.tipo
    };
    
    // Determinar se deve retornar a senha temporária na resposta
    const senhaTemporaria = estudanteData.password ? undefined : password;
    
    return res.status(201).json({
      status: 'success',
      data: {
        estudante,
        usuario: usuarioResponse,
        senhaTemporaria
      }
    });
  } catch (err: unknown) {
    const error = err as any;

     // Identificar erros específicos
     if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Dados de estudante inválidos',
        errors: Object.values(error.errors).map((err: any) => err.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({
        status: 'error',
        message: 'Já existe um estudante com este email'
      });
    }
    
    return next(err);
  }
};

/**
 * Obtém todos os estudantes com opção de paginação e filtro
 */
export const getAllEstudantes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = paginationSchema.parse({
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 10)
    });
    
    // Filtros opcionais
    const filtro: any = {};
    
    // Filtrar por classe
    if (req.query.classe && ['10', '11', '12'].includes(req.query.classe as string)) {
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
    
    // Filtrar por status ativo/inativo
    if (req.query.ativo !== undefined) {
      filtro.ativo = req.query.ativo === 'true';
    }
    
    // Consulta para obter o total de estudantes com filtros
    const total = await Estudante.countDocuments(filtro);
    
    // Consulta paginada com filtros
    const estudantes = await Estudante.find(filtro)
      .sort({ nome: 1 }) // Ordenar por nome
      .skip((page - 1) * limit)
      .limit(limit);
    
    // Para cada estudante, obter informações básicas sobre participação em quizzes
    const estudantesDetalhados = await Promise.all(estudantes.map(async (estudante) => {
      const quizzesParticipados = await EstudanteQuiz.countDocuments({
        estudante: estudante._id
      });
      
      const quizzesFinalizados = await EstudanteQuiz.countDocuments({
        estudante: estudante._id,
        dataFim: { $exists: true }
      });
      
      return {
        ...estudante.toObject(),
        _extras: {
          quizzesParticipados,
          quizzesFinalizados
        }
      };
    }));
    
    return res.status(200).json({
      status: 'success',
      data: estudantesDetalhados,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        filtros: Object.keys(filtro).length > 0 ? filtro : 'nenhum'
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Obtém um estudante pelo ID
 */
export const getEstudanteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const estudante = await Estudante.findById(id);
    
    if (!estudante) {
      return res.status(404).json({
        status: 'error',
        message: 'Estudante não encontrado'
      });
    }
    
    // Obter informações de participação em quizzes
    const quizzesParticipados = await EstudanteQuiz.countDocuments({
      estudante: id
    });
    
    const quizzesFinalizados = await EstudanteQuiz.countDocuments({
      estudante: id,
      dataFim: { $exists: true }
    });
    
    // Calcular estatísticas básicas
    const quizzesInfo = await EstudanteQuiz.aggregate([
      { $match: { 
        estudante: estudante._id,
        dataFim: { $exists: true }
      }},
      { $group: {
        _id: null,
        mediaAcerto: { $avg: "$percentualAcerto" },
        totalPontos: { $sum: "$pontuacaoObtida" }
      }}
    ]);
    
    const mediaAcerto = quizzesInfo.length > 0 ? quizzesInfo[0].mediaAcerto : 0;
    const totalPontos = quizzesInfo.length > 0 ? quizzesInfo[0].totalPontos : 0;
    
    return res.status(200).json({
      status: 'success',
      data: {
        ...estudante.toObject(),
        _extras: {
          quizzesParticipados,
          quizzesFinalizados,
          mediaAcerto: Math.round(mediaAcerto * 100) / 100,
          totalPontos
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Atualiza um estudante pelo ID
 */
export const updateEstudante = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const estudanteData = req.body as UpdateEstudanteInput;
    
    const estudante = await Estudante.findById(id);
    if (!estudante) {
      return res.status(404).json({
        status: 'error',
        message: 'Estudante não encontrado'
      });
    }
    
    // Se o email estiver sendo atualizado, atualizar também o usuário
    if (estudanteData.email && estudanteData.email !== estudante.email) {
      // Verificar se o novo email já está em uso
      const emailExists = await Usuario.findOne({ 
        email: estudanteData.email,
        _id: { $ne: estudante.usuario }
      });
      
      if (emailExists) {
        return res.status(409).json({
          status: 'error',
          message: `Já existe um usuário com o email ${estudanteData.email}`
        });
      }
      
      // Atualizar email do usuário associado
      await Usuario.findByIdAndUpdate(estudante.usuario, {
        email: estudanteData.email,
        nome: estudanteData.nome || undefined
      });
    } else if (estudanteData.nome) {
      // Atualizar apenas o nome do usuário se o email não mudar
      await Usuario.findByIdAndUpdate(estudante.usuario, {
        nome: estudanteData.nome
      });
    }
    
    // Atualizar o estudante
    const estudanteAtualizado = await Estudante.findByIdAndUpdate(
      id,
      estudanteData,
      { new: true, runValidators: true }
    );
    
    return res.status(200).json({
      status: 'success',
      data: estudanteAtualizado
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Remove um estudante pelo ID
 */
export const deleteEstudante = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const estudante = await Estudante.findById(id);
    if (!estudante) {
      return res.status(404).json({
        status: 'error',
        message: 'Estudante não encontrado'
      });
    }
    
    // Excluir o usuário associado
    await Usuario.findByIdAndDelete(estudante.usuario);
    
    // Excluir o estudante
    await Estudante.findByIdAndDelete(id);
    
    return res.status(200).json({
      status: 'success',
      message: 'Estudante excluído com sucesso'
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Busca estudantes por termo de pesquisa
 */
export const searchEstudantes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Termo de busca inválido'
      });
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
    
    // Para cada estudante, obter informações básicas sobre participação em quizzes
    const estudantesDetalhados = await Promise.all(estudantes.map(async (estudante) => {
      const quizzesParticipados = await EstudanteQuiz.countDocuments({
        estudante: estudante._id
      });
      
      return {
        ...estudante.toObject(),
        _extras: {
          quizzesParticipados
        }
      };
    }));
    
    return res.status(200).json({
      status: 'success',
      data: estudantesDetalhados,
      meta: {
        total: estudantes.length
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Obtém quizzes de um estudante
 */
export const getQuizzesEstudante = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
    // Verificar se o estudante existe
    const estudante = await Estudante.findById(id);
    if (!estudante) {
      return res.status(404).json({
        status: 'error',
        message: 'Estudante não encontrado'
      });
    }
    
    // Filtro por status (em andamento ou finalizados)
    const filtro: any = { estudante: id };
    
    if (status === 'finalizados') {
      filtro.dataFim = { $exists: true };
    } else if (status === 'em_andamento') {
      filtro.dataFim = { $exists: false };
    }
    
    // Buscar todos os quizzes do estudante com informações relacionadas
    const quizzes = await EstudanteQuiz.find(filtro)
      .populate({
        path: 'quiz',
        populate: {
          path: 'avaliacao',
          populate: 'disciplina'
        }
      })
      .sort({ dataInicio: -1 }); // Ordenar por data de início (mais recentes primeiro)
    
    return res.status(200).json({
      status: 'success',
      data: quizzes,
      meta: {
        total: quizzes.length
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Obtém estatísticas dos quizzes de um estudante agrupadas por disciplina
 */
export const getEstatisticasPorDisciplina = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Verificar se o estudante existe
    const estudante = await Estudante.findById(id);
    if (!estudante) {
      return res.status(404).json({
        status: 'error',
        message: 'Estudante não encontrado'
      });
    }
    
    // Buscar quizzes finalizados do estudante
    const quizzes = await EstudanteQuiz.find({ 
      estudante: id,
      dataFim: { $exists: true }
    }).populate({
      path: 'quiz',
      populate: {
        path: 'avaliacao',
        populate: 'disciplina'
      }
    });
    
    // Agrupar por disciplina
    const estatisticasPorDisciplina: Record<string, any> = {};
    
    quizzes.forEach(quiz => {
      const avaliacaoInfo = (quiz.quiz as any)?.avaliacao;
      const disciplinaInfo = avaliacaoInfo?.disciplina;
      
      if (!disciplinaInfo) return;
      
      const disciplinaId = disciplinaInfo._id.toString();
      
      if (!estatisticasPorDisciplina[disciplinaId]) {
        estatisticasPorDisciplina[disciplinaId] = {
          disciplina: {
            id: disciplinaId,
            nome: disciplinaInfo.nome,
            codigo: disciplinaInfo.codigo
          },
          quizzes: [],
          totalQuizzes: 0,
          mediaAcerto: 0,
          totalPontos: 0
        };
      }
      
      estatisticasPorDisciplina[disciplinaId].quizzes.push({
        id: quiz._id,
        titulo: (quiz.quiz as any).titulo,
        dataInicio: quiz.dataInicio,
        dataFim: quiz.dataFim,
        percentualAcerto: quiz.percentualAcerto,
        pontuacaoObtida: quiz.pontuacaoObtida
      });
      
      estatisticasPorDisciplina[disciplinaId].totalQuizzes += 1;
      estatisticasPorDisciplina[disciplinaId].totalPontos += quiz.pontuacaoObtida;
    });
    
    // Calcular médias
    Object.values(estatisticasPorDisciplina).forEach((disciplina: any) => {
      disciplina.mediaAcerto = disciplina.quizzes.reduce(
        (acc: number, quiz: any) => acc + quiz.percentualAcerto, 0
      ) / disciplina.totalQuizzes;
      
      // Remover a lista de quizzes da resposta (para reduzir o tamanho)
      // Se você precisa dos quizzes detalhados, remova esta linha
      delete disciplina.quizzes;
    });
    
    return res.status(200).json({
      status: 'success',
      data: Object.values(estatisticasPorDisciplina)
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Obtém a evolução de desempenho do estudante ao longo do tempo
 */
export const getEvolucaoDesempenho = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const periodoMeses = Number(req.query.meses || 3); // Padrão: últimos 3 meses
    
    // Verificar se o estudante existe
    const estudante = await Estudante.findById(id);
    if (!estudante) {
      return res.status(404).json({
        status: 'error',
        message: 'Estudante não encontrado'
      });
    }
    
    // Calcular a data limite
    const dataLimite = new Date();
    dataLimite.setMonth(dataLimite.getMonth() - periodoMeses);
    
    // Buscar quizzes finalizados do estudante no período
    const quizzes = await EstudanteQuiz.find({ 
      estudante: id,
      dataFim: { $exists: true, $gte: dataLimite }
    })
    .populate({
      path: 'quiz',
      populate: {
        path: 'avaliacao',
        populate: 'disciplina'
      }
    })
    .sort({ dataFim: 1 }); // Ordenar cronologicamente
    
    // Preparar dados de evolução
    const evolucao = quizzes.map(quiz => {
      const disciplinaNome = (quiz.quiz as any)?.avaliacao?.disciplina?.nome || 'Desconhecida';
      
      return {
        data: quiz.dataFim,
        quizId: quiz._id,
        quizTitulo: (quiz.quiz as any)?.titulo || 'Quiz sem título',
        disciplina: disciplinaNome,
        percentualAcerto: quiz.percentualAcerto,
        pontuacaoObtida: quiz.pontuacaoObtida,
        totalQuestoes: quiz.totalQuestoes
      };
    });
    
    // Agrupar por mês para análise de tendência
    const evolucaoPorMes: Record<string, any> = {};
    
    quizzes.forEach(quiz => {
      if (!quiz.dataFim) return;
      
      const data = quiz.dataFim;
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      
      if (!evolucaoPorMes[chave]) {
        evolucaoPorMes[chave] = {
          mes: chave,
          quizzes: 0,
          somaPercentuais: 0,
          somaPontos: 0
        };
      }
      
      evolucaoPorMes[chave].quizzes += 1;
      evolucaoPorMes[chave].somaPercentuais += quiz.percentualAcerto;
      evolucaoPorMes[chave].somaPontos += quiz.pontuacaoObtida;
    });
    
    // Calcular médias mensais
    const tendenciaMensal = Object.entries(evolucaoPorMes).map(([mes, dados]: [string, any]) => ({
      mes,
      quizzes: dados.quizzes,
      mediaAcerto: dados.somaPercentuais / dados.quizzes,
      mediaPontos: dados.somaPontos / dados.quizzes
    }));
    
    return res.status(200).json({
      status: 'success',
      data: {
        evolucaoDetalhada: evolucao,
        tendenciaMensal: tendenciaMensal.sort((a, b) => a.mes.localeCompare(b.mes)) // Ordenar por mês
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Obtém o perfil do estudante autenticado
 */
export const getEstudanteProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Não autenticado'
      });
    }
    
    // Extrair ID do usuário autenticado
    const { id: usuarioId } = req.user;
    
    // Verificar se o usuário é um estudante
    const usuario = await Usuario.findById(usuarioId)
      .select('-password'); // Excluir a senha da resposta
    
    if (!usuario) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }
    
    if (usuario.tipo !== TipoUsuario.NORMAL) {
      return res.status(403).json({
        status: 'error',
        message: 'Acesso negado. Apenas estudantes podem acessar este recurso.'
      });
    }
    
    // Buscar o perfil do estudante usando select para incluir só os campos necessários
    const estudante = await Estudante.findOne({ usuario: usuarioId })
      .select('nome email classe escola provincia ativo');
    
    if (!estudante) {
      return res.status(404).json({
        status: 'error',
        message: 'Perfil de estudante não encontrado'
      });
    }
    
    // Agrupamento das estatísticas em uma única consulta
    const [
      totalQuizzes,
      avaliacoesConcluidas,
      estatisticas
    ] = await Promise.all([
      EstudanteQuiz.countDocuments({ estudante: estudante._id }),
      EstudanteQuiz.countDocuments({ 
        estudante: estudante._id,
        dataFim: { $exists: true } 
      }),
      EstudanteQuiz.aggregate([
        { $match: { estudante: estudante._id, dataFim: { $exists: true } } },
        { $group: {
          _id: null,
          mediaAcertos: { $avg: '$percentualAcerto' },
          totalPontos: { $sum: '$pontuacaoObtida' }
        }}
      ])
    ]);
    
    const mediaAcertos = estatisticas.length > 0 ? estatisticas[0].mediaAcertos : 0;
    const totalPontos = estatisticas.length > 0 ? estatisticas[0].totalPontos : 0;
    
    return res.status(200).json({
      status: 'success',
      data: {
        estudante,
        usuario: {
          _id: usuario._id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo
        },
        estatisticas: {
          totalQuizzes,
          avaliacoesConcluidas,
          mediaAcertos: Math.round(mediaAcertos * 100) / 100, // Arredondar para 2 casas decimais
          totalPontos
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Altera a senha do estudante autenticado
 */
export const alterarSenhaEstudante = async (req: Request, res: Response, next: NextFunction) => {
  try {
     // Verificar se o usuário está autenticado
     if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Não autenticado'
      });
    }
    
    const { senhaAtual, novaSenha } = req.body;
    const { id: usuarioId } = req.user;
    
    // Validar inputs
    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        status: 'error',
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }
    
    if (novaSenha.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'A nova senha deve ter pelo menos 6 caracteres'
      });
    }
    
    // Buscar usuário
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }
    
    // Verificar senha atual
    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.password);
    if (!senhaCorreta) {
      return res.status(401).json({
        status: 'error',
        message: 'Senha atual incorreta'
      });
    }
    
    // Atualizar senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(novaSenha, saltRounds);
    
    await Usuario.findByIdAndUpdate(usuarioId, {
      password: hashedPassword
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    return next(error);
  }
};