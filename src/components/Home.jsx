import { useState } from 'react';
import { Box, Container, Heading, VStack, Button, Image } from '@chakra-ui/react';
import logo from '../img/logoSere.png'
import Coberturas from './cobertura/Coberturas';
import ProductosCobertura from './cobertura/ProductosCobertura';
import Devoluciones from './devolucion/Devoluciones';

function Home() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedCliente, setSelectedCliente] = useState(null);

  const handleDevoluciones = () => {
    setCurrentView('devoluciones');
  };

  const handleCoberturas = () => {
    setCurrentView('coberturas');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedCliente(null);
  };

  const handleVerProductos = (cliente) => {
    setSelectedCliente(cliente);
    setCurrentView('productos');
  };

  const handleBackToCoberturas = () => {
    setCurrentView('coberturas');
    setSelectedCliente(null);
  };

  // Renderizar vistas
  if (currentView === 'devoluciones') {
    return <Devoluciones onBack={handleBackToHome} />;
  }

  if (currentView === 'productos' && selectedCliente) {
    return (
      <ProductosCobertura 
        cliente={selectedCliente} 
        onBack={handleBackToCoberturas} 
      />
    );
  }

  if (currentView === 'coberturas') {
    return (
      <Coberturas 
        onBack={handleBackToHome}
        onVerProductos={handleVerProductos}
      />
    );
  }

  // Vista Home
  return (
    <Box 
      minH="100vh" 
      bg="white" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 10 }}
    >
      <Container maxW="container.sm" px={0}>
        <VStack spacing={{ base: 6, md: 8 }} w="100%">
          
          {/* Título */}
          <Heading 
            as="h1" 
            size={{ base: "xl", md: "2xl" }}
            textAlign="center"
            color="accent.900"
            px={4}
          >
            Gestión Serenísima
          </Heading>

          {/* Logo */}
          <Box w="100%" px={{ base: 4, md: 8 }}>
            <Image 
              src={logo} 
              alt="La Serenísima Logo" 
              maxW={{ base: "280px", sm: "350px", md: "400px" }}
              w="100%"
              mx="auto"
              objectFit="contain"
            />
          </Box>

          {/* Botones */}
          <VStack 
            spacing={{ base: 3, md: 4 }} 
            w="100%" 
            maxW={{ base: "100%", sm: "320px" }}
            px={{ base: 4, md: 0 }}
          >
            <Button 
              colorScheme="primary" 
              size={{ base: "lg", md: "lg" }}
              w="100%"
              onClick={handleDevoluciones}
              fontSize={{ base: "lg", md: "xl" }}
              py={{ base: 6, md: 7 }}
              height="auto"
              whiteSpace="normal"
              _active={{ transform: "scale(0.98)" }}
            >
              Devoluciones
            </Button>
            
            <Button 
              colorScheme="secondary" 
              size={{ base: "lg", md: "lg" }}
              w="100%"
              onClick={handleCoberturas}
              fontSize={{ base: "lg", md: "xl" }}
              py={{ base: 6, md: 7 }}
              height="auto"
              whiteSpace="normal"
              _active={{ transform: "scale(0.98)" }}
            >
              Coberturas
            </Button>
          </VStack>

        </VStack>
      </Container>
    </Box>
  );
}

export default Home;