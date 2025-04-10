import { Router } from 'express';
import * as estudanteController from '../controllers/estudante.controller';
import { validate } from '../middlewares/validate';
import { createEstudanteSchema, updateEstudanteSchema } from '../schemas/estudante.schema';
import { validateId } from '../middlewares/validateId';

const router = Router();

// Rotas para estudantes
router.post('/', validate(createEstudanteSchema), estudanteController.createEstudante);
router.get('/', estudanteController.getAllEstudantes);
router.get('/search', estudanteController.searchEstudantes);
router.get('/:id', validateId(), estudanteController.getEstudanteById);
router.put('/:id', validateId(), validate(updateEstudanteSchema), estudanteController.updateEstudante);
router.delete('/:id', validateId(), estudanteController.deleteEstudante);

// Rotas adicionais específicas para estudante
router.get('/:id/respostas', validateId(), estudanteController.getRespostasEstudante);
router.get('/:id/estatisticas', validateId(), estudanteController.getEstatisticasEstudante);

export default router;