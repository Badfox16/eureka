import { Disciplina } from '../../server/models/disciplina';

export const disciplinaFixtures = [
  {
    nome: 'Matemática',
    codigo: 'MAT',
    descricao: 'Disciplina de matemática'
  },
  {
    nome: 'Física',
    codigo: 'FIS',
    descricao: 'Disciplina de física'
  },
  {
    nome: 'Química',
    codigo: 'QUI',
    descricao: 'Disciplina de química'
  }
];

export const createDisciplinaFixtures = async () => {
  return await Disciplina.insertMany(disciplinaFixtures);
};