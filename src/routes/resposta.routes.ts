import { Router } from 'express';
import * as respostaController from '../controllers/resposta.controller';
import { validate } from '../middleware/validate';
import { createRespostaSchema, updateRespostaSchema, createRespostaEmMassaSchema } from '../schemas/resposta.schema';
import { validateId } from '../middleware/validateId';

const router = Router();

// Rotas CRUD básicas
router.post('/', validate(createRespostaSchema), respostaController.createResposta);
router.post('/batch', validate(createRespostaEmMassaSchema), respostaController.createRespostasEmMassa);
router.get('/', respostaController.getAllRespostas);
router.get('/estatisticas', respostaController.getEstatisticasRespostas);
router.get('/:id', validateId(), respostaController.getRespostaById);
router.put('/:id', validateId(), validate(updateRespostaSchema), respostaController.updateResposta);
router.delete('/:id', validateId(), respostaController.deleteResposta);

export default router;