import { Schema, model, Document, Types } from "mongoose";

export interface IEstudanteQuiz extends Document {
    _id: Types.ObjectId;
    estudante: Types.ObjectId;
    quiz: Types.ObjectId;
    dataInicio: Date;
    dataFim?: Date;
    pontuacaoObtida?: number;
    totalPontos?: number;
    respostasCorretas: number;
    totalQuestoes: number;
    percentualAcerto: number;
    createdAt: Date;
    updatedAt: Date;
}

const estudanteQuizSchema = new Schema<IEstudanteQuiz>(
    {
        estudante: {
            type: Schema.Types.ObjectId,
            ref: "Estudante",
            required: true
        },
        quiz: {
            type: Schema.Types.ObjectId,
            ref: "Quiz",
            required: true
        },
        dataInicio: {
            type: Date,
            required: true,
            default: Date.now
        },
        dataFim: {
            type: Date
        },
        pontuacaoObtida: {
            type: Number,
            min: 0
        },
        totalPontos: {
            type: Number,
            min: 0
        },
        respostasCorretas: {
            type: Number,
            default: 0
        },
        totalQuestoes: {
            type: Number,
            default: 0
        },
        percentualAcerto: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    {
        timestamps: true
    }
);

export const EstudanteQuiz = model<IEstudanteQuiz>("EstudanteQuiz", estudanteQuizSchema);