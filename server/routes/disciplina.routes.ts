import { Router } from 'express';
import * as disciplinaController from '../controllers/disciplina.controller';
import { validate } from '../middlewares/validate';
import { createDisciplinaSchema, updateDisciplinaSchema } from '../schemas/disciplina.schema';
import { validateId } from '../middlewares/validateId';

const router = Router();

/**
 * @swagger
 * /disciplinas:
 *   post:
 *     summary: Criar nova disciplina
 *     description: Cria uma nova disciplina no sistema
 *     tags: [Disciplinas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDisciplinaRequest'
 *     responses:
 *       201:
 *         description: Disciplina criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Disciplina'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Disciplina já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validate(createDisciplinaSchema), disciplinaController.createDisciplina);

/**
 * @swagger
 * /disciplinas/batch:
 *   post:
 *     summary: Criar múltiplas disciplinas
 *     description: Cria várias disciplinas de uma vez
 *     tags: [Disciplinas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - disciplinas
 *             properties:
 *               disciplinas:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CreateDisciplinaRequest'
 *     responses:
 *       201:
 *         description: Disciplinas criadas com sucesso
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
 *                     $ref: '#/components/schemas/Disciplina'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/batch', disciplinaController.createDisciplinasEmMassa);

/**
 * @swagger
 * /disciplinas:
 *   get:
 *     summary: Listar todas as disciplinas
 *     description: Retorna todas as disciplinas disponíveis
 *     tags: [Disciplinas]
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
 *         description: Lista de disciplinas
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
 *                     $ref: '#/components/schemas/Disciplina'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', disciplinaController.getAllDisciplinas);

/**
 * @swagger
 * /disciplinas/search:
 *   get:
 *     summary: Pesquisar disciplinas
 *     description: Pesquisa disciplinas por nome
 *     tags: [Disciplinas]
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
 *                     $ref: '#/components/schemas/Disciplina'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Termo de pesquisa não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', disciplinaController.searchDisciplinas);

/**
 * @swagger
 * /disciplinas/{id}:
 *   get:
 *     summary: Obter disciplina por ID
 *     description: Retorna uma disciplina específica pelo ID
 *     tags: [Disciplinas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da disciplina
 *     responses:
 *       200:
 *         description: Disciplina encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Disciplina'
 *       404:
 *         description: Disciplina não encontrada
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
router.get('/:id', validateId(), disciplinaController.getDisciplinaById);

/**
 * @swagger
 * /disciplinas/{id}:
 *   put:
 *     summary: Atualizar disciplina
 *     description: Atualiza uma disciplina existente
 *     tags: [Disciplinas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da disciplina
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDisciplinaRequest'
 *     responses:
 *       200:
 *         description: Disciplina atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Disciplina'
 *       404:
 *         description: Disciplina não encontrada
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
router.put('/:id', validateId(), validate(updateDisciplinaSchema), disciplinaController.updateDisciplina);

/**
 * @swagger
 * /disciplinas/{id}:
 *   delete:
 *     summary: Excluir disciplina
 *     description: Remove uma disciplina do sistema
 *     tags: [Disciplinas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da disciplina
 *     responses:
 *       200:
 *         description: Disciplina excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Disciplina não encontrada
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
router.delete('/:id', validateId(), disciplinaController.deleteDisciplina);

export default router;