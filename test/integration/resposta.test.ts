import request from 'supertest';
import { app } from '../../src/index';
import { Resposta } from '../../src/models/respostas';
import { Estudante } from '../../src/models/estudante';
import { Questao } from '../../src/models/questao';
import { createQuestaoFixtures } from '../fixtures/questoes';
import { createEstudanteFixtures } from '../fixtures/estudantes';
import { createRespostaFixtures } from '../fixtures/respostas';
import { createUsuarioFixtures } from '../fixtures/usuarios';
import { TipoUsuario } from '../../src/models/usuario';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('API de Respostas', () => {
  let authToken: string;
  let adminToken: string;
  let estudanteId: string;
  let questaoId: string;
  
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
    
    // Criar estudantes
    const estudantes = await createEstudanteFixtures();
    estudanteId = estudantes[0]._id.toString();
    
    // Criar questões
    const questoes = await createQuestaoFixtures();
    questaoId = questoes[0]._id.toString();
    
    // Criar respostas
    await createRespostaFixtures();
  });
  
  describe('GET /api/respostas', () => {
    it('deve listar todas as respostas com paginação', async () => {
      const res = await request(app)
        .get('/api/respostas')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThanOrEqual(0);
    });
    
    it('deve filtrar respostas por estudante', async () => {
      const res = await request(app)
        .get(`/api/respostas?estudante=${estudanteId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      
      // Se houver resultados, verificar se são do estudante correto
      if (res.body.data.length > 0) {
        const todasDoEstudante = res.body.data.every(
          (r: any) => r.estudante._id === estudanteId || r.estudante === estudanteId
        );
        expect(todasDoEstudante).toBe(true);
      }
    });
    
    it('deve filtrar respostas por questão', async () => {
      const res = await request(app)
        .get(`/api/respostas?questao=${questaoId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      
      // Se houver resultados, verificar se são da questão correta
      if (res.body.data.length > 0) {
        const todasDaQuestao = res.body.data.every(
          (r: any) => r.questao._id === questaoId || r.questao === questaoId
        );
        expect(todasDaQuestao).toBe(true);
      }
    });
  });
  
  describe('POST /api/respostas', () => {
    it('deve registrar uma nova resposta', async () => {
      // Buscar uma questão para obter suas informações
      const questao = await Questao.findById(questaoId).populate('alternativas');
      
      // Encontrar a alternativa correta
      const alternativaCorreta = questao!.alternativas.find(alt => alt.correta);
      
      const novaResposta = {
        estudante: estudanteId,
        questao: questaoId,
        alternativaSelecionada: alternativaCorreta!.letra,
        tempoResposta: 30
      };
      
      const res = await request(app)
        .post('/api/respostas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(novaResposta);
      
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.estudante).toBe(estudanteId);
      expect(res.body.data.questao).toBe(questaoId);
      expect(res.body.data.alternativaSelecionada).toBe(alternativaCorreta!.letra);
      expect(res.body.data.estaCorreta).toBe(true);
      
      // Verificar se foi salvo no banco
      const respostaSalva = await Resposta.findById(res.body.data._id);
      expect(respostaSalva).not.toBeNull();
      expect(respostaSalva!.alternativaSelecionada).toBe(alternativaCorreta!.letra);
      
      // Verificar se foi adicionada ao estudante
      const estudante = await Estudante.findById(estudanteId);
      const respostaNoEstudante = estudante!.respostas!.some(
        r => r.toString() === res.body.data._id
      );
      expect(respostaNoEstudante).toBe(true);
    });
    
    it('deve validar alternativa selecionada', async () => {
      const respostaInvalida = {
        estudante: estudanteId,
        questao: questaoId,
        alternativaSelecionada: 'Z', // Alternativa inválida
        tempoResposta: 30
      };
      
      const res = await request(app)
        .post('/api/respostas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(respostaInvalida);
      
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
    
    it('deve impedir resposta duplicada para mesma questão/estudante', async () => {
      // Primeiro, verificar se já existe alguma resposta
      const respostas = await Resposta.find({
        estudante: estudanteId,
        questao: questaoId
      });
      
      if (respostas.length === 0) {
        // Se não há resposta, criar uma
        const questao = await Questao.findById(questaoId);
        const alternativa = questao!.alternativas[0].letra;
        
        await Resposta.create({
          estudante: estudanteId,
          questao: questaoId,
          alternativaSelecionada: alternativa,
          tempoResposta: 20,
          estaCorreta: false
        });
      }
      
      // Agora tentar criar outra resposta para a mesma questão/estudante
      const novaResposta = {
        estudante: estudanteId,
        questao: questaoId,
        alternativaSelecionada: 'B',
        tempoResposta: 30
      };
      
      const res = await request(app)
        .post('/api/respostas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(novaResposta);
      
      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('já respondeu');
    });
  });
  
  describe('GET /api/respostas/:id', () => {
    it('deve retornar uma resposta pelo ID', async () => {
      // Buscar uma resposta existente
      const respostas = await Resposta.find();
      
      if (respostas.length === 0) {
        console.log('Não há respostas para testar');
        return;
      }
      
      const respostaId = respostas[0]._id;
      
      const res = await request(app)
        .get(`/api/respostas/${respostaId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data._id).toBe(respostaId.toString());
      expect(res.body.data.estudante).toBeDefined();
      expect(res.body.data.questao).toBeDefined();
      expect(res.body.data.alternativaSelecionada).toBeDefined();
    });
  });
  
  describe('DELETE /api/respostas/:id', () => {
    it('deve remover uma resposta', async () => {
      // Criar uma resposta para depois remover
      const questao = await Questao.findOne();
      const estudante = await Estudante.findOne();
      
      if (!questao || !estudante) {
        console.log('Não há questão ou estudante para testar');
        return;
      }
      
      const novaResposta = await Resposta.create({
        estudante: estudante._id,
        questao: questao._id,
        alternativaSelecionada: 'A',
        tempoResposta: 15,
        estaCorreta: false
      });
      
      // Adicionar a resposta ao estudante
      await Estudante.findByIdAndUpdate(
        estudante._id,
        { $push: { respostas: novaResposta._id } }
      );
      
      const res = await request(app)
        .delete(`/api/respostas/${novaResposta._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toContain('sucesso');
      
      // Verificar se foi removido do banco
      const respostaRemovida = await Resposta.findById(novaResposta._id);
      expect(respostaRemovida).toBeNull();
      
      // Verificar se foi removido do estudante
      const estudanteAtualizado = await Estudante.findById(estudante._id);
      const respostaNoEstudante = estudanteAtualizado!.respostas!.some(
        r => r.toString() === novaResposta._id.toString()
      );
      expect(respostaNoEstudante).toBe(false);
    });
  });
  
  describe('GET /api/respostas/estatisticas', () => {
    it('deve fornecer estatísticas de respostas', async () => {
      const res = await request(app)
        .get('/api/respostas/estatisticas')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toBeDefined();
      expect(res.body.data.totalRespostas).toBeDefined();
      expect(res.body.data.respostasCertas).toBeDefined();
      expect(res.body.data.percentualAcerto).toBeDefined();
    });
  });
});