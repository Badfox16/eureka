import { Schema, model, Document, Types } from "mongoose";

export interface IQuestao extends Document {
    numero: number;
    enunciado: string;
    alternativas: {
        letra: string;
        texto: string;
        correta: boolean;
    }[];
    explicacao?: string;
    avaliacao: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const questaoSchema = new Schema<IQuestao>(
    {
        numero: { 
            type: Number, 
            required: true 
        },
        enunciado: { 
            type: String, 
            required: true 
        },
        alternativas: [
            {
                letra: { type: String, required: true },
                texto: { type: String, required: true },
                correta: { type: Boolean, required: true, default: false }
            }
        ],
        explicacao: { 
            type: String 
        },
        avaliacao: {
            type: Schema.Types.ObjectId,
            ref: "Avaliacao",
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Garantir que não existam questões duplicadas na mesma avaliação
questaoSchema.index({ numero: 1, avaliacao: 1 }, { unique: true });

export const Questao = model<IQuestao>("Questao", questaoSchema);