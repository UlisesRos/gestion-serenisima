import { useState, useEffect } from 'react';
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
  Text,
  HStack,
} from '@chakra-ui/react';

function ProductoModal({ isOpen, onClose, onSave }) {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');

  // Resetear cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line
      setCodigo('');
      setError('');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const value = e.target.value;
    // Permitir solo números y máximo 6 dígitos
    if (value === '' || /^\d{0,6}$/.test(value)) {
      setCodigo(value);
      setError('');
    }
  };

  const handleSubmitAndContinue = async () => {
    if (codigo.length !== 6) {
      setError('El código debe tener exactamente 6 dígitos');
      return;
    }

    await onSave(codigo);
    
    // Limpiar el campo pero NO cerrar el modal
    setCodigo('');
    setError('');
  };

  const handleSubmitAndClose = async () => {
    if (codigo.length !== 6) {
      setError('El código debe tener exactamente 6 dígitos');
      return;
    }

    await onSave(codigo);
    
    // Limpiar y cerrar
    setCodigo('');
    setError('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitAndContinue(); // Enter = agregar y seguir
    }
  };

  const handleClose = () => {
    setCodigo('');
    setError('');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      isCentered 
      size={{ base: 'sm', md: 'md' }}
      closeOnOverlayClick={false} // Evitar cerrar al hacer click fuera
    >
      <ModalOverlay />
      <ModalContent mx={4}>
        <ModalHeader>Agregar Producto</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired>
            <FormLabel>Código del Producto</FormLabel>
            <Input
              value={codigo}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Ej: 123456"
              fontSize="2xl"
              textAlign="center"
              letterSpacing="0.2em"
              maxLength={6}
              autoFocus
              type="tel"
              inputMode="numeric"
            />
            <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
              {codigo.length}/6 dígitos
            </Text>
            {error && (
              <Text fontSize="sm" color="red.500" mt={2}>
                {error}
              </Text>
            )}
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={2} w="100%" justify="space-between">
            <Button variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            
            <HStack spacing={2}>
              <Button 
                colorScheme="blue" 
                onClick={handleSubmitAndContinue}
                isDisabled={codigo.length !== 6}
              >
                Agregar otro
              </Button>
              
              <Button 
                colorScheme="secondary" 
                onClick={handleSubmitAndClose}
                isDisabled={codigo.length !== 6}
              >
                Agregar y cerrar
              </Button>
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ProductoModal;