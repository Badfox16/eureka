import request from 'supertest';
import { app } from '../../src/index';
import { Estudante } from '../../src/models/estudante';
import { createEstudanteFixtures, estudanteFixtures } from '../fixtures/estudantes';
import { createUsuarioFixtures } from '../fixtures/usuarios';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { TipoUsuario } from '../../src/models/usuario';

describe('API de Estudantes', () => {
  let professorToken: string;
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
    
    professorToken = jwt.sign(
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
        .set('Authorization', `Bearer ${professorToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2); // Assume 2 itens de fixture
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBe(2);
    });
    
    it('deve filtrar estudantes por classe', async () => {
      const res = await request(app)
        .get('/api/estudantes?classe=12')
        .set('Authorization', `Bearer ${professorToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].classe).toBe(12);
    });

    it('deve negar acesso sem token de autenticação', async () => {
      const res = await request(app)
        .get('/api/estudantes');
      
      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('GET /api/estudantes/:id', () => {
    it('deve retornar um estudante pelo ID', async () => {
      // Primeiro obtemos um estudante existente
      const estudantes = await Estudante.find();
      const estudante = estudantes[0];
      
      const res = await request(app)
        .get(`/api/estudantes/${estudante._id}`)
        .set('Authorization', `Bearer ${professorToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data._id).toBe(estudante._id.toString());
      expect(res.body.data.nome).toBe(estudante.nome);
    });
    
    it('deve retornar 404 para ID inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .get(`/api/estudantes/${fakeId}`)
        .set('Authorization', `Bearer ${professorToken}`);
      
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('POST /api/estudantes', () => {
    it('deve criar um novo estudante', async () => {
      const novoEstudante = {
        nome: 'Pedro Alves',
        email: 'pedro@exemplo.com',
        classe: 11,
        escola: 'Colégio Dom Bosco',
        provincia: 'Huambo'
      };
      
      const res = await request(app)
        .post('/api/estudantes')
        .set('Authorization', `Bearer ${professorToken}`)
        .send(novoEstudante);
      
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.nome).toBe(novoEstudante.nome);
      expect(res.body.data.email).toBe(novoEstudante.email);
      expect(res.body.data.classe).toBe(novoEstudante.classe);
      
      // Verificar se foi realmente salvo no banco
      const estudanteSalvo = await Estudante.findOne({ email: 'pedro@exemplo.com' });
      expect(estudanteSalvo).not.toBeNull();
      expect(estudanteSalvo!.nome).toBe('Pedro Alves');
    });
    
    it('deve impedir a criação de estudante com email duplicado', async () => {
      // Usando email do primeiro fixture
      const estudanteDuplicado = {
        nome: 'Outro Nome',
        email: estudanteFixtures[0].email,
        classe: 12
      };
      
      const res = await request(app)
        .post('/api/estudantes')
        .set('Authorization', `Bearer ${professorToken}`)
        .send(estudanteDuplicado);
      
      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('email');
    });
    
    it('deve validar a classe do estudante', async () => {
      const estudanteInvalido = {
        nome: 'Teste Classe Inválida',
        email: 'teste.classe@exemplo.com',
        classe: 10 // Classe inválida, deve ser 11 ou 12
      };
      
      const res = await request(app)
        .post('/api/estudantes')
        .set('Authorization', `Bearer ${professorToken}`)
        .send(estudanteInvalido);
      
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('PUT /api/estudantes/:id', () => {
    it('deve atualizar um estudante existente', async () => {
      const estudantes = await Estudante.find();
      const estudante = estudantes[0];
      
      const atualizacao = {
        nome: 'Nome Atualizado',
        escola: 'Escola Atualizada'
      };
      
      const res = await request(app)
        .put(`/api/estudantes/${estudante._id}`)
        .set('Authorization', `Bearer ${professorToken}`)
        .send(atualizacao);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.nome).toBe(atualizacao.nome);
      expect(res.body.data.escola).toBe(atualizacao.escola);
      
      // Email não deve ter mudado
      expect(res.body.data.email).toBe(estudante.email);
      
      // Verificar no banco
      const estudanteAtualizado = await Estudante.findById(estudante._id);
      expect(estudanteAtualizado!.nome).toBe(atualizacao.nome);
    });
    
    it('deve impedir atualização para email duplicado', async () => {
      const estudantes = await Estudante.find();
      // Pegamos o estudante 0 e tentamos atualizar com o email do estudante 1
      const estudante0 = estudantes[0];
      const estudante1 = estudantes[1];
      
      const atualizacao = {
        email: estudante1.email // Tentando usar um email que já existe
      };
      
      const res = await request(app)
        .put(`/api/estudantes/${estudante0._id}`)
        .set('Authorization', `Bearer ${professorToken}`)
        .send(atualizacao);
      
      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('DELETE /api/estudantes/:id', () => {
    it('deve remover um estudante existente', async () => {
      // Primeiro criar um estudante para teste
      const novoEstudante = await Estudante.create({
        nome: 'Estudante para Remover',
        email: 'remover@exemplo.com',
        classe: 11
      });
      
      const res = await request(app)
        .delete(`/api/estudantes/${novoEstudante._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      
      // Verificar se foi removido do banco
      const estudanteRemovido = await Estudante.findById(novoEstudante._id);
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
    it('deve buscar estudantes por termo', async () => {
      const res = await request(app)
        .get('/api/estudantes/search?q=joao')
        .set('Authorization', `Bearer ${professorToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.length).toBeGreaterThan(0);
      // Assumindo que o nome do estudante contém "João" em minúsculas
      expect(res.body.data[0].nome.toLowerCase()).toContain('joão');
    });
    
    it('deve retornar array vazio para termo sem correspondência', async () => {
      const res = await request(app)
        .get('/api/estudantes/search?q=naoexiste')
        .set('Authorization', `Bearer ${professorToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);
    });
  });
  
  describe('GET /api/estudantes/:id/estatisticas', () => {
    it('deve retornar estatísticas do estudante', async () => {
      const estudantes = await Estudante.find();
      const estudante = estudantes[0];
      
      const res = await request(app)
        .get(`/api/estudantes/${estudante._id}/estatisticas`)
        .set('Authorization', `Bearer ${professorToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toBeDefined();
      expect(res.body.data.geral).toBeDefined();
      // Como não criamos respostas no beforeEach, esperamos 0 respostas
      expect(res.body.data.geral.totalRespostas).toBeDefined();
    });
  });
});