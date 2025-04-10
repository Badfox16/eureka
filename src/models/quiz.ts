import { Schema, model, Document, Types } from "mongoose";

export interface IQuiz extends Document {
    titulo: string;
    descricao?: string;
    avaliacao: Types.ObjectId; // Referência para uma avaliação
    tempoLimite?: number; // tempo em minutos para completar o quiz
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>(
    {
        titulo: { 
            type: String, 
            required: true 
        },
        descricao: { 
            type: String 
        },
        avaliacao: { 
            type: Schema.Types.ObjectId,
            ref: "Avaliacao",
            required: true
        },
        tempoLimite: { 
            type: Number,
            min: 1
        },
        ativo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export const Quiz = model<IQuiz>("Quiz", quizSchema);