// src/components/devolucion/Devoluciones.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  IconButton,
  Text,
  useDisclosure,
  useToast,
  Flex,
  Divider,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon, SearchIcon, WarningIcon } from '@chakra-ui/icons';
import DevolucionModal from './DevolucionModal';
import DevolucionCard from './DevolucionCard';
import { devolucionesService } from '../../services/devolucionesService';
import OfflineIndicator from '../shared/OfflineIndicator';
import { checkOnlineStatus } from '../../services/syncService';

function Devoluciones({ onBack }) {
  const [devoluciones, setDevoluciones] = useState([]);
  const [selectedDevolucion, setSelectedDevolucion] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const borderColors = ['#4caf50', '#f44336', '#2196f3', '#ff9800', '#9c27b0'];

  const loadDevoluciones = useCallback(async () => {
    setIsLoading(true);
    try {
      const online = await checkOnlineStatus();
      setIsOnline(online);

      const filters = {};
      if (searchName) filters.nombre = searchName;
      if (searchDate) filters.fecha = searchDate;
      
      const data = await devolucionesService.getAllDevoluciones(filters);
      setDevoluciones(data);
    } catch {
      toast({
        title: 'Error al cargar devoluciones',
        description: 'No se pudieron cargar las devoluciones',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchName, searchDate, toast]);

  useEffect(() => {
    loadDevoluciones();
  }, [loadDevoluciones]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, searchDate]);

  // Escuchar cambios de conectividad
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAddDevolucion = () => {
    setSelectedDevolucion(null);
    onOpen();
  };

  const handleSaveDevolucion = async (devolucionData) => {
    try {
      if (selectedDevolucion) {
        const updated = await devolucionesService.updateDevolucion(
          selectedDevolucion._id,
          devolucionData
        );
        setDevoluciones(prev =>
          prev.map(d => d._id === selectedDevolucion._id ? { ...d, ...updated } : d)
        );
        toast({
          title: isOnline ? 'Devolución actualizada' : '💾 Devolución guardada localmente',
          description: !isOnline ? 'Se subirá al servidor cuando vuelva la conexión' : undefined,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const nueva = await devolucionesService.createDevolucion(devolucionData);
        // Agregar al inicio de la lista para que aparezca primero
        setDevoluciones(prev => [nueva, ...prev]);
        toast({
          title: isOnline ? '✅ Devolución agregada' : '💾 Devolución guardada sin conexión',
          description: !isOnline
            ? 'Se guardó en tu dispositivo. Se subirá al servidor cuando vuelva el internet.'
            : undefined,
          status: isOnline ? 'success' : 'info',
          duration: 4000,
          isClosable: true,
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: 'Error al guardar',
        description: 'No se pudo guardar. Los datos quedaron en el formulario para que puedas intentarlo de nuevo.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      throw error; // Re-lanzar para que DevolucionModal detecte el fallo y no resetee el estado
    }
  };

  const handleEditDevolucion = (devolucion) => {
    setSelectedDevolucion(devolucion);
    onOpen();
  };

  const handleDeleteDevolucion = async (id) => {
    if (window.confirm('¿Eliminar esta devolución?')) {
      try {
        await devolucionesService.deleteDevolucion(id);
        setDevoluciones(prev => prev.filter(d => d._id !== id));
        toast({
          title: isOnline ? 'Devolución eliminada' : 'Eliminación pendiente',
          description: !isOnline ? 'Se eliminará del servidor cuando vuelva la conexión' : undefined,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } catch {
        toast({
          title: 'Error al eliminar',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleToggleControlado = async (devolucionId, productoId) => {
    // Actualización optimista local
    setDevoluciones(prev =>
      prev.map(dev => {
        if (dev._id === devolucionId) {
          return {
            ...dev,
            productos: dev.productos.map(prod =>
              prod._id === productoId ? { ...prod, controlado: !prod.controlado } : prod
            ),
          };
        }
        return dev;
      })
    );

    try {
      await devolucionesService.toggleControlado(devolucionId, productoId);
    } catch {
      loadDevoluciones();
      toast({
        title: 'Error al actualizar',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleToggleMaquina = async (devolucionId, productoId) => {
    setDevoluciones(prev =>
      prev.map(dev => {
        if (dev._id === devolucionId) {
          return {
            ...dev,
            productos: dev.productos.map(prod =>
              prod._id === productoId ? { ...prod, pasadoMaquina: !prod.pasadoMaquina } : prod
            ),
          };
        }
        return dev;
      })
    );

    try {
      await devolucionesService.toggleMaquina(devolucionId, productoId);
    } catch {
      loadDevoluciones();
      toast({
        title: 'Error al actualizar',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateProducto = async (devolucionId, productoId, data) => {
    setDevoluciones(prev =>
      prev.map(dev => {
        if (dev._id === devolucionId) {
          return {
            ...dev,
            productos: dev.productos.map(prod =>
              prod._id === productoId ? { ...prod, ...data } : prod
            ),
          };
        }
        return dev;
      })
    );

    try {
      await devolucionesService.updateProducto(devolucionId, productoId, data);
      toast({ title: 'Producto actualizado', status: 'success', duration: 1500, isClosable: true });
    } catch {
      loadDevoluciones();
      toast({ title: 'Error al actualizar', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const dia = fecha.getUTCDate();
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const mes = meses[fecha.getUTCMonth()];
    const año = fecha.getUTCFullYear();
    return `${dia} de ${mes} de ${año}`;
  };

  const devolucionesPorFecha = devoluciones.reduce((acc, dev) => {
    const fechaFormateada = formatearFecha(dev.fecha);
    if (!acc[fechaFormateada]) acc[fechaFormateada] = [];
    acc[fechaFormateada].push(dev);
    return acc;
  }, {});

  const todasLasFechas = Object.keys(devolucionesPorFecha).sort((a, b) => {
    const fechaA = devoluciones.find(d => formatearFecha(d.fecha) === a)?.fecha;
    const fechaB = devoluciones.find(d => formatearFecha(d.fecha) === b)?.fecha;
    return new Date(fechaB) - new Date(fechaA);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const fechasPaginadas = todasLasFechas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(todasLasFechas.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box minH="100vh" bg="white" pb={24}>
      {/* Header */}
      <Box bg="primary.500" color="white" py={4} px={4} shadow="md">
        <Container maxW="container.lg" px={0}>
          <HStack spacing={3} justify="space-between">
            <HStack spacing={3}>
              <IconButton
                icon={<ArrowBackIcon />}
                onClick={onBack}
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                aria-label="Volver"
              />
              <Heading size={{ base: 'md', md: 'lg' }}>Devoluciones</Heading>
            </HStack>

            {/* Indicador de estado en el header */}
            {!isOnline && (
              <HStack
                bg="whiteAlpha.200"
                px={3}
                py={1}
                borderRadius="full"
                spacing={1}
              >
                <Icon as={WarningIcon} w={3} h={3} />
                <Text fontSize="xs" fontWeight="bold">OFFLINE</Text>
              </HStack>
            )}
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.lg" px={4} py={6}>
        <VStack spacing={6} align="stretch">

          {/* Banner offline */}
          {!isOnline && (
            <Box
              bg="orange.50"
              border="2px solid"
              borderColor="orange.300"
              borderRadius="lg"
              p={4}
            >
              <HStack spacing={3}>
                <Icon as={WarningIcon} color="orange.500" w={5} h={5} flexShrink={0} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" color="orange.700" fontSize="sm">
                    Modo offline activo
                  </Text>
                  <Text color="orange.600" fontSize="xs">
                    Podés cargar devoluciones normalmente. Se guardan en tu dispositivo y se suben solos cuando vuelva el internet.
                  </Text>
                </VStack>
              </HStack>
            </Box>
          )}

          {/* Botón Agregar */}
          <Button
            leftIcon={<AddIcon />}
            colorScheme="primary"
            onClick={handleAddDevolucion}
            size={{ base: 'md', md: 'lg' }}
            w="100%"
          >
            Agregar Devolución
          </Button>

          {/* Filtros */}
          <VStack spacing={3} align="stretch">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Buscar por nombre del cliente..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                bg="white"
                border="2px solid"
                borderColor="gray.200"
                _focus={{ borderColor: 'primary.500' }}
              />
            </InputGroup>

            <Input
              type="date"
              placeholder="Filtrar por fecha"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              bg="white"
              border="2px solid"
              borderColor="gray.200"
              _focus={{ borderColor: 'primary.500' }}
            />

            {(searchName || searchDate) && (
              <HStack>
                <Text fontSize="sm" color="gray.600">
                  Mostrando {todasLasFechas.length} fecha(s) con resultados
                </Text>
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => { setSearchName(''); setSearchDate(''); }}
                >
                  Limpiar filtros
                </Button>
              </HStack>
            )}
          </VStack>

          {/* Lista */}
          {isLoading ? (
            <Flex justify="center" py={8}>
              <Spinner size="xl" color="primary.500" thickness="4px" />
            </Flex>
          ) : todasLasFechas.length === 0 ? (
            <Text textAlign="center" color="gray.500" py={8}>
              {searchName || searchDate
                ? 'No se encontraron devoluciones con esos filtros'
                : 'No hay devoluciones registradas'}
            </Text>
          ) : (
            <>
              <VStack spacing={8} align="stretch">
                {fechasPaginadas.map((fecha, fechaIndex) => {
                  const devolucionesDia = devolucionesPorFecha[fecha];

                  return (
                    <Box key={fecha}>
                      {fechaIndex > 0 && (
                        <Divider mb={8} borderWidth="2px" borderColor="gray.300" />
                      )}

                      <Flex align="center" mb={4}>
                        <Badge
                          colorScheme="primary"
                          fontSize={{ base: 'sm', md: 'md' }}
                          px={3}
                          py={1}
                          borderRadius="md"
                        >
                          {fecha}
                        </Badge>
                        <Badge colorScheme="gray" fontSize="xs" ml={2}>
                          {devolucionesDia.length} {devolucionesDia.length === 1 ? 'devolución' : 'devoluciones'}
                        </Badge>
                        <Divider ml={3} />
                      </Flex>

                      <VStack spacing={3} align="stretch">
                        {devolucionesDia.map((devolucion, index) => {
                          const borderColor = borderColors[index % borderColors.length];

                          return (
                            <Box key={devolucion._id} position="relative">
                              {/* Indicador de offline en la card */}
                              {devolucion._isOffline && (
                                <Badge
                                  position="absolute"
                                  top={-2}
                                  right={2}
                                  zIndex={1}
                                  colorScheme="orange"
                                  fontSize="xs"
                                >
                                  💾 Sin sincronizar
                                </Badge>
                              )}
                              <DevolucionCard
                                devolucion={devolucion}
                                borderColor={devolucion._isOffline ? '#ed8936' : borderColor}
                                onEdit={() => handleEditDevolucion(devolucion)}
                                onDelete={() => handleDeleteDevolucion(devolucion._id)}
                                onToggleControlado={handleToggleControlado}
                                onToggleMaquina={handleToggleMaquina}
                                onUpdateProducto={handleUpdateProducto}
                              />
                            </Box>
                          );
                        })}
                      </VStack>
                    </Box>
                  );
                })}
              </VStack>

              {totalPages > 1 && (
                <Flex justify="center" align="center" gap={2} mt={6}>
                  <Button
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    isDisabled={currentPage === 1}
                    colorScheme="primary"
                    variant="outline"
                  >
                    Anterior
                  </Button>

                  <HStack spacing={1}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        colorScheme="primary"
                        variant={currentPage === page ? 'solid' : 'ghost'}
                      >
                        {page}
                      </Button>
                    ))}
                  </HStack>

                  <Button
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    isDisabled={currentPage === totalPages}
                    colorScheme="primary"
                    variant="outline"
                  >
                    Siguiente
                  </Button>
                </Flex>
              )}

              <Text textAlign="center" fontSize="sm" color="gray.600">
                Mostrando {fechasPaginadas.length} de {todasLasFechas.length} fechas
              </Text>
            </>
          )}
        </VStack>
      </Container>

      {/* Modal */}
      <DevolucionModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSaveDevolucion}
        devolucion={selectedDevolucion}
      />

      {/* Indicador flotante offline/sync */}
      <OfflineIndicator onSyncComplete={loadDevoluciones} />
    </Box>
  );
}

export default Devoluciones;