import { Schema, model, Document, Types } from "mongoose";

export interface IQuiz extends Document {
    titulo: string;
    descricao?: string;
    disciplina: Types.ObjectId;
    classe: number;
    questoes: Types.ObjectId[];
    tempoLimite?: number; // tempo em minutos
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
        disciplina: {
            type: Schema.Types.ObjectId,
            ref: "Disciplina",
            required: true
        },
        classe: {
            type: Number,
            enum: [11, 12],
            required: true
        },
        questoes: [{
            type: Schema.Types.ObjectId,
            ref: "Questao"
        }],
        tempoLimite: {
            type: Number
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