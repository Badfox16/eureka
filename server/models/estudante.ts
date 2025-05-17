import { Schema, model, Document, Types } from "mongoose"

export interface IEstudante extends Document {
    _id: Types.ObjectId;
    nome: string
    email: string
    classe: number
    escola?: string
    provincia?: string
    usuario: Types.ObjectId; // Referência ao usuário associado
    ativo: boolean;
    createdAt: Date
    updatedAt: Date
}

const estudanteSchema = new Schema<IEstudante>(
    {
        nome: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        classe: {
            type: Number,
            enum: [10, 11, 12], 
            required: true
        },
        escola: { type: String },
        provincia: { type: String },
        usuario: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        },
        ativo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
    }
)

export const Estudante = model<IEstudante>("Estudante", estudanteSchema);