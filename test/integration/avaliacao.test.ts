import request from 'supertest';
import { app } from '../../src/index';
import { Avaliacao, TipoAvaliacao, Trimestre, Epoca } from '../../src/models/avaliacao';
import { Disciplina } from '../../src/models/disciplina';
import { createAvaliacaoFixtures } from '../fixtures/avaliacoes';
import { createDisciplinaFixtures } from '../fixtures/disciplinas';
import { createUsuarioFixtures } from '../fixtures/usuarios';
import { TipoUsuario } from '../../src/models/usuario';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('API de Avaliações', () => {
  let authToken: string;
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
    
    authToken = jwt.sign(
      { id: professor!._id.toString(), email: professor!.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    
    // Criar disciplinas para teste
    const disciplinas = await createDisciplinaFixtures();
    disciplinaId = disciplinas[0]._id.toString();
    
    // Criar avaliações para teste
    await createAvaliacaoFixtures();
  });
  
  describe('GET /api/avaliacoes', () => {
    it('deve listar todas as avaliações com paginação', async () => {
      const res = await request(app)
        .get('/api/avaliacoes')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThan(0);
    });
    
    it('deve aplicar filtro por disciplina', async () => {
      const res = await request(app)
        .get(`/api/avaliacoes?disciplina=${disciplinaId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      
      // Se houver resultados, verificar se todos pertencem à disciplina
      if (res.body.data.length > 0) {
        const todasDaDisciplina = res.body.data.every(
          (a: any) => a.disciplina._id === disciplinaId || a.disciplina === disciplinaId
        );
        expect(todasDaDisciplina).toBe(true);
      }
    });
    
    it('deve aplicar filtro por tipo', async () => {
      const tipoFiltro = TipoAvaliacao.AP;
      
      const res = await request(app)
        .get(`/api/avaliacoes?tipo=${tipoFiltro}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      
      // Se houver resultados, verificar se todos são do tipo solicitado
      if (res.body.data.length > 0) {
        const todasDoTipo = res.body.data.every((a: any) => a.tipo === tipoFiltro);
        expect(todasDoTipo).toBe(true);
      }
    });
    
    it('deve aplicar filtro por classe', async () => {
      const classeFiltro = 12;
      
      const res = await request(app)
        .get(`/api/avaliacoes?classe=${classeFiltro}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      
      // Se houver resultados, verificar se todos são da classe solicitada
      if (res.body.data.length > 0) {
        const todasDaClasse = res.body.data.every((a: any) => a.classe === classeFiltro);
        expect(todasDaClasse).toBe(true);
      }
    });
    
    it('deve aplicar filtro por ano', async () => {
      const anoAtual = new Date().getFullYear();
      
      const res = await request(app)
        .get(`/api/avaliacoes?ano=${anoAtual}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      
      // Se houver resultados, verificar se todos são do ano solicitado
      if (res.body.data.length > 0) {
        const todasDoAno = res.body.data.every((a: any) => a.ano === anoAtual);
        expect(todasDoAno).toBe(true);
      }
    });
  });
  
  describe('POST /api/avaliacoes', () => {
    it('deve criar uma nova avaliação tipo AP', async () => {
      const novaAvaliacao = {
        tipo: TipoAvaliacao.AP,
        ano: new Date().getFullYear(),
        disciplina: disciplinaId,
        classe: 11,
        trimestre: Trimestre.TERCEIRO
      };
      
      const res = await request(app)
        .post('/api/avaliacoes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(novaAvaliacao);
      
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.tipo).toBe(novaAvaliacao.tipo);
      expect(res.body.data.ano).toBe(novaAvaliacao.ano);
      expect(res.body.data.classe).toBe(novaAvaliacao.classe);
      expect(res.body.data.trimestre).toBe(novaAvaliacao.trimestre);
      expect(res.body.data.disciplina).toBe(disciplinaId);
      
      // Verificar se foi realmente salvo no banco
      const avaliacaoSalva = await Avaliacao.findById(res.body.data._id);
      expect(avaliacaoSalva).not.toBeNull();
      expect(avaliacaoSalva!.tipo).toBe(novaAvaliacao.tipo);
    });
    
    it('deve criar uma nova avaliação tipo EXAME', async () => {
      const novaAvaliacao = {
        tipo: TipoAvaliacao.EXAME,
        ano: new Date().getFullYear(),
        disciplina: disciplinaId,
        classe: 12,
        epoca: Epoca.PRIMEIRA
      };
      
      const res = await request(app)
        .post('/api/avaliacoes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(novaAvaliacao);
      
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.tipo).toBe(novaAvaliacao.tipo);
      expect(res.body.data.epoca).toBe(novaAvaliacao.epoca);
    });
    
    it('deve validar campos obrigatórios com base no tipo', async () => {
      // AP sem trimestre
      const avaliacaoInvalida = {
        tipo: TipoAvaliacao.AP,
        ano: new Date().getFullYear(),
        disciplina: disciplinaId,
        classe: 11
        // trimestre está faltando
      };
      
      const res = await request(app)
        .post('/api/avaliacoes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(avaliacaoInvalida);
      
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('GET /api/avaliacoes/:id', () => {
    it('deve retornar uma avaliação pelo ID com questões', async () => {
      // Buscar uma avaliação existente
      const avaliacoes = await Avaliacao.find();
      const avaliacaoId = avaliacoes[0]._id;
      
      const res = await request(app)
        .get(`/api/avaliacoes/${avaliacaoId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data._id).toBe(avaliacaoId.toString());
      expect(res.body.data.disciplina).toBeDefined();
      
      // A resposta deve incluir questões
      expect(Array.isArray(res.body.data.questoes)).toBe(true);
    });
  });
  
  describe('PUT /api/avaliacoes/:id', () => {
    it('deve atualizar uma avaliação existente', async () => {
      // Buscar uma avaliação existente
      const avaliacoes = await Avaliacao.find();
      const avaliacao = avaliacoes[0];
      
      const atualizacao = {
        ano: avaliacao.ano + 1
      };
      
      const res = await request(app)
        .put(`/api/avaliacoes/${avaliacao._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(atualizacao);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.ano).toBe(atualizacao.ano);
      
      // Verificar se foi atualizado no banco
      const avaliacaoAtualizada = await Avaliacao.findById(avaliacao._id);
      expect(avaliacaoAtualizada!.ano).toBe(atualizacao.ano);
    });
  });
  
  describe('DELETE /api/avaliacoes/:id', () => {
    it('deve remover uma avaliação e suas questões relacionadas', async () => {
      // Primeiro, criar uma avaliação para depois remover
      const novaAvaliacao = new Avaliacao({
        tipo: TipoAvaliacao.AP,
        ano: 2022,
        disciplina: disciplinaId,
        classe: 11,
        trimestre: Trimestre.PRIMEIRO,
        questoes: []
      });
      await novaAvaliacao.save();
      
      const res = await request(app)
        .delete(`/api/avaliacoes/${novaAvaliacao._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      
      // Verificar se foi realmente removido do banco
      const avaliacaoRemovida = await Avaliacao.findById(novaAvaliacao._id);
      expect(avaliacaoRemovida).toBeNull();
    });
  });
  
  describe('GET /api/avaliacoes/search', () => {
    it('deve buscar avaliações por disciplina', async () => {
      // Buscar uma disciplina existente
      const disciplina = await Disciplina.findOne();
      
      const res = await request(app)
        .get(`/api/avaliacoes/search?disciplina=${disciplina!.nome}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });
    
    it('deve retornar array vazio para termo sem correspondência', async () => {
      const res = await request(app)
        .get('/api/avaliacoes/search?disciplina=DisciplinaInexistente123')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toEqual([]);
    });
  });
  
  describe('GET /api/avaliacoes/estatisticas', () => {
    it('deve fornecer estatísticas das avaliações', async () => {
      const res = await request(app)
        .get('/api/avaliacoes/estatisticas')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toBeDefined();
      expect(res.body.data.totalAvaliacoes).toBeDefined();
      expect(res.body.data.porTipo).toBeDefined();
      expect(res.body.data.porClasse).toBeDefined();
      expect(res.body.data.porAno).toBeDefined();
    });
  });
});