// src/components/shared/OfflineIndicator.jsx
// Componente que muestra el estado de conexión y las operaciones pendientes

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  HStack,
  Text,
  Button,
  Collapse,
  VStack,
  Icon,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { WarningIcon, CheckCircleIcon, RepeatIcon } from '@chakra-ui/icons';
import { initSyncListener, syncPendingOperations, checkOnlineStatus } from '../../services/syncService';
import { getPendingCount } from '../../services/syncService';

function OfflineIndicator({ onSyncComplete }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const toast = useToast();

  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  }, []);

  const handleManualSync = async () => {
    const online = await checkOnlineStatus();
    if (!online) {
      toast({
        title: 'Sin conexión',
        description: 'No hay internet disponible para sincronizar',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncPendingOperations();
      await refreshPendingCount();
      
      if (result.synced > 0) {
        toast({
          title: '¡Sincronización exitosa!',
          description: `${result.synced} ${result.synced === 1 ? 'devolución subida' : 'devoluciones subidas'} al servidor`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        onSyncComplete?.();
      }

      if (result.failed > 0) {
        toast({
          title: 'Algunas operaciones fallaron',
          description: `${result.failed} operaciones no pudieron sincronizarse`,
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error al sincronizar',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Estado inicial
    checkOnlineStatus().then(setIsOnline);
    refreshPendingCount();

    // Listeners de red
    const cleanup = initSyncListener(
      // onOnline
      async () => {
        setIsOnline(true);
        toast({
          title: '📶 Conexión restaurada',
          description: 'Sincronizando datos pendientes...',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      },
      // onOffline
      () => {
        setIsOnline(false);
        toast({
          title: '📵 Sin conexión',
          description: 'Modo offline activo. Los datos se guardarán localmente.',
          status: 'warning',
          duration: 4000,
          isClosable: true,
        });
      },
      // onSyncComplete
      async (result) => {
        await refreshPendingCount();
        if (result.synced > 0) {
          toast({
            title: '✅ Datos sincronizados',
            description: `${result.synced} ${result.synced === 1 ? 'devolución subida' : 'devoluciones subidas'} automáticamente`,
            status: 'success',
            duration: 4000,
            isClosable: true,
          });
          onSyncComplete?.();
        }
      }
    );

    // Refrescar contador periódicamente
    const interval = setInterval(refreshPendingCount, 5000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [refreshPendingCount, toast, onSyncComplete]);

  // No mostrar nada si está online y no hay pendientes
  if (isOnline && pendingCount === 0) return null;

  const bgColor = isOnline ? (pendingCount > 0 ? 'orange.500' : 'green.500') : 'red.500';
  const borderColor = isOnline ? (pendingCount > 0 ? 'orange.300' : 'green.300') : 'red.300';

  return (
    <Box
      position="fixed"
      top={3}
      right={3}
      zIndex={9999}
    >
      {/* Píldora chica — siempre visible */}
      <Box
        bg={bgColor}
        color="white"
        borderRadius="full"
        px={3}
        py={1.5}
        shadow="lg"
        cursor="pointer"
        onClick={() => setShowDetails(!showDetails)}
        transition="all 0.2s"
        _hover={{ opacity: 0.9, transform: 'scale(1.05)' }}
        _active={{ transform: 'scale(0.97)' }}
      >
        <HStack spacing={1.5}>
          {isOnline
            ? pendingCount > 0
              ? <WarningIcon w={3} h={3} />
              : <CheckCircleIcon w={3} h={3} />
            : <WarningIcon w={3} h={3} />
          }
          <Text fontWeight="bold" fontSize="xs" lineHeight={1}>
            {isOnline
              ? pendingCount > 0
                ? `${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}`
                : 'Sincronizado'
              : 'Offline'}
          </Text>
        </HStack>
      </Box>

      {/* Panel expandido al tocar */}
      <Collapse in={showDetails} animateOpacity>
        <Box
          bg="white"
          border="2px solid"
          borderColor={borderColor}
          borderRadius="xl"
          mt={2}
          p={4}
          shadow="2xl"
          w="260px"
        >
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm" fontWeight="bold" color="gray.700">
              {isOnline
                ? pendingCount > 0
                  ? '⚠️ Sin sincronizar'
                  : '✅ Todo sincronizado'
                : '📵 Modo offline'}
            </Text>

            <Text fontSize="xs" color="gray.600">
              {isOnline
                ? `Tenés ${pendingCount} ${pendingCount === 1 ? 'devolución guardada' : 'devoluciones guardadas'} localmente que todavía no se subieron al servidor.`
                : 'Sin internet. Todo lo que cargues se guarda en tu dispositivo y se sube solo cuando vuelva la conexión.'}
            </Text>

            {isOnline && pendingCount > 0 && (
              <Button
                colorScheme="orange"
                size="sm"
                leftIcon={isSyncing ? <Spinner size="xs" /> : <RepeatIcon />}
                onClick={handleManualSync}
                isLoading={isSyncing}
                loadingText="Sincronizando..."
              >
                Sincronizar ahora
              </Button>
            )}

            {!isOnline && (
              <HStack
                bg="red.50"
                p={2}
                borderRadius="md"
                border="1px solid"
                borderColor="red.200"
              >
                <Icon as={WarningIcon} color="red.500" w={3} h={3} flexShrink={0} />
                <Text fontSize="xs" color="red.700">
                  Podés seguir cargando devoluciones normalmente.
                </Text>
              </HStack>
            )}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
}

export default OfflineIndicator;