import request from 'supertest';
import { app } from '../../server/src/index';
import { Usuario, TipoUsuario } from '../../server/src/models/usuario';
import { createUsuarioFixtures } from '../fixtures/usuarios';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('Autenticação e Gerenciamento de Usuários', () => {
  let adminToken: string;
  let normalToken: string;
  let adminUser: any;
  let normalUser: any;
  
  beforeEach(async () => {
    // Criar usuários para teste
    const usuarios = await createUsuarioFixtures();
    adminUser = usuarios.find(u => u.tipo === TipoUsuario.ADMIN);
    normalUser = usuarios.find(u => u.tipo === TipoUsuario.NORMAL);
    
    // Gerar tokens JWT
    adminToken = jwt.sign(
      { id: adminUser!._id.toString(), email: adminUser!.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    
    normalToken = jwt.sign(
      { id: normalUser!._id.toString(), email: normalUser!.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
  });
  
  describe('POST /api/usuarios/login', () => {
    it('deve autenticar com credenciais corretas', async () => {
      const res = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'normal@exemplo.com',
          password: 'senha123'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.usuario).toBeDefined();
      expect(res.body.data.usuario.email).toBe('normal@exemplo.com');
      expect(res.body.data.usuario.password).toBeUndefined(); // Senha não deve ser retornada
    });
    
    it('deve rejeitar credenciais inválidas', async () => {
      const res = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'normal@exemplo.com',
          password: 'senha_errada'
        });
      
      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('incorretos');
    });
    
    it('deve rejeitar email inexistente', async () => {
      const res = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'naoexiste@exemplo.com',
          password: 'senha123'
        });
      
      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('POST /api/usuarios/register', () => {
    it('deve registrar um novo usuário', async () => {
      const novoUsuario = {
        nome: 'Novo Usuário',
        email: 'novo@exemplo.com',
        password: 'senha456'
      };
      
      const res = await request(app)
        .post('/api/usuarios/register')
        .send(novoUsuario);
      
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.email).toBe(novoUsuario.email);
      expect(res.body.data.password).toBeUndefined();
      
      // Verificar se foi realmente salvo no banco
      const usuarioSalvo = await Usuario.findOne({ email: 'novo@exemplo.com' });
      expect(usuarioSalvo).not.toBeNull();
      expect(usuarioSalvo!.nome).toBe('Novo Usuário');
    });
    
    it('deve impedir registro com email duplicado', async () => {
      const usuarioDuplicado = {
        nome: 'Duplicado',
        email: 'normal@exemplo.com', // Email já existe
        password: 'senha789'
      };
      
      const res = await request(app)
        .post('/api/usuarios/register')
        .send(usuarioDuplicado);
      
      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
    });
    
    it('deve validar campos obrigatórios', async () => {
      const usuarioInvalido = {
        nome: 'Sem Email',
        // email faltando
        password: 'senha123'
      };
      
      const res = await request(app)
        .post('/api/usuarios/register')
        .send(usuarioInvalido);
      
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('GET /api/usuarios/profile', () => {
    it('deve retornar o perfil do usuário autenticado', async () => {
      const res = await request(app)
        .get('/api/usuarios/profile')
        .set('Authorization', `Bearer ${normalToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.email).toBe(normalUser.email);
      expect(res.body.data.password).toBeUndefined();
    });
    
    it('deve rejeitar acesso sem token', async () => {
      const res = await request(app)
        .get('/api/usuarios/profile');
      
      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
    });
    
    it('deve rejeitar token inválido', async () => {
      const res = await request(app)
        .get('/api/usuarios/profile')
        .set('Authorization', 'Bearer token_invalido');
      
      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('PUT /api/usuarios/profile', () => {
    it('deve atualizar o perfil do usuário', async () => {
      const atualizacao = {
        nome: 'Nome Atualizado'
      };
      
      const res = await request(app)
        .put('/api/usuarios/profile')
        .set('Authorization', `Bearer ${normalToken}`)
        .send(atualizacao);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.nome).toBe(atualizacao.nome);
      
      // Verificar se foi realmente atualizado no banco
      const usuarioAtualizado = await Usuario.findById(normalUser._id);
      expect(usuarioAtualizado!.nome).toBe(atualizacao.nome);
    });
  });
  
  describe('PUT /api/usuarios/change-password/:id', () => {
    it('deve alterar a senha do usuário', async () => {
      const dadosSenha = {
        currentPassword: 'senha123',
        newPassword: 'novaSenha456'
      };
      
      const res = await request(app)
        .put(`/api/usuarios/change-password/${normalUser._id}`)
        .set('Authorization', `Bearer ${normalToken}`)
        .send(dadosSenha);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toContain('sucesso');
      
      // Tentar fazer login com a nova senha
      const loginRes = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: normalUser.email,
          password: 'novaSenha456'
        });
      
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.status).toBe('success');
    });
    
    it('deve rejeitar senha atual incorreta', async () => {
      const dadosSenha = {
        currentPassword: 'senha_errada',
        newPassword: 'novaSenha456'
      };
      
      const res = await request(app)
        .put(`/api/usuarios/change-password/${normalUser._id}`)
        .set('Authorization', `Bearer ${normalToken}`)
        .send(dadosSenha);
      
      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('GET /api/usuarios (admin)', () => {
    it('deve listar todos os usuários para admin', async () => {
      const res = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
    
    it('deve negar acesso para usuários não-admin', async () => {
      const res = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${normalToken}`);
      
      expect(res.status).toBe(403);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('PUT /api/usuarios/:id (admin)', () => {
    it('deve permitir que admin atualize qualquer usuário', async () => {
      const atualizacao = {
        nome: 'Nome Atualizado pelo Admin',
        tipo: TipoUsuario.PROFESSOR
      };
      
      const res = await request(app)
        .put(`/api/usuarios/${normalUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(atualizacao);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.nome).toBe(atualizacao.nome);
      expect(res.body.data.tipo).toBe(TipoUsuario.PROFESSOR);
      
      // Verificar se foi realmente atualizado no banco
      const usuarioAtualizado = await Usuario.findById(normalUser._id);
      expect(usuarioAtualizado!.nome).toBe(atualizacao.nome);
      expect(usuarioAtualizado!.tipo).toBe(TipoUsuario.PROFESSOR);
    });
    
    it('deve negar que usuário normal atualize outro usuário', async () => {
      const atualizacao = {
        nome: 'Tentativa de Alteração'
      };
      
      const res = await request(app)
        .put(`/api/usuarios/${adminUser._id}`)
        .set('Authorization', `Bearer ${normalToken}`)
        .send(atualizacao);
      
      expect(res.status).toBe(403);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('DELETE /api/usuarios/:id (admin)', () => {
    it('deve permitir que admin remova um usuário', async () => {
      // Criar um usuário para ser removido
      const usuarioParaRemover = await Usuario.create({
        nome: 'Usuário para Remover',
        email: 'remover@exemplo.com',
        password: 'senha123',
        tipo: TipoUsuario.NORMAL
      });
      
      const res = await request(app)
        .delete(`/api/usuarios/${usuarioParaRemover._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toContain('sucesso');
      
      // Verificar se foi realmente removido do banco
      const usuarioRemovido = await Usuario.findById(usuarioParaRemover._id);
      expect(usuarioRemovido).toBeNull();
    });
    
    it('deve negar que usuário normal remova um usuário', async () => {
      const res = await request(app)
        .delete(`/api/usuarios/${adminUser._id}`)
        .set('Authorization', `Bearer ${normalToken}`);
      
      expect(res.status).toBe(403);
      expect(res.body.status).toBe('error');
    });
  });
});