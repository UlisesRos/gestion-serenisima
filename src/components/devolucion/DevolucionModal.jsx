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
  Flex,
  InputGroup,
  InputRightElement
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

function DevolucionModal({ isOpen, onClose, onSave, devolucion }) {
  const [nombreCliente, setNombreCliente] = useState('');
  const [productos, setProductos] = useState([]);
  const [currentProducto, setCurrentProducto] = useState({
    codigo: '',
    cantidad: '',
    descripcion: '',
  });
  const [usarTecladoNumerico, setUsarTecladoNumerico] = useState(true);

  const nombreRef = useRef(null);
  const codigoRef = useRef(null);
  const cantidadRef = useRef(null);
  const descripcionRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (devolucion) {
        // eslint-disable-next-line
        setNombreCliente(devolucion.nombreCliente);
        setProductos(devolucion.productos || []);
        setCurrentProducto({ codigo: '', cantidad: '', descripcion: '' });
      } else {
        setNombreCliente('');
        setProductos([]);
        setCurrentProducto({ codigo: '', cantidad: '', descripcion: '' });
      }
      // Resetear a teclado numérico cuando se abre el modal
      setUsarTecladoNumerico(true);
    }
  }, [devolucion, isOpen]);

  const handleAddProducto = () => {
    if (!currentProducto.codigo || !currentProducto.cantidad) {
      alert('Debes completar al menos código y cantidad');
      return;
    }

    setProductos([...productos, { ...currentProducto }]);
    setCurrentProducto({ codigo: '', cantidad: '', descripcion: '' });
    
    // Volver el foco al campo de código
    setTimeout(() => codigoRef.current?.focus(), 100);
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

  const handleSubmit = () => {
    if (!nombreCliente.trim()) {
      alert('Debes ingresar el nombre del cliente');
      return;
    }

    if (productos.length === 0) {
      alert('Debes agregar al menos un producto');
      return;
    }

    onSave({
      nombreCliente: nombreCliente.trim(),
      productos: productos,
    });

    // Resetear
    setNombreCliente('');
    setProductos([]);
    setCurrentProducto({ codigo: '', cantidad: '', descripcion: '' });
  };

  const handleClose = () => {
    setNombreCliente('');
    setProductos([]);
    setCurrentProducto({ codigo: '', cantidad: '', descripcion: '' });
    setUsarTecladoNumerico(true);
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
                  <InputGroup>
                    <Input
                      ref={codigoRef}
                      value={currentProducto.codigo}
                      onChange={(e) => setCurrentProducto({ ...currentProducto, codigo: e.target.value })}
                      onKeyPress={(e) => handleKeyPress(e, cantidadRef)}
                      placeholder="Ej: 3480"
                      type={usarTecladoNumerico ? "tel" : "text"}
                      enterKeyHint="done"
                      pr="3.5rem"
                    />
                    <InputRightElement width="3.5rem">
                      <Button
                        h="1.75rem"
                        size="sm"
                        onClick={() => setUsarTecladoNumerico(!usarTecladoNumerico)}
                        fontSize="xs"
                        colorScheme={usarTecladoNumerico ? "gray" : "primary"}
                        variant="ghost"
                      >
                        {usarTecladoNumerico ? "ABC" : "123"}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Cantidad</FormLabel>
                  <Input
                    ref={cantidadRef}
                    value={currentProducto.cantidad}
                    onChange={(e) => setCurrentProducto({ ...currentProducto, cantidad: e.target.value })}
                    onKeyPress={(e) => handleKeyPress(e, descripcionRef)}
                    placeholder="Ej: 2"
                    type="tel"
                    enterKeyHint="done"
                    min="1"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Descripción (opcional)</FormLabel>
                  <Input
                    ref={descripcionRef}
                    value={currentProducto.descripcion}
                    onChange={(e) => setCurrentProducto({ ...currentProducto, descripcion: e.target.value })}
                    onKeyPress={(e) => handleKeyPress(e, null, 'addProducto')}
                    placeholder="Ej: Rotos, Vencidos, etc."
                    enterKeyHint="done"
                  />
                </FormControl>

                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="secondary"
                  onClick={handleAddProducto}
                  size="sm"
                >
                  Agregar Producto
                </Button>
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
                        {producto.descripcion && (
                          <Text fontSize="sm" color="gray.500" fontStyle="italic">
                            {producto.descripcion}
                          </Text>
                        )}
                      </VStack>
                      
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDeleteProducto(index)}
                        aria-label="Eliminar producto"
                      />
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