// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    primary: {
      50: '#ffebee', 100: '#ffcdd2', 200: '#ef9a9a', 300: '#e57373',
      400: '#ef5350', 500: '#f44336', 600: '#e53935', 700: '#d32f2f',
      800: '#c62828', 900: '#b71c1c',
    },
    secondary: {
      50: '#e8f5e9', 100: '#c8e6c9', 200: '#a5d6a7', 300: '#81c784',
      400: '#66bb6a', 500: '#4caf50', 600: '#43a047', 700: '#388e3c',
      800: '#2e7d32', 900: '#1b5e20',
    },
    accent: {
      50: '#fafafa', 100: '#f5f5f5', 200: '#eeeeee', 300: '#e0e0e0',
      400: '#bdbdbd', 500: '#9e9e9e', 600: '#757575', 700: '#616161',
      800: '#424242', 900: '#212121',
    },
  },
  fonts: {
    heading: `"Anton SC", sans-serif`,
    body: `"Urbanist", sans-serif`,
  },
  styles: {
    global: {
      body: { bg: 'white', color: 'accent.900' },
    },
  },
  components: {
    Button: { defaultProps: { colorScheme: 'primary' } },
    Heading: { baseStyle: { fontWeight: '600' } },
  },
});

// Registrar Service Worker PWA
const updateSW = registerSW({
  onNeedRefresh() {
    updateSW(true); // actualizar silenciosamente
  },
  onOfflineReady() {
    console.log('[PWA] App lista para funcionar offline');
  },
  onRegistered() {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SYNC_COMPLETE') {
          window.dispatchEvent(new CustomEvent('sw-sync-complete'));
        }
      });
    }
  },
  onRegisterError(error) {
    console.error('[PWA] Error al registrar SW:', error);
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);