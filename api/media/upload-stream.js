// api/media/upload-stream.js
// Vercel Serverless API function to stream raw binary files directly to Cloudflare R2.
// Disables body-parsing to accept raw binary bodies without CORS or payload inflation.

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const fileName = req.query.fileName || `file_${Date.now()}`;
  const fileType = req.headers['content-type'] || 'application/octet-stream';
  const mediaType = req.query.mediaType || 'movie';

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || 'mediaflow-media';
  const publicUrlBase = process.env.R2_PUBLIC_URL || `https://${bucketName}.${accountId}.r2.cloudflarestorage.com`;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return res.status(500).json({
      message: 'Cloudflare R2 environment variables (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) are not configured in Vercel settings.'
    });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

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
      ContentType: fileType
    }));

    const publicUrl = `${publicUrlBase.replace(/\/$/, '')}/${storagePath}`;

    return res.status(200).json({
      success: true,
      publicUrl,
      storagePath
    });
  } catch (err) {
    console.error('Serverless Upload Stream Error:', err);
    return res.status(500).json({
      message: 'Failed to upload stream to Cloudflare R2',
      error: err.message
    });
  }
}
