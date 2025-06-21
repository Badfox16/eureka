import { Router } from 'express';
import * as estudanteController from '../controllers/estudante.controller';
import * as estatisticaController from '../controllers/estatistica.controller';
import { validate } from '../middlewares/validate';
import { createEstudanteSchema, updateEstudanteSchema } from '../schemas/estudante.schema';
import { validateId } from '../middlewares/validateId';
import { authenticate } from '../middlewares/auth';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// Adaptador para controllers que retornam Promises
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Rotas que exigem autenticação (a rota /me deve vir ANTES de /:id)
// router.get('/me', authenticate, asyncHandler(estudanteController.getEstudanteProfile));
// router.post('/me/alterar-senha', authenticate, asyncHandler(estudanteController.alterarSenhaEstudante));

// Rotas de busca sem parâmetro de ID
router.get('/search', asyncHandler(estudanteController.searchEstudantes));

// Rotas CRUD básicas
router.post('/', validate(createEstudanteSchema), asyncHandler(estudanteController.createEstudante));
router.get('/', asyncHandler(estudanteController.getAllEstudantes));

// Rotas com parâmetros de ID
router.get('/:id', validateId(), asyncHandler(estudanteController.getEstudanteById));
router.put('/:id', validateId(), validate(updateEstudanteSchema), asyncHandler(estudanteController.updateEstudante));
router.delete('/:id', validateId(), asyncHandler(estudanteController.deleteEstudante));

// Rotas para quizzes de um estudante
router.get('/:id/quizzes', validateId(), asyncHandler(estudanteController.getQuizzesEstudante));

// Rotas para estatísticas
router.get('/:id/estatisticas', validateId(), asyncHandler(estatisticaController.getEstatisticasEstudante));
router.get('/:id/estatisticas/disciplinas', validateId(), asyncHandler(estudanteController.getEstatisticasPorDisciplina));
router.get('/:id/estatisticas/evolucao', validateId(), asyncHandler(estudanteController.getEvolucaoDesempenho));
router.get('/:estudanteId/quizzes/:quizId/estatisticas', 
  validateId('estudanteId'), 
  validateId('quizId'), 
  asyncHandler(estatisticaController.getEstatisticasQuiz)
);

export default router;