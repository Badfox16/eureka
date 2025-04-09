import { Schema, model, Document, Types } from "mongoose";

export interface IResposta extends Document {
    estudante: Types.ObjectId;
    questao: Types.ObjectId;
    alternativaSelecionada: string;
    estaCorreta: boolean;
    tempoResposta?: number; // tempo em segundos para responder
    createdAt: Date;
    updatedAt: Date;
}

const respostaSchema = new Schema<IResposta>(
    {
        estudante: {
            type: Schema.Types.ObjectId,
            ref: "Estudante",
            required: true
        },
        questao: {
            type: Schema.Types.ObjectId,
            ref: "Questao",
            required: true
        },
        alternativaSelecionada: {
            type: String,
            required: true
        },
        estaCorreta: {
            type: Boolean,
            required: true
        },
        tempoResposta: {
            type: Number
        }
    },
    {
        timestamps: true
    }
);

// Garantir que um estudante não responda à mesma questão múltiplas vezes
// (ou permitir isso para histórico, mas usar timestamp para identificar a última resposta)
respostaSchema.index({ estudante: 1, questao: 1 });

export const Resposta = model<IResposta>("Resposta", respostaSchema);