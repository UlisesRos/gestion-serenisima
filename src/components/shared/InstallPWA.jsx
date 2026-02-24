// src/components/shared/InstallPWA.jsx
// Botón para instalar la app en el celular como si fuera nativa

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  VStack,
  IconButton,
  Slide,
  Icon,
} from '@chakra-ui/react';
import { CloseIcon, DownloadIcon } from '@chakra-ui/icons';

function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar si ya está instalada como PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detectar iOS (Safari no soporta beforeinstallprompt)
    const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(iOS);

    // Si ya fue descartado antes, no mostrar
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) return;

    if (iOS) {
      // En iOS mostrar instrucciones manuales después de 3 segundos
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // En Android/Chrome: escuchar el evento nativo
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isInstalled || !showBanner) return null;

  return (
    <Slide direction="bottom" in={showBanner} style={{ zIndex: 9998 }}>
      <Box
        bg="white"
        borderTop="3px solid"
        borderColor="secondary.500"
        px={4}
        py={4}
        shadow="2xl"
        mb={0}
      >
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1} flex={1}>
            <HStack spacing={2}>
              <Text fontSize="2xl">📱</Text>
              <Text fontWeight="bold" fontSize="sm" color="accent.900">
                Instalá la app en tu celular
              </Text>
            </HStack>

            {isIOS ? (
              <Text fontSize="xs" color="gray.600">
                Tocá el botón{' '}
                <Text as="span" fontWeight="bold">
                  Compartir{' '}
                </Text>
                <Icon viewBox="0 0 24 24" w={3} h={3} display="inline">
                  <path
                    fill="currentColor"
                    d="M12 2l-4 4h3v7h2V6h3l-4-4zm-6 9v7h12v-7h-2v5H8v-5H6z"
                  />
                </Icon>{' '}
                y después{' '}
                <Text as="span" fontWeight="bold">
                  "Agregar a pantalla de inicio"
                </Text>
              </Text>
            ) : (
              <Text fontSize="xs" color="gray.600">
                Funciona sin internet y se abre como una app normal
              </Text>
            )}
          </VStack>

          <HStack spacing={2}>
            {!isIOS && (
              <Button
                colorScheme="secondary"
                size="sm"
                leftIcon={<DownloadIcon />}
                onClick={handleInstall}
              >
                Instalar
              </Button>
            )}
            <IconButton
              icon={<CloseIcon />}
              size="xs"
              variant="ghost"
              colorScheme="gray"
              onClick={handleDismiss}
              aria-label="Cerrar"
            />
          </HStack>
        </HStack>
      </Box>
    </Slide>
  );
}

export default InstallPWA;