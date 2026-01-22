import { useState, useEffect } from 'react';
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
  Checkbox,
  Flex,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon, DeleteIcon } from '@chakra-ui/icons';
import ProductoModal from './ProductoModal';
import { coberturasService } from '../../services/coberturasService';

function ProductosCobertura({ cliente, onBack }) {
  const [clienteData, setClienteData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const borderColors = ['#ff9800', '#9c27b0', '#f44336', '#ffeb3b', '#e91e63', '#00bcd4'];

  useEffect(() => {
    loadCliente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente._id]);

  const loadCliente = async () => {
    setIsLoading(true);
    try {
      const data = await coberturasService.getCliente(cliente._id);
      setClienteData(data);
    } catch {
      toast({
        title: 'Error al cargar productos',
        description: 'No se pudieron cargar los productos del cliente',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTipoActual = () => {
    return tabIndex === 0 ? 'danone' : 'mastellone';
  };

  const handleAddProducto = async (codigo) => {
    try {
      const tipo = getTipoActual();
      
      if (tipo === 'danone') {
        const updated = await coberturasService.addProductoDanone(cliente._id, codigo);
        // Actualizar estado local con la respuesta del servidor
        setClienteData(updated);
      } else {
        const updated = await coberturasService.addProductoMastellone(cliente._id, codigo);
        setClienteData(updated);
      }
      
      toast({
        title: 'Producto agregado',
        status: 'success',
        duration: 1500,
        isClosable: true,
      });
      
    } catch {
      toast({
        title: 'Error al agregar producto',
        description: 'No se pudo agregar el producto',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleToggleProducto = async (producto) => {
    try {
      if (!producto._id) {
        toast({
          title: 'Error',
          description: 'El producto no tiene un ID válido',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const tipo = getTipoActual();
      const listKey = tipo === 'danone' ? 'productosDanone' : 'productosMastellone';
      
      // OPTIMIZACIÓN: Actualizar estado local primero (instantáneo)
      setClienteData(prev => ({
        ...prev,
        [listKey]: prev[listKey].map(p => 
          p._id === producto._id 
            ? { ...p, completado: !p.completado }
            : p
        )
      }));

      // Sincronizar con servidor en segundo plano
      if (tipo === 'danone') {
        await coberturasService.updateProductoDanone(
          cliente._id,
          producto._id,
          !producto.completado
        );
      } else {
        await coberturasService.updateProductoMastellone(
          cliente._id,
          producto._id,
          !producto.completado
        );
      }
      
    } catch (error) {
      // Si falla, recargar del servidor
      loadCliente();
      console.error('Error al actualizar producto:', error);
      toast({
        title: 'Error al actualizar producto',
        description: 'No se pudo actualizar el estado del producto',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteProducto = async (productoId, e) => {
    e.stopPropagation();
    
    if (window.confirm('¿Eliminar este producto?')) {
      try {
        const tipo = getTipoActual();
        
        if (tipo === 'danone') {
          const updated = await coberturasService.deleteProductoDanone(cliente._id, productoId);
          setClienteData(updated);
        } else {
          const updated = await coberturasService.deleteProductoMastellone(cliente._id, productoId);
          setClienteData(updated);
        }
        
        toast({
          title: 'Producto eliminado',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        
      } catch {
        toast({
          title: 'Error al eliminar',
          description: 'No se pudo eliminar el producto',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleTabChange = (index) => {
    setTabIndex(index);
  };

  if (isLoading || !clienteData) {
    return (
      <Box minH="100vh" bg="white" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="secondary.500" thickness="4px" />
      </Box>
    );
  }

  const productosDanone = clienteData.productosDanone || [];
  const productosMastellone = clienteData.productosMastellone || [];

  return (
    <Box minH="100vh" bg="white" pb={8}>
      {/* Header */}
      <Box bg="secondary.500" color="white" py={4} px={4} shadow="md">
        <Container maxW="container.lg" px={0}>
          <VStack align="stretch" spacing={2}>
            <HStack spacing={3}>
              <IconButton
                icon={<ArrowBackIcon />}
                onClick={onBack}
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                aria-label="Volver"
              />
              <Heading size={{ base: 'md', md: 'lg' }}>
                {clienteData.nombre} {clienteData.apellido}
              </Heading>
            </HStack>
            <Text fontSize={{ base: 'sm', md: 'md' }} pl={12} opacity={0.9}>
              Productos de Cobertura
            </Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.lg" px={4} py={6}>
        <VStack spacing={6} align="stretch">
          
          {/* Tabs Danone / Mastellone */}
          <Tabs 
            index={tabIndex}
            onChange={handleTabChange} 
            variant="soft-rounded" 
            colorScheme="secondary"
            size={{ base: 'sm', md: 'md' }}
          >
            <TabList>
              <Tab fontWeight="bold" _selected={{ bg: 'secondary.500', color: 'white' }}>
                🥛 Danone
              </Tab>
              <Tab fontWeight="bold" _selected={{ bg: 'secondary.500', color: 'white' }}>
                🧀 Mastellone
              </Tab>
            </TabList>

            <TabPanels>
              {/* Panel Danone */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  <ProductList
                    productos={productosDanone}
                    borderColors={borderColors}
                    onToggle={handleToggleProducto}
                    onDelete={handleDeleteProducto}
                    onAddProducto={onOpen}
                  />
                </VStack>
              </TabPanel>

              {/* Panel Mastellone */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  <ProductList
                    productos={productosMastellone}
                    borderColors={borderColors}
                    onToggle={handleToggleProducto}
                    onDelete={handleDeleteProducto}
                    onAddProducto={onOpen}
                  />
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>

      {/* Modal para Agregar Producto */}
      <ProductoModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleAddProducto}
      />
    </Box>
  );
}

// Componente de lista reutilizable
function ProductList({ 
  productos,
  borderColors,
  onToggle,
  onDelete,
  onAddProducto
}) {
  const productosPendientes = productos.filter((p) => !p.completado);
  const productosCompletados = productos.filter((p) => p.completado);
  const totalProductos = productos.length;
  const porcentajeCompletado = totalProductos > 0 
    ? Math.round((productosCompletados.length / totalProductos) * 100) 
    : 0;

  const productosOrdenados = [...productosPendientes, ...productosCompletados];

  return (
    <>
      {/* Botón Agregar Producto */}
      <Button
        leftIcon={<AddIcon />}
        colorScheme="secondary"
        onClick={onAddProducto}
        size={{ base: 'md', md: 'lg' }}
        w="100%"
      >
        Agregar Producto
      </Button>

      {/* Estadísticas */}
      <Box 
        bg="white" 
        border="2px solid" 
        borderColor="gray.200" 
        borderRadius="lg" 
        p={4}
        shadow="sm"
      >
        <VStack spacing={4}>
          <Flex justify="center" align="center" w="100%">
            <CircularProgress 
              value={porcentajeCompletado} 
              size="120px" 
              thickness="12px"
              color={porcentajeCompletado === 100 ? 'green.400' : 'secondary.500'}
            >
              <CircularProgressLabel fontSize="2xl" fontWeight="bold">
                {porcentajeCompletado}%
              </CircularProgressLabel>
            </CircularProgress>
          </Flex>

          <Box w="100%">
            <Text fontSize="sm" fontWeight="semibold" mb={2} textAlign="center">
              Porcentaje Realizado
            </Text>
            <Progress 
              value={porcentajeCompletado} 
              size="sm" 
              colorScheme={porcentajeCompletado === 100 ? 'green' : 'secondary'}
              borderRadius="full"
              hasStripe
              isAnimated
            />
          </Box>

          <HStack justify="space-around" w="100%" pt={2}>
            <VStack spacing={0}>
              <Text fontSize="xs" color="gray.600">Pendientes</Text>
              <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                {productosPendientes.length}
              </Text>
            </VStack>
            
            <Box h="40px" w="1px" bg="gray.300" />
            
            <VStack spacing={0}>
              <Text fontSize="xs" color="gray.600">Completados</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {productosCompletados.length}
              </Text>
            </VStack>
            
            <Box h="40px" w="1px" bg="gray.300" />
            
            <VStack spacing={0}>
              <Text fontSize="xs" color="gray.600">Total</Text>
              <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                {totalProductos}
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </Box>

      {/* Lista de Productos */}
      {productosOrdenados.length === 0 ? (
        <Text textAlign="center" color="gray.500" py={8}>
          No hay productos. ¡Agrega uno!
        </Text>
      ) : (
        <VStack spacing={3} align="stretch">
          {productosOrdenados.map((producto, index) => {
            const borderColor = borderColors[index % borderColors.length];
            const productoKey = producto._id || `producto-${index}`;
            
            return (
              <Flex
                key={productoKey}
                align="center"
                gap={3}
                position="relative"
              >
                <Box
                  w="12px"
                  h="100%"
                  position="absolute"
                  left="0"
                  top="0"
                  bg={borderColor}
                  borderRadius="md 0 0 md"
                />

                <Box
                  flex={1}
                  bg="white"
                  border="2px solid"
                  borderColor="gray.300"
                  borderRadius="md"
                  pl={6}
                  pr={4}
                  py={3}
                  shadow="sm"
                  transition="all 0.2s"
                  opacity={producto.completado ? 0.6 : 1}
                  _hover={{
                    shadow: 'md',
                    borderColor: 'gray.400',
                  }}
                >
                  <Flex justify="space-between" align="center">
                    <Text
                      fontSize={{ base: 'lg', md: 'xl' }}
                      fontWeight="bold"
                      color="accent.900"
                      textDecoration={producto.completado ? 'line-through' : 'none'}
                    >
                      {producto.codigo}
                    </Text>

                    <HStack spacing={2}>
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={(e) => onDelete(producto._id, e)}
                        aria-label="Eliminar producto"
                      />
                    </HStack>
                  </Flex>
                </Box>

                <Checkbox
                  size="lg"
                  colorScheme="green"
                  isChecked={producto.completado}
                  onChange={() => onToggle(producto)}
                  borderColor="gray.400"
                  sx={{
                    '& .chakra-checkbox__control': {
                      width: '28px',
                      height: '28px',
                      borderWidth: '2px',
                      borderRadius: 'full',
                    },
                  }}
                />
              </Flex>
            );
          })}
        </VStack>
      )}
    </>
  );
}

export default ProductosCobertura;