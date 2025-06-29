import { Router } from 'express';
import { localUploadMiddleware } from '../config/multer';
import * as questaoController from '../controllers/questao.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /uploads:
 *   post:
 *     summary: Upload de imagem temporária
 *     description: Faz upload de uma imagem temporária para questões
 *     tags: [Upload]
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
 *                 description: Arquivo de imagem (JPG, PNG, GIF)
 *     responses:
 *       201:
 *         description: Imagem enviada com sucesso
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
 *                     url:
 *                       type: string
 *                       description: URL temporária da imagem
 *                     filename:
 *                       type: string
 *                       description: Nome do arquivo
 *                     mimetype:
 *                       type: string
 *                       description: Tipo MIME do arquivo
 *                     size:
 *                       type: integer
 *                       description: Tamanho do arquivo em bytes
 *       400:
 *         description: Arquivo inválido ou não fornecido
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
 *       413:
 *         description: Arquivo muito grande
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/uploads', 
  authenticate, 
  localUploadMiddleware.single('imagem'), 
  questaoController.uploadTempImagem
);

export default router;