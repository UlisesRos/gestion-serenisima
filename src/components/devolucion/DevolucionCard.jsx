import { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  IconButton,
  Badge,
  Checkbox,
  Input,
  useToast,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';

function DevolucionCard({ devolucion, borderColor, onEdit, onDelete, onToggleProducto, onUpdateProducto }) {
  const [editingProductoId, setEditingProductoId] = useState(null);
  const [tempCodigo, setTempCodigo] = useState('');
  const [tempCantidad, setTempCantidad] = useState('');
  const toast = useToast();

  const totalProductos = devolucion.productos.reduce((sum, p) => sum + Number(p.cantidad), 0);
  const productosCompletados = devolucion.productos.filter(p => p.completado).length;
  const todoCompletado = devolucion.productos.length > 0 && productosCompletados === devolucion.productos.length;

  const handleStartEdit = (producto) => {
    setEditingProductoId(producto._id);
    setTempCodigo(producto.codigo);
    setTempCantidad(producto.cantidad.toString());
  };

  const handleCancelEdit = () => {
    setEditingProductoId(null);
    setTempCodigo('');
    setTempCantidad('');
  };

  const handleSaveEdit = (productoId) => {
    if (!tempCodigo.trim()) {
      toast({
        title: 'Error',
        description: 'El código no puede estar vacío',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const cantidad = parseInt(tempCantidad);
    if (isNaN(cantidad) || cantidad < 1) {
      toast({
        title: 'Error',
        description: 'La cantidad debe ser al menos 1',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    onUpdateProducto(devolucion._id, productoId, {
      codigo: tempCodigo.trim(),
      cantidad: cantidad
    });
    
    setEditingProductoId(null);
    setTempCodigo('');
    setTempCantidad('');
  };

  const handleKeyPress = (e, productoId) => {
    if (e.key === 'Enter') {
      handleSaveEdit(productoId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <Box
      bg="white"
      border="3px solid"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      shadow="md"
      transition="all 0.2s"
      _hover={{
        shadow: 'lg',
        transform: 'translateY(-2px)',
      }}
    >
      <Flex justify="space-between" align="start" mb={3}>
        {/* Nombre del cliente */}
        <VStack align="start" spacing={1}>
          <Text 
            fontSize={{ base: 'xl', md: '2xl' }} 
            fontWeight="bold"
            color="accent.900"
            textTransform="capitalize"
          >
            {devolucion.nombreCliente}
          </Text>
          <HStack spacing={2}>
            <Badge colorScheme="gray" fontSize="xs">
              {totalProductos} {totalProductos === 1 ? 'unidad' : 'unidades'}
            </Badge>
            <Badge 
              colorScheme={todoCompletado ? 'green' : 'orange'} 
              fontSize="xs"
            >
              {productosCompletados}/{devolucion.productos.length} pasados
            </Badge>
          </HStack>
        </VStack>

        {/* Botones de acción */}
        <HStack spacing={1}>
          <IconButton
            icon={<EditIcon />}
            size="sm"
            colorScheme="blue"
            variant="ghost"
            onClick={onEdit}
            aria-label="Editar devolución"
          />
          <IconButton
            icon={<DeleteIcon />}
            size="sm"
            colorScheme="red"
            variant="ghost"
            onClick={onDelete}
            aria-label="Eliminar devolución"
          />
        </HStack>
      </Flex>

      {/* Lista de productos con checkbox */}
      <VStack align="stretch" spacing={2}>
        {devolucion.productos.map((producto, idx) => {
          const isEditing = editingProductoId === producto._id;

          return (
            <Flex
              key={producto._id || idx}
              align="center"
              gap={3}
              position="relative"
            >
              {/* Checkbox */}
              <Checkbox
                size="lg"
                colorScheme="green"
                isChecked={producto.completado}
                onChange={() => onToggleProducto(devolucion._id, producto._id)}
                borderColor="gray.400"
                sx={{
                  '& .chakra-checkbox__control': {
                    width: '24px',
                    height: '24px',
                    borderWidth: '2px',
                  },
                }}
              />

              {/* Card del producto */}
              <Box
                flex={1}
                bg="gray.50"
                px={3}
                py={2}
                borderRadius="md"
                borderLeft="4px solid"
                borderLeftColor={borderColor}
                opacity={producto.completado ? 0.6 : 1}
                transition="all 0.2s"
              >
                <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                  <HStack spacing={3} flex={1}>
                    {/* Código y Cantidad editables */}
                    {isEditing ? (
                      <HStack spacing={2}>
                        <Input
                          value={tempCodigo}
                          onChange={(e) => setTempCodigo(e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, producto._id)}
                          size="sm"
                          width="100px"
                          placeholder="Código"
                          autoFocus
                          bg="white"
                        />
                        <Input
                          value={tempCantidad}
                          onChange={(e) => setTempCantidad(e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, producto._id)}
                          size="sm"
                          width="60px"
                          placeholder="Cant"
                          type="number"
                          min="1"
                          bg="white"
                        />
                        <IconButton
                          icon={<CheckIcon />}
                          size="xs"
                          colorScheme="green"
                          onClick={() => handleSaveEdit(producto._id)}
                          aria-label="Guardar"
                        />
                        <IconButton
                          icon={<CloseIcon />}
                          size="xs"
                          colorScheme="red"
                          onClick={handleCancelEdit}
                          aria-label="Cancelar"
                        />
                      </HStack>
                    ) : (
                      <>
                        <Text 
                          fontWeight="bold" 
                          fontSize="lg" 
                          color="accent.900"
                          cursor="pointer"
                          onClick={() => handleStartEdit(producto)}
                          _hover={{ 
                            color: 'blue.500',
                            textDecoration: 'underline'
                          }}
                          title="Click para editar código y cantidad"
                        >
                          {producto.codigo}
                        </Text>
                        
                        <Badge 
                          colorScheme="primary" 
                          fontSize="md" 
                          px={2}
                          cursor="pointer"
                          onClick={() => handleStartEdit(producto)}
                          _hover={{ 
                            bg: 'primary.600'
                          }}
                          title="Click para editar código y cantidad"
                        >
                          x{producto.cantidad}
                        </Badge>
                      </>
                    )}
                  </HStack>
                  
                  {producto.descripcion && !isEditing && (
                    <Text fontSize="sm" color="gray.600" fontStyle="italic">
                      {producto.descripcion}
                    </Text>
                  )}
                </Flex>
              </Box>
            </Flex>
          );
        })}
      </VStack>
    </Box>
  );
}

export default DevolucionCard;