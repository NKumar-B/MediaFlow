// src/services/mediaStorage.js
// Provides persistent IndexedDB and Base64 storage for media files (songs/movies)
// so uploaded content is NOT lost when the browser page is refreshed.

const DB_NAME = 'MediaFlowDB';
const DB_VERSION = 1;
const STORE_NAME = 'mediaFiles';

/**
 * Open or initialize IndexedDB connection
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

/**
 * Save a File/Blob or Base64 string persistently to IndexedDB
 */
export async function saveMediaFileToStorage(id, fileOrBlob) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(fileOrBlob, String(id));
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error('Failed to save media file to IndexedDB:', err);
    return false;
  }
}

/**
 * Retrieve a stored Blob/File from IndexedDB and create a restored Blob URL or Data URL
 */
export async function getMediaFileFromStorage(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(String(id));
      req.onsuccess = () => {
        const result = req.result;
        if (!result) return resolve(null);
        if (typeof result === 'string') return resolve(result); // Base64 or Data URL
        if (result instanceof Blob || result instanceof File) {
          const blobUrl = URL.createObjectURL(result);
          return resolve(blobUrl);
        }
        resolve(null);
      };
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error('Failed to read media file from IndexedDB:', err);
    return null;
  }
}

/**
 * Delete a media file from IndexedDB by ID
 */
export async function deleteMediaFileFromStorage(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(String(id));
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error('Failed to delete media file from IndexedDB:', err);
    return false;
  }
}

/**
 * Convert a File object to a Base64 Data URL
 */
export function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
