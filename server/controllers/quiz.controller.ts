import type { RequestHandler } from 'express';
import { Quiz } from '../models/quiz';
import { Avaliacao } from '../models/avaliacao';
import type { CreateQuizInput, UpdateQuizInput } from '../schemas/quiz.schema';
import { paginationSchema } from '../schemas/common.schema';

/**
 * Cria um novo quiz baseado numa avaliação
 */
export const createQuiz: RequestHandler = async (req, res, next) => {
  try {
    const quizData = req.body as CreateQuizInput;
    
    // Verificar se a avaliação existe
    const avaliacao = await Avaliacao.findById(quizData.avaliacao);
    if (!avaliacao) {
      res.status(404).json({
        status: 'error',
        message: 'Avaliação não encontrada'
      });
      return;
    }
    
    // Configurar título automático se não for fornecido
    if (!quizData.titulo) {
      try {
        // Obter a disciplina relacionada à avaliação
        const avaliacaoPopulada = await Avaliacao.findById(quizData.avaliacao)
          .populate('disciplina')
          .lean(); // Para garantir que podemos tratar como objeto JS normal
      
        // Verificar se conseguimos popular corretamente
        if (!avaliacaoPopulada) {
          throw new Error('Falha ao obter detalhes da avaliação');
        }
        
        // Formatar o nome com base no tipo de avaliação
        const tipoTexto = avaliacao.tipo === 'AP' ? 'Avaliação Provincial' : 'Exame Nacional';
        
        // Tratar caso trimestre ou época seja undefined
        const trimestreOuEpoca = avaliacao.tipo === 'AP' 
          ? `${avaliacao.trimestre || '?'} Trimestre` 
          : `${avaliacao.epoca || '?'} Época`;
        
        // Verificar se a disciplina existe e tem um nome
        const disciplina = avaliacaoPopulada.disciplina as any;
        const disciplinaNome = disciplina && disciplina.nome 
          ? disciplina.nome 
          : 'Disciplina Desconhecida';
        
        quizData.titulo = `${tipoTexto} de ${disciplinaNome} - ${avaliacao.classe}ª Classe - ${trimestreOuEpoca} (${avaliacao.ano})`;
      } catch (error) {
        console.error('Erro ao gerar título automático:', error);
        // Definir um título padrão genérico em caso de erro
        quizData.titulo = `Quiz de ${avaliacao.tipo} - ${avaliacao.classe}ª Classe (${avaliacao.ano})`;
      }
    }
    
    const quiz = await Quiz.create(quizData);
    
    res.status(201).json({
      status: 'success',
      data: quiz
    });
  } catch (error) {
    console.error('Erro ao criar quiz:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao criar quiz'
    });
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
    
    // Filtro opcional para status ativo
    const filtro: any = {};
    if (req.query.ativo !== undefined) {
      filtro.ativo = req.query.ativo === 'true';
    }
    
    // Consulta para obter o total de quizzes
    const total = await Quiz.countDocuments(filtro);
    
    // Consulta paginada
    const quizzes = await Quiz.find(filtro)
      .populate({
        path: 'avaliacao', 
        populate: { path: 'disciplina' }
      })
      .sort({ createdAt: -1 }) // Ordenar por data de criação (mais recentes primeiro)
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.status(200).json({
      status: 'success',
      data: quizzes,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar quizzes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar quizzes'
    });
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
      res.status(404).json({
        status: 'error',
        message: 'Quiz não encontrado'
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: quiz
    });
  } catch (error) {
    console.error('Erro ao buscar quiz:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar quiz'
    });
  }
};

/**
 * Atualiza um quiz pelo ID
 */
export const updateQuiz: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateQuizInput;
    
    // Verificar se o quiz existe
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      res.status(404).json({
        status: 'error',
        message: 'Quiz não encontrado'
      });
      return;
    }
    
    // Se estiver atualizando a avaliação, verificar se ela existe
    if (updateData.avaliacao) {
      const avaliacao = await Avaliacao.findById(updateData.avaliacao);
      if (!avaliacao) {
        res.status(404).json({
          status: 'error',
          message: 'Avaliação não encontrada'
        });
        return;
      }
    }
    
    // Atualizar o quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: updatedQuiz
    });
  } catch (error) {
    console.error('Erro ao atualizar quiz:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar quiz'
    });
  }
};

/**
 * Remove um quiz pelo ID
 */
export const deleteQuiz: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se o quiz existe
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      res.status(404).json({
        status: 'error',
        message: 'Quiz não encontrado'
      });
      return;
    }
    
    // Remover o quiz
    await Quiz.findByIdAndDelete(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Quiz removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover quiz:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao remover quiz'
    });
  }
};

/**
 * Ativa ou desativa um quiz
 */
export const toggleQuizStatus: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se o quiz existe
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      res.status(404).json({
        status: 'error',
        message: 'Quiz não encontrado'
      });
      return;
    }
    
    // Inverter o status ativo
    quiz.ativo = !quiz.ativo;
    await quiz.save();
    
    res.status(200).json({
      status: 'success',
      message: `Quiz ${quiz.ativo ? 'ativado' : 'desativado'} com sucesso`,
      data: { ativo: quiz.ativo }
    });
  } catch (error) {
    console.error('Erro ao alterar status do quiz:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao alterar status do quiz'
    });
  }
};