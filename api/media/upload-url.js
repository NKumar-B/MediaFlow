// // api/media/upload-url.js
// // Vercel Serverless API function to generate Cloudflare R2 presigned PUT upload URLs.
// // IMPORTANT: R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY are kept exclusively on the server.

// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// export default async function handler(req, res) {
//   // CORS headers
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }

//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method Not Allowed' });
//   }

//   const { fileName, fileType, mediaType = 'movie' } = req.body || {};

//   if (!fileName) {
//     return res.status(400).json({ message: 'fileName parameter is required.' });
//   }

//   const accountId = process.env.R2_ACCOUNT_ID;
//   const accessKeyId = process.env.R2_ACCESS_KEY_ID;
//   const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
//   const bucketName = process.env.R2_BUCKET_NAME || 'mediaflow';
//   const publicUrlBase = process.env.R2_PUBLIC_URL || `https://${bucketName}.${accountId}.r2.cloudflarestorage.com`;

//   // Fallback demo response if Cloudflare R2 credentials are not configured in Vercel environment
//   if (!accountId || !accessKeyId || !secretAccessKey) {
//     console.warn("Cloudflare R2 environment variables missing on serverless route. Returning development simulation endpoint.");
//     const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
//     const mockStoragePath = `${mediaType}s/${Date.now()}_${sanitizedName}`;
//     return res.status(200).json({
//       uploadUrl: `https://httpbin.org/put`,
//       publicUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
//       storagePath: mockStoragePath,
//       isSimulated: true,
//       message: "Development Mode: Configure R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY in Vercel for live Cloudflare R2 uploads."
//     });
//   }

//   try {
//     const s3 = new S3Client({
//       region: 'auto',
//       endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
//       credentials: {
//         accessKeyId,
//         secretAccessKey
//       }
//     });

//     const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
//     const folder = mediaType === 'music' ? 'music' : 'movies';
//     const storagePath = `${folder}/${Date.now()}_${sanitizedName}`;

//     const command = new PutObjectCommand({
//       Bucket: bucketName,
//       Key: storagePath,
//       ContentType: fileType || 'application/octet-stream'
//     });

//     const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
//     const publicUrl = `${publicUrlBase.replace(/\/$/, '')}/${storagePath}`;

//     return res.status(200).json({
//       uploadUrl,
//       publicUrl,
//       storagePath
//     });
//   } catch (err) {
//     console.error("Presigned URL Generation Failure:", err);
//     return res.status(500).json({ message: "Failed to generate presigned upload URL", error: err.message });
//   }
// }


// api/media/upload-url.js

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
    return res.status(405).json({
      message: 'Method Not Allowed'
    });
  }

  const {
    fileName,
    fileType,
    mediaType = 'movie'
  } = req.body || {};

  if (!fileName) {
    return res.status(400).json({
      message: 'fileName parameter is required.'
    });
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  // Do NOT silently fall back to demo storage
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    console.error('Missing R2 environment variables');

    return res.status(500).json({
      message: 'R2 environment variables are not configured.'
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

    const sanitizedName = fileName.replace(
      /[^a-zA-Z0-9._-]/g,
      '_'
    );

    const folder =
      mediaType === 'music'
        ? 'music'
        : 'movies';

    const storagePath =
      `${folder}/${Date.now()}_${sanitizedName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: storagePath,
      ContentType: fileType || 'application/octet-stream'
    });

    const uploadUrl = await getSignedUrl(
      s3,
      command,
      {
        expiresIn: 3600
      }
    );

    return res.status(200).json({
      uploadUrl,
      storagePath
    });

  } catch (err) {
    console.error(
      'Presigned URL Generation Failure:',
      err
    );

    return res.status(500).json({
      message: 'Failed to generate upload URL',
      error: err.message
    });
  }
}