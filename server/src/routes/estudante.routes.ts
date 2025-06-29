import { Router } from 'express';
import * as estudanteController from '../controllers/estudante.controller';
import * as estatisticaController from '../controllers/estatistica.controller';
import { validate } from '../middlewares/validate';
import { createEstudanteSchema, updateEstudanteSchema } from '../schemas/estudante.schema';
import { validateId } from '../middlewares/validateId';
import { authenticate } from '../middlewares/auth';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// Adaptador para controllers que retornam Promises
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @swagger
 * /estudantes/search:
 *   get:
 *     summary: Pesquisar estudantes
 *     description: Pesquisa estudantes por nome ou email
 *     tags: [Estudantes]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Termo de pesquisa
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
 *         description: Resultados da pesquisa
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
 *                     $ref: '#/components/schemas/Estudante'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Termo de pesquisa não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', asyncHandler(estudanteController.searchEstudantes));

/**
 * @swagger
 * /estudantes:
 *   post:
 *     summary: Criar novo estudante
 *     description: Cria um novo estudante no sistema
 *     tags: [Estudantes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEstudanteRequest'
 *     responses:
 *       201:
 *         description: Estudante criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Estudante'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validate(createEstudanteSchema), asyncHandler(estudanteController.createEstudante));

/**
 * @swagger
 * /estudantes:
 *   get:
 *     summary: Listar todos os estudantes
 *     description: Retorna todos os estudantes com paginação
 *     tags: [Estudantes]
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
 *         description: Lista de estudantes
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
 *                     $ref: '#/components/schemas/Estudante'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', asyncHandler(estudanteController.getAllEstudantes));

/**
 * @swagger
 * /estudantes/{id}:
 *   get:
 *     summary: Obter estudante por ID
 *     description: Retorna um estudante específico pelo ID
 *     tags: [Estudantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do estudante
 *     responses:
 *       200:
 *         description: Estudante encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Estudante'
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
router.get('/:id', validateId(), asyncHandler(estudanteController.getEstudanteById));

/**
 * @swagger
 * /estudantes/{id}:
 *   put:
 *     summary: Atualizar estudante
 *     description: Atualiza um estudante existente
 *     tags: [Estudantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do estudante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEstudanteRequest'
 *     responses:
 *       200:
 *         description: Estudante atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Estudante'
 *       404:
 *         description: Estudante não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', validateId(), validate(updateEstudanteSchema), asyncHandler(estudanteController.updateEstudante));

/**
 * @swagger
 * /estudantes/{id}:
 *   delete:
 *     summary: Excluir estudante
 *     description: Remove um estudante do sistema
 *     tags: [Estudantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do estudante
 *     responses:
 *       200:
 *         description: Estudante excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
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
router.delete('/:id', validateId(), asyncHandler(estudanteController.deleteEstudante));

/**
 * @swagger
 * /estudantes/{id}/quizzes:
 *   get:
 *     summary: Obter quizzes do estudante
 *     description: Retorna todos os quizzes realizados por um estudante
 *     tags: [Estudantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do estudante
 *     responses:
 *       200:
 *         description: Quizzes do estudante
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
 *                     $ref: '#/components/schemas/EstudanteQuiz'
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
router.get('/:id/quizzes', validateId(), asyncHandler(estudanteController.getQuizzesEstudante));

/**
 * @swagger
 * /estudantes/{id}/estatisticas:
 *   get:
 *     summary: Obter estatísticas do estudante
 *     description: Retorna estatísticas gerais de desempenho do estudante
 *     tags: [Estudantes]
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
router.get('/:id/estatisticas', validateId(), asyncHandler(estatisticaController.getEstatisticasEstudante));

/**
 * @swagger
 * /estudantes/{id}/estatisticas/disciplinas:
 *   get:
 *     summary: Obter estatísticas por disciplina
 *     description: Retorna estatísticas de desempenho do estudante por disciplina
 *     tags: [Estudantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do estudante
 *     responses:
 *       200:
 *         description: Estatísticas por disciplina
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
 *                       disciplina:
 *                         $ref: '#/components/schemas/Disciplina'
 *                       totalQuizzes:
 *                         type: integer
 *                       percentualMedio:
 *                         type: number
 *                       melhorDesempenho:
 *                         type: number
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
router.get('/:id/estatisticas/disciplinas', validateId(), asyncHandler(estudanteController.getEstatisticasPorDisciplina));

/**
 * @swagger
 * /estudantes/{id}/estatisticas/evolucao:
 *   get:
 *     summary: Obter evolução de desempenho
 *     description: Retorna a evolução do desempenho do estudante ao longo do tempo
 *     tags: [Estudantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do estudante
 *     responses:
 *       200:
 *         description: Evolução de desempenho
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
 *                       data:
 *                         type: string
 *                         format: date
 *                       percentual:
 *                         type: number
 *                       quiz:
 *                         type: string
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
router.get('/:id/estatisticas/evolucao', validateId(), asyncHandler(estudanteController.getEvolucaoDesempenho));

/**
 * @swagger
 * /estudantes/{estudanteId}/quizzes/{quizId}/estatisticas:
 *   get:
 *     summary: Obter estatísticas de quiz específico
 *     description: Retorna estatísticas detalhadas de um quiz específico realizado por um estudante
 *     tags: [Estudantes]
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
router.get('/:estudanteId/quizzes/:quizId/estatisticas', 
  validateId('estudanteId'), 
  validateId('quizId'), 
  asyncHandler(estatisticaController.getEstatisticasQuiz)
);

export default router;