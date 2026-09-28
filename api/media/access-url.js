// api/media/access-url.js
// Vercel Serverless API function to resolve signed/CDN URLs for Cloudflare R2 objects.

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const storageKey = req.query.key || (req.body && req.body.key);

  if (!storageKey) {
    return res.status(400).json({ message: 'storageKey parameter is required.' });
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || 'mediaflow';
  const publicUrlBase = process.env.R2_PUBLIC_URL;

  // Direct CDN URL if custom domain/CDN public URL is set
  if (publicUrlBase) {
    const directUrl = `${publicUrlBase.replace(/\/$/, '')}/${storageKey}`;
    return res.status(200).json({ accessUrl: directUrl });
  }

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return res.status(200).json({
      accessUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
    });
  }

  try {
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: storageKey
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 86400 });
    return res.status(200).json({ accessUrl: signedUrl });
  } catch (err) {
    console.error("Presigned GET URL Generation Failure:", err);
    return res.status(500).json({ message: "Failed to generate access URL", error: err.message });
  }
}
