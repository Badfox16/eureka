import { Schema, model, Document, Types } from "mongoose";

export interface IQuizResposta extends Document {
    _id: Types.ObjectId;
    estudanteQuiz: Types.ObjectId; // Referência para a tentativa do estudante
    questao: Types.ObjectId; // Referência para a questão respondida
    respostaEscolhida: string; // A alternativa que o estudante escolheu
    estaCorreta: boolean; // Se a resposta está correta
    tempoResposta?: number; // Tempo em segundos que levou para responder
    pontuacaoObtida: number; // Pontuação obtida nesta resposta específica
    createdAt: Date;
    updatedAt: Date;
}

const quizRespostaSchema = new Schema<IQuizResposta>(
    {
        estudanteQuiz: {
            type: Schema.Types.ObjectId,
            ref: "EstudanteQuiz",
            required: true
        },
        questao: {
            type: Schema.Types.ObjectId,
            ref: "Questao",
            required: true
        },
        respostaEscolhida: {
            type: String,
            required: true
        },
        estaCorreta: {
            type: Boolean,
            required: true
        },
        tempoResposta: {
            type: Number,
            min: 0
        },
        pontuacaoObtida: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Índice composto para garantir eficiência nas consultas
quizRespostaSchema.index({ estudanteQuiz: 1, questao: 1 }, { unique: true });

export const QuizResposta = model<IQuizResposta>("QuizResposta", quizRespostaSchema);