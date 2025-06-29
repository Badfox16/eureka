import { Avaliacao, TipoAvaliacao, Trimestre, Epoca } from '../../server/src/models/avaliacao';
import { Disciplina } from '../../server/src/models/disciplina';
import { Types } from 'mongoose';

// Fixture de avaliações dependente de disciplinas
export const getAvaliacaoFixtures = async () => {
  // Obter disciplinas existentes
  const disciplinas = await Disciplina.find().limit(3);
  
  // Se não houver disciplinas suficientes, não podemos criar avaliações
  if (disciplinas.length < 1) {
    throw new Error('Precisa criar disciplinas antes de criar avaliações');
  }
  
  // Ano atual para os testes
  const anoAtual = new Date().getFullYear();
  
  return [
    // AP - Avaliação Provincial
    {
      tipo: TipoAvaliacao.AP,
      ano: anoAtual,
      disciplina: disciplinas[0]._id,
      classe: 11,
      trimestre: Trimestre.PRIMEIRO,
      questoes: [] as Types.ObjectId[]
    },
    {
      tipo: TipoAvaliacao.AP,
      ano: anoAtual,
      disciplina: disciplinas[0]._id,
      classe: 12,
      trimestre: Trimestre.SEGUNDO,
      questoes: [] as Types.ObjectId[]
    },
    // EXAME - Exame Nacional
    {
      tipo: TipoAvaliacao.EXAME,
      ano: anoAtual - 1,
      disciplina: disciplinas.length > 1 ? disciplinas[1]._id : disciplinas[0]._id,
      classe: 12,
      epoca: Epoca.PRIMEIRA,
      questoes: [] as Types.ObjectId[]
    }
  ];
};

export const createAvaliacaoFixtures = async () => {
  const fixtures = await getAvaliacaoFixtures();
  return await Avaliacao.insertMany(fixtures);
};