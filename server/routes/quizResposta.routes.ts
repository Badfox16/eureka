import { Router } from 'express';
import * as quizRespostaController from '../controllers/quizResposta.controller';
import { validateId } from '../middlewares/validateId';
import { validate } from '../middlewares/validate';
import { iniciarQuizSchema, registrarRespostaSchema } from '../schemas/quizResposta.schema';

const router = Router();

// Iniciar um quiz
router.post('/iniciar', validate(iniciarQuizSchema), quizRespostaController.iniciarQuiz);

// Registrar uma resposta
router.post('/resposta', validate(registrarRespostaSchema), quizRespostaController.registrarResposta);

// Finalizar um quiz
router.post('/:estudanteQuizId/finalizar', 
  validateId('estudanteQuizId'), 
  quizRespostaController.finalizarQuiz
);

// Obter detalhes de um quiz em andamento
router.get('/:estudanteQuizId/andamento', 
  validateId('estudanteQuizId'), 
  quizRespostaController.getQuizEmAndamento
);

// Obter detalhes completos de um quiz finalizado
router.get('/:estudanteQuizId/resultado', 
  validateId('estudanteQuizId'), 
  quizRespostaController.getQuizFinalizado
);

export default router;