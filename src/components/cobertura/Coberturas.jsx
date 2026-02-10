import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Input,
  Select,
  IconButton,
  Text,
  useDisclosure,
  useToast,
  Flex,
  InputGroup,
  InputLeftElement,
  Spinner,
  CircularProgress,
  CircularProgressLabel,
  Badge,
  Progress,
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon, SearchIcon, EditIcon, DeleteIcon, CheckCircleIcon } from '@chakra-ui/icons';
import ClienteModal from './ClienteModal';
import { coberturasService } from '../../services/coberturasService';

function Coberturas({ onBack, onVerProductos }) {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [frecuenciaFilter, setFrecuenciaFilter] = useState('todos');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Colores para los bordes de los cards (alternando)
  const borderColors = ['#4caf50', '#f44336', '#2196f3', '#ff9800', '#9c27b0'];

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtrar clientes cuando cambian los filtros
  useEffect(() => {
    filterClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, frecuenciaFilter, clientes]);

  const loadClientes = async () => {
    setIsLoading(true);
    try {
      const data = await coberturasService.getAllClientes();
      setClientes(data);
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error al cargar clientes',
        description: 'No se pudieron cargar los clientes del servidor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterClientes = () => {
    let filtered = [...clientes];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((cliente) =>
        `${cliente.nombre} ${cliente.apellido}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por frecuencia
    if (frecuenciaFilter !== 'todos') {
      filtered = filtered.filter((cliente) => cliente.frecuencia === frecuenciaFilter);
    }

    setFilteredClientes(filtered);
  };

  const handleAddCliente = () => {
    setSelectedCliente(null);
    onOpen();
  };

  const handleEditCliente = (cliente, e) => {
    e.stopPropagation();
    setSelectedCliente(cliente);
    onOpen();
  };

  const handleDeleteCliente = async (id, e) => {
    e.stopPropagation();
    
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await coberturasService.deleteCliente(id);
        toast({
          title: 'Cliente eliminado',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        loadClientes();
      } catch (error) {
        console.error(error)
        toast({
          title: 'Error al eliminar',
          description: 'No se pudo eliminar el cliente',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleSaveCliente = async (clienteData) => {
    try {
      if (selectedCliente) {
        await coberturasService.updateCliente(selectedCliente._id, clienteData);
        toast({
          title: 'Cliente actualizado',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        await coberturasService.createCliente(clienteData);
        toast({
          title: 'Cliente agregado',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
      loadClientes();
      onClose();
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error al guardar',
        description: 'No se pudo guardar el cliente',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleClienteClick = (cliente) => {
    // Navegar a la pantalla de productos
    onVerProductos(cliente);
  };

  // Calcular porcentaje de completado para un cliente
  const calcularPorcentajeCliente = (cliente) => {
    const totalProductos = cliente.productosDanone.length + cliente.productosMastellone.length;
    if (totalProductos === 0) return 0;
    
    const completados = 
      cliente.productosDanone.filter(p => p.completado).length +
      cliente.productosMastellone.filter(p => p.completado).length;
    
    return Math.round((completados / totalProductos) * 100);
  };

  // Calcular porcentaje total de TODOS los clientes filtrados
  const calcularPorcentajeTotal = () => {
    let totalProductos = 0;
    let totalCompletados = 0;

    filteredClientes.forEach(cliente => {
      const totalDanone = cliente.productosDanone.length;
      const totalMastellone = cliente.productosMastellone.length;
      const completadosDanone = cliente.productosDanone.filter(p => p.completado).length;
      const completadosMastellone = cliente.productosMastellone.filter(p => p.completado).length;

      totalProductos += (totalDanone + totalMastellone);
      totalCompletados += (completadosDanone + completadosMastellone);
    });

    if (totalProductos === 0) return 0;
    return Math.round((totalCompletados / totalProductos) * 100);
  };

  const porcentajeTotal = calcularPorcentajeTotal();

  return (
    <Box minH="100vh" bg="white" pb={8}>
      {/* Header */}
      <Box bg="secondary.500" color="white" py={4} px={4} shadow="md">
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
            <Heading size={{ base: 'md', md: 'lg' }}>Coberturas</Heading>
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.lg" px={4} py={6}>
        <VStack spacing={6} align="stretch">
          
          {/* Botón Agregar */}
          <Button
            leftIcon={<AddIcon />}
            colorScheme="secondary"
            onClick={handleAddCliente}
            size={{ base: 'md', md: 'lg' }}
            w="100%"
          >
            Agregar Cliente
          </Button>

          {/* NUEVO: Porcentaje Total General */}
          {!isLoading && filteredClientes.length > 0 && (
            <Box 
              bg="white" 
              border="3px solid" 
              borderColor="secondary.500" 
              borderRadius="lg" 
              p={6}
              shadow="lg"
            >
              <VStack spacing={4}>
                <HStack spacing={3} w="100%" justify="center">
                  <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="accent.900">
                    Progreso Total de Coberturas
                  </Text>
                  {porcentajeTotal === 100 && (
                    <CheckCircleIcon w={6} h={6} color="green.500" />
                  )}
                </HStack>
                
                <Flex justify="center" align="center" w="100%">
                  <CircularProgress 
                    value={porcentajeTotal} 
                    size="140px" 
                    thickness="14px"
                    color={porcentajeTotal === 100 ? 'green.400' : 'secondary.500'}
                  >
                    <CircularProgressLabel fontSize="3xl" fontWeight="bold">
                      {porcentajeTotal}%
                    </CircularProgressLabel>
                  </CircularProgress>
                </Flex>

                <Box w="100%">
                  <Progress 
                    value={porcentajeTotal} 
                    size="lg" 
                    colorScheme={porcentajeTotal === 100 ? 'green' : 'secondary'}
                    borderRadius="full"
                    hasStripe
                    isAnimated
                  />
                </Box>

                <HStack spacing={4} fontSize="sm" color="gray.600">
                  <Text>
                    <strong>{filteredClientes.length}</strong> {filteredClientes.length === 1 ? 'cliente' : 'clientes'}
                  </Text>
                  <Text>•</Text>
                  <Text>
                    <strong>{filteredClientes.filter(c => calcularPorcentajeCliente(c) === 100).length}</strong> completados
                  </Text>
                </HStack>
              </VStack>
            </Box>
          )}

          {/* Filtros */}
          <VStack spacing={3} align="stretch">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Buscar por nombre o apellido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="white"
                border="2px solid"
                borderColor="gray.200"
                _focus={{ borderColor: 'secondary.500' }}
              />
            </InputGroup>

            <Select
              value={frecuenciaFilter}
              onChange={(e) => setFrecuenciaFilter(e.target.value)}
              bg="white"
              border="2px solid"
              borderColor="gray.200"
              _focus={{ borderColor: 'secondary.500' }}
            >
              <option value="todos">Todas las frecuencias</option>
              <option value="LMV">Lunes, Miércoles, Viernes</option>
              <option value="MJS">Martes, Jueves, Sábado</option>
            </Select>
          </VStack>

          {/* Lista de Clientes - Estilo Timeline */}
          {isLoading ? (
            <Flex justify="center" py={8}>
              <Spinner size="xl" color="secondary.500" thickness="4px" />
            </Flex>
          ) : filteredClientes.length === 0 ? (
            <Text textAlign="center" color="gray.500" py={8}>
              {searchTerm || frecuenciaFilter !== 'todos' 
                ? 'No se encontraron clientes con esos filtros'
                : 'No hay clientes. ¡Agrega uno!'}
            </Text>
          ) : (
            <VStack spacing={4} align="stretch" position="relative" pt={4}>
              {/* Línea vertical del timeline */}
              <Box
                position="absolute"
                left={{ base: '20px', md: '30px' }}
                top="0"
                bottom="0"
                width="3px"
                bg="gray.200"
                zIndex={0}
              />

              {filteredClientes.map((cliente, index) => {
                const borderColor = borderColors[index % borderColors.length];
                const porcentaje = calcularPorcentajeCliente(cliente);
                const totalProductos = cliente.productosDanone.length + cliente.productosMastellone.length;
                
                return (
                  <Flex key={cliente._id} gap={3} position="relative" zIndex={1}>
                    {/* Número en círculo */}
                    <Box
                      minW={{ base: '40px', md: '50px' }}
                      h={{ base: '40px', md: '50px' }}
                      bg={borderColor}
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="bold"
                      fontSize={{ base: 'lg', md: 'xl' }}
                      color="white"
                      shadow="md"
                      flexShrink={0}
                    >
                      {index + 1}
                    </Box>

                    {/* Card del cliente */}
                    <Box
                      flex={1}
                      bg="white"
                      border="3px solid"
                      borderColor={borderColor}
                      borderRadius="lg"
                      p={4}
                      shadow="md"
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{
                        transform: 'translateY(-2px)',
                        shadow: 'lg',
                      }}
                      _active={{
                        transform: 'translateY(0)',
                      }}
                      onClick={() => handleClienteClick(cliente)}
                    >
                      <Flex justify="space-between" align="start">
                        <Box flex={1}>
                          <HStack spacing={2} mb={1}>
                            <Text
                              fontSize={{ base: 'lg', md: 'xl' }}
                              fontWeight="bold"
                              color="accent.900"
                            >
                              {cliente.nombre} {cliente.apellido}
                            </Text>
                            {porcentaje === 100 && (
                              <CheckCircleIcon w={5} h={5} color="green.500" />
                            )}
                          </HStack>
                          
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            mb={2}
                          >
                            Frecuencia: {cliente.frecuencia === 'LMV' ? 'Lun, Mié, Vie' : 'Mar, Jue, Sáb'}
                          </Text>

                          {/* NUEVO: Porcentaje individual */}
                          <HStack spacing={3} align="center" mt={2}>
                            <CircularProgress 
                              value={porcentaje} 
                              size="50px" 
                              thickness="8px"
                              color={porcentaje === 100 ? 'green.400' : 'secondary.500'}
                            >
                              <CircularProgressLabel fontSize="sm" fontWeight="bold">
                                {porcentaje}%
                              </CircularProgressLabel>
                            </CircularProgress>
                            
                            <VStack align="start" spacing={0}>
                              <Badge 
                                colorScheme={porcentaje === 100 ? 'green' : 'gray'} 
                                fontSize="xs"
                              >
                                {totalProductos} {totalProductos === 1 ? 'producto' : 'productos'}
                              </Badge>
                              {totalProductos > 0 && (
                                <Text fontSize="xs" color="gray.500">
                                  {Math.round((porcentaje * totalProductos) / 100)} completados
                                </Text>
                              )}
                            </VStack>
                          </HStack>

                          {/* Barra de progreso */}
                          <Box mt={3}>
                            <Progress 
                              value={porcentaje} 
                              size="sm" 
                              colorScheme={porcentaje === 100 ? 'green' : 'secondary'}
                              borderRadius="full"
                              hasStripe={porcentaje < 100}
                              isAnimated={porcentaje < 100}
                            />
                          </Box>
                        </Box>

                        {/* Botones de acción */}
                        <HStack spacing={1}>
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={(e) => handleEditCliente(cliente, e)}
                            aria-label="Editar cliente"
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={(e) => handleDeleteCliente(cliente._id, e)}
                            aria-label="Eliminar cliente"
                          />
                        </HStack>
                      </Flex>
                    </Box>
                  </Flex>
                );
              })}
            </VStack>
          )}
        </VStack>
      </Container>

      {/* Modal para Agregar/Editar */}
      <ClienteModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSaveCliente}
        cliente={selectedCliente}
      />
    </Box>
  );
}

export default Coberturas;