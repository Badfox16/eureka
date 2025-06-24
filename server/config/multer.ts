import multer from 'multer';
import path from 'path';
import fs from 'fs';
import multerS3 from 'multer-s3';
import { s3Client, bucketName, s3BaseUrl } from './aws';
import type { Request } from 'express';

// Configure S3 storage without ACL
const s3Storage = multerS3({
  s3: s3Client,
  bucket: bucketName,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const key = `${file.fieldname}-${uniqueSuffix}${ext}`;
    cb(null, key);
  },
  contentType: multerS3.AUTO_CONTENT_TYPE
});

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
            fileSize: 7 * 1024 * 1024 // 7MB limit
        },
        fileFilter: fileFilter
    });
};

// Export the local-only middleware
export const localUploadMiddleware = createLocalOnlyUpload();

export default uploadMiddleware;