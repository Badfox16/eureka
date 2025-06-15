import { Router } from 'express';
import * as usuarioController from '../controllers/usuario.controller';
import { validate } from '../middlewares/validate';
import { createUsuarioSchema, updateUsuarioSchema, loginSchema } from '../schemas/usuario.schema';
import { validateId } from '../middlewares/validateId';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Rotas públicas
router.post('/register', validate(createUsuarioSchema), usuarioController.createUsuario);

// Rotas protegidas (requerem autenticação)
router.get('/profile', authenticate, usuarioController.getProfile);
router.put('/profile', authenticate, validate(updateUsuarioSchema), usuarioController.updateUsuario);
router.put('/change-password/:id', authenticate, validateId(), usuarioController.changePassword);

// Rotas administrativas (protegidas + admin)
router.get('/', authenticate, usuarioController.getAllUsuarios);
router.get('/search', authenticate, usuarioController.searchUsuarios);
router.get('/:id', authenticate, validateId(), usuarioController.getProfile);
router.post('/', authenticate, validate(createUsuarioSchema), usuarioController.createUsuario);
router.put('/:id', authenticate, validateId(), validate(updateUsuarioSchema), usuarioController.updateUsuario);
router.delete('/:id', authenticate, validateId(), usuarioController.deleteUsuario);

export default router;