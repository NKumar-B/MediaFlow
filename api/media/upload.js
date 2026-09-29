// api/media/upload.js
// Vercel Serverless API function to upload media files directly to Cloudflare R2.
// Bypasses browser CORS restrictions by executing backend-to-backend S3 upload.

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export default async function handler(req, res) {
  // Enable CORS for Vercel serverless endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { fileName, fileData, fileType, mediaType = 'movie' } = req.body || {};

  if (!fileName || !fileData) {
    return res.status(400).json({ message: 'fileName and fileData (Base64) are required.' });
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || 'mediaflow-media';
  const publicUrlBase = process.env.R2_PUBLIC_URL || `https://${bucketName}.${accountId}.r2.cloudflarestorage.com`;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    console.warn('Missing Cloudflare R2 environment variables on Vercel serverless environment.');
    return res.status(500).json({
      message: 'R2 environment variables (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) are not configured in Vercel settings.'
    });
  }

  try {
    // Strip Base64 data prefix if present
    const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
    const buffer = Buffer.from(base64Data, 'base64');
    
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const folder = mediaType === 'music' ? 'music' : 'movies';
    const storagePath = `${folder}/${Date.now()}_${sanitizedName}`;

    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: storagePath,
      Body: buffer,
      ContentType: fileType || 'application/octet-stream'
    }));

    const publicUrl = `${publicUrlBase.replace(/\/$/, '')}/${storagePath}`;

    return res.status(200).json({
      success: true,
      publicUrl,
      storagePath
    });
  } catch (err) {
    console.error('Serverless R2 Upload Failure:', err);
    return res.status(500).json({
      message: 'Failed to upload file to Cloudflare R2',
      error: err.message
    });
  }
}
