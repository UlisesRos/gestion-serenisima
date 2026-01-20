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
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon, DeleteIcon } from '@chakra-ui/icons';
import ProductoModal from './ProductoModal';

function ProductosCobertura({ cliente, onBack }) {
  const [productos, setProductos] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Colores para los bordes (igual que la imagen)
  const borderColors = ['#ff9800', '#9c27b0', '#f44336', '#ffeb3b', '#e91e63', '#00bcd4'];

  // Cargar productos del cliente al montar
  useEffect(() => {
    loadProductos();
  }, [cliente]);

  const loadProductos = () => {
    const key = `productos_cliente_${cliente._id}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      setProductos(JSON.parse(stored));
    } else {
      // Mock data inicial para pruebas
      const mockProductos = [
        { id: '1', codigo: '123456', completado: false },
        { id: '2', codigo: '789012', completado: false },
        { id: '3', codigo: '345678', completado: true },
        { id: '4', codigo: '901234', completado: true },
        { id: '5', codigo: '567890', completado: false },
      ];
      setProductos(mockProductos);
      localStorage.setItem(key, JSON.stringify(mockProductos));
    }
  };

  const saveProductos = (productosData) => {
    const key = `productos_cliente_${cliente._id}`;
    localStorage.setItem(key, JSON.stringify(productosData));
  };

  const handleAddProducto = (codigo) => {
    const nuevoProducto = {
      id: Date.now().toString(),
      codigo: codigo,
      completado: false,
    };

    const updatedProductos = [...productos, nuevoProducto];
    setProductos(updatedProductos);
    saveProductos(updatedProductos);

    toast({
      title: 'Producto agregado',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
    onClose();
  };

  const handleToggleProducto = (id) => {
    const updatedProductos = productos.map((p) =>
      p.id === id ? { ...p, completado: !p.completado } : p
    );
    setProductos(updatedProductos);
    saveProductos(updatedProductos);
  };

  const handleDeleteProducto = (id, e) => {
    e.stopPropagation();
    
    if (window.confirm('¿Eliminar este producto?')) {
      const updatedProductos = productos.filter((p) => p.id !== id);
      setProductos(updatedProductos);
      saveProductos(updatedProductos);

      toast({
        title: 'Producto eliminado',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Calcular estadísticas
  const productosPendientes = productos.filter((p) => !p.completado);
  const productosCompletados = productos.filter((p) => p.completado);
  const totalProductos = productos.length;
  const porcentajeCompletado = totalProductos > 0 
    ? Math.round((productosCompletados.length / totalProductos) * 100) 
    : 0;

  // Ordenar: pendientes arriba, completados abajo
  const productosOrdenados = [...productosPendientes, ...productosCompletados];

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
                {cliente.nombre} {cliente.apellido}
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
          
          {/* Botón Agregar Producto */}
          <Button
            leftIcon={<AddIcon />}
            colorScheme="secondary"
            onClick={onOpen}
            size={{ base: 'md', md: 'lg' }}
            w="100%"
          >
            Agregar Producto
          </Button>

          {/* Estadísticas con Porcentaje */}
          <Box 
            bg="white" 
            border="2px solid" 
            borderColor="gray.200" 
            borderRadius="lg" 
            p={4}
            shadow="sm"
          >
            <VStack spacing={4}>
              {/* Indicador circular de porcentaje */}
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

              {/* Barra de progreso */}
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

              {/* Contadores */}
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

          {/* Lista de Productos - Estilo Checklist */}
          {productosOrdenados.length === 0 ? (
            <Text textAlign="center" color="gray.500" py={8}>
              No hay productos. ¡Agrega uno!
            </Text>
          ) : (
            <VStack spacing={3} align="stretch">
              {productosOrdenados.map((producto, index) => {
                const borderColor = borderColors[index % borderColors.length];
                
                return (
                  <Flex
                    key={producto.id}
                    align="center"
                    gap={3}
                    position="relative"
                  >
                    {/* Borde de color (como en la imagen) */}
                    <Box
                      w="12px"
                      h="100%"
                      position="absolute"
                      left="0"
                      top="0"
                      bg={borderColor}
                      borderRadius="md 0 0 md"
                    />

                    {/* Card del producto */}
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
                            onClick={(e) => handleDeleteProducto(producto.id, e)}
                            aria-label="Eliminar producto"
                          />
                        </HStack>
                      </Flex>
                    </Box>

                    {/* Checkbox (como en la imagen) */}
                    <Checkbox
                      size="lg"
                      colorScheme="green"
                      isChecked={producto.completado}
                      onChange={() => handleToggleProducto(producto.id)}
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

export default ProductosCobertura;