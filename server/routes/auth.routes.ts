import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { loginSchema, registerSchema, createEstudanteSchema } from '../schemas/auth.schema';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Adaptador para controllers que retornam Promises
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login de usuário com email e senha
 * @access  Público
 */
router.post('/login', validate(loginSchema), asyncHandler(authController.login));

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registro de novo usuário (admin, professor, normal)
 * @access  Público
 */
router.post('/register', validate(registerSchema), asyncHandler(authController.register));

/**
 * @route   POST /api/v1/auth/register/estudante
 * @desc    Registro específico para estudantes
 * @access  Público
 */
router.post('/register/estudante', validate(createEstudanteSchema), asyncHandler(authController.registerEstudante));

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Renovar tokens JWT
 * @access  Público
 */
router.post('/refresh', asyncHandler(authController.refreshToken));

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout de usuário (invalidar tokens)
 * @access  Privado
 */
router.post('/logout', authenticate, asyncHandler(authController.logout));

/**
 * @route   GET /api/v1/auth/me
 * @desc    Obter informações do usuário autenticado
 * @access  Privado
 */
router.get('/me', authenticate, asyncHandler(authController.me));

export default router;