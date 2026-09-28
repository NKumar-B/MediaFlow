// src/services/cloudStorage.js
// Provides Firebase Cloud Storage upload and streaming URL generation
// for songs and movies of any size (MP3, MP4, WAV, MKV, etc.)

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Uploads a media file (song or movie) to Firebase Cloud Storage
 * and returns a permanent, high-speed public HTTPS streaming URL.
 * 
 * @param {File} file - The file object to upload
 * @param {Function} onProgress - Optional callback for upload percentage (0 - 100)
 * @returns {Promise<string>} - Direct public HTTPS streaming URL
 */
export async function uploadMediaFileToCloud(file, onProgress) {
  if (!file) throw new Error("No file provided for cloud upload.");

  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `media/${Date.now()}_${sanitizedFileName}`;
  const storageRef = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error("Firebase Storage Upload Error:", error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}
