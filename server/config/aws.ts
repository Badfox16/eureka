import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Ensure these environment variables are set in your .env file
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey) {
  console.error('❌ AWS credentials not found in environment variables!');
}

export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || ''
  }
});

// S3 bucket name from environment variables
export const bucketName = process.env.AWS_S3_BUCKET_NAME || '';

// Base URL for your S3 bucket (used to generate public URLs)
export const s3BaseUrl = `https://${bucketName}.s3.${region}.amazonaws.com/`;