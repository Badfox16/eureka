// src/routes/questao.routes.ts

import { Router } from 'express';
import * as questaoController from '../controllers/questao.controller'; //
import { validate } from '../middlewares/validate'; //
import { createQuestaoSchema, updateQuestaoSchema } from '../schemas/questao.schema'; //
import { validateId } from '../middlewares/validateId'; //
import uploadMiddleware from '../config/multer'; // <<< Importar o middleware de upload
// import { authenticate } from '../middlewares/auth'; // Descomente se precisar de autenticação

const router = Router();

// --- Rotas CRUD básicas ---
// Se precisar de autenticação, adicione 'authenticate' antes de 'validate' ou 'validateId'
router.post('/', /* authenticate, */ validate(createQuestaoSchema), questaoController.createQuestao); //
router.get('/', /* authenticate, */ questaoController.getAllQuestoes); //
router.get('/search', /* authenticate, */ questaoController.searchQuestoes); //
router.get('/:id', /* authenticate, */ validateId(), questaoController.getQuestaoById); //
router.put('/:id', /* authenticate, */ validateId(), validate(updateQuestaoSchema), questaoController.updateQuestao); //
router.delete('/:id', /* authenticate, */ validateId(), questaoController.deleteQuestao); //

// --- Rota especial para importação em massa ---
router.post('/importar/:avaliacaoId', /* authenticate, */ validateId('avaliacaoId'), questaoController.importarQuestoes); //

// --- Novas Rotas para Upload de Imagem ---

// Upload de imagem para o enunciado da questão
router.post(
    '/:id/imagem-enunciado',
    /* authenticate, */      // Adicione autenticação se necessário
    validateId(),           // Validar o ID da questão
    uploadMiddleware.single('imagemEnunciado'), // Aplicar Multer para um arquivo no campo 'imagemEnunciado'
    questaoController.uploadImagemEnunciado // Chamar a função do controller
);

// Upload de imagem para uma alternativa específica
router.post(
    '/:id/alternativas/:letra/imagem',
    /* authenticate, */      // Adicione autenticação se necessário
    validateId(),           // Validar o ID da questão
    uploadMiddleware.single('imagemAlternativa'), // Aplicar Multer para um arquivo no campo 'imagemAlternativa'
    questaoController.uploadImagemAlternativa // Chamar a função do controller
);


export default router;