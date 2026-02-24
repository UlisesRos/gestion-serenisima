// src/services/syncService.js
// Servicio que sincroniza las operaciones pendientes cuando vuelve la conexión

import {
  getAllPendingOperations,
  deletePendingOperation,
  savePendingOperation,
  countPendingOperations,
} from './offlineDB';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Verificar si hay conexión real (no solo la propiedad del navegador)
export const checkOnlineStatus = async () => {
  if (!navigator.onLine) return false;
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'HEAD',
      cache: 'no-cache',
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    // Si falla el health check, intentar con la URL base
    try {
      await fetch(API_URL, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(3000),
      });
      return true;
    } catch {
      return false;
    }
  }
};

// Ejecutar una operación pendiente contra el servidor
const executeOperation = async (operation) => {
  const { type, endpoint, method, body } = operation;

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: method || 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status} al sincronizar ${type}`);
  }

  return response.json();
};

// Sincronizar todas las operaciones pendientes
export const syncPendingOperations = async (onProgress) => {
  const isOnline = await checkOnlineStatus();
  if (!isOnline) return { synced: 0, failed: 0, remaining: await countPendingOperations() };

  const operations = await getAllPendingOperations();
  if (operations.length === 0) return { synced: 0, failed: 0, remaining: 0 };

  // Ordenar por timestamp para mantener el orden cronológico
  operations.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  let synced = 0;
  let failed = 0;

  for (const operation of operations) {
    try {
      await executeOperation(operation);
      await deletePendingOperation(operation.id);
      synced++;
      onProgress?.({ synced, failed, total: operations.length, current: operation });
    } catch (error) {
      console.error(`Error sincronizando operación ${operation.id}:`, error);
      failed++;
    }
  }

  const remaining = await countPendingOperations();
  return { synced, failed, remaining };
};

// Guardar una operación para sincronizar luego
export const queueOperation = async (operationData) => {
  return savePendingOperation(operationData);
};

// Obtener cantidad de operaciones pendientes
export const getPendingCount = async () => {
  return countPendingOperations();
};

// Iniciar listener de eventos online/offline
export const initSyncListener = (onOnline, onOffline, onSyncComplete) => {
  const handleOnline = async () => {
    onOnline?.();
    // Esperar 1 segundo para asegurar que la conexión es estable
    await new Promise(resolve => setTimeout(resolve, 1000));
    const result = await syncPendingOperations();
    if (result.synced > 0 || result.failed > 0) {
      onSyncComplete?.(result);
    }
  };

  const handleOffline = () => {
    onOffline?.();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Retornar función de cleanup
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};