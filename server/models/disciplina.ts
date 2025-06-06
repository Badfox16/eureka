import { Schema, model, Document, Types } from "mongoose";

export interface IDisciplina extends Document {
    _id: Types.ObjectId;
    nome: string;
    codigo: string;
    descricao?: string;
    createdAt: Date;
    updatedAt: Date;
}

const disciplinaSchema = new Schema<IDisciplina>(
    {
        nome: { type: String, required: true },
        codigo: { type: String, required: true, unique: true },
        descricao: { type: String }
    },
    {
        timestamps: true,
    }
);

export const Disciplina = model<IDisciplina>("Disciplina", disciplinaSchema);