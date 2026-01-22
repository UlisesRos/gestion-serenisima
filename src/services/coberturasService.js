// services/coberturasService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const coberturasService = {
  // ===== CLIENTES =====
  
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

  getCliente: async (id) => {
    try {
      const response = await fetch(`${API_URL}/coberturas/clientes/${id}`);
      if (!response.ok) throw new Error('Error al obtener cliente');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

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

  // ===== PRODUCTOS DANONE =====

  addProductoDanone: async (clienteId, codigo) => {
    try {
      const response = await fetch(`${API_URL}/coberturas/clientes/${clienteId}/productos/danone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo }),
      });
      if (!response.ok) throw new Error('Error al agregar producto');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  updateProductoDanone: async (clienteId, productoId, completado) => {
    try {
      const response = await fetch(`${API_URL}/coberturas/clientes/${clienteId}/productos/danone/${productoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completado }),
      });
      if (!response.ok) throw new Error('Error al actualizar producto');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  deleteProductoDanone: async (clienteId, productoId) => {
    try {
      const response = await fetch(`${API_URL}/coberturas/clientes/${clienteId}/productos/danone/${productoId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar producto');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // ===== PRODUCTOS MASTELLONE =====

  addProductoMastellone: async (clienteId, codigo) => {
    try {
      const response = await fetch(`${API_URL}/coberturas/clientes/${clienteId}/productos/mastellone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo }),
      });
      if (!response.ok) throw new Error('Error al agregar producto');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  updateProductoMastellone: async (clienteId, productoId, completado) => {
    try {
      const response = await fetch(`${API_URL}/coberturas/clientes/${clienteId}/productos/mastellone/${productoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completado }),
      });
      if (!response.ok) throw new Error('Error al actualizar producto');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  deleteProductoMastellone: async (clienteId, productoId) => {
    try {
      const response = await fetch(`${API_URL}/coberturas/clientes/${clienteId}/productos/mastellone/${productoId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar producto');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },
};