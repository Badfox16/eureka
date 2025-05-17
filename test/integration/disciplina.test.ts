import request from 'supertest';
import { app } from '../../server/index';
import { Disciplina } from '../../server/models/disciplina';
import { createDisciplinaFixtures } from '../fixtures/disciplinas';
import { createUsuarioFixtures } from '../fixtures/usuarios';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { TipoUsuario } from '../../server/models/usuario';

describe('API de Disciplinas', () => {
  let authToken: string;
  let adminToken: string;
  
  beforeEach(async () => {
    // Criar usuários para teste
    const usuarios = await createUsuarioFixtures();
    const admin = usuarios.find(u => u.tipo === TipoUsuario.ADMIN);
    const normal = usuarios.find(u => u.tipo === TipoUsuario.NORMAL);
    
    // Gerar tokens JWT
    adminToken = jwt.sign(
      { id: admin!._id.toString(), email: admin!.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    
    authToken = jwt.sign(
      { id: normal!._id.toString(), email: normal!.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    
    // Criar disciplinas para teste
    await createDisciplinaFixtures();
  });
  
  describe('GET /api/disciplinas', () => {
    it('deve listar todas as disciplinas com paginação', async () => {
      const res = await request(app)
        .get('/api/disciplinas')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(3); // Assume 3 itens de fixture
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBe(3);
    });
    
    it('deve aplicar paginação corretamente', async () => {
      const res = await request(app)
        .get('/api/disciplinas?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(2);
      expect(res.body.meta.pages).toBe(2); // 3 itens, limite 2 = 2 páginas
    });

    it('deve negar acesso sem token de autenticação', async () => {
      const res = await request(app)
        .get('/api/disciplinas');
      
      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('GET /api/disciplinas/:id', () => {
    it('deve retornar uma disciplina pelo ID', async () => {
      // Primeiro obtemos uma disciplina existente
      const disciplinas = await Disciplina.find();
      const disciplina = disciplinas[0];
      
      const res = await request(app)
        .get(`/api/disciplinas/${disciplina._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data._id).toBe(disciplina._id.toString());
      expect(res.body.data.nome).toBe(disciplina.nome);
    });
    
    it('deve retornar 404 para ID inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .get(`/api/disciplinas/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
    });
    
    it('deve retornar 400 para ID inválido', async () => {
      const res = await request(app)
        .get('/api/disciplinas/id-invalido')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('POST /api/disciplinas', () => {
    it('deve criar uma nova disciplina com permissão de admin', async () => {
      const novaDisciplina = {
        nome: 'Biologia',
        codigo: 'BIO',
        descricao: 'Disciplina de biologia'
      };
      
      const res = await request(app)
        .post('/api/disciplinas')
        .set('Authorization', `Bearer ${adminToken}`) // Usando token de admin
        .send(novaDisciplina);
      
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.nome).toBe(novaDisciplina.nome);
      expect(res.body.data.codigo).toBe(novaDisciplina.codigo);
      
      // Verificar se foi realmente salvo no banco
      const disciplinaSalva = await Disciplina.findOne({ codigo: 'BIO' });
      expect(disciplinaSalva).not.toBeNull();
      expect(disciplinaSalva!.nome).toBe('Biologia');
    });

    it('deve negar criação para usuário sem permissão de admin', async () => {
      const novaDisciplina = {
        nome: 'Geografia',
        codigo: 'GEO',
        descricao: 'Disciplina de geografia'
      };
      
      const res = await request(app)
        .post('/api/disciplinas')
        .set('Authorization', `Bearer ${authToken}`) // Usando token de usuário normal
        .send(novaDisciplina);
      
      expect(res.status).toBe(403);
      expect(res.body.status).toBe('error');
    });
    
    it('deve impedir a criação de disciplina com código duplicado', async () => {
      const disciplinaDuplicada = {
        nome: 'Matemática Duplicada',
        codigo: 'MAT', // Código já existente nos fixtures
        descricao: 'Tentativa de duplicação'
      };
      
      const res = await request(app)
        .post('/api/disciplinas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(disciplinaDuplicada);
      
      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('Já existe');
    });
    
    it('deve validar campos obrigatórios', async () => {
      const disciplinaInvalida = {
        descricao: 'Sem nome nem código'
      };
      
      const res = await request(app)
        .post('/api/disciplinas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(disciplinaInvalida);
      
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('PUT /api/disciplinas/:id', () => {
    it('deve atualizar uma disciplina existente', async () => {
      const disciplinas = await Disciplina.find();
      const disciplina = disciplinas[0];
      
      const atualizacao = {
        nome: 'Matemática Avançada',
        descricao: 'Disciplina atualizada'
      };
      
      const res = await request(app)
        .put(`/api/disciplinas/${disciplina._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(atualizacao);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.nome).toBe(atualizacao.nome);
      expect(res.body.data.descricao).toBe(atualizacao.descricao);
      
      // O código não deve ter mudado
      expect(res.body.data.codigo).toBe(disciplina.codigo);
      
      // Verificar no banco
      const disciplinaAtualizada = await Disciplina.findById(disciplina._id);
      expect(disciplinaAtualizada!.nome).toBe(atualizacao.nome);
    });
    
    it('deve impedir atualização para código duplicado', async () => {
      const disciplinas = await Disciplina.find();
      // Pegamos a disciplina 0 e tentamos atualizar com o código da disciplina 1
      const disciplina0 = disciplinas[0];
      const disciplina1 = disciplinas[1];
      
      const atualizacao = {
        codigo: disciplina1.codigo // Tentando usar um código que já existe
      };
      
      const res = await request(app)
        .put(`/api/disciplinas/${disciplina0._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(atualizacao);
      
      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('DELETE /api/disciplinas/:id', () => {
    it('deve remover uma disciplina existente', async () => {
      // Primeiro criar uma disciplina que não tenha avaliações
      const novaDisciplina = await Disciplina.create({
        nome: 'Disciplina para Remover',
        codigo: 'REM',
        descricao: 'Esta disciplina será removida'
      });
      
      const res = await request(app)
        .delete(`/api/disciplinas/${novaDisciplina._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      
      // Verificar se foi removido do banco
      const disciplinaRemovida = await Disciplina.findById(novaDisciplina._id);
      expect(disciplinaRemovida).toBeNull();
    });
    
    it('deve retornar 404 ao tentar remover disciplina inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .delete(`/api/disciplinas/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('GET /api/disciplinas/search', () => {
    it('deve buscar disciplinas por termo', async () => {
      const res = await request(app)
        .get('/api/disciplinas/search?q=mat')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].nome).toContain('Matemática');
    });
    
    it('deve retornar array vazio para termo sem correspondência', async () => {
      const res = await request(app)
        .get('/api/disciplinas/search?q=naoexiste')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);
    });
    
    it('deve validar o parâmetro de busca', async () => {
      const res = await request(app)
        .get('/api/disciplinas/search')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });
});