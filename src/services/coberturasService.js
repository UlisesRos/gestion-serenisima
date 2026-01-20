// services/coberturasService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const coberturasService = {
  // Obtener todos los clientes
  getAllClientes: async () => {
    try {
      const response = await fetch(`${API_URL}/coberturas/clientes`);
      if (!response.ok) throw new Error('Error al obtener clientes');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Crear nuevo cliente
  createCliente: async (clienteData) => {
    try {
      const response = await fetch(`${API_URL}/coberturas/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clienteData),
      });
      if (!response.ok) throw new Error('Error al crear cliente');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Actualizar cliente
  updateCliente: async (id, clienteData) => {
    try {
      const response = await fetch(`${API_URL}/coberturas/clientes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clienteData),
      });
      if (!response.ok) throw new Error('Error al actualizar cliente');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Eliminar cliente
  deleteCliente: async (id) => {
    try {
      const response = await fetch(`${API_URL}/coberturas/clientes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar cliente');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },
};