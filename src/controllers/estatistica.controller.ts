import type { RequestHandler } from 'express';
import { Estudante } from '../models/estudante';
import { EstudanteQuiz } from '../models/estudanteQuiz';
import { QuizResposta } from '../models/quizResposta';
import { Quiz } from '../models/quiz';
import mongoose from 'mongoose';

/**
 * Obtém estatísticas gerais de um estudante (todos os quizzes)
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
    
    // Buscar todos os quizzes que o estudante participou
    const quizzesParticipados = await EstudanteQuiz.find({ 
      estudante: id,
      dataFim: { $exists: true } // Apenas quizzes finalizados
    }).populate({
      path: 'quiz',
      populate: {
        path: 'avaliacao',
        populate: 'disciplina'
      }
    });
    
    // Estatísticas gerais
    const totalQuizzes = quizzesParticipados.length;
    const totalQuestoes = quizzesParticipados.reduce((acc, eq) => acc + eq.totalQuestoes, 0);
    const respostasCorretas = quizzesParticipados.reduce((acc, eq) => acc + eq.respostasCorretas, 0);
    const percentualGeral = totalQuestoes > 0 
      ? Math.round((respostasCorretas / totalQuestoes) * 10000) / 100 
      : 0;
    
    // Estatísticas por disciplina
    const estatisticasPorDisciplina: Record<string, {
      nome: string,
      quizzes: number,
      totalQuestoes: number,
      respostasCorretas: number,
      percentualAcerto: number
    }> = {};
    
    // Agrupar por disciplina
    quizzesParticipados.forEach(estudanteQuiz => {
      const quiz = estudanteQuiz.quiz as any;
      if (!quiz || !quiz.avaliacao || !quiz.avaliacao.disciplina) return;
      
      const disciplina = quiz.avaliacao.disciplina;
      const disciplinaId = disciplina._id.toString();
      
      if (!estatisticasPorDisciplina[disciplinaId]) {
        estatisticasPorDisciplina[disciplinaId] = {
          nome: disciplina.nome,
          quizzes: 0,
          totalQuestoes: 0,
          respostasCorretas: 0,
          percentualAcerto: 0
        };
      }
      
      estatisticasPorDisciplina[disciplinaId].quizzes += 1;
      estatisticasPorDisciplina[disciplinaId].totalQuestoes += estudanteQuiz.totalQuestoes;
      estatisticasPorDisciplina[disciplinaId].respostasCorretas += estudanteQuiz.respostasCorretas;
    });
    
    // Calcular percentuais para cada disciplina
    Object.values(estatisticasPorDisciplina).forEach(stats => {
      stats.percentualAcerto = stats.totalQuestoes > 0 
        ? Math.round((stats.respostasCorretas / stats.totalQuestoes) * 10000) / 100 
        : 0;
    });
    
    // Evolução temporal (últimos 6 quizzes)
    const evolucaoTemporal = await EstudanteQuiz.find({ 
      estudante: id,
      dataFim: { $exists: true }
    })
    .sort({ dataFim: -1 })
    .limit(6)
    .select('dataFim percentualAcerto quiz')
    .populate('quiz', 'titulo');
    
    const dadosEvolucao = evolucaoTemporal.map(eq => ({
      data: eq.dataFim,
      percentual: eq.percentualAcerto,
      quiz: (eq.quiz as any).titulo
    })).reverse(); // Ordenar do mais antigo para o mais recente
    
    res.status(200).json({
      status: 'success',
      data: {
        geral: {
          totalQuizzes,
          totalQuestoes,
          respostasCorretas,
          percentualAcerto: percentualGeral
        },
        disciplinas: Object.values(estatisticasPorDisciplina),
        evolucao: dadosEvolucao
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

/**
 * Obtém estatísticas detalhadas de um quiz específico realizado pelo estudante
 */
export const getEstatisticasQuiz: RequestHandler = async (req, res, next) => {
  try {
    const { estudanteId, quizId } = req.params;
    
    // Verificar se o estudante existe
    const estudante = await Estudante.findById(estudanteId);
    if (!estudante) {
      res.status(404).json({
        status: 'error',
        message: 'Estudante não encontrado'
      });
      return;
    }
    
    // Buscar a tentativa do quiz
    const estudanteQuiz = await EstudanteQuiz.findOne({
      estudante: estudanteId,
      quiz: quizId,
      dataFim: { $exists: true } // Apenas quizzes finalizados
    }).populate({
      path: 'quiz',
      populate: {
        path: 'avaliacao',
        populate: {
          path: 'disciplina'
        }
      }
    });
    
    if (!estudanteQuiz) {
      res.status(404).json({
        status: 'error',
        message: 'Tentativa de quiz não encontrada ou não finalizada'
      });
      return;
    }
    
    // Buscar todas as respostas do estudante neste quiz
    const respostas = await QuizResposta.find({
      estudanteQuiz: estudanteQuiz._id
    }).populate({
      path: 'questao',
      select: 'numero enunciado alternativas explicacao valor'
    });
    
    // Obter informações do quiz
    const quizInfo = estudanteQuiz.quiz as any;
    const avaliacaoInfo = quizInfo?.avaliacao || {};
    const disciplinaInfo = avaliacaoInfo?.disciplina || {};
    
    // Dados gerais da tentativa
    const duracao = estudanteQuiz.dataFim && estudanteQuiz.dataInicio 
      ? Math.round((estudanteQuiz.dataFim.getTime() - estudanteQuiz.dataInicio.getTime()) / 60000) 
      : null;
    
    const dadosGerais = {
      dataInicio: estudanteQuiz.dataInicio,
      dataFim: estudanteQuiz.dataFim,
      duracao, // em minutos
      respostasCorretas: estudanteQuiz.respostasCorretas,
      totalQuestoes: estudanteQuiz.totalQuestoes,
      percentualAcerto: estudanteQuiz.percentualAcerto,
      pontuacaoObtida: estudanteQuiz.pontuacaoObtida,
      totalPontos: estudanteQuiz.totalPontos
    };
    
    // Detalhes das respostas
    const detalhesRespostas = respostas.map(resposta => {
      const questao = resposta.questao as any;
      
      // Encontrar a alternativa escolhida
      const alternativaEscolhida = questao.alternativas.find(
        (alt: any) => alt.letra === resposta.respostaEscolhida
      );
      
      // Encontrar a alternativa correta
      const alternativaCorreta = questao.alternativas.find(
        (alt: any) => alt.correta === true
      );
      
      return {
        questaoId: questao._id,
        numero: questao.numero,
        enunciado: questao.enunciado,
        alternativaEscolhida: {
          letra: resposta.respostaEscolhida,
          texto: alternativaEscolhida?.texto || 'Não encontrada'
        },
        alternativaCorreta: {
          letra: alternativaCorreta?.letra || '?',
          texto: alternativaCorreta?.texto || 'Não especificada'
        },
        estaCorreta: resposta.estaCorreta,
        tempoResposta: resposta.tempoResposta,
        pontuacaoObtida: resposta.pontuacaoObtida,
        valorQuestao: questao.valor || 1,
        explicacao: questao.explicacao
      };
    });
    
    // Análise das respostas
    const respostasCorretas = detalhesRespostas.filter(r => r.estaCorreta);
    const respostasIncorretas = detalhesRespostas.filter(r => !r.estaCorreta);
    
    const tempoMedioResposta = detalhesRespostas
      .filter(r => r.tempoResposta)
      .reduce((acc, r) => acc + (r.tempoResposta || 0), 0) / 
      detalhesRespostas.filter(r => r.tempoResposta).length || 0;
    
    // Preparar a resposta
    res.status(200).json({
      status: 'success',
      data: {
        quiz: {
          id: quizInfo?._id,
          titulo: quizInfo?.titulo || 'Quiz sem título',
          avaliacao: {
            id: avaliacaoInfo?._id,
            tipo: avaliacaoInfo?.tipo,
            ano: avaliacaoInfo?.ano,
            classe: avaliacaoInfo?.classe
          },
          disciplina: {
            id: disciplinaInfo?._id,
            nome: disciplinaInfo?.nome || 'Disciplina não especificada',
            codigo: disciplinaInfo?.codigo
          }
        },
        estudante: {
          id: estudante._id,
          nome: estudante.nome,
          classe: estudante.classe
        },
        tentativa: {
          id: estudanteQuiz._id,
          geral: dadosGerais,
          analise: {
            tempoMedioResposta: Math.round(tempoMedioResposta * 10) / 10, // em segundos, com 1 casa decimal
            totalCorretas: respostasCorretas.length,
            totalIncorretas: respostasIncorretas.length,
            percentualAcerto: estudanteQuiz.percentualAcerto
          }
        },
        respostas: detalhesRespostas.sort((a, b) => a.numero - b.numero) // Ordenar por número da questão
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas do quiz:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao obter estatísticas do quiz'
    });
  }
};

export const getRanking: RequestHandler = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const limit = Number(req.query.limit || 10);
    
    let pipeline: any[] = [];
    
    if (quizId) {
      // Ranking específico para um quiz
      pipeline = [
        { $match: { 
          quiz: new mongoose.Types.ObjectId(quizId),
          dataFim: { $exists: true }
        }},
        { $sort: { percentualAcerto: -1, pontuacaoObtida: -1 } },
        { $limit: limit },
        { $lookup: {
          from: 'estudantes',
          localField: 'estudante',
          foreignField: '_id',
          as: 'estudanteInfo'
        }},
        { $unwind: '$estudanteInfo' },
        { $project: {
          estudante: {
            id: '$estudanteInfo._id',
            nome: '$estudanteInfo.nome',
            escola: '$estudanteInfo.escola',
            classe: '$estudanteInfo.classe'
          },
          percentualAcerto: 1,
          pontuacaoObtida: 1,
          totalPontos: 1,
          dataFim: 1
        }}
      ];
    } else {
      // Ranking geral (média de todos os quizzes por estudante)
      pipeline = [
        { $match: { dataFim: { $exists: true } } },
        { $group: {
          _id: '$estudante',
          totalQuizzes: { $sum: 1 },
          mediaPercentual: { $avg: '$percentualAcerto' },
          totalPontos: { $sum: '$pontuacaoObtida' }
        }},
        { $match: { totalQuizzes: { $gte: 3 } } }, // Apenas estudantes com no mínimo 3 quizzes
        { $sort: { mediaPercentual: -1, totalPontos: -1 } },
        { $limit: limit },
        { $lookup: {
          from: 'estudantes',
          localField: '_id',
          foreignField: '_id',
          as: 'estudanteInfo'
        }},
        { $unwind: '$estudanteInfo' },
        { $project: {
          estudante: {
            id: '$estudanteInfo._id',
            nome: '$estudanteInfo.nome',
            escola: '$estudanteInfo.escola',
            classe: '$estudanteInfo.classe'
          },
          totalQuizzes: 1,
          mediaPercentual: 1,
          totalPontos: 1
        }}
      ];
    }
    
    const ranking = await EstudanteQuiz.aggregate(pipeline);
    
    res.status(200).json({
      status: 'success',
      data: ranking
    });
  } catch (error) {
    console.error('Erro ao obter ranking:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao obter ranking'
    });
  }
};

/**
 * Obtém estatísticas gerais do sistema
 */
export const getEstatisticasGerais: RequestHandler = async (req, res, next) => {
  try {
    // Total de estudantes ativos
    const totalEstudantes = await Estudante.countDocuments({ ativo: true });
    
    // Total de quizzes
    const totalQuizzes = await Quiz.countDocuments({ ativo: true });
    
    // Total de tentativas de quizzes
    const totalTentativas = await EstudanteQuiz.countDocuments();
    
    // Quizzes mais populares
    const quizzesMaisPopulares = await EstudanteQuiz.aggregate([
      { $group: {
        _id: '$quiz',
        tentativas: { $sum: 1 },
        mediaAcerto: { $avg: '$percentualAcerto' }
      }},
      { $sort: { tentativas: -1 } },
      { $limit: 5 },
      { $lookup: {
        from: 'quizzes',
        localField: '_id',
        foreignField: '_id',
        as: 'quizInfo'
      }},
      { $unwind: '$quizInfo' },
      { $project: {
        id: '$_id',
        titulo: '$quizInfo.titulo',
        tentativas: 1,
        mediaAcerto: 1
      }}
    ]);
    
    // Estatísticas por classe
    const estatisticasPorClasse = await EstudanteQuiz.aggregate([
      { $lookup: {
        from: 'estudantes',
        localField: 'estudante',
        foreignField: '_id',
        as: 'estudanteInfo'
      }},
      { $unwind: '$estudanteInfo' },
      { $group: {
        _id: '$estudanteInfo.classe',
        totalEstudantes: { $addToSet: '$estudante' },
        mediaAcerto: { $avg: '$percentualAcerto' }
      }},
      { $project: {
        classe: '$_id',
        totalEstudantes: { $size: '$totalEstudantes' },
        mediaAcerto: 1
      }},
      { $sort: { classe: 1 } }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        contagens: {
          totalEstudantes,
          totalQuizzes,
          totalTentativas
        },
        quizzesMaisPopulares,
        estatisticasPorClasse
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas gerais:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao obter estatísticas gerais'
    });
  }
};