import type { RequestHandler } from 'express';
import { Usuario, TipoUsuario, type IUsuario } from '../models/usuario';
import { Estudante } from '../models/estudante';
import type { CreateUsuarioInput, UpdateUsuarioInput, LoginInput } from '../schemas/usuario.schema';
import { paginationSchema } from '../schemas/common.schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';
import { formatResponse } from '../utils/response.utils';

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
      res.status(409).json(formatResponse(
        null,
        undefined,
        `Já existe um usuário com o email ${usuarioData.email}`
      ));
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
    
    res.status(201).json(formatResponse(usuarioSemSenha));
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao criar usuário'));
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
      res.status(401).json(formatResponse(null, undefined, 'Não autenticado'));
      return;
    }
    
    const usuario = await Usuario.findById(userId).select('-password');
    if (!usuario) {
      res.status(404).json(formatResponse(null, undefined, 'Usuário não encontrado'));
      return;
    }
    
    res.status(200).json(formatResponse(usuario));
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao buscar perfil'));
  }
};

/**
 * Obtém todos os usuários (somente para admin)
 */
export const getAllUsuarios: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const tipo = req.query.tipo as string;
    const status = req.query.status as string;
    
    // Construir a query
    let query: any = {};
    
    // Aplicar filtro de busca
    if (search) {
      query.$or = [
        { nome: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Aplicar filtro de tipo
    if (tipo) {
      query.tipo = tipo;
    }
    
    // Aplicar filtro de status
    if (status) {
      query.ativo = status === 'ativo';
    }
    
    // Contar o total de resultados para paginação
    const total = await Usuario.countDocuments(query);
    
    // Buscar os usuários com paginação
    const usuarios = await Usuario.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.status(200).json(formatResponse(
      usuarios,
      { page, limit, total }
    ));
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao buscar usuários'));
  }
};

/**
 * Busca usuários por termo de pesquisa
 */
export const searchUsuarios: RequestHandler = async (req, res, next) => {
  try {
    const query = req.query.q as string;
    
    if (!query) {
      res.status(400).json(formatResponse(null, undefined, 'Termo de busca é obrigatório'));
      return;
    }
    
    const usuarios = await Usuario.find({
      $or: [
        { nome: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
    .select('-password')
    .limit(10);
    
    res.status(200).json(formatResponse(usuarios));
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao buscar usuários'));
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
      res.status(404).json(formatResponse(null, undefined, 'Usuário não encontrado'));
      return;
    }
    
    // Se estiver atualizando o email, verificar se já existe outro com esse email
    if (updateData.email && updateData.email !== usuario.email) {
      const exists = await Usuario.findOne({ 
        email: updateData.email, 
        _id: { $ne: id } 
      });
      
      if (exists) {
        res.status(409).json(formatResponse(
          null,
          undefined,
          `Já existe um usuário com o email ${updateData.email}`
        ));
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
    
    res.status(200).json(formatResponse(updatedUsuario));
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao atualizar usuário'));
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
      res.status(404).json(formatResponse(null, undefined, 'Usuário não encontrado'));
      return;
    }
    
    // Remover o usuário
    await Usuario.findByIdAndDelete(id);
    
    res.status(200).json(formatResponse(null, undefined, 'Usuário removido com sucesso'));
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao remover usuário'));
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
      res.status(400).json(formatResponse(null, undefined, 'Senha atual e nova senha são obrigatórias'));
      return;
    }
    
    // Verificar se o usuário existe
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      res.status(404).json(formatResponse(null, undefined, 'Usuário não encontrado'));
      return;
    }
    
    // Verificar senha atual
    const senhaCorreta = await bcrypt.compare(currentPassword, usuario.password);
    if (!senhaCorreta) {
      res.status(401).json(formatResponse(null, undefined, 'Senha atual incorreta'));
      return;
    }
    
    // Hash da nova senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Atualizar senha
    usuario.password = hashedPassword;
    await usuario.save();
    
    res.status(200).json(formatResponse(null, undefined, 'Senha alterada com sucesso'));
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao alterar senha'));
  }
};