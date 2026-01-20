// services/devolucionesService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const devolucionesService = {
  // Obtener todas las devoluciones
  getAllDevoluciones: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.nombre) params.append('nombre', filters.nombre);
      if (filters.fecha) params.append('fecha', filters.fecha);
      
      const url = `${API_URL}/devoluciones${params.toString() ? `?${params}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al obtener devoluciones');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Crear nueva devolución
  createDevolucion: async (devolucionData) => {
    try {
      const response = await fetch(`${API_URL}/devoluciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(devolucionData),
      });
      if (!response.ok) throw new Error('Error al crear devolución');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Actualizar devolución
  updateDevolucion: async (id, devolucionData) => {
    try {
      const response = await fetch(`${API_URL}/devoluciones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(devolucionData),
      });
      if (!response.ok) throw new Error('Error al actualizar devolución');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Eliminar devolución
  deleteDevolucion: async (id) => {
    try {
      const response = await fetch(`${API_URL}/devoluciones/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar devolución');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },
};