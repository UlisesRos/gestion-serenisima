// src/components/shared/OfflineIndicator.jsx
// Componente que muestra el estado de conexión y las operaciones pendientes

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  HStack,
  Text,
  Badge,
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

  return (
    <Box
      position="fixed"
      top={4}
      left="50%"
      transform="translateX(-50%)"
      zIndex={9999}
      w={{ base: '90vw', md: 'auto' }}
      minW={{ md: '380px' }}
      maxW="500px"
    >
      {/* Barra principal */}
      <Box
        bg={isOnline ? (pendingCount > 0 ? 'orange.500' : 'green.500') : 'red.500'}
        color="white"
        borderRadius="xl"
        px={4}
        py={3}
        shadow="2xl"
        cursor="pointer"
        onClick={() => setShowDetails(!showDetails)}
        transition="all 0.2s"
        _hover={{ opacity: 0.95 }}
      >
        <HStack justify="space-between" spacing={3}>
          <HStack spacing={2}>
            {isOnline ? (
              pendingCount > 0 ? (
                <WarningIcon w={5} h={5} />
              ) : (
                <CheckCircleIcon w={5} h={5} />
              )
            ) : (
              <WarningIcon w={5} h={5} />
            )}
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" fontSize="sm">
                {isOnline
                  ? pendingCount > 0
                    ? '⚠️ Devoluciones sin sincronizar'
                    : '✅ Conectado'
                  : '📵 Modo Offline activo'}
              </Text>
              <Text fontSize="xs" opacity={0.9}>
                {isOnline
                  ? pendingCount > 0
                    ? `${pendingCount} ${pendingCount === 1 ? 'operación pendiente' : 'operaciones pendientes'}`
                    : 'Todo sincronizado'
                  : 'Las devoluciones se guardan localmente'}
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={2}>
            {pendingCount > 0 && (
              <Badge
                bg="white"
                color={isOnline ? 'orange.600' : 'red.600'}
                borderRadius="full"
                fontSize="sm"
                px={2}
              >
                {pendingCount}
              </Badge>
            )}
          </HStack>
        </HStack>
      </Box>

      {/* Panel expandible */}
      <Collapse in={showDetails} animateOpacity>
        <Box
          bg="white"
          border="2px solid"
          borderColor={isOnline ? 'orange.300' : 'red.300'}
          borderRadius="xl"
          mt={2}
          p={4}
          shadow="xl"
        >
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm" color="gray.600" fontWeight="medium">
              {isOnline
                ? `Tenés ${pendingCount} ${pendingCount === 1 ? 'devolución' : 'devoluciones'} guardadas localmente que todavía no se subieron al servidor.`
                : 'Estás sin internet. Todo lo que cargues se guarda en tu dispositivo y se sube automáticamente cuando vuelva la conexión.'}
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
                p={3} 
                borderRadius="md" 
                border="1px solid" 
                borderColor="red.200"
              >
                <Icon as={WarningIcon} color="red.500" />
                <Text fontSize="xs" color="red.700">
                  Podés seguir cargando devoluciones normalmente. Se van a subir solas cuando vuelva el internet.
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