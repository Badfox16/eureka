import request from 'supertest';
import { app } from '../../src/index';
import { Avaliacao, TipoAvaliacao, Trimestre, Epoca } from '../../src/models/avaliacao';
import { createAvaliacaoFixtures } from '../fixtures/avaliacoes';
import { createDisciplinaFixtures } from '../fixtures/disciplinas';
import { createUsuarioFixtures } from '../fixtures/usuarios';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { TipoUsuario } from '../../src/models/usuario';

describe('API de Avaliações', () => {
  let professorToken: string;
  let adminToken: string;
  let disciplinaId: string;
  
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
    
    // Criar disciplinas para avaliações
    const disciplinas = await createDisciplinaFixtures();
    disciplinaId = disciplinas[0]._id.toString();
    
    // Criar avaliações para teste
    await createAvaliacaoFixtures();
  });
  
  describe('GET /api/avaliacoes', () => {
    it('deve listar todas as avaliações com paginação', async () => {
      const res = await request(app)
        .get('/api/avaliacoes')
        .set('Authorization', `Bearer ${professorToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.meta).toBeDefined();
    });
    
    it('deve filtrar avaliações por tipo', async () => {
      const res = await request(app)
        .get(`/api/avaliacoes?tipo=${TipoAvaliacao.AP}`)
        .set('Authorization', `Bearer ${professorToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].tipo).toBe(TipoAvaliacao.AP);
    });
    
    it('deve filtrar avaliações por classe', async () => {
      const res = await request(app)
        .get('/api/avaliacoes?classe=12')
        .set('Authorization', `Bearer ${professorToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach((avaliacao: any) => {
        expect(avaliacao.classe).toBe(12);
      });
    });
  });
  
  describe('GET /api/avaliacoes/:id', () => {
    it('deve retornar uma avaliação pelo ID', async () => {
      // Primeiro obtemos uma avaliação existente
      const avaliacoes = await Avaliacao.find();
      const avaliacao = avaliacoes[0];
      
      const res = await request(app)
        .get(`/api/avaliacoes/${avaliacao._id}`)
        .set('Authorization', `Bearer ${professorToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data._id).toBe(avaliacao._id.toString());
      expect(res.body.data.tipo).toBe(avaliacao.tipo);
    });
    
    it('deve retornar 404 para ID inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .get(`/api/avaliacoes/${fakeId}`)
        .set('Authorization', `Bearer ${professorToken}`);
      
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('POST /api/avaliacoes', () => {
    it('deve criar uma nova avaliação do tipo AP', async () => {
      const anoAtual = new Date().getFullYear();
      const novaAvaliacao = {
        tipo: TipoAvaliacao.AP,
        ano: anoAtual,
        disciplina: disciplinaId,
        classe: 11,
        trimestre: Trimestre.TERCEIRO
      };
      
      const res = await request(app)
        .post('/api/avaliacoes')
        .set('Authorization', `Bearer ${professorToken}`)
        .send(novaAvaliacao);
      
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.tipo).toBe(novaAvaliacao.tipo);
      expect(res.body.data.trimestre).toBe(novaAvaliacao.trimestre);
      
      // Verificar se foi realmente salvo no banco
      const avaliacaoSalva = await Avaliacao.findById(res.body.data._id);
      expect(avaliacaoSalva).not.toBeNull();
      expect(avaliacaoSalva!.tipo).toBe(TipoAvaliacao.AP);
    });
    
    it('deve criar uma nova avaliação do tipo EXAME', async () => {
      const anoAtual = new Date().getFullYear();
      const novaAvaliacao = {
        tipo: TipoAvaliacao.EXAME,
        ano: anoAtual,
        disciplina: disciplinaId,
        classe: 12,
        epoca: Epoca.SEGUNDA
      };
      
      const res = await request(app)
        .post('/api/avaliacoes')
        .set('Authorization', `Bearer ${professorToken}`)
        .send(novaAvaliacao);
      
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.tipo).toBe(novaAvaliacao.tipo);
      expect(res.body.data.epoca).toBe(novaAvaliacao.epoca);
    });
    
    it('deve validar os campos específicos para AP (trimestre obrigatório)', async () => {
      const anoAtual = new Date().getFullYear();
      const avaliacaoInvalida = {
        tipo: TipoAvaliacao.AP,
        ano: anoAtual,
        disciplina: disciplinaId,
        classe: 11
        // Faltando trimestre
      };
      
      const res = await request(app)
        .post('/api/avaliacoes')
        .set('Authorization', `Bearer ${professorToken}`)
        .send(avaliacaoInvalida);
      
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
    
    it('deve validar os campos específicos para EXAME (época obrigatória)', async () => {
      const anoAtual = new Date().getFullYear();
      const avaliacaoInvalida = {
        tipo: TipoAvaliacao.EXAME,
        ano: anoAtual,
        disciplina: disciplinaId,
        classe: 12
        // Faltando época
      };
      
      const res = await request(app)
        .post('/api/avaliacoes')
        .set('Authorization', `Bearer ${professorToken}`)
        .send(avaliacaoInvalida);
      
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
    
    it('deve impedir a criação de avaliação com características duplicadas', async () => {
      // Primeiro obter uma avaliação existente
      const avaliacoes = await Avaliacao.find({ tipo: TipoAvaliacao.AP });
      const avaliacaoExistente = avaliacoes[0];
      
      // Tentar criar uma avaliação idêntica
      const avaliacaoDuplicada = {
        tipo: avaliacaoExistente.tipo,
        ano: avaliacaoExistente.ano,
        disciplina: avaliacaoExistente.disciplina.toString(),
        classe: avaliacaoExistente.classe,
        trimestre: avaliacaoExistente.trimestre
      };
      
      const res = await request(app)
        .post('/api/avaliacoes')
        .set('Authorization', `Bearer ${professorToken}`)
        .send(avaliacaoDuplicada);
      
      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('mesmas características');
    });
  });
  
  describe('PUT /api/avaliacoes/:id', () => {
    it('deve atualizar uma avaliação existente', async () => {
      // Primeiro obter uma avaliação existente
      const avaliacoes = await Avaliacao.find({ tipo: TipoAvaliacao.AP });
      const avaliacao = avaliacoes[0];
      
      const atualizacao = {
        ano: avaliacao.ano - 1, // Alterar o ano para um valor anterior
      };
      
      const res = await request(app)
        .put(`/api/avaliacoes/${avaliacao._id}`)
        .set('Authorization', `Bearer ${professorToken}`)
        .send(atualizacao);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.ano).toBe(atualizacao.ano);
      
      // O tipo não deve ter mudado
      expect(res.body.data.tipo).toBe(avaliacao.tipo);
      
      // Verificar no banco
      const avaliacaoAtualizada = await Avaliacao.findById(avaliacao._id);
      expect(avaliacaoAtualizada!.ano).toBe(atualizacao.ano);
    });
  });
  
  describe('DELETE /api/avaliacoes/:id', () => {
    it('deve remover uma avaliação existente', async () => {
      // Criar uma avaliação para teste
      const anoAtual = new Date().getFullYear();
      const avaliacaoParaRemover = await Avaliacao.create({
        tipo: TipoAvaliacao.AP,
        ano: anoAtual,
        disciplina: new mongoose.Types.ObjectId(disciplinaId),
        classe: 11,
        trimestre: Trimestre.TERCEIRO
      });
      
      const res = await request(app)
        .delete(`/api/avaliacoes/${avaliacaoParaRemover._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      
      // Verificar se foi removido do banco
      const avaliacaoRemovida = await Avaliacao.findById(avaliacaoParaRemover._id);
      expect(avaliacaoRemovida).toBeNull();
    });
    
    it('deve retornar 404 ao tentar remover avaliação inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .delete(`/api/avaliacoes/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('GET /api/avaliacoes/estatisticas', () => {
    it('deve retornar estatísticas sobre avaliações', async () => {
      const res = await request(app)
        .get('/api/avaliacoes/estatisticas')
        .set('Authorization', `Bearer ${professorToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toBeDefined();
      expect(res.body.data.porTipo).toBeDefined();
      expect(res.body.data.porDisciplina).toBeDefined();
      expect(res.body.data.porAno).toBeDefined();
    });
  });
  
  describe('GET /api/avaliacoes/search', () => {
    it('deve buscar avaliações por termo', async () => {
      // Buscar pelo ano atual (que deve existir em alguma avaliação)
      const anoAtual = new Date().getFullYear().toString();
      
      const res = await request(app)
        .get(`/api/avaliacoes/search?q=${anoAtual}`)
        .set('Authorization', `Bearer ${professorToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});