import { Schema, model, Document, Types } from "mongoose";
import { type IDisciplina } from "./disciplina";
import { type IProvincia } from "./provincia";

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

export enum VarianteProva {
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    UNICA = "ÚNICA" // Para provas sem variantes
}

export enum AreaEstudo {
    CIENCIAS = "CIÊNCIAS",
    LETRAS = "LETRAS",
    GERAL = "GERAL" // Para disciplinas que não têm divisão por área
}

export interface IAvaliacao extends Document {
    _id: Types.ObjectId;
    tipo: TipoAvaliacao;
    ano: number;
    disciplina: Types.ObjectId | IDisciplina;
    // Campos específicos para AP
    trimestre?: Trimestre;
    provincia?: Types.ObjectId | IProvincia;
    variante?: VarianteProva; 
    // Campos específicos para Exame
    epoca?: Epoca;
    // Informações sobre área de estudo
    areaEstudo?: AreaEstudo;
    // Outras informações
    classe: number; // 11 ou 12
    titulo?: string; // Título opcional para melhor identificação da avaliação
    questoes: Types.ObjectId[];
    ativo: boolean;
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
        provincia: {
            type: Schema.Types.ObjectId,
            ref: "Provincia",
            required: function(this: IAvaliacao) {
                return this.tipo === TipoAvaliacao.AP;
            }
        },
        variante: {
            type: String,
            enum: Object.values(VarianteProva),
            default: VarianteProva.UNICA
        },
        epoca: { 
            type: String,
            enum: Object.values(Epoca),
            required: function(this: IAvaliacao) {
                return this.tipo === TipoAvaliacao.EXAME;
            }
        },
        areaEstudo: {
            type: String,
            enum: Object.values(AreaEstudo),
            default: AreaEstudo.GERAL
        },
        classe: {
            type: Number,
            enum: [10, 11, 12], // Adicionei a 10ª classe também
            required: true
        },
        titulo: {
            type: String,
            trim: true,
            maxlength: 200
        },
        questoes: [{ 
            type: Schema.Types.ObjectId, 
            ref: "Questao" 
        }],
        ativo: {
            type: Boolean,
            required: true,
            default: false
        },
    },
    {
        timestamps: true
    }
);

// Atualização do índice composto para incluir as novas propriedades
avaliacaoSchema.index({ 
    tipo: 1, 
    ano: 1, 
    disciplina: 1, 
    trimestre: 1, 
    epoca: 1, 
    classe: 1,
    variante: 1,
    areaEstudo: 1,
    provincia: 1
}, { 
    unique: true,
    // Índice parcial que ignora campos nulos/indefinidos
    partialFilterExpression: {
        tipo: { $exists: true }
    }
});

// Método para gerar o título automaticamente se não for fornecido
avaliacaoSchema.pre('save', async function(next) {
    if (!this.titulo) {
        try {
            // Aqui você pode implementar lógica para popular 
            // automaticamente disciplinas e províncias
            let titulo = '';
            
            const populatedDoc = await this.populate([
                { path: 'disciplina', select: 'nome' },
                { path: 'provincia', select: 'nome' }
            ]);
            
            // Construir título baseado no tipo
            if (this.tipo === TipoAvaliacao.EXAME) {
                const disciplinaNome = typeof populatedDoc.disciplina === 'object' && populatedDoc.disciplina && 'nome' in populatedDoc.disciplina 
                    ? populatedDoc.disciplina.nome 
                    : 'Disciplina';
                titulo = `Exame Nacional de ${disciplinaNome}`;
                if (this.areaEstudo !== AreaEstudo.GERAL) {
                    titulo += ` (${this.areaEstudo})`;
                }
                titulo += ` - ${this.classe}ª Classe, ${this.ano}, ${this.epoca} Época`;
            } else {
                const disciplinaNome = typeof populatedDoc.disciplina === 'object' && populatedDoc.disciplina && 'nome' in populatedDoc.disciplina 
                    ? populatedDoc.disciplina.nome 
                    : 'Disciplina';
                titulo = `Avaliação Provincial de ${disciplinaNome}`;
                if (this.areaEstudo !== AreaEstudo.GERAL) {
                    titulo += ` (${this.areaEstudo})`;
                }
                titulo += ` - ${this.classe}ª Classe, ${this.ano}, ${this.trimestre} Trimestre`;
                if (populatedDoc.provincia && typeof populatedDoc.provincia !== 'string' && 'nome' in populatedDoc.provincia) {
                    titulo += `, ${populatedDoc.provincia.nome}`;
                }
                if (this.variante !== VarianteProva.UNICA) {
                    titulo += `, Variante ${this.variante}`;
                }
            }
            
            this.titulo = titulo;
        } catch (error) {
            // Se falhar ao popular, cria um título básico
            this.titulo = `Avaliação de ${this.tipo} - ${this.ano} - ${this.classe}ª Classe`;
        }
    }
    next();
});

export const Avaliacao = model<IAvaliacao>("Avaliacao", avaliacaoSchema);