import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, bucketName, s3BaseUrl } from '../config/aws';
import fs from 'fs';
import path from 'path';

// Function to get S3 key from URL
export const getS3KeyFromUrl = (url: string): string | null => {
  if (!url) return null;
  
  // If it's an S3 URL (https://bucket.s3.region.amazonaws.com/path/to/file.jpg)
  if (url.includes(s3BaseUrl)) {
    return url.replace(s3BaseUrl, '');
  }
  
  // If it's just a path (/uploads/2023-06-19/file.jpg)
  if (url.startsWith('/uploads/')) {
    return url.substring(1); // Remove leading slash
  }
  
  return null;
};

// Function to remove a file from S3
export const removeS3File = async (url: string | undefined | null): Promise<boolean> => {
  if (!url) return false;
  
  try {
    const key = getS3KeyFromUrl(url);
    if (!key) return false;
    
    const deleteParams = {
      Bucket: bucketName,
      Key: key
    };
    
    await s3Client.send(new DeleteObjectCommand(deleteParams));
    console.log(`🗑️ S3 file removed: ${key}`);
    return true;
  } catch (error) {
    console.error('❌ Error removing file from S3:', error);
    return false;
  }
};

// Function to remove either local or S3 file
export const removeFile = async (url: string | undefined | null): Promise<boolean> => {
  if (!url) return false;
  
  // Determine if it's an S3 URL or local file path
  const isS3Url = url.includes('amazonaws.com') || (process.env.USE_S3_STORAGE === 'true' && url.startsWith('/uploads/'));
  
  if (isS3Url) {
    return removeS3File(url);
  } else if (url.startsWith('/uploads/')) {
    // Local file path
    const actualFilename = url.substring('/uploads/'.length);
    const filePath = path.resolve(__dirname, '..', '..', 'tmp', 'uploads', actualFilename);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Local file removed: ${filePath}`);
        return true;
      }
    } catch (err) {
      console.error(`❌ Error removing local file ${filePath}:`, err);
    }
  } else {
    console.warn(`⚠️ Unexpected file URL format, unable to remove: ${url}`);
  }
  
  return false;
};