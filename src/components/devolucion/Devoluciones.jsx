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
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon, SearchIcon } from '@chakra-ui/icons';
import DevolucionModal from './DevolucionModal';
import DevolucionCard from './DevolucionCard';
import { devolucionesService } from '../../services/devolucionesService';

function Devoluciones({ onBack }) {
  const [devoluciones, setDevoluciones] = useState([]);
  const [selectedDevolucion, setSelectedDevolucion] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const borderColors = ['#4caf50', '#f44336', '#2196f3', '#ff9800', '#9c27b0'];

  const loadDevoluciones = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters = {};
      if (searchName) filters.nombre = searchName;
      if (searchDate) filters.fecha = searchDate;
      
      const data = await devolucionesService.getAllDevoluciones(filters);
      setDevoluciones(data);
    } catch {
      toast({
        title: 'Error al cargar devoluciones',
        description: 'No se pudieron cargar las devoluciones del servidor',
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

  const handleAddDevolucion = () => {
    setSelectedDevolucion(null);
    onOpen();
  };

  const handleSaveDevolucion = async (devolucionData) => {
    try {
      if (selectedDevolucion) {
        await devolucionesService.updateDevolucion(selectedDevolucion._id, devolucionData);
        toast({
          title: 'Devolución actualizada',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        await devolucionesService.createDevolucion(devolucionData);
        toast({
          title: 'Devolución agregada',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
      loadDevoluciones();
      onClose();
    } catch {
      toast({
        title: 'Error al guardar',
        description: 'No se pudo guardar la devolución',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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
        toast({
          title: 'Devolución eliminada',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        loadDevoluciones();
      } catch {
        toast({
          title: 'Error al eliminar',
          description: 'No se pudo eliminar la devolución',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleToggleControlado = async (devolucionId, productoId) => {
    setDevoluciones(prevDevoluciones => 
      prevDevoluciones.map(dev => {
        if (dev._id === devolucionId) {
          return {
            ...dev,
            productos: dev.productos.map(prod => 
              prod._id === productoId 
                ? { ...prod, controlado: !prod.controlado }
                : prod
            )
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
        description: 'No se pudo actualizar el estado',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleToggleMaquina = async (devolucionId, productoId) => {
    setDevoluciones(prevDevoluciones => 
      prevDevoluciones.map(dev => {
        if (dev._id === devolucionId) {
          return {
            ...dev,
            productos: dev.productos.map(prod => 
              prod._id === productoId 
                ? { ...prod, pasadoMaquina: !prod.pasadoMaquina }
                : prod
            )
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
        description: 'No se pudo actualizar el estado',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateProducto = async (devolucionId, productoId, data) => {
    setDevoluciones(prevDevoluciones => 
      prevDevoluciones.map(dev => {
        if (dev._id === devolucionId) {
          return {
            ...dev,
            productos: dev.productos.map(prod => 
              prod._id === productoId 
                ? { ...prod, ...data }
                : prod
            )
          };
        }
        return dev;
      })
    );

    try {
      await devolucionesService.updateProducto(devolucionId, productoId, data);
      toast({
        title: 'Producto actualizado',
        status: 'success',
        duration: 1500,
        isClosable: true,
      });
    } catch {
      loadDevoluciones();
      toast({
        title: 'Error al actualizar',
        description: 'No se pudo actualizar el producto',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Función para formatear fecha SIN conversión de zona horaria
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    // Usar getUTCDate, getUTCMonth, getUTCFullYear para mantener la fecha UTC
    const dia = fecha.getUTCDate();
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const mes = meses[fecha.getUTCMonth()];
    const año = fecha.getUTCFullYear();
    
    return `${dia} de ${mes} de ${año}`;
  };

  // Agrupar devoluciones por fecha (usando UTC)
  const devolucionesPorFecha = devoluciones.reduce((acc, dev) => {
    const fechaFormateada = formatearFecha(dev.fecha);
    
    if (!acc[fechaFormateada]) {
      acc[fechaFormateada] = [];
    }
    acc[fechaFormateada].push(dev);
    return acc;
  }, {});

  // Ordenar fechas de más reciente a más antigua
  const fechasOrdenadas = Object.keys(devolucionesPorFecha).sort((a, b) => {
    const fechaA = devoluciones.find(d => formatearFecha(d.fecha) === a)?.fecha;
    const fechaB = devoluciones.find(d => formatearFecha(d.fecha) === b)?.fecha;
    return new Date(fechaB) - new Date(fechaA);
  });

  return (
    <Box minH="100vh" bg="white" pb={8}>
      {/* Header */}
      <Box bg="primary.500" color="white" py={4} px={4} shadow="md">
        <Container maxW="container.lg" px={0}>
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
        </Container>
      </Box>

      <Container maxW="container.lg" px={4} py={6}>
        <VStack spacing={6} align="stretch">
          
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

            {/* Indicador de filtros activos */}
            {(searchName || searchDate) && (
              <HStack>
                <Text fontSize="sm" color="gray.600">
                  Mostrando {devoluciones.length} resultado(s)
                </Text>
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => {
                    setSearchName('');
                    setSearchDate('');
                  }}
                >
                  Limpiar filtros
                </Button>
              </HStack>
            )}
          </VStack>

          {/* Lista agrupada por fechas */}
          {isLoading ? (
            <Flex justify="center" py={8}>
              <Spinner size="xl" color="primary.500" thickness="4px" />
            </Flex>
          ) : fechasOrdenadas.length === 0 ? (
            <Text textAlign="center" color="gray.500" py={8}>
              {searchName || searchDate 
                ? 'No se encontraron devoluciones con esos filtros'
                : 'No hay devoluciones registradas'}
            </Text>
          ) : (
            <VStack spacing={8} align="stretch">
              {fechasOrdenadas.map((fecha) => {
                const devolucionesDia = devolucionesPorFecha[fecha];
                
                return (
                  <Box key={fecha}>
                    {/* Header de Fecha */}
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
                      <Divider ml={3} />
                    </Flex>

                    {/* Cards de clientes */}
                    <VStack spacing={3} align="stretch">
                      {devolucionesDia.map((devolucion, index) => {
                        const borderColor = borderColors[index % borderColors.length];
                        
                        return (
                          <DevolucionCard
                            key={devolucion._id}
                            devolucion={devolucion}
                            borderColor={borderColor}
                            onEdit={() => handleEditDevolucion(devolucion)}
                            onDelete={() => handleDeleteDevolucion(devolucion._id)}
                            onToggleControlado={handleToggleControlado}
                            onToggleMaquina={handleToggleMaquina}
                            onUpdateProducto={handleUpdateProducto}
                          />
                        );
                      })}
                    </VStack>
                  </Box>
                );
              })}
            </VStack>
          )}
        </VStack>
      </Container>

      {/* Modal para Agregar/Editar */}
      <DevolucionModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSaveDevolucion}
        devolucion={selectedDevolucion}
      />
    </Box>
  );
}

export default Devoluciones;