import type { RequestHandler } from 'express';
import { QuizResposta } from '../models/quizResposta';
import { EstudanteQuiz } from '../models/estudanteQuiz';
import { Questao } from '../models/questao';
import { Estudante } from '../models/estudante';
import { Quiz } from '../models/quiz';

/**
 * Inicia um quiz para um estudante
 * Cria um novo registro EstudanteQuiz ou retorna um já em andamento
 */
export const iniciarQuiz: RequestHandler = async (req, res, next) => {
  try {
    const { estudanteId, quizId } = req.body;
    
    // Verificar se estudante existe
    const estudante = await Estudante.findById(estudanteId);
    if (!estudante) {
      res.status(404).json({
        status: 'error',
        message: 'Estudante não encontrado'
      });
      return;
    }
    
    // Verificar se quiz existe e está ativo
    const quiz = await Quiz.findOne({ _id: quizId, ativo: true }).populate('avaliacao');
    if (!quiz) {
      res.status(404).json({
        status: 'error',
        message: 'Quiz não encontrado ou não está ativo'
      });
      return;
    }
    
    // Verificar se o estudante já tem uma tentativa em andamento para este quiz
    const tentativaEmAndamento = await EstudanteQuiz.findOne({
      estudante: estudanteId,
      quiz: quizId,
      dataFim: { $exists: false }
    });
    
    if (tentativaEmAndamento) {
      // Buscar as questões já respondidas
      const respostasExistentes = await QuizResposta.find({
        estudanteQuiz: tentativaEmAndamento._id
      });
      
      // Buscar todas as questões do quiz através da avaliação
      const todasQuestoes = await Questao.find({
        avaliacao: quiz.avaliacao
      }).select('_id numero enunciado alternativas');
      
      // Filtrar questões não respondidas
      const questoesRespondidas = new Set(respostasExistentes.map(r => r.questao.toString()));
      const questoesPendentes = todasQuestoes.filter(q => !questoesRespondidas.has(q._id.toString()));
      
      res.status(200).json({
        status: 'success',
        data: {
          tentativa: tentativaEmAndamento,
          questoesPendentes,
          totalRespondidas: respostasExistentes.length,
          totalQuestoes: todasQuestoes.length
        },
        message: 'Continuando tentativa de quiz já iniciada'
      });
      return;
    }
    
    // Obter todas as questões para o quiz
    const questoes = await Questao.find({
      avaliacao: quiz.avaliacao
    }).select('_id numero enunciado alternativas');
    
    if (questoes.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Este quiz não possui questões cadastradas'
      });
      return;
    }
    
    // Criar uma nova tentativa
    const novaTentativa = await EstudanteQuiz.create({
      estudante: estudanteId,
      quiz: quizId,
      dataInicio: new Date(),
      respostasCorretas: 0,
      totalQuestoes: 0,
      percentualAcerto: 0
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        tentativa: novaTentativa,
        questoes,
        totalQuestoes: questoes.length
      }
    });
  } catch (error) {
    console.error('Erro ao iniciar quiz:', error);
    next(error);
  }
};

/**
 * Registra uma resposta do estudante a uma questão de quiz
 */
export const registrarResposta: RequestHandler = async (req, res, next) => {
  try {
    const { estudanteQuizId, questaoId, respostaEscolhida, tempoResposta } = req.body;

    // Verificar se a tentativa de quiz existe e está ativa
    const estudanteQuiz = await EstudanteQuiz.findById(estudanteQuizId);
    if (!estudanteQuiz) {
      res.status(404).json({
        status: 'error',
        message: 'Tentativa de quiz não encontrada'
      });
      return;
    }

    // Verificar se o quiz já foi finalizado
    if (estudanteQuiz.dataFim) {
      res.status(400).json({
        status: 'error',
        message: 'Este quiz já foi finalizado e não pode receber novas respostas'
      });
      return;
    }

    // Verificar se a questão existe
    const questao = await Questao.findById(questaoId);
    if (!questao) {
      res.status(404).json({
        status: 'error',
        message: 'Questão não encontrada'
      });
      return;
    }

    // Verificar se já existe uma resposta para esta questão neste quiz
    const respostaExistente = await QuizResposta.findOne({
      estudanteQuiz: estudanteQuizId,
      questao: questaoId
    });

    if (respostaExistente) {
      res.status(409).json({
        status: 'error',
        message: 'Já existe uma resposta registrada para esta questão'
      });
      return;
    }

    // Verificar se a resposta está correta
    const alternativaCorreta = questao.alternativas.find(alt => alt.correta === true);
    if (!alternativaCorreta) {
      res.status(500).json({
        status: 'error',
        message: 'Questão mal configurada: nenhuma alternativa marcada como correta'
      });
      return;
    }

    const letraCorreta = alternativaCorreta.letra;
    const estaCorreta = respostaEscolhida === letraCorreta;

    // Calcular pontuação (usando o valor da questão)
    const pontuacaoObtida = estaCorreta ? (questao.valor || 1) : 0;

    // Criar a resposta
    const novaResposta = await QuizResposta.create({
      estudanteQuiz: estudanteQuizId,
      questao: questaoId,
      respostaEscolhida,
      estaCorreta,
      tempoResposta,
      pontuacaoObtida
    });

    // Buscar todas as questões do quiz
    const quiz = await EstudanteQuiz.findById(estudanteQuizId).populate('quiz');
    if (!quiz) {
      res.status(404).json({
        status: 'error',
        message: 'Quiz não encontrado'
      });
      return;
    }
    
    // Verificar quantas questões faltam
    const avaliacao = await Quiz.findById(quiz.quiz).populate('avaliacao');
    if (!avaliacao) {
      res.status(404).json({
        status: 'error',
        message: 'Avaliação não encontrada'
      });
      return;
    }
    
    const todasQuestoes = await Questao.countDocuments({ avaliacao: (avaliacao as any).avaliacao });
    const respostasAtuais = await QuizResposta.countDocuments({ estudanteQuiz: estudanteQuizId });
    const questoesPendentes = todasQuestoes - respostasAtuais;

    res.status(201).json({
      status: 'success',
      data: {
        resposta: novaResposta,
        estaCorreta,
        alternativaCorreta: {
          letra: letraCorreta,
          texto: alternativaCorreta.texto
        },
        progresso: {
          respondidas: respostasAtuais,
          total: todasQuestoes,
          pendentes: questoesPendentes,
          percentualConcluido: (respostasAtuais / todasQuestoes) * 100
        }
      }
    });
  } catch (error) {
    console.error('Erro ao registrar resposta:', error);
    next(error);
  }
};

/**
 * Finaliza uma tentativa de quiz e calcula estatísticas
 */
export const finalizarQuiz: RequestHandler = async (req, res, next) => {
  try {
    const { estudanteQuizId } = req.params;

    // Buscar a tentativa de quiz
    const estudanteQuiz = await EstudanteQuiz.findById(estudanteQuizId);
    if (!estudanteQuiz) {
      res.status(404).json({
        status: 'error',
        message: 'Tentativa de quiz não encontrada'
      });
      return;
    }

    // Verificar se o quiz já foi finalizado
    if (estudanteQuiz.dataFim) {
      res.status(400).json({
        status: 'error',
        message: 'Este quiz já foi finalizado'
      });
      return;
    }

    // Buscar informações do quiz
    const quiz = await Quiz.findById(estudanteQuiz.quiz).populate('avaliacao');
    if (!quiz) {
      res.status(404).json({
        status: 'error',
        message: 'Quiz não encontrado'
      });
      return;
    }
    
    // Buscar todas as questões do quiz
    const todasQuestoes = await Questao.find({ 
      avaliacao: (quiz as any).avaliacao 
    });
    
    // Buscar todas as respostas do estudante neste quiz
    const respostas = await QuizResposta.find({
      estudanteQuiz: estudanteQuizId
    });

    // Calcular estatísticas
    const totalQuestoes = todasQuestoes.length;
    const questoesRespondidas = respostas.length;
    const respostasCorretas = respostas.filter(r => r.estaCorreta).length;
    const percentualAcerto = questoesRespondidas > 0
      ? (respostasCorretas / questoesRespondidas) * 100
      : 0;
    
    // Somar pontuação total possível (valor de todas as questões)
    const totalPontosPossiveis = todasQuestoes.reduce((acc, q) => acc + (q.valor || 1), 0);
    
    // Somar pontuação obtida
    const pontuacaoObtida = respostas.reduce((acc, r) => acc + r.pontuacaoObtida, 0);

    // Verificar se todas as questões foram respondidas
    const percentualConcluido = (questoesRespondidas / totalQuestoes) * 100;
    
    // Lista de questões não respondidas
    const questoesRespondidasIds = new Set(respostas.map(r => r.questao.toString()));
    const questoesNaoRespondidas = todasQuestoes
      .filter(q => !questoesRespondidasIds.has(q._id.toString()))
      .map(q => ({
        id: q._id,
        numero: q.numero,
        enunciado: q.enunciado
      }));

    // Atualizar a tentativa de quiz
    const quizAtualizado = await EstudanteQuiz.findByIdAndUpdate(
      estudanteQuizId,
      {
        dataFim: new Date(),
        totalQuestoes,
        respostasCorretas,
        percentualAcerto,
        pontuacaoObtida,
        totalPontos: totalPontosPossiveis
      },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        tentativa: quizAtualizado,
        progresso: {
          totalQuestoes,
          questoesRespondidas,
          percentualConcluido
        },
        resultados: {
          respostasCorretas,
          percentualAcerto,
          pontuacaoObtida,
          totalPontosPossiveis
        },
        questoesNaoRespondidas: questoesNaoRespondidas.length > 0 ? questoesNaoRespondidas : null
      }
    });
  } catch (error) {
    console.error('Erro ao finalizar quiz:', error);
    next(error);
  }
};

/**
 * Busca detalhes sobre um quiz em andamento
 */
export const getQuizEmAndamento: RequestHandler = async (req, res, next) => {
  try {
    const { estudanteQuizId } = req.params;
    
    // Buscar a tentativa de quiz
    const estudanteQuiz = await EstudanteQuiz.findById(estudanteQuizId)
      .populate({
        path: 'quiz',
        populate: {
          path: 'avaliacao',
          populate: 'disciplina'
        }
      })
      .populate('estudante');
      
    if (!estudanteQuiz) {
      res.status(404).json({
        status: 'error',
        message: 'Tentativa de quiz não encontrada'
      });
      return;
    }
    
    // Verificar se o quiz já foi finalizado
    if (estudanteQuiz.dataFim) {
      res.status(400).json({
        status: 'error',
        message: 'Este quiz já foi finalizado',
        data: {
          id: estudanteQuiz._id,
          dataInicio: estudanteQuiz.dataInicio,
          dataFim: estudanteQuiz.dataFim
        }
      });
      return;
    }
    
    // Obter as questões respondidas
    const respostasRegistradas = await QuizResposta.find({
      estudanteQuiz: estudanteQuizId
    }).populate('questao');
    
    // Obter todas as questões do quiz
    const quizInfo = estudanteQuiz.quiz as any;
    const avaliacaoId = quizInfo?.avaliacao?._id;
    
    if (!avaliacaoId) {
      res.status(500).json({
        status: 'error',
        message: 'Erro na estrutura do quiz: avaliação não encontrada'
      });
      return;
    }
    
    const todasQuestoes = await Questao.find({ avaliacao: avaliacaoId })
      .select('_id numero enunciado alternativas');
    
    // Calcular tempo decorrido
    const dataInicio = estudanteQuiz.dataInicio;
    const agora = new Date();
    const tempoDecorrido = Math.floor((agora.getTime() - dataInicio.getTime()) / 1000); // em segundos
    
    // Verificar se o tempo limite foi excedido
    const tempoLimite = quizInfo.tempoLimite ? quizInfo.tempoLimite * 60 : null; // converter minutos para segundos
    const tempoRestante = tempoLimite ? tempoLimite - tempoDecorrido : null;
    const tempoExcedido = tempoLimite && tempoDecorrido > tempoLimite;
    
    // Filtrar questões pendentes
    const questoesRespondidasIds = new Set(respostasRegistradas.map(r => r.questao._id.toString()));
    const questoesPendentes = todasQuestoes.filter(q => !questoesRespondidasIds.has(q._id.toString()));
    
    // Formatando a resposta
    res.status(200).json({
      status: 'success',
      data: {
        quiz: {
          id: quizInfo._id,
          titulo: quizInfo.titulo,
          descricao: quizInfo.descricao,
          avaliacao: {
            id: quizInfo.avaliacao._id,
            tipo: quizInfo.avaliacao.tipo,
            classe: quizInfo.avaliacao.classe,
            ano: quizInfo.avaliacao.ano
          },
          disciplina: {
            id: quizInfo.avaliacao.disciplina?._id,
            nome: quizInfo.avaliacao.disciplina?.nome,
            codigo: quizInfo.avaliacao.disciplina?.codigo
          },
          tempoLimite: quizInfo.tempoLimite // em minutos
        },
        tentativa: {
          id: estudanteQuiz._id,
          estudante: {
            id: (estudanteQuiz.estudante as any)._id,
            nome: (estudanteQuiz.estudante as any).nome
          },
          dataInicio: estudanteQuiz.dataInicio,
          tempo: {
            decorrido: tempoDecorrido, // em segundos
            restante: tempoRestante, // em segundos, null se não houver limite
            excedido: tempoExcedido
          }
        },
        progresso: {
          respondidas: respostasRegistradas.length,
          total: todasQuestoes.length,
          pendentes: questoesPendentes.length,
          percentualConcluido: (respostasRegistradas.length / todasQuestoes.length) * 100
        },
        questoesPendentes: questoesPendentes.map(q => ({
          id: q._id,
          numero: q.numero,
          enunciado: q.enunciado,
          alternativas: q.alternativas.map(a => ({
            letra: a.letra,
            texto: a.texto
            // Não enviamos qual é a correta!
          }))
        }))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar quiz em andamento:', error);
    next(error);
  }
};