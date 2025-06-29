import { Router } from 'express';
import * as quizRespostaController from '../controllers/quizResposta.controller';
import { validateId } from '../middlewares/validateId';
import { validate } from '../middlewares/validate';
import { iniciarQuizSchema, registrarRespostaSchema } from '../schemas/quizResposta.schema';

const router = Router();

/**
 * @swagger
 * /quiz-respostas/iniciar:
 *   post:
 *     summary: Iniciar quiz
 *     description: Inicia um novo quiz para um estudante ou retorna uma tentativa em andamento
 *     tags: [Quiz Respostas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IniciarQuizRequest'
 *     responses:
 *       201:
 *         description: Quiz iniciado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     tentativa:
 *                       $ref: '#/components/schemas/EstudanteQuiz'
 *                     questoes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Questao'
 *                     totalQuestoes:
 *                       type: integer
 *                       description: Total de questões no quiz
 *       200:
 *         description: Continuando tentativa existente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     tentativa:
 *                       $ref: '#/components/schemas/EstudanteQuiz'
 *                     questoesPendentes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Questao'
 *                     totalRespondidas:
 *                       type: integer
 *                       description: Número de questões já respondidas
 *                     totalQuestoes:
 *                       type: integer
 *                       description: Total de questões no quiz
 *                 message:
 *                   type: string
 *                   example: Continuando tentativa de quiz já iniciada
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Estudante ou quiz não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/iniciar', validate(iniciarQuizSchema), quizRespostaController.iniciarQuiz);

/**
 * @swagger
 * /quiz-respostas/resposta:
 *   post:
 *     summary: Registrar resposta
 *     description: Registra uma resposta do estudante para uma questão específica
 *     tags: [Quiz Respostas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistrarRespostaRequest'
 *     responses:
 *       201:
 *         description: Resposta registrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     resposta:
 *                       $ref: '#/components/schemas/QuizResposta'
 *                     estaCorreta:
 *                       type: boolean
 *                       description: Se a resposta está correta
 *                     alternativaEscolhida:
 *                       type: object
 *                       properties:
 *                         letra:
 *                           type: string
 *                         texto:
 *                           type: string
 *                         imagemUrl:
 *                           type: string
 *                     alternativaCorreta:
 *                       type: object
 *                       properties:
 *                         letra:
 *                           type: string
 *                         texto:
 *                           type: string
 *                         imagemUrl:
 *                           type: string
 *                     progresso:
 *                       type: object
 *                       properties:
 *                         totalQuestoes:
 *                           type: integer
 *                         questoesRespondidas:
 *                           type: integer
 *                         questoesPendentes:
 *                           type: integer
 *       400:
 *         description: Dados inválidos ou quiz finalizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tentativa de quiz ou questão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Resposta já registrada para esta questão
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Questão mal configurada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/resposta', validate(registrarRespostaSchema), quizRespostaController.registrarResposta);

/**
 * @swagger
 * /quiz-respostas/{estudanteQuizId}/finalizar:
 *   post:
 *     summary: Finalizar quiz
 *     description: Finaliza um quiz e calcula os resultados finais
 *     tags: [Quiz Respostas]
 *     parameters:
 *       - in: path
 *         name: estudanteQuizId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tentativa de quiz do estudante
 *     responses:
 *       200:
 *         description: Quiz finalizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     tentativa:
 *                       $ref: '#/components/schemas/EstudanteQuiz'
 *                     progresso:
 *                       type: object
 *                       properties:
 *                         totalQuestoes:
 *                           type: integer
 *                         questoesRespondidas:
 *                           type: integer
 *                         percentualConcluido:
 *                           type: number
 *                     resultados:
 *                       type: object
 *                       properties:
 *                         respostasCorretas:
 *                           type: integer
 *                         percentualAcerto:
 *                           type: number
 *                         pontuacaoObtida:
 *                           type: number
 *                         totalPontosPossiveis:
 *                           type: number
 *                         percentualPontuacao:
 *                           type: number
 *                     respostas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           questao:
 *                             $ref: '#/components/schemas/Questao'
 *                           resposta:
 *                             type: object
 *                             properties:
 *                               escolhida:
 *                                 type: string
 *                               estaCorreta:
 *                                 type: boolean
 *                               pontuacao:
 *                                 type: number
 *                               tempoResposta:
 *                                 type: number
 *                           alternativaEscolhida:
 *                             type: object
 *                           alternativaCorreta:
 *                             type: object
 *                           explicacao:
 *                             type: string
 *                     questoesNaoRespondidas:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Questao'
 *       400:
 *         description: Quiz já finalizado ou ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tentativa de quiz não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:estudanteQuizId/finalizar', 
  validateId('estudanteQuizId'), 
  quizRespostaController.finalizarQuiz
);

/**
 * @swagger
 * /quiz-respostas/{estudanteQuizId}/andamento:
 *   get:
 *     summary: Obter quiz em andamento
 *     description: Retorna detalhes de um quiz que ainda está em andamento
 *     tags: [Quiz Respostas]
 *     parameters:
 *       - in: path
 *         name: estudanteQuizId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tentativa de quiz do estudante
 *     responses:
 *       200:
 *         description: Detalhes do quiz em andamento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     tentativa:
 *                       $ref: '#/components/schemas/EstudanteQuiz'
 *                     progresso:
 *                       type: object
 *                       properties:
 *                         totalQuestoes:
 *                           type: integer
 *                         questoesRespondidas:
 *                           type: integer
 *                         percentualConcluido:
 *                           type: number
 *                     questoesPendentes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Questao'
 *                     respostas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           questao:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               numero:
 *                                 type: integer
 *                           resposta:
 *                             type: string
 *                           tempoResposta:
 *                             type: number
 *       400:
 *         description: Quiz já finalizado ou ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tentativa de quiz não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:estudanteQuizId/andamento', 
  validateId('estudanteQuizId'), 
  quizRespostaController.getQuizEmAndamento
);

/**
 * @swagger
 * /quiz-respostas/{estudanteQuizId}/resultado:
 *   get:
 *     summary: Obter resultado do quiz finalizado
 *     description: Retorna detalhes completos de um quiz que foi finalizado
 *     tags: [Quiz Respostas]
 *     parameters:
 *       - in: path
 *         name: estudanteQuizId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tentativa de quiz do estudante
 *     responses:
 *       200:
 *         description: Resultado completo do quiz
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     quiz:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         titulo:
 *                           type: string
 *                         descricao:
 *                           type: string
 *                         avaliacao:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             tipo:
 *                               type: string
 *                             classe:
 *                               type: integer
 *                             ano:
 *                               type: integer
 *                         disciplina:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             nome:
 *                               type: string
 *                             codigo:
 *                               type: string
 *                     tentativa:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         estudante:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             nome:
 *                               type: string
 *                         dataInicio:
 *                           type: string
 *                           format: date-time
 *                         dataFim:
 *                           type: string
 *                           format: date-time
 *                         duracao:
 *                           type: integer
 *                           description: Duração em segundos
 *                         percentualAcerto:
 *                           type: number
 *                         pontuacaoObtida:
 *                           type: number
 *                         totalPontos:
 *                           type: number
 *                         respostasCorretas:
 *                           type: integer
 *                         totalQuestoes:
 *                           type: integer
 *                     respostas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           questao:
 *                             $ref: '#/components/schemas/Questao'
 *                           resposta:
 *                             type: object
 *                             properties:
 *                               escolhida:
 *                                 type: string
 *                               estaCorreta:
 *                                 type: boolean
 *                               pontuacao:
 *                                 type: number
 *                               tempoResposta:
 *                                 type: number
 *                           alternativas:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 letra:
 *                                   type: string
 *                                 texto:
 *                                   type: string
 *                                 correta:
 *                                   type: boolean
 *                                 imagemUrl:
 *                                   type: string
 *                           alternativaEscolhida:
 *                             type: object
 *                           alternativaCorreta:
 *                             type: object
 *                           explicacao:
 *                             type: string
 *       400:
 *         description: Quiz ainda não finalizado ou ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tentativa de quiz não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:estudanteQuizId/resultado', 
  validateId('estudanteQuizId'), 
  quizRespostaController.getQuizFinalizado
);

export default router;