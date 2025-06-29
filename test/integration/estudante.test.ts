import request from 'supertest';
import { app } from '../../server/src/index';
import { Estudante } from '../../server/src/models/estudante';
import { createEstudanteFixtures } from '../fixtures/estudantes';
import { createUsuarioFixtures } from '../fixtures/usuarios';
import { TipoUsuario } from '../../server/src/models/usuario';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('API de Estudantes', () => {
  let authToken: string;
  let adminToken: string;
  
  beforeEach(async () => {
    // Criar usuários para teste
    const usuarios = await createUsuarioFixtures();
    const admin = usuarios.find(u => u.tipo === TipoUsuario.ADMIN);
    const professor = usuarios.find(u => u.tipo === TipoUsuario.PROFESSOR);
    
    // Gerar tokens JWT
    adminToken = jwt.sign(
      { id: admin!._id.toString(), email: admin!.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    
    authToken = jwt.sign(
      { id: professor!._id.toString(), email: professor!.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    
    // Criar estudantes para teste
    await createEstudanteFixtures();
  });
  
  describe('GET /api/estudantes', () => {
    it('deve listar todos os estudantes com paginação', async () => {
      const res = await request(app)
        .get('/api/estudantes')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThan(0);
    });
    
    it('deve aplicar filtro por classe', async () => {
      // Buscar estudantes da classe 11
      const res = await request(app)
        .get('/api/estudantes?classe=11')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      
      // Verificar se todos os resultados têm classe = 11
      const todosClasse11 = res.body.data.every((e: any) => e.classe === 11);
      expect(todosClasse11).toBe(true);
    });
    
    it('deve aplicar paginação corretamente', async () => {
      const res = await request(app)
        .get('/api/estudantes?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(1);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(1);
    });
  });
  
  describe('GET /api/estudantes/:id', () => {
    it('deve retornar um estudante pelo ID', async () => {
      // Buscar todos os estudantes para obter um ID válido
      const todosEstudantes = await Estudante.find();
      const estudanteId = todosEstudantes[0]._id;
      
      const res = await request(app)
        .get(`/api/estudantes/${estudanteId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data._id).toBe(estudanteId.toString());
      expect(res.body.data.nome).toBeDefined();
      expect(res.body.data.email).toBeDefined();
      expect(res.body.data.classe).toBeDefined();
    });
    
    it('deve retornar 404 para ID inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .get(`/api/estudantes/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('POST /api/estudantes', () => {
    it('deve criar um novo estudante', async () => {
      const novoEstudante = {
        nome: 'Estudante Teste',
        email: 'estudante.teste@exemplo.com',
        classe: 12,
        escola: 'Escola Teste',
        provincia: 'Luanda'
      };
      
      const res = await request(app)
        .post('/api/estudantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(novoEstudante);
      
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.nome).toBe(novoEstudante.nome);
      expect(res.body.data.email).toBe(novoEstudante.email);
      expect(res.body.data.classe).toBe(novoEstudante.classe);
      
      // Verificar se foi realmente salvo no banco
      const estudanteSalvo = await Estudante.findOne({ email: novoEstudante.email });
      expect(estudanteSalvo).not.toBeNull();
      expect(estudanteSalvo!.nome).toBe(novoEstudante.nome);
    });
    
    it('deve impedir a criação de estudante com email duplicado', async () => {
      // Buscar um estudante existente
      const estudanteExistente = await Estudante.findOne();
      
      const estudanteDuplicado = {
        nome: 'Outro Nome',
        email: estudanteExistente!.email, // Email já existe
        classe: 11
      };
      
      const res = await request(app)
        .post('/api/estudantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(estudanteDuplicado);
      
      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('email');
    });
    
    it('deve validar a classe do estudante', async () => {
      const estudanteInvalido = {
        nome: 'Estudante Inválido',
        email: 'invalido@exemplo.com',
        classe: 10 // Deve ser 11 ou 12
      };
      
      const res = await request(app)
        .post('/api/estudantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(estudanteInvalido);
      
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('PUT /api/estudantes/:id', () => {
    it('deve atualizar um estudante existente', async () => {
      // Buscar um estudante existente
      const estudanteExistente = await Estudante.findOne();
      
      const atualizacao = {
        nome: 'Nome Atualizado',
        escola: 'Escola Atualizada'
      };
      
      const res = await request(app)
        .put(`/api/estudantes/${estudanteExistente!._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(atualizacao);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.nome).toBe(atualizacao.nome);
      expect(res.body.data.escola).toBe(atualizacao.escola);
      
      // Email não deve ter mudado
      expect(res.body.data.email).toBe(estudanteExistente!.email);
      
      // Verificar no banco
      const estudanteAtualizado = await Estudante.findById(estudanteExistente!._id);
      expect(estudanteAtualizado!.nome).toBe(atualizacao.nome);
    });
    
    it('deve impedir atualização para email duplicado', async () => {
      // Buscar dois estudantes
      const estudantes = await Estudante.find().limit(2);
      
      if (estudantes.length < 2) {
        console.log('Não há estudantes suficientes para este teste');
        return;
      }
      
      const [estudante1, estudante2] = estudantes;
      
      // Tentar atualizar estudante1 com o email de estudante2
      const atualizacao = {
        email: estudante2.email
      };
      
      const res = await request(app)
        .put(`/api/estudantes/${estudante1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(atualizacao);
      
      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('email');
    });
  });
  
  describe('DELETE /api/estudantes/:id', () => {
    it('deve remover um estudante existente', async () => {
      // Criar um estudante para ser removido
      const estudanteParaRemover = await Estudante.create({
        nome: 'Estudante Para Remover',
        email: 'remover@exemplo.com',
        classe: 11
      });
      
      const res = await request(app)
        .delete(`/api/estudantes/${estudanteParaRemover._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toContain('sucesso');
      
      // Verificar se foi realmente removido do banco
      const estudanteRemovido = await Estudante.findById(estudanteParaRemover._id);
      expect(estudanteRemovido).toBeNull();
    });
    
    it('deve retornar 404 ao tentar remover estudante inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .delete(`/api/estudantes/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('GET /api/estudantes/search', () => {
    it('deve buscar estudantes por termo no nome ou email', async () => {
      // Criar um estudante com nome específico para busca
      await Estudante.create({
        nome: 'UniqueTestName',
        email: 'unique.test@exemplo.com',
        classe: 11
      });
      
      const res = await request(app)
        .get('/api/estudantes/search?q=UniqueTest')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].nome).toContain('UniqueTest');
    });
  });
  
  describe('GET /api/estudantes/:id/respostas', () => {
    it('deve listar respostas de um estudante', async () => {
      // Buscar um estudante existente
      const estudante = await Estudante.findOne();
      
      const res = await request(app)
        .get(`/api/estudantes/${estudante!._id}/respostas`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
  
  describe('GET /api/estudantes/:id/estatisticas', () => {
    it('deve fornecer estatísticas para um estudante', async () => {
      // Buscar um estudante existente
      const estudante = await Estudante.findOne();
      
      const res = await request(app)
        .get(`/api/estudantes/${estudante!._id}/estatisticas`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toBeDefined();
      expect(res.body.data.totalRespostas).toBeDefined();
    });
  });
});