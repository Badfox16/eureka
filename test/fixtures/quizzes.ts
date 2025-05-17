import { Quiz } from '../../server/models/quiz';
import { Avaliacao } from '../../server/models/avaliacao';

// Fixture de quizzes dependente de avaliações
export const getQuizFixtures = async () => {
  // Obter avaliações existentes
  const avaliacoes = await Avaliacao.find().limit(3).populate('disciplina');
  
  // Se não houver avaliações, não podemos criar quizzes
  if (avaliacoes.length < 1) {
    throw new Error('Precisa criar avaliações antes de criar quizzes');
  }
  
  return avaliacoes.map((avaliacao, index) => {
    // Formatar o nome com base no tipo de avaliação
    const tipoTexto = avaliacao.tipo === 'AP' ? 'Avaliação Provincial' : 'Exame Nacional';
    
    // Tratar caso disciplina, trimestre ou época sejam undefined
    const disciplinaNome = (avaliacao.disciplina as any)?.nome || 'Disciplina Desconhecida';
    const trimestreOuEpoca = avaliacao.tipo === 'AP' 
      ? `${avaliacao.trimestre || '?'} Trimestre` 
      : `${avaliacao.epoca || '?'} Época`;
    
    return {
      titulo: `Quiz ${index + 1}: ${tipoTexto} de ${disciplinaNome} - ${avaliacao.classe}ª Classe - ${trimestreOuEpoca} (${avaliacao.ano})`,
      descricao: `Quiz de preparação baseado na ${avaliacao.tipo} de ${avaliacao.ano}`,
      avaliacao: avaliacao._id,
      tempoLimite: 30, // 30 minutos
      ativo: index !== 2 // O último quiz está inativo
    };
  });
};

export const createQuizFixtures = async () => {
  const fixtures = await getQuizFixtures();
  return await Quiz.insertMany(fixtures);
};