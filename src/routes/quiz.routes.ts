import { Router } from 'express';
import * as quizController from '../controllers/quiz.controller';
import { validate } from '../middleware/validate';
import { createQuizSchema, updateQuizSchema } from '../schemas/quiz.schema';
import { validateId } from '../middleware/validateId';

const router = Router();

// Rotas para quizzes
router.post('/', validate(createQuizSchema), quizController.createQuiz);
router.get('/', quizController.getAllQuizzes);
router.get('/:id', validateId(), quizController.getQuizById);
router.put('/:id', validateId(), validate(updateQuizSchema), quizController.updateQuiz);
router.delete('/:id', validateId(), quizController.deleteQuiz);
router.patch('/:id/toggle-status', validateId(), quizController.toggleQuizStatus);

export default router;