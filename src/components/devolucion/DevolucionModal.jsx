import { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  IconButton,
  Text,
  Box,
  Divider,
  Flex
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon, CheckIcon } from '@chakra-ui/icons';

function DevolucionModal({ isOpen, onClose, onSave, devolucion }) {
  const [nombreCliente, setNombreCliente] = useState('');
  const [productos, setProductos] = useState([]);
  const [currentProducto, setCurrentProducto] = useState({
    codigo: '',
    cantidad: '',
  });
  const [editingProductoIndex, setEditingProductoIndex] = useState(null);

  const nombreRef = useRef(null);
  const codigoRef = useRef(null);
  const cantidadRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (devolucion) {
        // eslint-disable-next-line
        setNombreCliente(devolucion.nombreCliente);
        setProductos(devolucion.productos || []);
        setCurrentProducto({ codigo: '', cantidad: '' });
      } else {
        setNombreCliente('');
        setProductos([]);
        setCurrentProducto({ codigo: '', cantidad: '' });
      }
      setEditingProductoIndex(null);
    }
  }, [devolucion, isOpen]);

  const handleAddProducto = () => {
    if (!currentProducto.codigo || !currentProducto.cantidad) {
      alert('Debes completar al menos código y cantidad');
      return;
    }

    if (editingProductoIndex !== null) {
      // Modo edición directa de un ítem existente
      const actualizados = [...productos];
      actualizados[editingProductoIndex] = {
        ...actualizados[editingProductoIndex],
        codigo: currentProducto.codigo,
        cantidad: currentProducto.cantidad,
      };
      setProductos(actualizados);
      setEditingProductoIndex(null);
    } else {
      // Verificar si el código ya existe
      const indiceExistente = productos.findIndex(p => p.codigo === currentProducto.codigo);
      if (indiceExistente !== -1) {
        // Actualizar cantidad del existente
        const actualizados = [...productos];
        actualizados[indiceExistente] = {
          ...actualizados[indiceExistente],
          cantidad: currentProducto.cantidad,
        };
        setProductos(actualizados);
      } else {
        // Nuevo código: agregar
        setProductos([...productos, { ...currentProducto }]);
      }
    }

    setCurrentProducto({ codigo: '', cantidad: '' });

    // Volver el foco al campo de código
    setTimeout(() => codigoRef.current?.focus(), 100);
  };

  const handleEditProductoEnLista = (index) => {
    const producto = productos[index];
    setCurrentProducto({
      codigo: producto.codigo,
      cantidad: producto.cantidad.toString(),
    });
    setEditingProductoIndex(index);
    setTimeout(() => codigoRef.current?.focus(), 100);
  };

  const handleCancelarEdicionEnLista = () => {
    setEditingProductoIndex(null);
    setCurrentProducto({ codigo: '', cantidad: '' });
  };

  const handleDeleteProducto = (index) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e, nextRef, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (action === 'addProducto') {
        handleAddProducto();
      } else if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleSubmit = async () => {
    if (!nombreCliente.trim()) {
      alert('Debes ingresar el nombre del cliente');
      return;
    }

    if (productos.length === 0) {
      alert('Debes agregar al menos un producto');
      return;
    }

    try {
      await onSave({
        nombreCliente: nombreCliente.trim(),
        productos: productos,
      });
      // Éxito: el padre llama a onClose(), el reset ocurre en handleClose o en el useEffect al próximo open.
    } catch {
      // El error ya se mostró con toast desde el padre.
      // El modal queda abierto con todos los datos intactos para reintentar.
    }
  };

  const handleClose = () => {
    setNombreCliente('');
    setProductos([]);
    setCurrentProducto({ codigo: '', cantidad: '' });
    setEditingProductoIndex(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: 'full', md: 'xl' }}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {devolucion ? 'Editar Devolución' : 'Agregar Devolución'}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">

            {/* Nombre del Cliente */}
            <FormControl isRequired>
              <FormLabel>Nombre del Cliente</FormLabel>
              <Input
                ref={nombreRef}
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, codigoRef)}
                placeholder="Ej: Juan"
                autoFocus
                size="lg"
              />
            </FormControl>

            <Divider />

            {/* Formulario de Producto */}
            <Box>
              <Text fontWeight="bold" mb={3}>
                Agregar Productos
              </Text>

              <VStack spacing={3} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Código</FormLabel>
                  <Input
                    ref={codigoRef}
                    value={currentProducto.codigo}
                    onChange={(e) => {
                      const nuevoCodigo = e.target.value;
                      const existente = productos.find(p => p.codigo === nuevoCodigo);
                      if (existente) {
                        setCurrentProducto({
                          ...currentProducto,
                          codigo: nuevoCodigo,
                          cantidad: existente.cantidad.toString(),
                        });
                      } else {
                        setCurrentProducto({ ...currentProducto, codigo: nuevoCodigo });
                      }
                    }}
                    onKeyPress={(e) => handleKeyPress(e, cantidadRef)}
                    placeholder="Ej: 3480"
                    type="text"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Cantidad</FormLabel>
                  <Input
                    ref={cantidadRef}
                    value={currentProducto.cantidad}
                    onChange={(e) => {
                      const soloNumeros = e.target.value.replace(/\D/g, '');
                      setCurrentProducto({ ...currentProducto, cantidad: soloNumeros });
                    }}
                    onKeyPress={(e) => handleKeyPress(e, null, 'addProducto')}
                    placeholder="Ej: 2"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </FormControl>

                <HStack>
                  <Button
                    leftIcon={editingProductoIndex !== null ? <CheckIcon /> : <AddIcon />}
                    colorScheme={editingProductoIndex !== null ? 'blue' : 'secondary'}
                    onClick={handleAddProducto}
                    size="sm"
                    flex={1}
                  >
                    {editingProductoIndex !== null ? 'Actualizar Producto' : 'Agregar Producto'}
                  </Button>
                  {editingProductoIndex !== null && (
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={handleCancelarEdicionEnLista}
                    >
                      Cancelar
                    </Button>
                  )}
                </HStack>
              </VStack>
            </Box>

            {/* Lista de productos agregados */}
            {productos.length > 0 && (
              <Box>
                <Text fontWeight="bold" mb={3}>
                  Productos agregados ({productos.length})
                </Text>

                <VStack spacing={2} align="stretch">
                  {productos.map((producto, index) => (
                    <Flex
                      key={index}
                      bg="gray.50"
                      p={3}
                      borderRadius="md"
                      justify="space-between"
                      align="center"
                      borderLeft="4px solid"
                      borderLeftColor="primary.500"
                    >
                      <VStack align="start" spacing={0} flex={1}>
                        <HStack>
                          <Text fontWeight="bold">{producto.codigo}</Text>
                          <Text color="gray.600">x{producto.cantidad}</Text>
                        </HStack>
                      </VStack>

                      <HStack spacing={1}>
                        <IconButton
                          icon={<EditIcon />}
                          size="xs"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => handleEditProductoEnLista(index)}
                          aria-label="Editar producto"
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDeleteProducto(index)}
                          aria-label="Eliminar producto"
                        />
                      </HStack>
                    </Flex>
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            colorScheme="primary"
            onClick={handleSubmit}
            isDisabled={!nombreCliente || productos.length === 0}
          >
            {devolucion ? 'Guardar Cambios' : 'Guardar Devolución'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default DevolucionModal;
