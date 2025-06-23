import { Router } from 'express';
import { localUploadMiddleware } from '../config/multer';
import * as questaoController from '../controllers/questao.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Rota para upload temporário de imagens (acessível via /api/v1/uploads/temp)
router.post('/uploads', 
  authenticate, 
  localUploadMiddleware.single('imagem'), 
  questaoController.uploadTempImagem
);

export default router;