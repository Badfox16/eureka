import { Schema, model, Document, Types } from "mongoose";

export interface IProvincia extends Document {
    _id: Types.ObjectId;
    nome: string;
    codigo?: string;
    regiao?: string;
    createdAt: Date;
    updatedAt: Date;
}

const provinciaSchema = new Schema<IProvincia>(
    {
        nome: { type: String, required: true, unique: true },
        codigo: { type: String },
        regiao: { type: String }
    },
    {
        timestamps: true
    }
);

export const Provincia = model<IProvincia>("Provincia", provinciaSchema);