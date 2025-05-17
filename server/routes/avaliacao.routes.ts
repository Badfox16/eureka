import { Router } from 'express';
import * as avaliacaoController from '../controllers/avaliacao.controller';
import { validate } from '../middlewares/validate';
import { createAvaliacaoSchema, updateAvaliacaoSchema } from '../schemas/avaliacao.schema';
import { validateId } from '../middlewares/validateId';

const router = Router();

// Rotas para avaliações
router.post('/', validate(createAvaliacaoSchema), avaliacaoController.createAvaliacao);
router.get('/', avaliacaoController.getAllAvaliacoes);
router.get('/estatisticas', avaliacaoController.getEstatisticasAvaliacoes);
router.get('/search', avaliacaoController.searchAvaliacoes);
router.get('/:id', validateId(), avaliacaoController.getAvaliacaoById);
router.put('/:id', validateId(), validate(updateAvaliacaoSchema), avaliacaoController.updateAvaliacao);
router.delete('/:id', validateId(), avaliacaoController.deleteAvaliacao);

export default router;