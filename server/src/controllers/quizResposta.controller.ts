import type { RequestHandler } from 'express';
import { QuizResposta } from '../models/quizResposta';
import { EstudanteQuiz } from '../models/estudanteQuiz';
import { Questao } from '../models/questao';
import { Estudante } from '../models/estudante';
import { Quiz } from '../models/quiz';
import { formatResponse } from '../utils/response.utils';
import { HttpError } from '../utils/error.utils';

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
      throw new HttpError('Estudante não encontrado', 404, 'NOT_FOUND');
    }

    // Verificar se quiz existe e está ativo
    const quiz = await Quiz.findOne({ _id: quizId, ativo: true }).populate('avaliacao');
    if (!quiz) {
      throw new HttpError('Quiz não encontrado ou não está ativo', 404, 'NOT_FOUND');
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

      // Buscar todas as questões do quiz através da avaliação com imagens
      const todasQuestoes = await Questao.find({
        avaliacao: quiz.avaliacao
      }).select('_id numero enunciado alternativas imagemEnunciadoUrl explicacao valor');

      // Filtrar questões não respondidas
      const questoesRespondidas = new Set(respostasExistentes.map(r => r.questao.toString()));
      const questoesPendentes = todasQuestoes.filter(q => !questoesRespondidas.has(q._id.toString()));

      res.status(200).json(formatResponse(
        {
          tentativa: tentativaEmAndamento,
          questoesPendentes,
          totalRespondidas: respostasExistentes.length,
          totalQuestoes: todasQuestoes.length
        },
        undefined,
        'Continuando tentativa de quiz já iniciada'
      ));
      return;
    }

    // Obter todas as questões para o quiz incluindo imagens
    const questoes = await Questao.find({
      avaliacao: quiz.avaliacao
    }).select('_id numero enunciado alternativas imagemEnunciadoUrl valor');

    if (questoes.length === 0) {
      throw new HttpError('Este quiz não possui questões cadastradas', 400, 'NO_QUESTIONS');
    }

    // Criar uma nova tentativa
    const novaTentativa = await EstudanteQuiz.create({
      estudante: estudanteId,
      quiz: quizId,
      dataInicio: new Date(),
      respostasCorretas: 0,
      totalQuestoes: questoes.length, // Já definimos o número total de questões
      percentualAcerto: 0
    });

    res.status(201).json(formatResponse(
      {
        tentativa: novaTentativa,
        questoes,
        totalQuestoes: questoes.length
      }
    ));
  } catch (error) {
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
      throw new HttpError('Tentativa de quiz não encontrada', 404, 'NOT_FOUND');
    }

    // Verificar se o quiz já foi finalizado
    if (estudanteQuiz.dataFim) {
      throw new HttpError('Este quiz já foi finalizado e não pode receber novas respostas', 400, 'QUIZ_FINISHED');
    }

    // Verificar se a questão existe com detalhes
    const questao = await Questao.findById(questaoId);
    if (!questao) {
      throw new HttpError('Questão não encontrada', 404, 'NOT_FOUND');
    }

    // Verificar se já existe uma resposta para esta questão neste quiz
    const respostaExistente = await QuizResposta.findOne({
      estudanteQuiz: estudanteQuizId,
      questao: questaoId
    });

    if (respostaExistente) {
      throw new HttpError('Já existe uma resposta registrada para esta questão', 409, 'DUPLICATE_ANSWER');
    }

    // Verificar se a resposta está correta
    const alternativaCorreta = questao.alternativas.find(alt => alt.correta === true);
    if (!alternativaCorreta) {
      throw new HttpError('Questão mal configurada: nenhuma alternativa marcada como correta', 500, 'INVALID_QUESTION');
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

    // Buscar o quiz para obter a avaliação
    const quiz = await EstudanteQuiz.findById(estudanteQuizId)
      .populate({
        path: 'quiz',
        select: '_id avaliacao',
        populate: {
          path: 'avaliacao',
          select: '_id'
        }
      });

    if (!quiz || !quiz.quiz) {
      throw new HttpError('Quiz não encontrado', 404, 'NOT_FOUND');
    }

    const avaliacaoId = (quiz.quiz as any).avaliacao._id;
    if (!avaliacaoId) {
      throw new HttpError('Avaliação não encontrada', 404, 'NOT_FOUND');
    }

    // Buscar informações atualizadas de progresso
    const todasQuestoes = await Questao.countDocuments({ avaliacao: avaliacaoId });
    const respostasAtuais = await QuizResposta.countDocuments({ estudanteQuiz: estudanteQuizId });
    const questoesPendentes = todasQuestoes - respostasAtuais;

    // Retornar informações da resposta incluindo detalhes completos
    const alternativaEscolhida = questao.alternativas.find(a => a.letra === respostaEscolhida);

    res.status(201).json(formatResponse(
      {
        resposta: {
          ...novaResposta.toObject(),
          questao: {
            id: questao._id,
            numero: questao.numero,
            enunciado: questao.enunciado,
            imagemEnunciadoUrl: questao.imagemEnunciadoUrl,
            valor: questao.valor
          }
        },
        estaCorreta,
        alternativaEscolhida: alternativaEscolhida ? {
          letra: alternativaEscolhida.letra,
          texto: alternativaEscolhida.texto,
          imagemUrl: alternativaEscolhida.imagemUrl
        } : null,
        alternativaCorreta: {
          letra: letraCorreta,
          texto: alternativaCorreta.texto,
          imagemUrl: alternativaCorreta.imagemUrl
        },
        explicacao: questao.explicacao,
        progresso: {
          respondidas: respostasAtuais,
          total: todasQuestoes,
          pendentes: questoesPendentes,
          percentualConcluido: (respostasAtuais / todasQuestoes) * 100
        }
      }
    ));
  } catch (error) {
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
      throw new HttpError('Tentativa de quiz não encontrada', 404, 'NOT_FOUND');
    }

    // Verificar se o quiz já foi finalizado
    if (estudanteQuiz.dataFim) {
      throw new HttpError('Este quiz já foi finalizado', 400, 'ALREADY_FINISHED');
    }

    // Buscar informações do quiz
    const quiz = await Quiz.findById(estudanteQuiz.quiz).populate('avaliacao');
    if (!quiz) {
      throw new HttpError('Quiz não encontrado', 404, 'NOT_FOUND');
    }

    // Buscar todas as questões do quiz com detalhes completos
    const todasQuestoes = await Questao.find({ 
      avaliacao: (quiz as any).avaliacao 
    }).select('_id numero enunciado alternativas imagemEnunciadoUrl valor explicacao');

    // Buscar todas as respostas do estudante neste quiz com detalhes
    const respostas = await QuizResposta.find({
      estudanteQuiz: estudanteQuizId
    }).populate('questao');

    // Calcular estatísticas
    const totalQuestoes = todasQuestoes.length;
    const questoesRespondidas = respostas.length;
    const respostasCorretas = respostas.filter(r => r.estaCorreta).length;
    const percentualAcerto = questoesRespondidas > 0
      ? Math.round((respostasCorretas / questoesRespondidas) * 100 * 10) / 10 // Arredondar para 1 casa decimal
      : 0;

    // Somar pontuação total possível (valor de todas as questões)
    const totalPontosPossiveis = todasQuestoes.reduce((acc, q) => acc + (q.valor || 1), 0);

    // Somar pontuação obtida
    const pontuacaoObtida = respostas.reduce((acc, r) => acc + r.pontuacaoObtida, 0);
    
    // Percentual em relação à pontuação máxima
    const percentualPontuacao = totalPontosPossiveis > 0
      ? Math.round((pontuacaoObtida / totalPontosPossiveis) * 100 * 10) / 10
      : 0;

    // Verificar se todas as questões foram respondidas
    const percentualConcluido = Math.round((questoesRespondidas / totalQuestoes) * 100);

    // Lista de questões não respondidas com detalhes
    const questoesRespondidasIds = new Set(respostas.map(r => r.questao.toString()));
    const questoesNaoRespondidas = todasQuestoes
      .filter(q => !questoesRespondidasIds.has(q._id.toString()))
      .map(q => ({
        id: q._id,
        numero: q.numero,
        enunciado: q.enunciado,
        imagemEnunciadoUrl: q.imagemEnunciadoUrl,
        valor: q.valor
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

    // Estruturar respostas detalhadas do estudante
    const detalhesRespostas = await Promise.all(respostas.map(async (resposta) => {
      const questao = resposta.questao as any;
      const alternativaEscolhida = questao.alternativas.find((a: { letra: string; }) => a.letra === resposta.respostaEscolhida);
      const alternativaCorreta = questao.alternativas.find((a: { correta: any; }) => a.correta);

      return {
        questao: {
          id: questao._id,
          numero: questao.numero,
          enunciado: questao.enunciado,
          imagemEnunciadoUrl: questao.imagemEnunciadoUrl,
          valor: questao.valor
        },
        resposta: {
          escolhida: resposta.respostaEscolhida,
          estaCorreta: resposta.estaCorreta,
          pontuacao: resposta.pontuacaoObtida,
          tempoResposta: resposta.tempoResposta
        },
        alternativaEscolhida: alternativaEscolhida ? {
          letra: alternativaEscolhida.letra,
          texto: alternativaEscolhida.texto,
          imagemUrl: alternativaEscolhida.imagemUrl
        } : null,
        alternativaCorreta: alternativaCorreta ? {
          letra: alternativaCorreta.letra,
          texto: alternativaCorreta.texto,
          imagemUrl: alternativaCorreta.imagemUrl
        } : null,
        explicacao: questao.explicacao
      };
    }));

    res.status(200).json(formatResponse(
      {
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
          totalPontosPossiveis,
          percentualPontuacao
        },
        respostas: detalhesRespostas.sort((a, b) => a.questao.numero - b.questao.numero),
        questoesNaoRespondidas: questoesNaoRespondidas.length > 0 ? questoesNaoRespondidas : null
      }
    ));
  } catch (error) {
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
          populate: {
            path: 'disciplina',
            select: '_id nome codigo'
          }
        }
      })
      .populate('estudante');

    if (!estudanteQuiz) {
      throw new HttpError('Tentativa de quiz não encontrada', 404, 'NOT_FOUND');
    }

    // Verificar se o quiz já foi finalizado
    if (estudanteQuiz.dataFim) {
      res.status(200).json(formatResponse(
        {
          id: estudanteQuiz._id,
          dataInicio: estudanteQuiz.dataInicio,
          dataFim: estudanteQuiz.dataFim,
          status: 'FINALIZADO'
        },
        undefined,
        'Este quiz já foi finalizado'
      ));
      return;
    }

    // Obter as questões respondidas com todos os detalhes
    const respostasRegistradas = await QuizResposta.find({
      estudanteQuiz: estudanteQuizId
    }).populate({
      path: 'questao',
      select: '_id numero enunciado alternativas imagemEnunciadoUrl valor'
    });

    // Obter todas as questões do quiz com detalhes
    const quizInfo = estudanteQuiz.quiz as any;
    const avaliacaoId = quizInfo?.avaliacao?._id;

    if (!avaliacaoId) {
      throw new HttpError('Erro na estrutura do quiz: avaliação não encontrada', 500, 'INVALID_QUIZ_STRUCTURE');
    }

    const todasQuestoes = await Questao.find({ avaliacao: avaliacaoId })
      .select('_id numero enunciado alternativas imagemEnunciadoUrl valor');

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
    res.status(200).json(formatResponse(
      {
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
            excedido: tempoExcedido,
            limiteEmMinutos: quizInfo.tempoLimite
          }
        },
        progresso: {
          respondidas: respostasRegistradas.length,
          total: todasQuestoes.length,
          pendentes: questoesPendentes.length,
          percentualConcluido: Math.round((respostasRegistradas.length / todasQuestoes.length) * 100)
        },
        questoesPendentes: questoesPendentes.map(q => ({
          id: q._id,
          numero: q.numero,
          enunciado: q.enunciado,
          imagemEnunciadoUrl: q.imagemEnunciadoUrl,
          valor: q.valor,
          alternativas: q.alternativas.map(a => ({
            letra: a.letra,
            texto: a.texto,
            imagemUrl: a.imagemUrl
          }))
        })),
        questoesRespondidas: respostasRegistradas.map(r => ({
          id: r.questao._id,
          numero: (r.questao as any).numero,
          respostaEscolhida: r.respostaEscolhida,
          estaCorreta: r.estaCorreta
        }))
      }
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém os detalhes completos de um quiz finalizado
 */
export const getQuizFinalizado: RequestHandler = async (req, res, next) => {
  try {
    const { estudanteQuizId } = req.params;

    // Buscar a tentativa de quiz com todos os dados relacionados
    const estudanteQuiz = await EstudanteQuiz.findById(estudanteQuizId)
      .populate({
        path: 'quiz',
        populate: {
          path: 'avaliacao',
          populate: {
            path: 'disciplina',
            select: '_id nome codigo'
          }
        }
      })
      .populate('estudante');

    if (!estudanteQuiz) {
      throw new HttpError('Tentativa de quiz não encontrada', 404, 'NOT_FOUND');
    }

    // Verificar se o quiz foi realmente finalizado
    if (!estudanteQuiz.dataFim) {
      throw new HttpError('Este quiz ainda não foi finalizado', 400, 'QUIZ_NOT_FINISHED');
    }

    // Obter todas as respostas do estudante com detalhes das questões
    const respostas = await QuizResposta.find({
      estudanteQuiz: estudanteQuizId
    }).populate({
      path: 'questao',
      select: '_id numero enunciado alternativas imagemEnunciadoUrl valor explicacao'
    });

    // Estruturar respostas detalhadas
    const detalhesRespostas = respostas.map(resposta => {
      const questao = resposta.questao as any;
      const alternativaEscolhida = questao.alternativas.find((a: { letra: string; }) => a.letra === resposta.respostaEscolhida);
      const alternativaCorreta = questao.alternativas.find((a: { correta: any; }) => a.correta);

      return {
        questao: {
          id: questao._id,
          numero: questao.numero,
          enunciado: questao.enunciado,
          imagemEnunciadoUrl: questao.imagemEnunciadoUrl,
          valor: questao.valor
        },
        resposta: {
          escolhida: resposta.respostaEscolhida,
          estaCorreta: resposta.estaCorreta,
          pontuacao: resposta.pontuacaoObtida,
          tempoResposta: resposta.tempoResposta
        },
        alternativas: questao.alternativas.map((a: { letra: any; texto: any; correta: any; imagemUrl: any; }) => ({
          letra: a.letra,
          texto: a.texto,
          correta: a.correta,
          imagemUrl: a.imagemUrl
        })),
        alternativaEscolhida: alternativaEscolhida ? {
          letra: alternativaEscolhida.letra,
          texto: alternativaEscolhida.texto,
          imagemUrl: alternativaEscolhida.imagemUrl
        } : null,
        alternativaCorreta: alternativaCorreta ? {
          letra: alternativaCorreta.letra,
          texto: alternativaCorreta.texto,
          imagemUrl: alternativaCorreta.imagemUrl
        } : null,
        explicacao: questao.explicacao
      };
    });

    // Calcular duração do quiz
    const dataInicio = new Date(estudanteQuiz.dataInicio).getTime();
    const dataFim = new Date(estudanteQuiz.dataFim).getTime();
    const duracaoSegundos = Math.floor((dataFim - dataInicio) / 1000);
    
    // Formatando a resposta
    res.status(200).json(formatResponse({
      quiz: {
        id: (estudanteQuiz.quiz as any)._id,
        titulo: (estudanteQuiz.quiz as any).titulo,
        descricao: (estudanteQuiz.quiz as any).descricao,
        avaliacao: {
          id: (estudanteQuiz.quiz as any).avaliacao._id,
          tipo: (estudanteQuiz.quiz as any).avaliacao.tipo,
          classe: (estudanteQuiz.quiz as any).avaliacao.classe,
          ano: (estudanteQuiz.quiz as any).avaliacao.ano
        },
        disciplina: {
          id: (estudanteQuiz.quiz as any).avaliacao.disciplina?._id,
          nome: (estudanteQuiz.quiz as any).avaliacao.disciplina?.nome,
          codigo: (estudanteQuiz.quiz as any).avaliacao.disciplina?.codigo
        }
      },
      tentativa: {
        id: estudanteQuiz._id,
        estudante: {
          id: (estudanteQuiz.estudante as any)._id,
          nome: (estudanteQuiz.estudante as any).nome
        },
        dataInicio: estudanteQuiz.dataInicio,
        dataFim: estudanteQuiz.dataFim,
        duracao: duracaoSegundos,
        percentualAcerto: estudanteQuiz.percentualAcerto,
        pontuacaoObtida: estudanteQuiz.pontuacaoObtida,
        totalPontos: estudanteQuiz.totalPontos,
        respostasCorretas: estudanteQuiz.respostasCorretas,
        totalQuestoes: estudanteQuiz.totalQuestoes
      },
      respostas: detalhesRespostas.sort((a, b) => a.questao.numero - b.questao.numero)
    }));
  } catch (error) {
    next(error);
  }
};