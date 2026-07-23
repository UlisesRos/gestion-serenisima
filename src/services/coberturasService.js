// services/coberturasService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const coberturasService = {
  // ===== CLIENTES =====
  
  getAllClientes: async () => {
    const response = await fetch(`${API_URL}/coberturas/clientes`);
    if (!response.ok) throw new Error('Error al obtener clientes');
    return await response.json();
  },

  getCliente: async (id) => {
    const response = await fetch(`${API_URL}/coberturas/clientes/${id}`);
    if (!response.ok) throw new Error('Error al obtener cliente');
    return await response.json();
  },

  createCliente: async (clienteData) => {
    const response = await fetch(`${API_URL}/coberturas/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clienteData),
    });
    if (!response.ok) throw new Error('Error al crear cliente');
    return await response.json();
  },

  updateCliente: async (id, clienteData) => {
    const response = await fetch(`${API_URL}/coberturas/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clienteData),
    });
    if (!response.ok) throw new Error('Error al actualizar cliente');
    return await response.json();
  },

  deleteCliente: async (id) => {
    const response = await fetch(`${API_URL}/coberturas/clientes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar cliente');
    return await response.json();
  },

  // ===== BORRAR TODO =====

  borrarTodo: async () => {
    const response = await fetch(`${API_URL}/coberturas/clientes/todos`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al borrar todos los clientes');
    return await response.json();
  },

  // ===== IMPORTAR PDF =====

  /**
   * Importa un PDF de Danone o Mastellone.
   * @param {string} empresa - 'danone' | 'mastellone'
   * @param {File} archivo - el archivo PDF seleccionado por el usuario
   * @returns {{ clientesProcesados, codigosCompletados, codigosAgregados }}
   */
  importarPDF: async (empresa, archivo) => {
    const formData = new FormData();
    formData.append('pdf', archivo);

    const response = await fetch(`${API_URL}/coberturas/importar-pdf/${empresa}`, {
      method: 'POST',
      body: formData,
      // No poner Content-Type header — el browser lo setea con el boundary correcto para multipart
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error al importar el PDF');
    }

    return await response.json();
  },

  // ===== PRODUCTOS DANONE =====

  addProductoDanone: async (clienteId, codigo) => {
    const response = await fetch(`${API_URL}/coberturas/clientes/${clienteId}/productos/danone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo }),
    });
    if (!response.ok) throw new Error('Error al agregar producto');
    return await response.json();
  },

  updateProductoDanone: async (clienteId, productoId, completado) => {
    const response = await fetch(`${API_URL}/coberturas/clientes/${clienteId}/productos/danone/${productoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completado }),
    });
    if (!response.ok) throw new Error('Error al actualizar producto');
    return await response.json();
  },

  deleteProductoDanone: async (clienteId, productoId) => {
    const response = await fetch(`${API_URL}/coberturas/clientes/${clienteId}/productos/danone/${productoId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar producto');
    return await response.json();
  },

  // ===== PRODUCTOS MASTELLONE =====

  addProductoMastellone: async (clienteId, codigo) => {
    const response = await fetch(`${API_URL}/coberturas/clientes/${clienteId}/productos/mastellone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo }),
    });
    if (!response.ok) throw new Error('Error al agregar producto');
    return await response.json();
  },

  updateProductoMastellone: async (clienteId, productoId, completado) => {
    const response = await fetch(`${API_URL}/coberturas/clientes/${clienteId}/productos/mastellone/${productoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completado }),
    });
    if (!response.ok) throw new Error('Error al actualizar producto');
    return await response.json();
  },

  deleteProductoMastellone: async (clienteId, productoId) => {
    const response = await fetch(`${API_URL}/coberturas/clientes/${clienteId}/productos/mastellone/${productoId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar producto');
    return await response.json();
  },
};
