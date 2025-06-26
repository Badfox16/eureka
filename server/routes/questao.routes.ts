import { Router } from 'express';
import * as questaoController from '../controllers/questao.controller'; //
import { validate } from '../middlewares/validate'; //
import { createQuestaoSchema, updateQuestaoSchema } from '../schemas/questao.schema'; //
import { validateId } from '../middlewares/validateId'; //
import uploadMiddleware, { localUploadMiddleware } from '../config/multer'; // <<< Importar o middleware de upload
import { authenticate } from '../middlewares/auth'; // Descomente se precisar de autenticação

const router = Router();

/**
 * @swagger
 * /questoes:
 *   post:
 *     summary: Criar nova questão
 *     description: Cria uma nova questão associada a uma avaliação
 *     tags: [Questões]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuestaoRequest'
 *     responses:
 *       201:
 *         description: Questão criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Questao'
 *                 message:
 *                   type: string
 *                   example: Questão criada com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Avaliação não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Questão com número já existe nesta avaliação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticate, validate(createQuestaoSchema), questaoController.createQuestao); //

/**
 * @swagger
 * /questoes:
 *   get:
 *     summary: Listar todas as questões
 *     description: Retorna todas as questões com opções de filtro e paginação
 *     tags: [Questões]
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
 *         name: avaliacao
 *         schema:
 *           type: string
 *         description: ID da avaliação para filtrar
 *       - in: query
 *         name: disciplina
 *         schema:
 *           type: string
 *         description: ID da disciplina para filtrar
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo para busca no enunciado, explicação ou alternativas
 *     responses:
 *       200:
 *         description: Lista de questões
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
 *                     $ref: '#/components/schemas/Questao'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Parâmetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', /* authenticate, */ questaoController.getAllQuestoes); //

/**
 * @swagger
 * /questoes/search:
 *   get:
 *     summary: Pesquisar questões
 *     description: Pesquisa questões por texto no enunciado, explicação ou alternativas
 *     tags: [Questões]
 *     security:
 *       - bearerAuth: []
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
 *                     $ref: '#/components/schemas/Questao'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Termo de pesquisa não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', authenticate, questaoController.searchQuestoes); //

/**
 * @swagger
 * /questoes/{id}:
 *   get:
 *     summary: Obter questão por ID
 *     description: Retorna uma questão específica pelo ID
 *     tags: [Questões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da questão
 *     responses:
 *       200:
 *         description: Questão encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Questao'
 *       404:
 *         description: Questão não encontrada
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
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authenticate, validateId(), questaoController.getQuestaoById); //

/**
 * @swagger
 * /questoes/{id}:
 *   put:
 *     summary: Atualizar questão
 *     description: Atualiza uma questão existente
 *     tags: [Questões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da questão
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateQuestaoRequest'
 *     responses:
 *       200:
 *         description: Questão atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Questao'
 *                 message:
 *                   type: string
 *                   example: Questão atualizada com sucesso
 *       404:
 *         description: Questão não encontrada
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
 *         description: Questão com número já existe na avaliação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authenticate, validateId(), validate(updateQuestaoSchema), questaoController.updateQuestao); //

/**
 * @swagger
 * /questoes/{id}:
 *   delete:
 *     summary: Excluir questão
 *     description: Remove uma questão do sistema
 *     tags: [Questões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da questão
 *     responses:
 *       200:
 *         description: Questão excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Questão não encontrada
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
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticate, validateId(), questaoController.deleteQuestao); //

/**
 * @swagger
 * /questoes/importar/{avaliacaoId}:
 *   post:
 *     summary: Importar questões em massa
 *     description: Importa múltiplas questões para uma avaliação específica
 *     tags: [Questões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: avaliacaoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da avaliação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questoes
 *             properties:
 *               questoes:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CreateQuestaoRequest'
 *     responses:
 *       201:
 *         description: Questões importadas com sucesso
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
 *                     $ref: '#/components/schemas/Questao'
 *                 message:
 *                   type: string
 *                   example: "X questões importadas com sucesso. Y foram rejeitadas."
 *       400:
 *         description: Dados inválidos ou nenhuma questão válida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Avaliação não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/importar/:avaliacaoId', authenticate, validateId('avaliacaoId'), questaoController.importarQuestoes); //

/**
 * @swagger
 * /questoes/{id}/imagem-enunciado:
 *   post:
 *     summary: Upload de imagem para enunciado
 *     description: Faz upload de uma imagem para o enunciado da questão
 *     tags: [Questões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da questão
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - imagemEnunciado
 *             properties:
 *               imagemEnunciado:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem para o enunciado
 *     responses:
 *       200:
 *         description: Imagem carregada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Questao'
 *                 message:
 *                   type: string
 *                   example: Imagem do enunciado carregada com sucesso
 *       400:
 *         description: Nenhum arquivo enviado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Questão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro no upload da imagem
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/:id/imagem-enunciado',
    authenticate,       // Adicione autenticação se necessário
    validateId(),           // Validar o ID da questão
    uploadMiddleware.single('imagemEnunciado'), // Aplicar Multer para um arquivo no campo 'imagemEnunciado'
    questaoController.uploadImagemEnunciado // Chamar a função do controller
);

/**
 * @swagger
 * /questoes/{id}/alternativas/{alternativaIndex}/imagem:
 *   post:
 *     summary: Upload de imagem para alternativa
 *     description: Faz upload de uma imagem para uma alternativa específica da questão
 *     tags: [Questões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da questão
 *       - in: path
 *         name: alternativaIndex
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 3
 *         description: Índice da alternativa (0-3)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - imagemAlternativa
 *             properties:
 *               imagemAlternativa:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem para a alternativa
 *     responses:
 *       200:
 *         description: Imagem carregada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Questao'
 *                 message:
 *                   type: string
 *                   example: Imagem da alternativa carregada com sucesso
 *       400:
 *         description: Nenhum arquivo enviado ou índice inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Questão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro no upload da imagem
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/:id/alternativas/:alternativaIndex/imagem',
    authenticate,       // Adicione autenticação se necessário
    validateId(),           // Validar o ID da questão
    uploadMiddleware.single('imagemAlternativa'), // Aplicar Multer para um arquivo no campo 'imagemAlternativa'
    questaoController.uploadImagemAlternativa // Chamar a função do controller
);

/**
 * @swagger
 * /questoes/upload/temp:
 *   post:
 *     summary: Upload temporário de imagem
 *     description: Faz upload temporário de uma imagem para uso posterior
 *     tags: [Questões]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - imagem
 *             properties:
 *               imagem:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem temporário
 *     responses:
 *       200:
 *         description: Imagem temporária carregada com sucesso
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
 *                     imageUrl:
 *                       type: string
 *                       description: URL da imagem temporária
 *                 message:
 *                   type: string
 *                   example: Imagem temporária carregada com sucesso
 *       400:
 *         description: Nenhum arquivo enviado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/upload/temp',
    authenticate,
    localUploadMiddleware.single('imagem'), // Nome do campo no form data
    questaoController.uploadTempImagem // Implementar esta função no controller
);

export default router;