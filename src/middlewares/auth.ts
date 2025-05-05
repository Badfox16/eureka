import type { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { Usuario, TipoUsuario } from '../models/usuario';

const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_temporaria';

// Declare a extensão do tipo Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        tipo: TipoUsuario;
      }
    }
  }
}

interface JwtPayload {
  id: string;
  email: string;
  tipo: TipoUsuario;
}

export const authenticate: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        status: 'error',
        message: 'Acesso negado. Nenhum token fornecido'
      });
      return;
    }
    
    // Verificar formato do cabeçalho (deve ser "Bearer [token]")
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      res.status(401).json({
        status: 'error',
        message: 'Formato de token inválido'
      });
      return;
    }
    
    const [scheme, token] = parts;
    
    if (!/^Bearer$/i.test(scheme)) {
      res.status(401).json({
        status: 'error',
        message: 'Formato de token inválido'
      });
      return;
    }
    
    // Verificar e decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Verificar se o usuário ainda existe
    const user = await Usuario.findById(decoded.id);
    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuário do token não existe mais'
      });
      return;
    }
    
    // Adicionar o usuário à requisição
    req.user = {
      id: decoded.id,
      email: decoded.email,
      tipo: decoded.tipo
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: 'error',
        message: 'Token inválido ou expirado'
      });
      return;
    }
    
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro na autenticação'
    });
  }
};