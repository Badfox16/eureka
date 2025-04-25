// src/config/multer.ts
import multer, { type StorageEngine } from 'multer';
import type { Request } from 'express';
import path from 'path';
import fs from 'fs'; // Importar o módulo 'fs' para criar a pasta
import { any } from 'zod';

// --- Armazenamento em Disco ---
const uploadDirectory = path.resolve(__dirname, '..', '..', 'tmp', 'uploads'); // Caminho absoluto para tmp/uploads na raiz do projeto

// Garantir que o diretório de uploads exista
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
    console.log(`✅ Diretório de uploads criado em: ${uploadDirectory}`);
} else {
    console.log(`ℹ️ Diretório de uploads já existe em: ${uploadDirectory}`);
}


const diskStorage: StorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        // Define a pasta onde os arquivos serão salvos
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        // Define um nome único para o arquivo para evitar conflitos
        // Usar o timestamp e um número aleatório é uma boa prática
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Manter a extensão original do arquivo
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});


// Filtro de Arquivo (para aceitar apenas imagens - igual ao anterior)
const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedMimes = [
        'image/jpeg',
        'image/pjpeg', // Para JPEGs mais antigos
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'image/bmp',
        'image/tiff',
        'image/heif',
        'image/heic',
        'image/jpg',
        'image/avif',
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true); // Aceita o arquivo
    } else {
        // Rejeita o arquivo e passa um erro
        (cb as any)(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas.'), false);
    }
};

// Configuração principal do Multer
const uploadConfig = {
    storage: diskStorage, // <<< Alterado para diskStorage
    limits: {
        fileSize: 2 * 1024 * 1024 // Limite de 2MB por arquivo (pode ajustar)
    },
    fileFilter: fileFilter
};

// Cria a instância do Multer
const uploadMiddleware = multer(uploadConfig);

export default uploadMiddleware;