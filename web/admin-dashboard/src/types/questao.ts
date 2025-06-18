import { z } from 'zod';
import {
  alternativaSchema,
  createQuestaoSchema,
  updateQuestaoSchema,
  questaoSchema,
  questaoPopuladaSchema,
  questaoQueryParamsSchema
} from '@/schemas/questao.schema';

/**
 * Tipo de uma alternativa de questão
 * @property letra - Identificador da alternativa (A, B, C, D, E)
 * @property texto - Conteúdo da alternativa
 * @property correta - Indica se é a alternativa correta
 * @property imagemUrl - URL opcional para imagem da alternativa
 */
export type Alternativa = z.infer<typeof alternativaSchema>;

/**
 * Tipo para criação de novas questões
 */
export type CreateQuestaoInput = z.infer<typeof createQuestaoSchema>;

/**
 * Tipo para atualização de questões existentes
 * Todos os campos são opcionais
 */
export type UpdateQuestaoInput = z.infer<typeof updateQuestaoSchema>;

/**
 * Interface completa de uma Questão com metadados
 * Tipo derivado diretamente do schema Zod
 */
export type QuestaoModel = z.infer<typeof questaoSchema>;

/**
 * Tipo para questão com dados populados da avaliação
 */
export type QuestaoPopulada = z.infer<typeof questaoPopuladaSchema>;

/**
 * Parâmetros de consulta específicos para questões
 */
export type QuestaoQueryParams = z.infer<typeof questaoQueryParamsSchema>;

// Re-exportar os schemas para uso em validação
export {
  alternativaSchema,
  createQuestaoSchema,
  updateQuestaoSchema,
  questaoSchema,
  questaoPopuladaSchema,
  questaoQueryParamsSchema
};

// Exportando Questao como o tipo principal para uso na aplicação
// Você pode escolher qual dos tipos abaixo é o principal e renomear o outro
export type Questao = QuestaoModel;