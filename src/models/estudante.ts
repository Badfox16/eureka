import { Schema, model, Document, Types } from "mongoose"

export interface IEstudante extends Document {
    nome: string
    email: string
    classe: number
    escola?: string
    provincia?: string
    respostas?: Types.ObjectId[]
    createdAt: Date
    updatedAt: Date
}

const estudanteSchema = new Schema<IEstudante>(
    {
        nome: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        classe: { 
            type: Number,
            enum: [11, 12],
            required: true 
        },
        escola: { type: String },
        provincia: { type: String },
        respostas: [{
            type: Schema.Types.ObjectId,
            ref: "Resposta"
        }]
    },
    {
        timestamps: true,
    }
)

export const Estudante = model<IEstudante>("Estudante", estudanteSchema);