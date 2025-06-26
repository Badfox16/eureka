import { Router } from 'express';
import * as estatisticaController from '../controllers/estatistica.controller';
import { validateId } from '../middlewares/validateId';

const router = Router();

/**
 * @swagger
 * /estatisticas/estudantes/{id}/estatisticas:
 *   get:
 *     summary: Obter estatísticas do estudante
 *     description: Retorna estatísticas gerais de desempenho do estudante
 *     tags: [Estatísticas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do estudante
 *     responses:
 *       200:
 *         description: Estatísticas do estudante
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
 *                     totalQuizzes:
 *                       type: integer
 *                     percentualMedio:
 *                       type: number
 *                     melhorDesempenho:
 *                       type: number
 *                     piorDesempenho:
 *                       type: number
 *                     tempoMedio:
 *                       type: number
 *                     totalQuestoes:
 *                       type: integer
 *                     questoesCorretas:
 *                       type: integer
 *       404:
 *         description: Estudante não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/estudantes/:id/estatisticas', estatisticaController.getEstatisticasEstudante);

/**
 * @swagger
 * /estatisticas/estudantes/{estudanteId}/quizzes/{quizId}/estatisticas:
 *   get:
 *     summary: Obter estatísticas de quiz específico
 *     description: Retorna estatísticas detalhadas de um quiz específico realizado por um estudante
 *     tags: [Estatísticas]
 *     parameters:
 *       - in: path
 *         name: estudanteId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do estudante
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do quiz
 *     responses:
 *       200:
 *         description: Estatísticas do quiz
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
 *                       $ref: '#/components/schemas/Quiz'
 *                     tentativa:
 *                       $ref: '#/components/schemas/EstudanteQuiz'
 *                     respostasCorretas:
 *                       type: integer
 *                     percentualAcerto:
 *                       type: number
 *                     tempoMedio:
 *                       type: number
 *                     tempoTotal:
 *                       type: number
 *                     questoesPorDisciplina:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *       404:
 *         description: Estudante ou quiz não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/estudantes/:estudanteId/quizzes/:quizId/estatisticas', estatisticaController.getEstatisticasQuiz);

/**
 * @swagger
 * /estatisticas/ranking:
 *   get:
 *     summary: Obter ranking geral
 *     description: Retorna o ranking geral de todos os estudantes
 *     tags: [Estatísticas]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de itens por página
 *     responses:
 *       200:
 *         description: Ranking geral
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       posicao:
 *                         type: integer
 *                       estudante:
 *                         $ref: '#/components/schemas/Estudante'
 *                       percentualMedio:
 *                         type: number
 *                       totalQuizzes:
 *                         type: integer
 *                       melhorDesempenho:
 *                         type: number
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/ranking', estatisticaController.getRanking);

/**
 * @swagger
 * /estatisticas/quizzes/{quizId}/ranking:
 *   get:
 *     summary: Obter ranking por quiz
 *     description: Retorna o ranking de estudantes para um quiz específico
 *     tags: [Estatísticas]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do quiz
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de itens por página
 *     responses:
 *       200:
 *         description: Ranking do quiz
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       posicao:
 *                         type: integer
 *                       estudante:
 *                         $ref: '#/components/schemas/Estudante'
 *                       percentualAcerto:
 *                         type: number
 *                       tempoResposta:
 *                         type: number
 *                       dataRealizacao:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       404:
 *         description: Quiz não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/quizzes/:quizId/ranking', validateId('quizId'), estatisticaController.getRanking);

/**
 * @swagger
 * /estatisticas/gerais:
 *   get:
 *     summary: Obter estatísticas gerais do sistema
 *     description: Retorna estatísticas gerais do sistema
 *     tags: [Estatísticas]
 *     responses:
 *       200:
 *         description: Estatísticas gerais
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
 *                     totalEstudantes:
 *                       type: integer
 *                     totalQuizzes:
 *                       type: integer
 *                     totalQuestoes:
 *                       type: integer
 *                     totalDisciplinas:
 *                       type: integer
 *                     totalAvaliacoes:
 *                       type: integer
 *                     percentualMedioGeral:
 *                       type: number
 *                     quizzesRealizadosHoje:
 *                       type: integer
 *                     estudantesAtivos:
 *                       type: integer
 *                     topDisciplinas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           disciplina:
 *                             $ref: '#/components/schemas/Disciplina'
 *                           totalQuizzes:
 *                             type: integer
 *                           percentualMedio:
 *                             type: number
 */
router.get('/gerais', estatisticaController.getEstatisticasGerais);

export default router;