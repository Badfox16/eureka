import { EstudanteQuiz } from "./estudanteQuiz";
import { QuizResposta } from "./quizResposta";

// Reexportando os tipos principais
export type { EstudanteQuiz } from "./estudanteQuiz";
export type { QuizResposta } from "./quizResposta";

// Mantendo compatibilidade com o código existente
// até que seja totalmente refatorado
export type QuizAttempt = EstudanteQuiz;
export type QuizAnswer = QuizResposta;
