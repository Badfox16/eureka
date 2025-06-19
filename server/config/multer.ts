import multer from 'multer';
import type { Request } from 'express';
import path from 'path';
import fs from 'fs';
import multerS3 from 'multer-s3';
import { s3Client, bucketName } from './aws';

const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedMimes = [
        'image/jpeg',
        'image/pjpeg',
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
        cb(null, true); // Accept the file
    } else {
        // Reject the file and pass an error
        (cb as any)(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas.'), false);
    }
};

// Configure S3 storage
const s3Storage = multerS3({
    s3: s3Client,
    bucket: bucketName,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
        // Generate a unique file name
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + extension;
        // Store in a folder structure: uploads/YYYY-MM-DD/filename
        const date = new Date();
        const folder = `uploads/${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        cb(null, `${folder}/${filename}`);
    }
});

// Keep local storage as a fallback option
const uploadDirectory = path.resolve(__dirname, '..', '..', 'tmp', 'uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
    console.log(`✅ Diretório de uploads criado em: ${uploadDirectory}`);
} else {
    console.log(`ℹ️ Diretório de uploads já existe em: ${uploadDirectory}`);
}

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

// Configure Multer
const useS3 = process.env.USE_S3_STORAGE === 'true';

const uploadConfig = {
    storage: useS3 ? s3Storage : diskStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
};

// Create the Multer instance
const uploadMiddleware = multer(uploadConfig);

// Add this function to create a local-only middleware
export const createLocalOnlyUpload = () => {
    return multer({
        storage: diskStorage,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        },
        fileFilter: fileFilter
    });
};

// Export the local-only middleware
export const localUploadMiddleware = createLocalOnlyUpload();

export default uploadMiddleware;