import { Router } from 'express';
import * as estatisticaController from '../controllers/estatistica.controller';
import { validateId } from '../middlewares/validateId';

const router = Router();

// Estatísticas gerais de um estudante
router.get('/estudantes/:id/estatisticas', estatisticaController.getEstatisticasEstudante);

// Estatísticas detalhadas de um quiz específico realizado por um estudante
router.get('/estudantes/:estudanteId/quizzes/:quizId/estatisticas', estatisticaController.getEstatisticasQuiz);

// Ranking geral
router.get('/ranking', estatisticaController.getRanking);

// Ranking por quiz
router.get('/quizzes/:quizId/ranking', validateId('quizId'), estatisticaController.getRanking);

// Estatísticas gerais do sistema
router.get('/gerais', estatisticaController.getEstatisticasGerais);

export default router;