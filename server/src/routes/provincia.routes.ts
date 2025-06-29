import { Router } from 'express';
import * as provinciaController from '../controllers/provincia.controller'; //
import { validate } from '../middlewares/validate'; //
import { createProvinciaSchema, updateProvinciaSchema } from '../schemas/provincia.schema'; //
import { validateId } from '../middlewares/validateId'; //
// Considere adicionar o middleware de autenticação se necessário
// import { authenticate } from '../middlewares/auth'; //

const router = Router();

/**
 * @swagger
 * /provincias:
 *   post:
 *     summary: Criar nova província
 *     description: Cria uma nova província no sistema
 *     tags: [Províncias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProvinciaRequest'
 *     responses:
 *       201:
 *         description: Província criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Provincia'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Nome da província já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validate(createProvinciaSchema), provinciaController.createProvincia); //

/**
 * @swagger
 * /provincias/batch:
 *   post:
 *     summary: Criar múltiplas províncias
 *     description: Cria múltiplas províncias de uma vez
 *     tags: [Províncias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/CreateProvinciaRequest'
 *     responses:
 *       201:
 *         description: Províncias criadas com sucesso
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
 *                     $ref: '#/components/schemas/Provincia'
 *                 message:
 *                   type: string
 *                   example: Províncias criadas com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/batch', provinciaController.createProvinciasEmMassa); //

/**
 * @swagger
 * /provincias:
 *   get:
 *     summary: Listar todas as províncias
 *     description: Retorna todas as províncias com paginação
 *     tags: [Províncias]
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
 *         description: Lista de províncias
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
 *                     $ref: '#/components/schemas/Provincia'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', provinciaController.getAllProvincias); //

/**
 * @swagger
 * /provincias/search:
 *   get:
 *     summary: Pesquisar províncias
 *     description: Pesquisa províncias por nome
 *     tags: [Províncias]
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
 *                     $ref: '#/components/schemas/Provincia'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Termo de pesquisa não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', provinciaController.searchProvincias); //

/**
 * @swagger
 * /provincias/{id}:
 *   get:
 *     summary: Obter província por ID
 *     description: Retorna uma província específica pelo ID
 *     tags: [Províncias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da província
 *     responses:
 *       200:
 *         description: Província encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Provincia'
 *       404:
 *         description: Província não encontrada
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
router.get('/:id', validateId(), provinciaController.getProvinciaById); //

/**
 * @swagger
 * /provincias/{id}:
 *   put:
 *     summary: Atualizar província
 *     description: Atualiza uma província existente
 *     tags: [Províncias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da província
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProvinciaRequest'
 *     responses:
 *       200:
 *         description: Província atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Provincia'
 *       404:
 *         description: Província não encontrada
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
 *       409:
 *         description: Nome da província já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', validateId(), validate(updateProvinciaSchema), provinciaController.updateProvincia); //

/**
 * @swagger
 * /provincias/{id}:
 *   delete:
 *     summary: Excluir província
 *     description: Remove uma província do sistema
 *     tags: [Províncias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da província
 *     responses:
 *       200:
 *         description: Província excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Província não encontrada
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
router.delete('/:id', validateId(), provinciaController.deleteProvincia); //

export default router;