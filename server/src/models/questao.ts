import { Schema, model, Document, Types } from "mongoose";

export interface IQuestao extends Document {
    _id: Types.ObjectId;
    numero: number;
    enunciado: string;
    imagemEnunciadoUrl?: string; 
    alternativas: {
        letra: string;
        texto: string;
        correta: boolean;
        imagemUrl?: string;  
    }[];
    explicacao?: string;
    avaliacao: Types.ObjectId;
    valor?: number; 
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
        // Adicionar campo para a imagem do enunciado
        imagemEnunciadoUrl: { 
            type: String,
        },
        alternativas: [
            {
                letra: { type: String, required: true },
                texto: { type: String, required: true },
                correta: { type: Boolean, required: true, default: false },
                // Adicionar campo para a imagem da alternativa
                imagemUrl: { type: String, default: '' }
            }
        ],
        explicacao: { 
            type: String,
        },
        avaliacao: {
            type: Schema.Types.ObjectId,
            ref: "Avaliacao",
            required: true
        },
        valor: { 
            type: Number,
            min: 0,
            default: 0.5 // Valor padrão
        }
    },
    {
        timestamps: true
    }
);

// Garantir que não existam questões duplicadas na mesma avaliação
questaoSchema.index({ numero: 1, avaliacao: 1 }, { unique: true });

// Adicionar método toJSON para garantir que os campos de imagem sempre estejam presentes
// questaoSchema.set('toJSON', {
//     transform: function(doc, ret, options) {
//         // Garantir que imagemEnunciadoUrl sempre esteja presente
//         ret.imagemEnunciadoUrl = ret.imagemEnunciadoUrl || '';
        
//         // Garantir que cada alternativa tenha o campo imagemUrl
//         if (ret.alternativas && Array.isArray(ret.alternativas)) {
//             ret.alternativas = ret.alternativas.map(alt => ({
//                 ...alt,
//                 imagemUrl: alt.imagemUrl || ''
//             }));
//         }
        
//         return ret;
//     }
// });

export const Questao = model<IQuestao>("Questao", questaoSchema);