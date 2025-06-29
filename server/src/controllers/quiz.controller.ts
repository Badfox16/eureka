import type { RequestHandler } from 'express';
import { Quiz } from '../models/quiz';
import { Avaliacao } from '../models/avaliacao';
import type { CreateQuizInput, UpdateQuizInput } from '../schemas/quiz.schema';
import { paginationSchema } from '../schemas/common.schema';
import { formatResponse } from '../utils/response.utils';

/**
 * Cria um novo quiz baseado numa avaliação
 */
export const createQuiz: RequestHandler = async (req, res, next) => {
  try {
    const quizData = req.body as CreateQuizInput;
    
    // Verificar se a avaliação existe
    const avaliacao = await Avaliacao.findById(quizData.avaliacao);
    if (!avaliacao) {
      res.status(404).json(formatResponse(null, undefined, 'Avaliação não encontrada'));
      return;
    }
    
    // Configurar título automático se não for fornecido
    if (!quizData.titulo) {
      try {
        // Obter a disciplina relacionada à avaliação
        const avaliacaoPopulada = await Avaliacao.findById(quizData.avaliacao)
          .populate('disciplina')
          .lean();
      
        if (!avaliacaoPopulada) {
          throw new Error('Falha ao obter detalhes da avaliação');
        }
        
        const tipoTexto = avaliacao.tipo === 'AP' ? 'Avaliação Provincial' : 'Exame Nacional';
        const trimestreOuEpoca = avaliacao.tipo === 'AP' 
          ? `${avaliacao.trimestre || '?'} Trimestre` 
          : `${avaliacao.epoca || '?'} Época`;
        const disciplina = avaliacaoPopulada.disciplina as any;
        const disciplinaNome = disciplina && disciplina.nome 
          ? disciplina.nome 
          : 'Disciplina Desconhecida';
        
        quizData.titulo = `${tipoTexto} de ${disciplinaNome} - ${avaliacao.classe}ª Classe - ${trimestreOuEpoca} (${avaliacao.ano})`;
      } catch (error) {
        console.error('Erro ao gerar título automático:', error);
        quizData.titulo = `Quiz de ${avaliacao.tipo} - ${avaliacao.classe}ª Classe (${avaliacao.ano})`;
      }
    }
    
    const quiz = await Quiz.create(quizData);
    res.status(201).json(formatResponse(quiz));
  } catch (error) {
    console.error('Erro ao criar quiz:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao criar quiz'));
  }
};

/**
 * Obtém todos os quizzes com opção de paginação
 */
export const getAllQuizzes: RequestHandler = async (req, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse({
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 10)
    });
    
    const filtro: any = {};
    if (req.query.ativo !== undefined) {
      filtro.ativo = req.query.ativo === 'true';
    }
    
    const total = await Quiz.countDocuments(filtro);
    const quizzes = await Quiz.find(filtro)
      .populate({
        path: 'avaliacao', 
        populate: { path: 'disciplina' }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.status(200).json(formatResponse(
      quizzes,
      { page, limit, total }
    ));
  } catch (error) {
    console.error('Erro ao buscar quizzes:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao buscar quizzes'));
  }
};

/**
 * Obtém um quiz pelo ID, incluindo avaliação e questões
 */
export const getQuizById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id)
      .populate({
        path: 'avaliacao',
        populate: [
          { path: 'disciplina' },
          { path: 'questoes' }
        ]
      });
    if (!quiz) {
      res.status(404).json(formatResponse(null, undefined, 'Quiz não encontrado'));
      return;
    }
    res.status(200).json(formatResponse(quiz));
  } catch (error) {
    console.error('Erro ao buscar quiz:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao buscar quiz'));
  }
};

/**
 * Atualiza um quiz pelo ID
 */
export const updateQuiz: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateQuizInput;
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      res.status(404).json(formatResponse(null, undefined, 'Quiz não encontrado'));
      return;
    }
    if (updateData.avaliacao) {
      const avaliacao = await Avaliacao.findById(updateData.avaliacao);
      if (!avaliacao) {
        res.status(404).json(formatResponse(null, undefined, 'Avaliação não encontrada'));
        return;
      }
    }
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    res.status(200).json(formatResponse(updatedQuiz));
  } catch (error) {
    console.error('Erro ao atualizar quiz:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao atualizar quiz'));
  }
};

/**
 * Remove um quiz pelo ID
 */
export const deleteQuiz: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      res.status(404).json(formatResponse(null, undefined, 'Quiz não encontrado'));
      return;
    }
    await Quiz.findByIdAndDelete(id);
    res.status(200).json(formatResponse(null, undefined, 'Quiz removido com sucesso'));
  } catch (error) {
    console.error('Erro ao remover quiz:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao remover quiz'));
  }
};

/**
 * Ativa ou desativa um quiz
 */
export const toggleQuizStatus: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      res.status(404).json(formatResponse(null, undefined, 'Quiz não encontrado'));
      return;
    }
    quiz.ativo = !quiz.ativo;
    await quiz.save();
    res.status(200).json(formatResponse(
      { ativo: quiz.ativo },
      undefined,
      `Quiz ${quiz.ativo ? 'ativado' : 'desativado'} com sucesso`
    ));
  } catch (error) {
    console.error('Erro ao alterar status do quiz:', error);
    res.status(500).json(formatResponse(null, undefined, 'Erro ao alterar status do quiz'));
  }
};