
// Simple IndexedDB wrapper for storing large interview results
const DB_NAME = 'WindAI_DB';
const STORE_NAME = 'interview_results';
const DB_VERSION = 1;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const saveInterviewResult = async (result: any) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      // Remove id if it exists to ensure we always create a new entry
      const resultToSave = { ...result };
      delete resultToSave.id;
      const request = store.add(resultToSave);

      request.onsuccess = () => {
        console.log('[IndexedDB] Saved interview result:', result.job?.title || 'Unknown', 'Date:', result.date);
        resolve(request.result);
      };
      request.onerror = () => {
        // If it's a duplicate key error, try using put instead
        if (request.error?.name === 'ConstraintError') {
          console.warn('[IndexedDB] Duplicate detected, using put instead');
          const putRequest = store.put(resultToSave);
          putRequest.onsuccess = () => resolve(putRequest.result);
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          console.error('[IndexedDB] Error saving result:', request.error);
          reject(request.error);
        }
      };
    });
  } catch (e) {
    console.error('Failed to save to IndexedDB:', e);
  }
};

export const getAllInterviewResults = async (): Promise<any[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result || [];
        console.log(`[IndexedDB] Retrieved ${results.length} interview results`);
        resolve(results);
      };
      request.onerror = () => {
        console.error('[IndexedDB] Error getting results:', request.error);
        reject(request.error);
      };
    });
  } catch (e) {
    console.error('Failed to get from IndexedDB:', e);
    return [];
  }
};

export const clearAllResults = async () => {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    transaction.objectStore(STORE_NAME).clear();
};

