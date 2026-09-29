// api/media/upload-url.js
// Vercel Serverless API function to generate Cloudflare R2 presigned PUT upload URLs.
// Keeps R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY secure on the server.

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { fileName, fileType, mediaType = 'movie' } = req.body || {};

  if (!fileName) {
    return res.status(400).json({ message: 'fileName parameter is required.' });
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || 'mediaflow-media';
  const publicUrlBase = process.env.R2_PUBLIC_URL || `https://${bucketName}.${accountId}.r2.cloudflarestorage.com`;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    console.error('Missing Cloudflare R2 environment variables on Vercel.');
    return res.status(500).json({
      message: 'Cloudflare R2 environment variables (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) are not configured in Vercel settings.'
    });
  }

  try {
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey
      },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED'
    });

    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const folder = mediaType === 'music' ? 'music' : 'movies';
    const storagePath = `${folder}/${Date.now()}_${sanitizedName}`;

    // Omit ContentType restriction from PutObjectCommand so signed headers match simple PUT requests without header lock
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: storagePath
    });

    const uploadUrl = await getSignedUrl(s3, command, { 
      expiresIn: 3600
    });
    const publicUrl = `${publicUrlBase.replace(/\/$/, '')}/${storagePath}`;

    return res.status(200).json({
      uploadUrl,
      publicUrl,
      storagePath
    });

  } catch (err) {
    console.error('Presigned Upload URL Generation Failure:', err);
    return res.status(500).json({
      message: 'Failed to generate upload URL',
      error: err.message
    });
  }
}