import { Router } from 'express';
import * as avaliacaoController from '../controllers/avaliacao.controller';
import { validate } from '../middlewares/validate';
import { createAvaliacaoSchema, updateAvaliacaoSchema } from '../schemas/avaliacao.schema';
import { validateId } from '../middlewares/validateId';

const router = Router();

/**
 * @swagger
 * /avaliacoes:
 *   post:
 *     summary: Criar nova avaliação
 *     description: Cria uma nova avaliação (AP ou Exame) no sistema
 *     tags: [Avaliações]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAvaliacaoRequest'
 *     responses:
 *       201:
 *         description: Avaliação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Avaliacao'
 *       400:
 *         description: Dados inválidos ou campos obrigatórios faltando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Disciplina ou província não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Avaliação com características similares já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validate(createAvaliacaoSchema), avaliacaoController.createAvaliacao);

/**
 * @swagger
 * /avaliacoes:
 *   get:
 *     summary: Listar todas as avaliações
 *     description: Retorna todas as avaliações com opções de filtro e paginação
 *     tags: [Avaliações]
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
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [AP, EXAME]
 *         description: Filtrar por tipo de avaliação
 *       - in: query
 *         name: disciplina
 *         schema:
 *           type: string
 *         description: ID da disciplina para filtrar
 *       - in: query
 *         name: ano
 *         schema:
 *           type: integer
 *         description: Ano da avaliação
 *       - in: query
 *         name: classe
 *         schema:
 *           type: integer
 *           enum: [10, 11, 12]
 *         description: Classe da avaliação
 *       - in: query
 *         name: trimestre
 *         schema:
 *           type: string
 *           enum: [PRIMEIRO, SEGUNDO, TERCEIRO]
 *         description: Trimestre (apenas para AP)
 *       - in: query
 *         name: provincia
 *         schema:
 *           type: string
 *         description: ID ou nome da província (apenas para AP)
 *       - in: query
 *         name: epoca
 *         schema:
 *           type: string
 *           enum: [NORMAL, RECURSO]
 *         description: Época (apenas para Exames)
 *       - in: query
 *         name: variante
 *         schema:
 *           type: string
 *           enum: [A, B]
 *         description: Variante da prova
 *       - in: query
 *         name: areaEstudo
 *         schema:
 *           type: string
 *           enum: [CIENCIAS_EXATAS, CIENCIAS_HUMANAS, LINGUAS]
 *         description: Área de estudo
 *     responses:
 *       200:
 *         description: Lista de avaliações
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
 *                     $ref: '#/components/schemas/Avaliacao'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', avaliacaoController.getAllAvaliacoes);

/**
 * @swagger
 * /avaliacoes/estatisticas:
 *   get:
 *     summary: Obter estatísticas das avaliações
 *     description: Retorna estatísticas gerais sobre as avaliações no sistema
 *     tags: [Avaliações]
 *     responses:
 *       200:
 *         description: Estatísticas das avaliações
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
 *                     totalAvaliacoes:
 *                       type: integer
 *                       description: Total de avaliações
 *                     porTipo:
 *                       type: object
 *                       properties:
 *                         AP:
 *                           type: integer
 *                         EXAME:
 *                           type: integer
 *                     porClasse:
 *                       type: object
 *                       properties:
 *                         "10":
 *                           type: integer
 *                         "11":
 *                           type: integer
 *                         "12":
 *                           type: integer
 *                     porAno:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           ano:
 *                             type: integer
 *                           total:
 *                             type: integer
 */
router.get('/estatisticas', avaliacaoController.getEstatisticasAvaliacoes);

/**
 * @swagger
 * /avaliacoes/search:
 *   get:
 *     summary: Pesquisar avaliações
 *     description: Pesquisa avaliações por texto
 *     tags: [Avaliações]
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
 *                     $ref: '#/components/schemas/Avaliacao'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Termo de pesquisa não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', avaliacaoController.searchAvaliacoes);

/**
 * @swagger
 * /avaliacoes/{id}:
 *   get:
 *     summary: Obter avaliação por ID
 *     description: Retorna uma avaliação específica pelo ID
 *     tags: [Avaliações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da avaliação
 *     responses:
 *       200:
 *         description: Avaliação encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Avaliacao'
 *       404:
 *         description: Avaliação não encontrada
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
router.get('/:id', validateId(), avaliacaoController.getAvaliacaoById);

/**
 * @swagger
 * /avaliacoes/{id}:
 *   put:
 *     summary: Atualizar avaliação
 *     description: Atualiza uma avaliação existente
 *     tags: [Avaliações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da avaliação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAvaliacaoRequest'
 *     responses:
 *       200:
 *         description: Avaliação atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Avaliacao'
 *       404:
 *         description: Avaliação não encontrada
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
router.put('/:id', validateId(), validate(updateAvaliacaoSchema), avaliacaoController.updateAvaliacao);

/**
 * @swagger
 * /avaliacoes/{id}:
 *   delete:
 *     summary: Excluir avaliação
 *     description: Remove uma avaliação do sistema
 *     tags: [Avaliações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da avaliação
 *     responses:
 *       200:
 *         description: Avaliação excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Avaliação não encontrada
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
router.delete('/:id', validateId(), avaliacaoController.deleteAvaliacao);

export default router;