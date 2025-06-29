import { Questao } from '../../server/src/models/questao';
import { Avaliacao } from '../../server/src/models/avaliacao';
import { Types } from 'mongoose';

// Fixture de questões dependente de avaliações
export const getQuestaoFixtures = async () => {
  // Obter avaliações existentes
  const avaliacoes = await Avaliacao.find().limit(3);
  
  // Se não houver avaliações, não podemos criar questões
  if (avaliacoes.length < 1) {
    throw new Error('Precisa criar avaliações antes de criar questões');
  }
  
  const questoes = [];
  
  // Para cada avaliação, criar algumas questões
  for (const avaliacao of avaliacoes) {
    // Criar 5 questões para esta avaliação
    for (let i = 1; i <= 5; i++) {
      questoes.push({
        numero: i,
        enunciado: `Questão ${i} da ${avaliacao.tipo} de ${avaliacao.ano}`,
        alternativas: [
          {
            letra: 'A',
            texto: `Alternativa A da questão ${i}`,
            correta: i % 5 === 1 // Primeira questão, alternativa A é correta
          },
          {
            letra: 'B',
            texto: `Alternativa B da questão ${i}`,
            correta: i % 5 === 2 // Segunda questão, alternativa B é correta
          },
          {
            letra: 'C',
            texto: `Alternativa C da questão ${i}`,
            correta: i % 5 === 3 // Terceira questão, alternativa C é correta
          },
          {
            letra: 'D',
            texto: `Alternativa D da questão ${i}`,
            correta: i % 5 === 4 // Quarta questão, alternativa D é correta
          },
          {
            letra: 'E',
            texto: `Alternativa E da questão ${i}`,
            correta: i % 5 === 0 // Quinta questão, alternativa E é correta
          }
        ],
        explicacao: `Explicação da questão ${i}`,
        avaliacao: avaliacao._id
      });
    }
  }
  
  return questoes;
};

export const createQuestaoFixtures = async () => {
  const fixtures = await getQuestaoFixtures();
  const questoes = await Questao.insertMany(fixtures);
  
  // Atualizar as avaliações com as questões criadas
  for (const questao of questoes) {
    await Avaliacao.findByIdAndUpdate(
      questao.avaliacao,
      { $push: { questoes: questao._id } }
    );
  }
  
  return questoes;
};