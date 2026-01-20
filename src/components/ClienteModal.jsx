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
  Select,
  VStack,
} from '@chakra-ui/react';

function ClienteModal({ isOpen, onClose, onSave, cliente }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    frecuencia: 'LMV',
  });

  const nombreRef = useRef(null);
  const apellidoRef = useRef(null);
  const frecuenciaRef = useRef(null);

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        frecuencia: cliente.frecuencia,
      });
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        frecuencia: 'LMV',
      });
    }
  }, [cliente, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }
    onSave(formData);
  };

  const handleKeyPress = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        // Mover al siguiente campo
        nextRef.current.focus();
      } else {
        // Si no hay siguiente campo, enviar el formulario
        handleSubmit();
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: 'sm', md: 'md' }}>
      <ModalOverlay />
      <ModalContent mx={4}>
        <ModalHeader>{cliente ? 'Editar Cliente' : 'Agregar Cliente'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Nombre</FormLabel>
              <Input
                ref={nombreRef}
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                onKeyPress={(e) => handleKeyPress(e, apellidoRef)}
                placeholder="Ingrese el nombre"
                autoFocus
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Apellido</FormLabel>
              <Input
                ref={apellidoRef}
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                onKeyPress={(e) => handleKeyPress(e, frecuenciaRef)}
                placeholder="Ingrese el apellido"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Frecuencia</FormLabel>
              <Select 
                ref={frecuenciaRef}
                name="frecuencia" 
                value={formData.frecuencia} 
                onChange={handleChange}
                onKeyPress={(e) => handleKeyPress(e, null)}
              >
                <option value="LMV">Lunes, Miércoles, Viernes</option>
                <option value="MJS">Martes, Jueves, Sábado</option>
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="secondary" onClick={handleSubmit}>
            {cliente ? 'Guardar' : 'Agregar'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ClienteModal;