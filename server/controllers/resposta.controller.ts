import type { RequestHandler } from 'express';
import { Resposta } from '../models/respostas';
import { Questao } from '../models/questao';
import { Estudante } from '../models/estudante';
import type { CreateRespostaInput, CreateRespostaEmMassaInput, UpdateRespostaInput } from '../schemas/resposta.schema';
import { paginationSchema } from '../schemas/common.schema';
import { Types } from 'mongoose';

// Interface para a alternativa de uma questão
interface IAlternativa {
  letra: string;
  texto: string;
  correta: boolean;
}

/**
 * Cria uma nova resposta
 */
export const createResposta: RequestHandler = async (req, res, next) => {
  try {
    const respostaData = req.body as CreateRespostaInput;
    
    // Verificar se o estudante existe
    const estudante = await Estudante.findById(respostaData.estudante);
    if (!estudante) {
      res.status(404).json({
        status: 'error',
        message: 'Estudante não encontrado'
      });
      return;
    }
    
    // Verificar se a questão existe
    const questao = await Questao.findById(respostaData.questao);
    if (!questao) {
      res.status(404).json({
        status: 'error',
        message: 'Questão não encontrada'
      });
      return;
    }
    
    // Verificar se a alternativa selecionada existe na questão
    const alternativaExiste = questao.alternativas.some(
      (alt) => alt.letra === respostaData.alternativaSelecionada
    );
    
    if (!alternativaExiste) {
      res.status(400).json({
        status: 'error',
        message: `Alternativa ${respostaData.alternativaSelecionada} não existe nesta questão`
      });
      return;
    }
    
    // Verificar se o estudante já respondeu esta questão
    const respostaExistente = await Resposta.findOne({
      estudante: respostaData.estudante,
      questao: respostaData.questao
    });
    
    if (respostaExistente) {
      res.status(409).json({
        status: 'error',
        message: 'Este estudante já respondeu esta questão',
        data: respostaExistente
      });
      return;
    }
    
    // Determinar se a resposta está correta
    const alternativaCorreta = questao.alternativas.find(
      (alt) => alt.correta
    );
    respostaData.estaCorreta = respostaData.alternativaSelecionada === alternativaCorreta?.letra;
    
    // Criar a resposta
    const resposta = await Resposta.create(respostaData);
    
    // Adicionar a resposta ao estudante
    await Estudante.findByIdAndUpdate(
      respostaData.estudante,
      { $push: { respostas: resposta._id } }
    );
    
    res.status(201).json({
      status: 'success',
      data: resposta
    });
  } catch (error) {
    console.error('Erro ao criar resposta:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao criar resposta'
    });
  }
};

/**
 * Cria múltiplas respostas para um quiz
 */
export const createRespostasEmMassa: RequestHandler = async (req, res, next) => {
  try {
    const { estudante, respostas } = req.body as CreateRespostaEmMassaInput;
    
    // Verificar se o estudante existe
    const estudanteDoc = await Estudante.findById(estudante);
    if (!estudanteDoc) {
      res.status(404).json({
        status: 'error',
        message: 'Estudante não encontrado'
      });
      return;
    }
    
    // Obter todas as questões referenciadas para verificação e avaliação
    const questoesIds = respostas.map(r => r.questao);
    const questoes = await Questao.find({ _id: { $in: questoesIds } }).lean();
    
    // Verificar se todas as questões foram encontradas
    if (questoes.length !== questoesIds.length) {
      res.status(404).json({
        status: 'error',
        message: 'Uma ou mais questões não foram encontradas'
      });
      return;
    }
    
    // Criar um mapa para acesso rápido às questões
    const questaoMap = new Map<string, any>();
    questoes.forEach(questao => {
      // Usar toString() para garantir que estamos trabalhando com strings
      const idString = typeof questao._id === 'object' ? questao._id.toString() : questao._id;
      questaoMap.set(idString, questao);
    });
    
    // Verificar se o estudante já respondeu alguma das questões
    const respostasExistentes = await Resposta.find({
      estudante,
      questao: { $in: questoesIds }
    });
    
    if (respostasExistentes.length > 0) {
      const questoesJaRespondidas = respostasExistentes.map(r => 
        r.questao.toString()
      );
      
      res.status(409).json({
        status: 'error',
        message: 'O estudante já respondeu algumas das questões',
        questoesJaRespondidas
      });
      return;
    }
    
    // Preparar os documentos para inserção
    const respostasParaInserir = respostas.map(r => {
      const questaoId = r.questao.toString();
      const questao = questaoMap.get(questaoId);
      
      if (!questao) {
        throw new Error(`Questão não encontrada no mapa: ${questaoId}`);
      }
      
      const alternativaCorreta = questao.alternativas.find(
        (alt: any) => alt.correta
      );
      
      const estaCorreta = r.alternativaSelecionada === alternativaCorreta?.letra;
      
      return {
        estudante,
        questao: new Types.ObjectId(r.questao),
        alternativaSelecionada: r.alternativaSelecionada,
        estaCorreta,
        tempoResposta: r.tempoResposta
      };
    });
    
    // Criar as respostas
    const respostasInseridas = await Resposta.insertMany(respostasParaInserir);
    
    // Adicionar as respostas ao estudante
    const respostasIds = respostasInseridas.map(r => r._id);
    await Estudante.findByIdAndUpdate(
      estudante,
      { $push: { respostas: { $each: respostasIds } } }
    );
    
    // Calcular estatísticas
    const total = respostasInseridas.length;
    const corretas = respostasInseridas.filter(r => r.estaCorreta).length;
    const percentualAcerto = total > 0 ? (corretas / total) * 100 : 0;
    
    res.status(201).json({
      status: 'success',
      data: respostasInseridas,
      meta: {
        total,
        corretas,
        percentualAcerto: Math.round(percentualAcerto * 100) / 100
      }
    });
  } catch (error) {
    console.error('Erro ao criar respostas em massa:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao criar respostas em massa'
    });
  }
};

/**
 * Obtém todas as respostas com opção de paginação e filtros
 */
export const getAllRespostas: RequestHandler = async (req, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse({
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 10)
    });
    
    // Filtros opcionais
    const filtro: any = {};
    
    // Filtrar por estudante
    if (req.query.estudante && typeof req.query.estudante === 'string') {
      filtro.estudante = req.query.estudante;
    }
    
    // Filtrar por questão
    if (req.query.questao && typeof req.query.questao === 'string') {
      filtro.questao = req.query.questao;
    }
    
    // Filtrar por status (correta/incorreta)
    if (req.query.correta !== undefined) {
      filtro.estaCorreta = req.query.correta === 'true';
    }
    
    // Consulta para obter o total de respostas com filtros
    const total = await Resposta.countDocuments(filtro);
    
    // Consulta paginada com filtros
    const respostas = await Resposta.find(filtro)
      .populate('estudante', 'nome email classe')
      .populate({
        path: 'questao',
        populate: {
          path: 'avaliacao',
          populate: 'disciplina'
        }
      })
      .sort({ createdAt: -1 }) // Ordenar por data de criação (mais recentes primeiro)
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.status(200).json({
      status: 'success',
      data: respostas,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar respostas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar respostas'
    });
  }
};

/**
 * Obtém uma resposta pelo ID
 */
export const getRespostaById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const resposta = await Resposta.findById(id)
      .populate('estudante', 'nome email classe')
      .populate({
        path: 'questao',
        populate: {
          path: 'avaliacao',
          populate: 'disciplina'
        }
      });
    
    if (!resposta) {
      res.status(404).json({
        status: 'error',
        message: 'Resposta não encontrada'
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: resposta
    });
  } catch (error) {
    console.error('Erro ao buscar resposta:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar resposta'
    });
  }
};

/**
 * Atualiza uma resposta pelo ID 
 * (normalmente não permitiríamos isso em um sistema real,
 * mas pode ser útil para fins administrativos)
 */
export const updateResposta: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateRespostaInput;
    
    // Verificar se a resposta existe
    const resposta = await Resposta.findById(id);
    if (!resposta) {
      res.status(404).json({
        status: 'error',
        message: 'Resposta não encontrada'
      });
      return;
    }
    
    // Se estiver alterando a alternativa selecionada, verificar a correção
    if (updateData.alternativaSelecionada && 
        updateData.alternativaSelecionada !== resposta.alternativaSelecionada) {
      
      const questao = await Questao.findById(resposta.questao);
      if (!questao) {
        res.status(404).json({
          status: 'error',
          message: 'Questão associada não encontrada'
        });
        return;
      }
      
      const alternativaExiste = questao.alternativas.some(
        alt => alt.letra === updateData.alternativaSelecionada
      );
      
      if (!alternativaExiste) {
        res.status(400).json({
          status: 'error',
          message: `Alternativa ${updateData.alternativaSelecionada} não existe nesta questão`
        });
        return;
      }
      
      // Atualizar a correção
      const alternativaCorreta = questao.alternativas.find(alt => alt.correta);
      updateData.estaCorreta = updateData.alternativaSelecionada === alternativaCorreta?.letra;
    }
    
    // Atualizar a resposta
    const respostaAtualizada = await Resposta.findByIdAndUpdate(id, updateData, { new: true });
    
    res.status(200).json({
      status: 'success',
      data: respostaAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar resposta:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar resposta'
    });
  }
};

/**
 * Remove uma resposta pelo ID
 */
export const deleteResposta: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Verificar se a resposta existe
      const resposta = await Resposta.findById(id);
      if (!resposta) {
        res.status(404).json({
          status: 'error',
          message: 'Resposta não encontrada'
        });
        return;
      }
      
      // Remover a referência da resposta do estudante
      await Estudante.findByIdAndUpdate(
        resposta.estudante,
        { $pull: { respostas: id } }
      );
      
      // Remover a resposta
      await Resposta.findByIdAndDelete(id);
      
      // Para o status 204, não devemos incluir corpo na resposta
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao remover resposta:', error);
      res.status(500).json({
        status: 'error',
        message: 'Erro ao remover resposta'
      });
    }
  };


/**
 * Obtém estatísticas de respostas
 */
export const getEstatisticasRespostas: RequestHandler = async (req, res, next) => {
    try {
      // Estatísticas gerais
      const totalRespostas = await Resposta.countDocuments();
      const totalCorretas = await Resposta.countDocuments({ estaCorreta: true });
      const percentualAcerto = totalRespostas > 0 ? (totalCorretas / totalRespostas) * 100 : 0;
      
      // Estatísticas por disciplina
      const estatisticasPorDisciplina = await Resposta.aggregate([
        {
          $lookup: {
            from: 'questoes',
            localField: 'questao',
            foreignField: '_id',
            as: 'questaoInfo'
          }
        },
        {
          $unwind: '$questaoInfo'
        },
        {
          $lookup: {
            from: 'avaliacoes',
            localField: 'questaoInfo.avaliacao',
            foreignField: '_id',
            as: 'avaliacaoInfo'
          }
        },
        {
          $unwind: '$avaliacaoInfo'
        },
        {
          $lookup: {
            from: 'disciplinas',
            localField: 'avaliacaoInfo.disciplina',
            foreignField: '_id',
            as: 'disciplinaInfo'
          }
        },
        {
          $unwind: '$disciplinaInfo'
        },
        {
          $group: {
            _id: '$disciplinaInfo._id',
            disciplinaNome: { $first: '$disciplinaInfo.nome' },
            disciplinaCodigo: { $first: '$disciplinaInfo.codigo' },
            total: { $sum: 1 },
            corretas: {
              $sum: { $cond: { if: '$estaCorreta', then: 1, else: 0 } }
            }
          }
        },
        {
          $project: {
            disciplinaNome: 1,
            disciplinaCodigo: 1,
            total: 1,
            corretas: 1,
            percentualAcerto: {
              $multiply: [{ $divide: ['$corretas', '$total'] }, 100]
            }
          }
        },
        {
          $sort: { disciplinaNome: 1 }
        }
      ]);
      
      res.status(200).json({
        status: 'success',
        data: {
          geral: {
            totalRespostas,
            totalCorretas,
            percentualAcerto: Math.round(percentualAcerto * 100) / 100
          },
          porDisciplina: estatisticasPorDisciplina.map(e => ({
            ...e,
            percentualAcerto: Math.round(e.percentualAcerto * 100) / 100
          }))
        }
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de respostas:', error);
      res.status(500).json({
        status: 'error',
        message: 'Erro ao obter estatísticas de respostas'
      });
    }
  };