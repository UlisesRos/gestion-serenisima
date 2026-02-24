// src/services/offlineDB.js
// Base de datos local usando IndexedDB para almacenar datos cuando no hay internet

const DB_NAME = 'SerenisimaOfflineDB';
const DB_VERSION = 1;
const STORE_PENDING = 'pendingOperations';
const STORE_CACHE = 'cachedData';

let db = null;

const openDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Store para operaciones pendientes (crear/editar/eliminar sin internet)
      if (!database.objectStoreNames.contains(STORE_PENDING)) {
        const pendingStore = database.createObjectStore(STORE_PENDING, {
          keyPath: 'id',
          autoIncrement: true,
        });
        pendingStore.createIndex('type', 'type', { unique: false });
        pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Store para cachear datos del servidor
      if (!database.objectStoreNames.contains(STORE_CACHE)) {
        database.createObjectStore(STORE_CACHE, { keyPath: 'key' });
      }
    };
  });
};

// ===== OPERACIONES PENDIENTES =====

export const savePendingOperation = async (operation) => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_PENDING, 'readwrite');
    const store = tx.objectStore(STORE_PENDING);
    const request = store.add({
      ...operation,
      timestamp: new Date().toISOString(),
      synced: false,
    });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAllPendingOperations = async () => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_PENDING, 'readonly');
    const store = tx.objectStore(STORE_PENDING);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deletePendingOperation = async (id) => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_PENDING, 'readwrite');
    const store = tx.objectStore(STORE_PENDING);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const countPendingOperations = async () => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_PENDING, 'readonly');
    const store = tx.objectStore(STORE_PENDING);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// ===== CACHÉ DE DATOS =====

export const setCachedData = async (key, data) => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_CACHE, 'readwrite');
    const store = tx.objectStore(STORE_CACHE);
    const request = store.put({ key, data, updatedAt: new Date().toISOString() });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getCachedData = async (key) => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_CACHE, 'readonly');
    const store = tx.objectStore(STORE_CACHE);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result?.data || null);
    request.onerror = () => reject(request.error);
  });
};

export const clearCachedData = async (key) => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_CACHE, 'readwrite');
    const store = tx.objectStore(STORE_CACHE);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};