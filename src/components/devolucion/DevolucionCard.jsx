import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  IconButton,
  Badge,
  Checkbox,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';

function DevolucionCard({ devolucion, borderColor, onEdit, onDelete, onToggleProducto }) {
  const totalProductos = devolucion.productos.reduce((sum, p) => sum + Number(p.cantidad), 0);
  const productosCompletados = devolucion.productos.filter(p => p.completado).length;
  const todoCompletado = devolucion.productos.length > 0 && productosCompletados === devolucion.productos.length;

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
            textTransform='capitalize'
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
        {devolucion.productos.map((producto, idx) => (
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
                  <Text 
                    fontWeight="bold" 
                    fontSize="lg" 
                    color="accent.900"
                    textDecoration={producto.completado ? 'line-through' : 'none'}
                  >
                    {producto.codigo}
                  </Text>
                  <Badge colorScheme="primary" fontSize="md" px={2}>
                    x{producto.cantidad}
                  </Badge>
                </HStack>
                
                {producto.descripcion && (
                  <Text fontSize="sm" color="gray.600" fontStyle="italic">
                    {producto.descripcion}
                  </Text>
                )}
              </Flex>
            </Box>
          </Flex>
        ))}
      </VStack>
    </Box>
  );
}

export default DevolucionCard;