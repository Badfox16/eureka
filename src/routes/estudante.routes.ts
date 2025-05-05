import { Router } from 'express';
import * as estudanteController from '../controllers/estudante.controller';
import * as estatisticaController from '../controllers/estatistica.controller';
import { validate } from '../middlewares/validate';
import { createEstudanteSchema, updateEstudanteSchema } from '../schemas/estudante.schema';
import { validateId } from '../middlewares/validateId';

const router = Router();

// Rotas CRUD básicas para estudantes
router.post('/', validate(createEstudanteSchema), estudanteController.createEstudante);
router.get('/', estudanteController.getAllEstudantes);
router.get('/search', estudanteController.searchEstudantes);
router.get('/:id', validateId(), estudanteController.getEstudanteById);
router.put('/:id', validateId(), validate(updateEstudanteSchema), estudanteController.updateEstudante);
router.delete('/:id', validateId(), estudanteController.deleteEstudante);

// Rota para retornar dados do perfil
router.get('/me', authenticate, estudanteController.getEstudanteProfile);

// Rotas para quizzes de um estudante
router.get('/:id/quizzes', validateId(), estudanteController.getQuizzesEstudante);

// Rotas para estatísticas
router.get('/:id/estatisticas', validateId(), estatisticaController.getEstatisticasEstudante);
router.get('/:id/estatisticas/disciplinas', validateId(), estudanteController.getEstatisticasPorDisciplina);
router.get('/:id/estatisticas/evolucao', validateId(), estudanteController.getEvolucaoDesempenho);
router.get('/:estudanteId/quizzes/:quizId/estatisticas', 
  validateId('estudanteId'), 
  validateId('quizId'), 
  estatisticaController.getEstatisticasQuiz
);

export default router;