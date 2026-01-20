import { useState } from 'react';
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
} from '@chakra-ui/react';

function ProductoModal({ isOpen, onClose, onSave }) {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    // Permitir solo números y máximo 6 dígitos
    if (value === '' || /^\d{0,6}$/.test(value)) {
      setCodigo(value);
      setError('');
    }
  };

  const handleSubmit = () => {
    if (codigo.length !== 6) {
      setError('El código debe tener exactamente 6 dígitos');
      return;
    }

    onSave(codigo);
    setCodigo('');
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClose = () => {
    setCodigo('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size={{ base: 'sm', md: 'md' }}>
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
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            colorScheme="secondary" 
            onClick={handleSubmit}
            isDisabled={codigo.length !== 6}
          >
            Agregar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ProductoModal;