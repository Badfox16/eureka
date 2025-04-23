import { Schema, model, Document, Types } from "mongoose";

export enum TipoAvaliacao {
    AP = "AP", // Avaliação Provincial
    EXAME = "EXAME"
}

export enum Trimestre {
    PRIMEIRO = "1º",
    SEGUNDO = "2º",
    TERCEIRO = "3º"
}

export enum Epoca {
    PRIMEIRA = "1ª",
    SEGUNDA = "2ª"
}

export interface IAvaliacao extends Document {
    _id: Types.ObjectId;
    tipo: TipoAvaliacao;
    ano: number;
    disciplina: Types.ObjectId;
    // Campos específicos para AP
    trimestre?: Trimestre;
    provincia?: string; 
    // Campos específicos para Exame
    epoca?: Epoca;
    // Outras informações
    classe: number; 
    questoes: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const avaliacaoSchema = new Schema<IAvaliacao>(
    {
        tipo: { 
            type: String, 
            enum: Object.values(TipoAvaliacao),
            required: true 
        },
        ano: { 
            type: Number, 
            required: true,
            min: 2000,
            max: new Date().getFullYear()
        },
        disciplina: { 
            type: Schema.Types.ObjectId, 
            ref: "Disciplina",
            required: true 
        },
        trimestre: { 
            type: String,
            enum: Object.values(Trimestre),
            required: function(this: IAvaliacao) {
                return this.tipo === TipoAvaliacao.AP;
            }
        },
        provincia: { // Nova propriedade
            type: String,
            required: function(this: IAvaliacao) {
                return this.tipo === TipoAvaliacao.AP;
            }
        },
        epoca: { 
            type: String,
            enum: Object.values(Epoca),
            required: function(this: IAvaliacao) {
                return this.tipo === TipoAvaliacao.EXAME;
            }
        },
        classe: {
            type: Number,
            enum: [11, 12],
            required: true
        },
        questoes: [{ 
            type: Schema.Types.ObjectId, 
            ref: "Questao" 
        }]
    },
    {
        timestamps: true
    }
);

// Índice composto para evitar avaliações duplicadas
avaliacaoSchema.index({ 
    tipo: 1, 
    ano: 1, 
    disciplina: 1, 
    trimestre: 1, 
    epoca: 1, 
    classe: 1 
}, { 
    unique: true 
});

export const Avaliacao = model<IAvaliacao>("Avaliacao", avaliacaoSchema);