import type { Request, Response, NextFunction } from 'express';
import { Usuario, TipoUsuario } from '../models/usuario';
import { Estudante } from '../models/estudante';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { generatePassword } from '../utils/password-generator';
import { createEstudanteSchema, loginSchema, registerSchema } from '../schemas/auth.schema';

// Obter a chave secreta para JWT do ambiente ou usar um valor padrão
const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_temporaria';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'chave_refresh_temporaria';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Definir as opções de token como objetos separados
const tokenOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as any};
const refreshTokenOptions: SignOptions = { expiresIn: JWT_REFRESH_EXPIRES_IN as any};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar body com Zod
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Dados inválidos',
        errors: validationResult.error.format()
      });
    }

    const { email, password } = validationResult.data;

    // Buscar usuário pelo email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar senha
    const senhaCorreta = await bcrypt.compare(password, usuario.password);
    if (!senhaCorreta) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou senha incorretos'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario._id,
        email: usuario.email,
        tipo: usuario.tipo
      },
      JWT_SECRET,
      tokenOptions
    );

    // Gerar refresh token
    const refreshToken = jwt.sign(
      { id: usuario._id },
      JWT_REFRESH_SECRET,
      refreshTokenOptions
    );

    // Remover senha do objeto de resposta
    const usuarioResponse = {
      _id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo
    };

    return res.status(200).json({
      status: 'success',
      data: {
        usuario: usuarioResponse,
        token,
        refreshToken
      }
    });
  } catch (err: unknown) {
    return next(err);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar body com Zod
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Dados inválidos',
        errors: validationResult.error.format()
      });
    }

    const { nome, email, password, tipo } = validationResult.data;

    // Verificar se já existe um usuário com este email
    const existsUsuario = await Usuario.findOne({ email });
    if (existsUsuario) {
      return res.status(409).json({
        status: 'error',
        message: `Já existe um usuário com o email ${email}`
      });
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criar novo usuário
    const usuario = await Usuario.create({
      nome,
      email,
      password: hashedPassword,
      tipo: tipo || TipoUsuario.NORMAL
    });

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario._id,
        email: usuario.email,
        tipo: usuario.tipo
      },
      JWT_SECRET,
      tokenOptions
    );

    // Gerar refresh token
    const refreshToken = jwt.sign(
      { id: usuario._id },
      JWT_REFRESH_SECRET,
      refreshTokenOptions
    );

    // Remover senha do objeto de resposta
    const usuarioResponse = {
      _id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo
    };

    return res.status(201).json({
      status: 'success',
      data: {
        usuario: usuarioResponse,
        token,
        refreshToken
      }
    });
  } catch (err: unknown) {
    return next(err);
  }
};

export const registerEstudante = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar body com Zod
    const validationResult = createEstudanteSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Dados inválidos',
        errors: validationResult.error.format()
      });
    }

    const estudanteData = validationResult.data;

    // Verificar se já existe um estudante com o mesmo email
    const existsEstudante = await Estudante.findOne({ email: estudanteData.email });
    if (existsEstudante) {
      return res.status(409).json({
        status: 'error',
        message: `Já existe um estudante com o email ${estudanteData.email}`
      });
    }

    // Verificar se já existe um usuário com o mesmo email
    const existsUsuario = await Usuario.findOne({ email: estudanteData.email });
    if (existsUsuario) {
      return res.status(409).json({
        status: 'error',
        message: `Já existe um usuário com o email ${estudanteData.email}`
      });
    }

    // Criar um usuário para o estudante
    const saltRounds = 10;
    // Use a senha fornecida ou gere uma senha aleatória
    const password = estudanteData.password || generatePassword();
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const novoUsuario = await Usuario.create({
      nome: estudanteData.nome,
      email: estudanteData.email,
      password: hashedPassword,
      tipo: TipoUsuario.NORMAL // Estudantes são usuários normais
    });

    // Criar o estudante associado ao usuário
    const estudante = await Estudante.create({
      nome: estudanteData.nome,
      email: estudanteData.email,
      classe: estudanteData.classe,
      escola: estudanteData.escola,
      provincia: estudanteData.provincia,
      usuario: novoUsuario._id
    });

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: novoUsuario._id,
        email: novoUsuario.email,
        tipo: novoUsuario.tipo
      },
      JWT_SECRET,
      tokenOptions
    );

    // Gerar refresh token
    const refreshToken = jwt.sign(
      { id: novoUsuario._id },
      JWT_REFRESH_SECRET,
      refreshTokenOptions
    );

    // Remover senha do objeto de resposta
    const usuarioResponse = {
      _id: novoUsuario._id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      tipo: novoUsuario.tipo
    };

    // Determinar se deve retornar a senha temporária na resposta
    const senhaTemporaria = estudanteData.password ? undefined : password;

    return res.status(201).json({
      status: 'success',
      data: {
        estudante,
        usuario: usuarioResponse,
        token,
        refreshToken,
        senhaTemporaria
      }
    });
  } catch (err: unknown) {
    return next(err);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token não fornecido'
      });
    }

    // Verificar o refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string };
    
    // Buscar usuário
    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }

    // Gerar novo token JWT
    const token = jwt.sign(
      { 
        id: usuario._id,
        email: usuario.email,
        tipo: usuario.tipo
      },
      JWT_SECRET,
      tokenOptions
    );

    // Gerar novo refresh token
    const newRefreshToken = jwt.sign(
      { id: usuario._id },
      JWT_REFRESH_SECRET,
      refreshTokenOptions
    );

    return res.status(200).json({
      status: 'success',
      data: {
        token,
        refreshToken: newRefreshToken
      }
    });
  } catch (err: unknown) {
    // Verificar se é um erro de JWT
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        status: 'error',
        message: 'Token inválido ou expirado'
      });
    }
    
    return next(err);
  }
};

/**
 * Logout (invalidar refresh token)
 * Nota: Em uma implementação mais completa, você armazenaria tokens em uma blacklist
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Em uma implementação real, você adicionaria o token à blacklist aqui
    // Como estamos usando JWT stateless, apenas confirmamos o logout

    return res.status(200).json({
      status: 'success',
      message: 'Logout realizado com sucesso'
    });
  } catch (err: unknown) {
    return next(err);
  }
};

/**
 * Obter informações do usuário autenticado
 */
export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Não autenticado'
      });
    }

    const { id } = req.user;

    // Buscar usuário pelo ID
    const usuario = await Usuario.findById(id).select('-password');
    if (!usuario) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se é um estudante e buscar informações adicionais
    let estudante = null;
    if (usuario.tipo === TipoUsuario.NORMAL) {
      estudante = await Estudante.findOne({ usuario: usuario._id });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        usuario,
        estudante
      }
    });
  } catch (err: unknown) {
    return next(err);
  }
};