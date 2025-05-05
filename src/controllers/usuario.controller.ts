import type { RequestHandler } from 'express';
import { Usuario, TipoUsuario, type IUsuario } from '../models/usuario';
import { Estudante } from '../models/estudante';
import type { CreateUsuarioInput, UpdateUsuarioInput, LoginInput } from '../schemas/usuario.schema';
import { paginationSchema } from '../schemas/common.schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Cria um novo usuário
 */
export const createUsuario: RequestHandler = async (req, res, next) => {
  try {
    const usuarioData = req.body as CreateUsuarioInput;
    
    // Verificar se já existe um usuário com o mesmo email
    const exists = await Usuario.findOne({ email: usuarioData.email });
    if (exists) {
      res.status(409).json({
        status: 'error',
        message: `Já existe um usuário com o email ${usuarioData.email}`
      });
      return;
    }
    
    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(usuarioData.password, saltRounds);
    
    // Criar usuário com senha hasheada
    const usuario = await Usuario.create({
      ...usuarioData,
      password: hashedPassword
    });
    
    // Remover senha do objeto de resposta usando desestruturação
    const { password, ...usuarioSemSenha } = usuario.toObject();
    
    res.status(201).json({
      status: 'success',
      data: usuarioSemSenha
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao criar usuário'
    });
  }
};

/**
 * Login de usuário
 */
export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuário pelo email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou senha incorretos'
      });
    }
    
    // Verificar senha
    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou senha incorretos'
      });
    }
    
    // Se for um estudante, buscar os dados do estudante
    let estudanteData = null;
    if (usuario.tipo === TipoUsuario.NORMAL) {
      const estudante = await Estudante.findOne({ usuario: usuario._id });
      if (estudante) {
        estudanteData = {
          _id: estudante._id,
          nome: estudante.nome,
          email: estudante.email,
          classe: estudante.classe,
          escola: estudante.escola,
          provincia: estudante.provincia
        };
      }
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario._id,
        email: usuario.email,
        tipo: usuario.tipo
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Dados do usuário para resposta
    const userData = {
      _id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      estudante: estudanteData
    };
    
    res.status(200).json({
      status: 'success',
      token,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém o perfil do usuário autenticado
 */
export const getProfile: RequestHandler = async (req, res, next) => {
  try {
    // O middleware de autenticação já deve ter colocado o ID do usuário na request
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Não autenticado'
      });
      return;
    }
    
    const usuario = await Usuario.findById(userId).select('-password');
    if (!usuario) {
      res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: usuario
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar perfil'
    });
  }
};

/**
 * Obtém todos os usuários (somente para admin)
 */
export const getAllUsuarios: RequestHandler = async (req, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse({
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 10)
    });
    
    const total = await Usuario.countDocuments();
    
    const usuarios = await Usuario.find()
      .select('-password')
      .sort({ nome: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.status(200).json({
      status: 'success',
      data: usuarios,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar usuários'
    });
  }
};

/**
 * Atualiza um usuário pelo ID
 */
export const updateUsuario: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateUsuarioInput;
    
    // Verificar se o usuário existe
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
      return;
    }
    
    // Se estiver atualizando o email, verificar se já existe outro com esse email
    if (updateData.email && updateData.email !== usuario.email) {
      const exists = await Usuario.findOne({ 
        email: updateData.email, 
        _id: { $ne: id } 
      });
      
      if (exists) {
        res.status(409).json({
          status: 'error',
          message: `Já existe um usuário com o email ${updateData.email}`
        });
        return;
      }
    }
    
    // Hash da senha se estiver sendo atualizada
    if (updateData.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }
    
    // Atualizar o usuário
    const updatedUsuario = await Usuario.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      status: 'success',
      data: updatedUsuario
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar usuário'
    });
  }
};

/**
 * Remove um usuário pelo ID
 */
export const deleteUsuario: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
      return;
    }
    
    // Remover o usuário
    await Usuario.findByIdAndDelete(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Usuário removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao remover usuário'
    });
  }
};

/**
 * Altera a senha do usuário
 */
export const changePassword: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        status: 'error',
        message: 'Senha atual e nova senha são obrigatórias'
      });
      return;
    }
    
    // Verificar se o usuário existe
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
      return;
    }
    
    // Verificar senha atual
    const senhaCorreta = await bcrypt.compare(currentPassword, usuario.password);
    if (!senhaCorreta) {
      res.status(401).json({
        status: 'error',
        message: 'Senha atual incorreta'
      });
      return;
    }
    
    // Hash da nova senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Atualizar senha
    usuario.password = hashedPassword;
    await usuario.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao alterar senha'
    });
  }
};