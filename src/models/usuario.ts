import { Schema, model, Document } from "mongoose";

export interface IUsuario extends Document {
    nome: string
    email: string
    password: string
    createdAt: Date
    updatedAt: Date
}

const userSchema = new Schema<IUsuario>(
    {
        nome: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
    },
    {
        timestamps: true,
    }
)

export const Usuario = model<IUsuario>("Usuario", userSchema);
