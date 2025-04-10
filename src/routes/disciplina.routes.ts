import { Router } from 'express';
import * as disciplinaController from '../controllers/disciplina.controller';
import { validate } from '../middlewares/validate';
import { createDisciplinaSchema, updateDisciplinaSchema } from '../schemas/disciplina.schema';
import { validateId } from '../middlewares/validateId';

const router = Router();

// Rotas para disciplinas
router.post('/', validate(createDisciplinaSchema), disciplinaController.createDisciplina);
router.get('/', disciplinaController.getAllDisciplinas);
router.get('/search', disciplinaController.searchDisciplinas);
router.get('/:id', validateId(), disciplinaController.getDisciplinaById);
router.put('/:id', validateId(), validate(updateDisciplinaSchema), disciplinaController.updateDisciplina);
router.delete('/:id', validateId(), disciplinaController.deleteDisciplina);

export default router;