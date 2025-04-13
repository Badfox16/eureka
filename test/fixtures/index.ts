import { createDisciplinaFixtures } from './disciplinas';
import { createEstudanteFixtures } from './estudantes';
import { createUsuarioFixtures } from './usuarios';
import { createAvaliacaoFixtures } from './avaliacoes';
import { createQuestaoFixtures } from './questoes';
import { createRespostaFixtures } from './respostas';
import { createQuizFixtures } from './quizzes';

export const createAllFixtures = async () => {
  console.log('Criando fixtures para disciplinas...');
  const disciplinas = await createDisciplinaFixtures();
  
  console.log('Criando fixtures para estudantes...');
  const estudantes = await createEstudanteFixtures();
  
  console.log('Criando fixtures para usuários...');
  const usuarios = await createUsuarioFixtures();
  
  console.log('Criando fixtures para avaliações...');
  const avaliacoes = await createAvaliacaoFixtures();
  
  console.log('Criando fixtures para questões...');
  const questoes = await createQuestaoFixtures();
  
  console.log('Criando fixtures para respostas...');
  const respostas = await createRespostaFixtures();
  
  console.log('Criando fixtures para quizzes...');
  const quizzes = await createQuizFixtures();
  
  return {
    disciplinas,
    estudantes,
    usuarios,
    avaliacoes,
    questoes,
    respostas,
    quizzes
  };
};

export * from './disciplinas';
export * from './estudantes';
export * from './usuarios';
export * from './avaliacoes';
export * from './questoes';
export * from './respostas';
export * from './quizzes';