// services/coberturasService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const coberturasService = {
  // ===== CLIENTES =====
  
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

  // Obtener un cliente por ID
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

  // ===== PRODUCTOS =====

  // Agregar producto a un cliente
  addProducto: async (clienteId, codigo) => {
    try {
      const response = await fetch(`${API_URL}/coberturas/clientes/${clienteId}/productos`, {
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

  // Actualizar estado de un producto
  updateProducto: async (clienteId, productoId, completado) => {
    try {
      const response = await fetch(`${API_URL}/coberturas/clientes/${clienteId}/productos/${productoId}`, {
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

  // Eliminar producto de un cliente
  deleteProducto: async (clienteId, productoId) => {
    try {
      const response = await fetch(`${API_URL}/coberturas/clientes/${clienteId}/productos/${productoId}`, {
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