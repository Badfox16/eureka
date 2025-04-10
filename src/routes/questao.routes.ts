import { Router } from 'express';
import * as questaoController from '../controllers/questao.controller';
import { validate } from '../middleware/validate';
import { createQuestaoSchema, updateQuestaoSchema } from '../schemas/questao.schema';
import { validateId } from '../middleware/validateId';

const router = Router();

// Rotas CRUD básicas
router.post('/', validate(createQuestaoSchema), questaoController.createQuestao);
router.get('/', questaoController.getAllQuestoes);
router.get('/search', questaoController.searchQuestoes);
router.get('/:id', validateId(), questaoController.getQuestaoById);
router.put('/:id', validateId(), validate(updateQuestaoSchema), questaoController.updateQuestao);
router.delete('/:id', validateId(), questaoController.deleteQuestao);

// Rota especial para importação em massa
router.post('/importar/:avaliacaoId', validateId('avaliacaoId'), questaoController.importarQuestoes);

export default router;