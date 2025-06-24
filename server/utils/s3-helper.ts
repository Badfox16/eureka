import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, bucketName, s3BaseUrl } from '../config/aws';
import fs from 'fs';
import path from 'path';

export const removeFile = async (fileUrl: string | undefined): Promise<void> => {
  if (!fileUrl) return;
  
  try {
    if (fileUrl.includes(s3BaseUrl)) {
      // É um arquivo S3
      const key = fileUrl.replace(s3BaseUrl, '');
      console.log('Removendo arquivo S3 com key:', key);
      
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      
      await s3Client.send(command);
      console.log('Arquivo S3 removido com sucesso');
    } else if (fileUrl.startsWith('/uploads/')) {
      // É um arquivo local
      const filename = path.basename(fileUrl);
      const filePath = path.resolve(__dirname, '..', '..', 'tmp', 'uploads', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Arquivo local removido:', filePath);
      } else {
        console.log('Arquivo local não encontrado:', filePath);
      }
    } else {
      console.log('URL de arquivo em formato desconhecido:', fileUrl);
    }
  } catch (error) {
    console.error('Erro ao remover arquivo:', error);
    // Não repassar o erro, apenas registrar
  }
};