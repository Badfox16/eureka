import { Schema, model, Document, Types } from "mongoose";

export enum TipoUsuario {
    ADMIN = "ADMIN",
    PROFESSOR = "PROFESSOR",
    NORMAL = "NORMAL"
}

export interface IUsuario extends Document {
    _id: Types.ObjectId;
    nome: string;
    email: string;
    password: string;
    tipo: TipoUsuario;
    createdAt: Date;
    updatedAt: Date;
}

const usuarioSchema = new Schema<IUsuario>(
    {
        nome: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        tipo: { 
            type: String,
            enum: Object.values(TipoUsuario),
            default: TipoUsuario.NORMAL,
            required: true 
        }
    },
    {
        timestamps: true,
    }
);

export const Usuario = model<IUsuario>("Usuario", usuarioSchema);