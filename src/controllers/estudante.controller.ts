import type { RequestHandler } from 'express';
import { Estudante } from '../models/estudante';
import { EstudanteQuiz } from '../models/estudanteQuiz';
import { QuizResposta } from '../models/quizResposta';
import type { CreateEstudanteInput, UpdateEstudanteInput } from '../schemas/estudante.schema';
import { paginationSchema } from '../schemas/common.schema';

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
    next(error);
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
    
    res.status(200).json({
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
    next(error);
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
    
    res.status(200).json({
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
    next(error);
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
    next(error);
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
    
    // Verificar se o estudante tem quizzes associados
    const quizzes = await EstudanteQuiz.find({ estudante: id });
    
    if (quizzes.length > 0) {
      // Para cada quiz do estudante, remover todas as respostas associadas
      for (const quiz of quizzes) {
        await QuizResposta.deleteMany({ estudanteQuiz: quiz._id });
      }
      
      // Remover todos os quizzes do estudante
      await EstudanteQuiz.deleteMany({ estudante: id });
    }
    
    // Remover o estudante
    await Estudante.findByIdAndDelete(id);
    
    res.status(200).json({
      status: 'success',
      message: quizzes.length > 0 
        ? `Estudante removido com sucesso (incluindo ${quizzes.length} quizzes e todas as respostas)` 
        : 'Estudante removido com sucesso'
    });
  } catch (error) {
    next(error);
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
    
    res.status(200).json({
      status: 'success',
      data: estudantesDetalhados,
      meta: {
        total: estudantes.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém quizzes de um estudante
 */
export const getQuizzesEstudante: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
    // Verificar se o estudante existe
    const estudante = await Estudante.findById(id);
    if (!estudante) {
      res.status(404).json({
        status: 'error',
        message: 'Estudante não encontrado'
      });
      return;
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
    
    res.status(200).json({
      status: 'success',
      data: quizzes,
      meta: {
        total: quizzes.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém estatísticas dos quizzes de um estudante agrupadas por disciplina
 */
export const getEstatisticasPorDisciplina: RequestHandler = async (req, res, next) => {
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
    
    res.status(200).json({
      status: 'success',
      data: Object.values(estatisticasPorDisciplina)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém a evolução de desempenho do estudante ao longo do tempo
 */
export const getEvolucaoDesempenho: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const periodoMeses = Number(req.query.meses || 3); // Padrão: últimos 3 meses
    
    // Verificar se o estudante existe
    const estudante = await Estudante.findById(id);
    if (!estudante) {
      res.status(404).json({
        status: 'error',
        message: 'Estudante não encontrado'
      });
      return;
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
    
    res.status(200).json({
      status: 'success',
      data: {
        evolucaoDetalhada: evolucao,
        tendenciaMensal: tendenciaMensal.sort((a, b) => a.mes.localeCompare(b.mes)) // Ordenar por mês
      }
    });
  } catch (error) {
    next(error);
  }
};