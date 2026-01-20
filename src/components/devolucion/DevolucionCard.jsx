import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  IconButton,
  Badge,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';

function DevolucionCard({ devolucion, borderColor, onEdit, onDelete }) {
  // Convertir a número antes de sumar para evitar concatenación
  const totalProductos = devolucion.productos.reduce((sum, p) => sum + Number(p.cantidad), 0);

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
          >
            {devolucion.nombreCliente}
          </Text>
          <Badge colorScheme="gray" fontSize="xs">
            {totalProductos} {totalProductos === 1 ? 'producto' : 'productos'}
          </Badge>
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

      {/* Lista de productos */}
      <VStack align="stretch" spacing={2}>
        {devolucion.productos.map((producto, idx) => (
          <Box
            key={idx}
            bg="gray.50"
            px={3}
            py={2}
            borderRadius="md"
            borderLeft="4px solid"
            borderLeftColor={borderColor}
          >
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
              <HStack spacing={3} flex={1}>
                <Text fontWeight="bold" fontSize="lg" color="accent.900">
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
        ))}
      </VStack>
    </Box>
  );
}

export default DevolucionCard;
