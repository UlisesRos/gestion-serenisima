// src/services/devolucionesService.js
// Versión con soporte offline: si no hay internet, guarda localmente y sincroniza al volver.

import { setCachedData, getCachedData } from './offlineDB';
import { checkOnlineStatus, queueOperation } from './syncService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Generar un ID temporal para operaciones offline
const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const devolucionesService = {

  // Obtener todas las devoluciones
  getAllDevoluciones: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.nombre) params.append('nombre', filters.nombre);
    if (filters.fecha) params.append('fecha', filters.fecha);

    const cacheKey = `devoluciones_${params.toString()}`;

    try {
      const isOnline = await checkOnlineStatus();

      if (isOnline) {
        const url = `${API_URL}/devoluciones${params.toString() ? `?${params}` : ''}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener devoluciones');
        const data = await response.json();

        // Cachear los datos para uso offline
        await setCachedData(cacheKey, data);
        return data;
      } else {
        // Sin internet: devolver datos cacheados
        const cached = await getCachedData(cacheKey);
        if (cached) return cached;
        
        // Si no hay caché con filtros, intentar con el caché general
        const generalCached = await getCachedData('devoluciones_');
        return generalCached || [];
      }
    } catch (error) {
      console.error('Error fetching devoluciones:', error);
      // Fallback al caché
      const cached = await getCachedData(cacheKey) || await getCachedData('devoluciones_');
      return cached || [];
    }
  },

  // Crear nueva devolución
  createDevolucion: async (devolucionData) => {
    const isOnline = await checkOnlineStatus();

    if (isOnline) {
      // Online: guardar directamente en el servidor
      const response = await fetch(`${API_URL}/devoluciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(devolucionData),
      });
      if (!response.ok) throw new Error('Error al crear devolución');
      return await response.json();
    } else {
      // Offline: guardar en cola de sincronización
      const tempId = generateTempId();
      const tempDevolucion = {
        _id: tempId,
        ...devolucionData,
        fecha: devolucionData.fecha || new Date().toISOString(),
        productos: (devolucionData.productos || []).map(p => ({
          ...p,
          _id: generateTempId(),
          controlado: false,
          pasadoMaquina: false,
        })),
        _isOffline: true, // Marcar como creada offline
      };

      // Encolar operación para sync posterior
      await queueOperation({
        type: 'CREATE_DEVOLUCION',
        endpoint: '/devoluciones',
        method: 'POST',
        body: devolucionData,
        tempId,
      });

      return tempDevolucion;
    }
  },

  // Actualizar devolución
  updateDevolucion: async (id, devolucionData) => {
    // Si el ID es temporal (offline), actualizar en la cola
    if (id.startsWith('temp_')) {
      await queueOperation({
        type: 'UPDATE_DEVOLUCION_OFFLINE',
        endpoint: `/devoluciones/temp`,
        method: 'PUT',
        body: { ...devolucionData, tempId: id },
        tempId: id,
      });
      return { _id: id, ...devolucionData, _isOffline: true };
    }

    const isOnline = await checkOnlineStatus();

    if (isOnline) {
      const response = await fetch(`${API_URL}/devoluciones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(devolucionData),
      });
      if (!response.ok) throw new Error('Error al actualizar devolución');
      return await response.json();
    } else {
      await queueOperation({
        type: 'UPDATE_DEVOLUCION',
        endpoint: `/devoluciones/${id}`,
        method: 'PUT',
        body: devolucionData,
      });
      return { _id: id, ...devolucionData, _isOffline: true };
    }
  },

  // Eliminar devolución
  deleteDevolucion: async (id) => {
    if (id.startsWith('temp_')) {
      // Era una devolución offline que nunca se subió, no hay nada que eliminar del servidor
      return { message: 'Devolución offline eliminada' };
    }

    const isOnline = await checkOnlineStatus();

    if (isOnline) {
      const response = await fetch(`${API_URL}/devoluciones/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar devolución');
      return await response.json();
    } else {
      await queueOperation({
        type: 'DELETE_DEVOLUCION',
        endpoint: `/devoluciones/${id}`,
        method: 'DELETE',
      });
      return { message: 'Eliminación pendiente de sincronización' };
    }
  },

  // Toggle producto CONTROLADO
  toggleControlado: async (devolucionId, productoId) => {
    if (devolucionId.startsWith('temp_') || productoId.startsWith('temp_')) {
      return null; // Para devoluciones offline, el estado se maneja localmente
    }

    const isOnline = await checkOnlineStatus();

    if (isOnline) {
      const response = await fetch(
        `${API_URL}/devoluciones/${devolucionId}/productos/${productoId}/toggle-controlado`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
      );
      if (!response.ok) throw new Error('Error al actualizar producto');
      return await response.json();
    } else {
      await queueOperation({
        type: 'TOGGLE_CONTROLADO',
        endpoint: `/devoluciones/${devolucionId}/productos/${productoId}/toggle-controlado`,
        method: 'PUT',
      });
      return null;
    }
  },

  // Toggle producto PASADO A MÁQUINA
  toggleMaquina: async (devolucionId, productoId) => {
    if (devolucionId.startsWith('temp_') || productoId.startsWith('temp_')) {
      return null;
    }

    const isOnline = await checkOnlineStatus();

    if (isOnline) {
      const response = await fetch(
        `${API_URL}/devoluciones/${devolucionId}/productos/${productoId}/toggle-maquina`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
      );
      if (!response.ok) throw new Error('Error al actualizar producto');
      return await response.json();
    } else {
      await queueOperation({
        type: 'TOGGLE_MAQUINA',
        endpoint: `/devoluciones/${devolucionId}/productos/${productoId}/toggle-maquina`,
        method: 'PUT',
      });
      return null;
    }
  },

  // Actualizar código y/o cantidad de producto
  updateProducto: async (devolucionId, productoId, data) => {
    if (devolucionId.startsWith('temp_') || productoId.startsWith('temp_')) {
      return null;
    }

    const isOnline = await checkOnlineStatus();

    if (isOnline) {
      const response = await fetch(
        `${API_URL}/devoluciones/${devolucionId}/productos/${productoId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error('Error al actualizar producto');
      return await response.json();
    } else {
      await queueOperation({
        type: 'UPDATE_PRODUCTO',
        endpoint: `/devoluciones/${devolucionId}/productos/${productoId}`,
        method: 'PUT',
        body: data,
      });
      return null;
    }
  },
};