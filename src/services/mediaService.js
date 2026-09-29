// src/services/mediaService.js
// Provides Cloudflare R2 upload presigned URL generation, Firestore watch history sync,
// and HLS stream resolution for MediaFlow.

import { db } from './firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

// Default HLS demo stream fallbacks for development/demo mode when R2 is not yet configured
export const DEMO_HLS_VIDEO = import.meta.env.VITE_DEMO_HLS_URL || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
export const DEMO_HLS_AUDIO = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3";

/**
 * Resolves the effective stream URL (HLS .m3u8, direct HTTPS URL, or fallback)
 * @param {Object} mediaItem 
 * @returns {string}
 */
export function resolveMediaStreamUrl(mediaItem) {
  if (!mediaItem) return DEMO_HLS_VIDEO;
  if (mediaItem.hlsUrl && mediaItem.hlsUrl.trim() !== '') {
    return mediaItem.hlsUrl.trim();
  }
  if (mediaItem.url && mediaItem.url.trim() !== '' && !/^[a-zA-Z]:\\|^file:\/\/\//i.test(mediaItem.url.trim())) {
    return mediaItem.url.trim();
  }
  return mediaItem.type === 'movie' ? DEMO_HLS_VIDEO : DEMO_HLS_AUDIO;
}

/**
 * Request presigned R2 upload URL from Vercel Serverless API
 * @param {string} fileName 
 * @param {string} fileType 
 * @param {string} mediaType - 'movie' or 'music'
 * @returns {Promise<{ uploadUrl: string, publicUrl: string, storagePath: string }>}
 */
export async function getPresignedR2UploadUrl(fileName, fileType, mediaType = 'movie') {
  try {
    const res = await fetch('/api/media/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, fileType, mediaType }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Serverless API error (${res.status})`);
    }

    return await res.json();
  } catch (error) {
    console.warn("Presigned R2 API fallback notice:", error.message);
    throw error;
  }
}

/**
 * Upload file directly through Vercel Serverless API to Cloudflare R2
 * Bypasses all browser CORS restrictions cleanly.
 * @param {File} file 
 * @param {string} mediaType 
 * @returns {Promise<{ publicUrl: string, storagePath: string }>}
 */
export async function uploadFileToR2Serverless(file, mediaType = 'movie') {
  const base64Data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });

  const res = await fetch('/api/media/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      fileData: base64Data,
      mediaType
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Serverless upload error (${res.status})`);
  }

  return await res.json();
}

/**
 * Direct browser upload to Cloudflare R2 using presigned URL
 * @param {File} file 
 * @param {string} presignedUploadUrl 
 * @param {Function} onProgress 
 */
export function uploadFileToR2PresignedUrl(file, presignedUploadUrl, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', presignedUploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.timeout = 25000; // 25s timeout to catch CORS/network lockup

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(true);
      } else {
        reject(new Error(`R2 upload rejected with status ${xhr.status}. Check R2 Bucket CORS configuration.`));
      }
    };

    xhr.ontimeout = () => {
      reject(new Error("Cloudflare R2 upload timed out. Falling back to cloud storage."));
    };

    xhr.onerror = () => reject(new Error("Network / CORS error uploading to Cloudflare R2. Check R2 Bucket CORS settings."));
    xhr.send(file);
  });
}

/**
 * Save user playback watch history position periodically to Firestore (throttled)
 * @param {string} userId 
 * @param {string|number} mediaId 
 * @param {number} positionInSeconds 
 * @param {number} totalDurationInSeconds 
 */
export async function saveWatchHistoryPosition(userId, mediaId, positionInSeconds, totalDurationInSeconds) {
  if (!userId || !mediaId || isNaN(positionInSeconds) || positionInSeconds <= 0) return;

  try {
    const docKey = `${userId}_${mediaId}`;
    const historyRef = doc(db, "watchHistory", docKey);
    await setDoc(historyRef, {
      userId,
      mediaId: String(mediaId),
      position: Math.floor(positionInSeconds),
      duration: Math.floor(totalDurationInSeconds || 0),
      lastWatchedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore Watch History save notice:", err);
  }
}

/**
 * Fetch last watched playback position for playback resumption
 * @param {string} userId 
 * @param {string|number} mediaId 
 * @returns {Promise<number>} - last position in seconds
 */
export async function getWatchHistoryPosition(userId, mediaId) {
  if (!userId || !mediaId) return 0;
  try {
    const docKey = `${userId}_${mediaId}`;
    const historyRef = doc(db, "watchHistory", docKey);
    const snap = await getDoc(historyRef);
    if (snap.exists()) {
      const data = snap.data();
      // Resume if user has not reached end (within last 10s)
      if (data.position && data.duration && (data.duration - data.position) > 10) {
        return data.position;
      }
    }
  } catch (err) {
    console.warn("Firestore Watch History read notice:", err);
  }
  return 0;
}

/**
 * Toggle user favorites in Firestore
 * @param {string} userId 
 * @param {string|number} mediaId 
 * @param {boolean} isFav 
 */
export async function toggleUserFavorite(userId, mediaId, isFav) {
  if (!userId || !mediaId) return;
  try {
    const favRef = doc(db, "favorites", String(userId));
    if (isFav) {
      await setDoc(favRef, { mediaIds: arrayUnion(String(mediaId)) }, { merge: true });
    } else {
      await setDoc(favRef, { mediaIds: arrayRemove(String(mediaId)) }, { merge: true });
    }
  } catch (err) {
    console.warn("Firestore Favorite toggle notice:", err);
  }
}
