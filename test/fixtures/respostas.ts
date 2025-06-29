import { Resposta } from '../../server/src/models/respostas';
import { Questao } from '../../server/src/models/questao';
import { Estudante } from '../../server/src/models/estudante';
import { Types } from 'mongoose';

// Fixture de respostas dependente de questões e estudantes
export const getRespostaFixtures = async () => {
  // Obter questões existentes
  const questoes = await Questao.find().limit(10);
  
  // Obter estudantes existentes
  const estudantes = await Estudante.find().limit(2);
  
  // Se não houver questões ou estudantes, não podemos criar respostas
  if (questoes.length < 1 || estudantes.length < 1) {
    throw new Error('Precisa criar questões e estudantes antes de criar respostas');
  }
  
  const respostas = [];
  
  // Para cada estudante, criar respostas para algumas questões
  for (const estudante of estudantes) {
    // Cada estudante responde a 5 questões no máximo
    const questoesParaResponder = questoes.slice(0, Math.min(5, questoes.length));
    
    for (const questao of questoesParaResponder) {
      // Encontrar a alternativa correta
      const alternativaCorreta = questao.alternativas.find(alt => alt.correta);
      
      // Decidir se o estudante acerta ou erra (aleatório)
      const acertou = Math.random() > 0.4; // 60% de chance de acertar
      
      // Se acertou, seleciona a alternativa correta, senão seleciona outra qualquer
      const alternativaSelecionada = acertou 
        ? alternativaCorreta?.letra 
        : questao.alternativas.find(alt => !alt.correta)?.letra || 'A';
      
      respostas.push({
        estudante: estudante._id,
        questao: questao._id,
        alternativaSelecionada,
        estaCorreta: acertou,
        tempoResposta: Math.floor(Math.random() * 60) + 10 // Entre 10 e 70 segundos
      });
    }
  }
  
  return respostas;
};

export const createRespostaFixtures = async () => {
  const fixtures = await getRespostaFixtures();
  const respostas = await Resposta.insertMany(fixtures);
  
  // Atualizar os estudantes com as respostas criadas
  for (const resposta of respostas) {
    await Estudante.findByIdAndUpdate(
      resposta.estudante,
      { $push: { respostas: resposta._id } }
    );
  }
  
  return respostas;
};