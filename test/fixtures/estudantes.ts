import { Estudante } from '../../server/src/models/estudante';

export const estudanteFixtures = [
  {
    nome: 'João Silva',
    email: 'joao@exemplo.com',
    classe: 11,
    escola: 'Escola Secundária 1',
    provincia: 'Luanda'
  },
  {
    nome: 'Maria Santos',
    email: 'maria@exemplo.com',
    classe: 12,
    escola: 'Liceu Nacional',
    provincia: 'Benguela'
  }
];

export const createEstudanteFixtures = async () => {
  return await Estudante.insertMany(estudanteFixtures);
};