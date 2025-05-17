import request from 'supertest';
import { app } from '../../server/index';
import { Questao } from '../../server/models/questao';
import { Avaliacao, TipoAvaliacao, Trimestre, Epoca } from '../../server/models/avaliacao';
import { Disciplina } from '../../server/models/disciplina';
import mongoose from 'mongoose';
import { createDisciplinaFixtures } from '../fixtures/disciplinas';
import { createUsuarioFixtures } from '../fixtures/usuarios';
import { createAvaliacaoFixtures } from '../fixtures/avaliacoes';
import { createQuestaoFixtures } from '../fixtures/questoes';
import jwt from 'jsonwebtoken';
import { TipoUsuario } from '../../server/models/usuario';

describe('API de Questões', () => {
  let authToken: string;
  let adminToken: string;
  let avaliacaoId: string;
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
    const avaliacoes = await createAvaliacaoFixtures();
    avaliacaoId = avaliacoes[0]._id.toString();
    
    // Criar questões para teste
    await createQuestaoFixtures();
  });
  
  describe('GET /api/questoes', () => {
    it('deve listar todas as questões com paginação', async () => {
      const res = await request(app)
        .get('/api/questoes')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThan(0);
    });
    
    it('deve aplicar filtro por avaliação', async () => {
      const res = await request(app)
        .get(`/api/questoes?avaliacao=${avaliacaoId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      
      // Verificar se todas as questões pertencem à avaliação especificada
      if (res.body.data.length > 0) {
        const todasQuestoesDaAvaliacao = res.body.data.every(
          (q: any) => q.avaliacao._id === avaliacaoId || q.avaliacao === avaliacaoId
        );
        expect(todasQuestoesDaAvaliacao).toBe(true);
      }
    });
    
    it('deve aplicar filtro por disciplina', async () => {
      const res = await request(app)
        .get(`/api/questoes?disciplina=${disciplinaId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      
      // Se houver questões, verificar se todas estão relacionadas à disciplina correta
      if (res.body.data.length > 0) {
        for (const questao of res.body.data) {
          const avaliacaoDisciplinaId = questao.avaliacao.disciplina._id || 
                                        questao.avaliacao.disciplina;
          expect(avaliacaoDisciplinaId).toBeDefined();
        }
      }
    });
    
    it('deve negar acesso sem autenticação', async () => {
      const res = await request(app).get('/api/questoes');
      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('GET /api/questoes/:id', () => {
    it('deve retornar uma questão específica pelo ID', async () => {
      // Primeiro buscar todas as questões para obter um ID válido
      const questoesRes = await request(app)
        .get('/api/questoes')
        .set('Authorization', `Bearer ${authToken}`);
      
      const questaoId = questoesRes.body.data[0]._id;
      
      const res = await request(app)
        .get(`/api/questoes/${questaoId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data._id).toBe(questaoId);
      expect(res.body.data.enunciado).toBeDefined();
      expect(Array.isArray(res.body.data.alternativas)).toBe(true);
    });
    
    it('deve retornar 404 para ID inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .get(`/api/questoes/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
    });
    
    it('deve retornar 400 para ID inválido', async () => {
      const res = await request(app)
        .get('/api/questoes/id-invalido')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('POST /api/questoes', () => {
    it('deve criar uma nova questão', async () => {
      const novaQuestao = {
        numero: 10, // Número que provavelmente não está em uso
        enunciado: 'Qual é a capital de Angola?',
        alternativas: [
          {
            letra: 'A',
            texto: 'Luanda',
            correta: true
          },
          {
            letra: 'B',
            texto: 'Benguela',
            correta: false
          },
          {
            letra: 'C',
            texto: 'Huambo',
            correta: false
          },
          {
            letra: 'D',
            texto: 'Lubango',
            correta: false
          },
          {
            letra: 'E',
            texto: 'Malanje',
            correta: false
          }
        ],
        explicacao: 'Luanda é a capital de Angola desde a independência em 1975',
        avaliacao: avaliacaoId
      };
      
      const res = await request(app)
        .post('/api/questoes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(novaQuestao);
      
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.numero).toBe(novaQuestao.numero);
      expect(res.body.data.enunciado).toBe(novaQuestao.enunciado);
      
      // Verificar se foi realmente salvo no banco
      const questaoSalva = await Questao.findById(res.body.data._id);
      expect(questaoSalva).not.toBeNull();
      expect(questaoSalva!.enunciado).toBe(novaQuestao.enunciado);
      
      // Verificar se a questão foi adicionada à avaliação
      const avaliacao = await Avaliacao.findById(avaliacaoId);
      const questaoNaAvaliacao = avaliacao!.questoes.some(
        q => q.toString() === res.body.data._id
      );
      expect(questaoNaAvaliacao).toBe(true);
    });
    
    it('deve impedir a criação de questão com número duplicado na mesma avaliação', async () => {
      // Primeiro, buscar uma questão existente para obter seu número
      const questoesExistentes = await Questao.find({ avaliacao: avaliacaoId }).limit(1);
      
      if (questoesExistentes.length === 0) {
        // Se não houver questões para esta avaliação, o teste é inconclusivo
        console.log('Nenhuma questão encontrada para esta avaliação');
        return;
      }
      
      const numeroExistente = questoesExistentes[0].numero;
      
      const questaoComNumeroDuplicado = {
        numero: numeroExistente,
        enunciado: 'Esta questão tem um número duplicado',
        alternativas: [
          {
            letra: 'A',
            texto: 'Primeira alternativa',
            correta: true
          },
          {
            letra: 'B',
            texto: 'Segunda alternativa',
            correta: false
          },
          {
            letra: 'C',
            texto: 'Terceira alternativa',
            correta: false
          }
        ],
        avaliacao: avaliacaoId
      };
      
      const res = await request(app)
        .post('/api/questoes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(questaoComNumeroDuplicado);
      
      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('Já existe');
    });
    
    it('deve validar os campos obrigatórios', async () => {
      const questaoInvalida = {
        // Sem número
        enunciado: 'Questão sem número',
        avaliacao: avaliacaoId,
        alternativas: [
          {
            letra: 'A',
            texto: 'Alternativa A',
            correta: true
          },
          {
            letra: 'B',
            texto: 'Alternativa B',
            correta: false
          }
        ]
      };
      
      const res = await request(app)
        .post('/api/questoes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(questaoInvalida);
      
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
    
    it('deve validar que existe pelo menos uma alternativa correta', async () => {
      const questaoSemAlternativaCorreta = {
        numero: 99,
        enunciado: 'Esta questão não tem alternativa correta',
        alternativas: [
          {
            letra: 'A',
            texto: 'Alternativa A',
            correta: false
          },
          {
            letra: 'B',
            texto: 'Alternativa B',
            correta: false
          },
          {
            letra: 'C',
            texto: 'Alternativa C',
            correta: false
          }
        ],
        avaliacao: avaliacaoId
      };
      
      const res = await request(app)
        .post('/api/questoes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(questaoSemAlternativaCorreta);
      
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('PUT /api/questoes/:id', () => {
    it('deve atualizar uma questão existente', async () => {
      // Primeiro, criar uma questão para depois atualizar
      const novaQuestao = {
        numero: 20,
        enunciado: 'Questão para atualizar',
        alternativas: [
          {
            letra: 'A',
            texto: 'Alternativa A',
            correta: true
          },
          {
            letra: 'B',
            texto: 'Alternativa B',
            correta: false
          },
          {
            letra: 'C',
            texto: 'Alternativa C',
            correta: false
          }
        ],
        avaliacao: avaliacaoId
      };
      
      const criarRes = await request(app)
        .post('/api/questoes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(novaQuestao);
      
      const questaoId = criarRes.body.data._id;
      
      // Agora atualizar a questão
      const atualizacao = {
        enunciado: 'Questão atualizada',
        explicacao: 'Nova explicação'
      };
      
      const res = await request(app)
        .put(`/api/questoes/${questaoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(atualizacao);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.enunciado).toBe(atualizacao.enunciado);
      expect(res.body.data.explicacao).toBe(atualizacao.explicacao);
      
      // O número não deve ter mudado
      expect(res.body.data.numero).toBe(novaQuestao.numero);
      
      // Verificar no banco
      const questaoAtualizada = await Questao.findById(questaoId);
      expect(questaoAtualizada!.enunciado).toBe(atualizacao.enunciado);
    });
    
    it('deve impedir atualização para número duplicado na mesma avaliação', async () => {
      // Obter duas questões da mesma avaliação
      const questoes = await Questao.find({ avaliacao: avaliacaoId }).limit(2);
      
      if (questoes.length < 2) {
        console.log('Não há questões suficientes para este teste');
        return;
      }
      
      const [questao1, questao2] = questoes;
      
      // Tentar atualizar questao1 com o número de questao2
      const atualizacao = {
        numero: questao2.numero
      };
      
      const res = await request(app)
        .put(`/api/questoes/${questao1._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(atualizacao);
      
      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('Já existe');
    });
    
    it('deve atualizar alternativas corretamente', async () => {
      // Primeiro, criar uma questão para depois atualizar
      const novaQuestao = {
        numero: 21,
        enunciado: 'Questão para atualizar alternativas',
        alternativas: [
          {
            letra: 'A',
            texto: 'Alternativa A',
            correta: true
          },
          {
            letra: 'B',
            texto: 'Alternativa B',
            correta: false
          },
          {
            letra: 'C',
            texto: 'Alternativa C',
            correta: false
          }
        ],
        avaliacao: avaliacaoId
      };
      
      const criarRes = await request(app)
        .post('/api/questoes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(novaQuestao);
      
      const questaoId = criarRes.body.data._id;
      
      // Agora atualizar as alternativas da questão
      const atualizacao = {
        alternativas: [
          {
            letra: 'A',
            texto: 'Alternativa A atualizada',
            correta: false
          },
          {
            letra: 'B',
            texto: 'Alternativa B atualizada',
            correta: true // Mudando a correta para B
          },
          {
            letra: 'C',
            texto: 'Alternativa C atualizada',
            correta: false
          }
        ]
      };
      
      const res = await request(app)
        .put(`/api/questoes/${questaoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(atualizacao);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      
      // Verificar se alternativas foram atualizadas
      const alternativaCorreta = res.body.data.alternativas.find((a: any) => a.correta);
      expect(alternativaCorreta.letra).toBe('B');
      expect(alternativaCorreta.texto).toBe('Alternativa B atualizada');
    });
  });
  
  describe('DELETE /api/questoes/:id', () => {
    it('deve remover uma questão existente', async () => {
      // Primeiro, criar uma questão para depois remover
      const novaQuestao = {
        numero: 30,
        enunciado: 'Questão para remover',
        alternativas: [
          {
            letra: 'A',
            texto: 'Alternativa A',
            correta: true
          },
          {
            letra: 'B',
            texto: 'Alternativa B',
            correta: false
          },
          {
            letra: 'C',
            texto: 'Alternativa C',
            correta: false
          }
        ],
        avaliacao: avaliacaoId
      };
      
      const criarRes = await request(app)
        .post('/api/questoes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(novaQuestao);
      
      const questaoId = criarRes.body.data._id;
      
      // Antes de remover, verificar se a questão foi adicionada à avaliação
      const avaliacaoAntes = await Avaliacao.findById(avaliacaoId);
      const questaoNaAvaliacaoAntes = avaliacaoAntes!.questoes.some(
        q => q.toString() === questaoId
      );
      expect(questaoNaAvaliacaoAntes).toBe(true);
      
      // Agora remover a questão
      const res = await request(app)
        .delete(`/api/questoes/${questaoId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      
      // Verificar se foi realmente removido do banco
      const questaoRemovida = await Questao.findById(questaoId);
      expect(questaoRemovida).toBeNull();
      
      // Verificar se a questão foi removida da avaliação
      const avaliacaoDepois = await Avaliacao.findById(avaliacaoId);
      const questaoNaAvaliacaoDepois = avaliacaoDepois!.questoes.some(
        q => q.toString() === questaoId
      );
      expect(questaoNaAvaliacaoDepois).toBe(false);
    });
    
    it('deve retornar 404 ao tentar remover questão inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .delete(`/api/questoes/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('GET /api/questoes/search', () => {
    it('deve buscar questões por termo no enunciado', async () => {
      // Usamos um termo genérico para aumentar chances de encontrar algo
      const termoBusca = 'questão';
      
      const res = await request(app)
        .get(`/api/questoes/search?q=${termoBusca}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });
    
    it('deve retornar array vazio para termo sem correspondência', async () => {
      const res = await request(app)
        .get('/api/questoes/search?q=termomuitoespecificoqueninhumaquestaodevet3r')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toEqual([]);
    });
    
    it('deve validar o parâmetro de busca', async () => {
      const res = await request(app)
        .get('/api/questoes/search')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('POST /api/questoes/importar/:avaliacaoId', () => {
    it('deve importar questões em massa para uma avaliação', async () => {
      // Criar uma nova avaliação para o teste
      const novaDisciplina = await Disciplina.create({
        nome: 'Disciplina para Importação',
        codigo: 'IMPORT'
      });
      
      const novaAvaliacao = await Avaliacao.create({
        tipo: TipoAvaliacao.AP,
        ano: new Date().getFullYear(),
        disciplina: novaDisciplina._id,
        classe: 12,
        trimestre: Trimestre.PRIMEIRO,
        questoes: []
      });
      
      // Preparar questões para importar
      const questoesParaImportar = [
        {
          numero: 1,
          enunciado: 'Questão importada 1',
          alternativas: [
            { letra: 'A', texto: 'Alternativa A', correta: true },
            { letra: 'B', texto: 'Alternativa B', correta: false },
            { letra: 'C', texto: 'Alternativa C', correta: false }
          ]
        },
        {
          numero: 2,
          enunciado: 'Questão importada 2',
          alternativas: [
            { letra: 'A', texto: 'Alternativa A', correta: false },
            { letra: 'B', texto: 'Alternativa B', correta: true },
            { letra: 'C', texto: 'Alternativa C', correta: false }
          ],
          explicacao: 'Explicação da questão 2'
        },
        {
          numero: 3,
          enunciado: 'Questão importada 3',
          alternativas: [
            { letra: 'A', texto: 'Alternativa A', correta: false },
            { letra: 'B', texto: 'Alternativa B', correta: false },
            { letra: 'C', texto: 'Alternativa C', correta: true }
          ]
        }
      ];
      
      const res = await request(app)
        .post(`/api/questoes/importar/${novaAvaliacao._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ questoes: questoesParaImportar });
      
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(3);
      expect(res.body.meta.total).toBe(3);
      
      // Verificar se as questões foram realmente criadas
      const questoesCriadas = await Questao.find({ avaliacao: novaAvaliacao._id });
      expect(questoesCriadas.length).toBe(3);
      
      // Verificar se a avaliação foi atualizada com as novas questões
      const avaliacaoAtualizada = await Avaliacao.findById(novaAvaliacao._id);
      expect(avaliacaoAtualizada!.questoes.length).toBe(3);
    });
    
    it('deve impedir a importação de questões para avaliação inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const questoesParaImportar = [
        {
          numero: 1,
          enunciado: 'Questão teste',
          alternativas: [
            { letra: 'A', texto: 'Alternativa A', correta: true },
            { letra: 'B', texto: 'Alternativa B', correta: false }
          ]
        }
      ];
      
      const res = await request(app)
        .post(`/api/questoes/importar/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ questoes: questoesParaImportar });
      
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
    });
    
    it('deve validar as questões importadas', async () => {
      // Tentar importar questões sem alternativas corretas
      const questoesInvalidas = [
        {
          numero: 1,
          enunciado: 'Questão sem alternativa correta',
          alternativas: [
            { letra: 'A', texto: 'Alternativa A', correta: false },
            { letra: 'B', texto: 'Alternativa B', correta: false }
          ]
        }
      ];
      
      const res = await request(app)
        .post(`/api/questoes/importar/${avaliacaoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ questoes: questoesInvalidas });
      
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
    
    it('deve rejeitar questões com números já existentes', async () => {
      // Primeiro, verificar se já existem questões para esta avaliação
      const questoesExistentes = await Questao.find({ avaliacao: avaliacaoId }).sort('numero');
      
      if (questoesExistentes.length === 0) {
        console.log('Não há questões para testar duplicação');
        return;
      }
      
      // Pegar o número de uma questão existente
      const numeroExistente = questoesExistentes[0].numero;
      
      // Tentar importar uma questão com o mesmo número
      const questoesDuplicadas = [
        {
          numero: numeroExistente,
          enunciado: 'Questão com número duplicado',
          alternativas: [
            { letra: 'A', texto: 'Alternativa A', correta: true },
            { letra: 'B', texto: 'Alternativa B', correta: false }
          ]
        },
        {
          numero: 999, // Este número provavelmente não existe
          enunciado: 'Questão com número único',
          alternativas: [
            { letra: 'A', texto: 'Alternativa A', correta: true },
            { letra: 'B', texto: 'Alternativa B', correta: false }
          ]
        }
      ];
      
      const res = await request(app)
        .post(`/api/questoes/importar/${avaliacaoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ questoes: questoesDuplicadas });
      
      // A importação deve ser bem-sucedida parcialmente
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.length).toBe(1); // Apenas a questão única deve ser importada
      expect(res.body.meta.rejeitadas).toContain(numeroExistente); // O número duplicado deve estar na lista de rejeitados
    });
  });
});