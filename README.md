# 📦 Gestión Serenísima - Frontend

Aplicación web moderna para la gestión de coberturas de clientes y control de devoluciones de productos. Desarrollada con React, Vite y Chakra UI.

## ✨ Características Principales

### Módulo de Coberturas
- Gestión completa de clientes (CRUD)
- Productos organizados en dos categorías: **Danone** y **Mastellone**
- Sistema de tabs para cambio rápido entre categorías
- Seguimiento de productos con checkboxes
- Indicadores visuales de progreso (circular y barra)
- Búsqueda y filtrado en tiempo real

### Módulo de Devoluciones
- Registro de devoluciones con múltiples productos por cliente
- **Sistema de doble verificación:**
  - ✅ Check verde: Producto controlado
  - ✅ Check azul: Producto procesado en máquina
- Edición inline de código y cantidad
- Agrupación automática por fecha
- Indicador visual de completado total
- Filtros por cliente y fecha

### Características Técnicas
- ⚡ Actualización optimista para UI instantánea
- 📱 Diseño responsive mobile-first
- 🎨 Interfaz moderna con Chakra UI
- 🔄 Sincronización automática con backend

## 🛠️ Tecnologías

- React 19.2.3
- Vite 5.x
- Chakra UI
- React Router
- Emotion & Framer Motion

## 🚀 Instalación

```bash
# Instalar dependencias
npm install --legacy-peer-deps

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend

# Iniciar desarrollo
npm run dev
```

## 📁 Estructura

```
src/
├── components/         # Componentes React
│   ├── Coberturas/    # Módulo de coberturas
│   └── Devoluciones/  # Módulo de devoluciones
├── services/          # Servicios de API
└── App.jsx           # Componente principal
```

## 🔧 Variables de Entorno

```env
VITE_API_URL=http://localhost:5000/api
```

## 📦 Scripts

```bash
npm run dev      # Desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
```

## 🌐 Despliegue

Compatible con:
- Vercel
- Netlify
- GitHub Pages
- Railway
- Render

## 📄 Licencia

Proyecto privado bajo licencia propietaria.

---

Desarrollado para la gestión eficiente de coberturas y devoluciones.