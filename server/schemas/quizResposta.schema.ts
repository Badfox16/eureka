import { z } from 'zod';

// Esquema para iniciar um quiz
export const iniciarQuizSchema = z.object({
    estudanteId: z.string({
      required_error: "ID do estudante é obrigatório",
    }).min(1, "ID do estudante não pode ser vazio"),
    quizId: z.string({
      required_error: "ID do quiz é obrigatório",
    }).min(1, "ID do quiz não pode ser vazio"),
});

// Esquema para registrar uma resposta
export const registrarRespostaSchema = z.object({
    estudanteQuizId: z.string({
      required_error: "ID da tentativa de quiz é obrigatório",
    }).min(1, "ID da tentativa não pode ser vazio"),
    questaoId: z.string({
      required_error: "ID da questão é obrigatório",
    }).min(1, "ID da questão não pode ser vazio"),
    respostaEscolhida: z.string({
      required_error: "Resposta escolhida é obrigatória",
    }).min(1, "Resposta escolhida não pode ser vazia"),
    tempoResposta: z.number({
      required_error: "Tempo de resposta é obrigatório",
    }).min(0, "Tempo não pode ser negativo").optional(),
});

export type IniciarQuizInput = z.TypeOf<typeof iniciarQuizSchema>;
export type RegistrarRespostaInput = z.TypeOf<typeof registrarRespostaSchema>;