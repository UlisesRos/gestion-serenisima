import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Input,
  Select,
  IconButton,
  Text,
  useDisclosure,
  useToast,
  Flex,
  InputGroup,
  InputLeftElement,
  Spinner,
  CircularProgress,
  CircularProgressLabel,
  Badge,
  Progress,
  Divider,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  AddIcon,
  SearchIcon,
  EditIcon,
  DeleteIcon,
  CheckCircleIcon,
  AttachmentIcon,
  WarningIcon,
} from '@chakra-ui/icons';
import ClienteModal from './ClienteModal';
import { coberturasService } from '../../services/coberturasService';

function Coberturas({ onBack, onVerProductos }) {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [frecuenciaFilter, setFrecuenciaFilter] = useState('todos');
  const [coberturaFilter, setCoberturaFilter] = useState('todos');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para importación de PDF
  const [importandoDanone, setImportandoDanone] = useState(false);
  const [importandoMastellone, setImportandoMastellone] = useState(false);

  // Modal de borrar todo
  const [showBorrarModal, setShowBorrarModal] = useState(false);
  const [confirmTexto, setConfirmTexto] = useState('');
  const [borrando, setBorrando] = useState(false);

  // Refs para los inputs de archivo (ocultos)
  const inputDanoneRef = useRef(null);
  const inputMastelloneRef = useRef(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const borderColors = ['#4caf50', '#f44336', '#2196f3', '#ff9800', '#9c27b0'];

  useEffect(() => {
    loadClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, frecuenciaFilter, coberturaFilter, clientes]);

  const loadClientes = async () => {
    setIsLoading(true);
    try {
      const data = await coberturasService.getAllClientes();
      setClientes(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error al cargar clientes',
        description: 'No se pudieron cargar los clientes del servidor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== IMPORTAR PDF ====================

  const handleImportarPDF = async (empresa, archivo) => {
    if (!archivo) return;
    if (!archivo.name.toLowerCase().endsWith('.pdf')) {
      toast({
        title: 'Archivo inválido',
        description: 'Solo se aceptan archivos PDF',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const setImportando = empresa === 'danone' ? setImportandoDanone : setImportandoMastellone;
    setImportando(true);

    try {
      const resultado = await coberturasService.importarPDF(empresa, archivo);

      const nombreEmpresa = empresa === 'danone' ? '🥛 Danone' : '🧀 Mastellone';

      toast({
        title: `PDF ${nombreEmpresa} importado`,
        description: (
          <VStack align="start" spacing={0}>
            <Text>✅ {resultado.clientesProcesados} clientes procesados</Text>
            {resultado.codigosCompletados > 0 && (
              <Text>🏁 {resultado.codigosCompletados} códigos marcados como completados</Text>
            )}
            {resultado.codigosAgregados > 0 && (
              <Text>➕ {resultado.codigosAgregados} códigos nuevos agregados</Text>
            )}
          </VStack>
        ),
        status: 'success',
        duration: 6000,
        isClosable: true,
      });

      loadClientes();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error al importar PDF',
        description: error.message || 'No se pudo procesar el archivo',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setImportando(false);
      // Limpiar el input para permitir cargar el mismo archivo otra vez
      if (empresa === 'danone' && inputDanoneRef.current) inputDanoneRef.current.value = '';
      if (empresa === 'mastellone' && inputMastelloneRef.current) inputMastelloneRef.current.value = '';
    }
  };

  // ==================== BORRAR TODO ====================

  const handleBorrarTodo = async () => {
    if (confirmTexto !== 'BORRAR') return;

    setBorrando(true);
    try {
      const resultado = await coberturasService.borrarTodo();
      toast({
        title: 'Datos eliminados',
        description: `Se eliminaron ${resultado.eliminados} clientes`,
        status: 'info',
        duration: 4000,
        isClosable: true,
      });
      setClientes([]);
      setShowBorrarModal(false);
      setConfirmTexto('');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error al borrar',
        description: 'No se pudieron eliminar los datos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setBorrando(false);
    }
  };

  // ==================== FILTROS Y UTILS ====================

  const getTipoCobertura = (cliente) => {
    const tieneDanone = cliente.productosDanone.length > 0;
    const tieneMastellone = cliente.productosMastellone.length > 0;
    if (tieneDanone && tieneMastellone) return 'ambas';
    if (tieneDanone) return 'danone';
    if (tieneMastellone) return 'mastellone';
    return 'ninguna';
  };

  const filterClientes = () => {
    let filtered = [...clientes];

    if (searchTerm) {
      filtered = filtered.filter((cliente) =>
        `${cliente.nombre} ${cliente.apellido}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (frecuenciaFilter !== 'todos') {
      filtered = filtered.filter((cliente) => cliente.frecuencia === frecuenciaFilter);
    }

    if (coberturaFilter !== 'todos') {
      filtered = filtered.filter((cliente) => {
        const tipo = getTipoCobertura(cliente);
        if (coberturaFilter === 'ambas') return tipo === 'ambas';
        if (coberturaFilter === 'danone') return tipo === 'danone' || tipo === 'ambas';
        if (coberturaFilter === 'mastellone') return tipo === 'mastellone' || tipo === 'ambas';
        return true;
      });
    }

    setFilteredClientes(filtered);
  };

  const handleAddCliente = () => {
    setSelectedCliente(null);
    onOpen();
  };

  const handleEditCliente = (cliente, e) => {
    e.stopPropagation();
    setSelectedCliente(cliente);
    onOpen();
  };

  const handleDeleteCliente = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await coberturasService.deleteCliente(id);
        toast({ title: 'Cliente eliminado', status: 'success', duration: 2000, isClosable: true });
        loadClientes();
      } catch (error) {
        console.error(error);
        toast({ title: 'Error al eliminar', status: 'error', duration: 3000, isClosable: true });
      }
    }
  };

  const handleSaveCliente = async (clienteData) => {
    try {
      if (selectedCliente) {
        await coberturasService.updateCliente(selectedCliente._id, clienteData);
        toast({ title: 'Cliente actualizado', status: 'success', duration: 2000, isClosable: true });
      } else {
        await coberturasService.createCliente(clienteData);
        toast({ title: 'Cliente agregado', status: 'success', duration: 2000, isClosable: true });
      }
      loadClientes();
      onClose();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error al guardar', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleClienteClick = (cliente) => {
    onVerProductos(cliente);
  };

  // ==================== CÁLCULOS ====================

  const calcularPorcentajeCliente = (cliente) => {
    const totalProductos = cliente.productosDanone.length + cliente.productosMastellone.length;
    if (totalProductos === 0) return 0;
    const completados =
      cliente.productosDanone.filter(p => p.completado).length +
      cliente.productosMastellone.filter(p => p.completado).length;
    return Math.round((completados / totalProductos) * 100);
  };

  const calcularPorcentajeTotal = () => {
    let totalProductos = 0;
    let totalCompletados = 0;
    filteredClientes.forEach(cliente => {
      totalProductos += cliente.productosDanone.length + cliente.productosMastellone.length;
      totalCompletados +=
        cliente.productosDanone.filter(p => p.completado).length +
        cliente.productosMastellone.filter(p => p.completado).length;
    });
    if (totalProductos === 0) return 0;
    return Math.round((totalCompletados / totalProductos) * 100);
  };

  const calcularPorcentajeDanone = () => {
    let total = 0;
    let completados = 0;
    filteredClientes.forEach(cliente => {
      total += cliente.productosDanone.length;
      completados += cliente.productosDanone.filter(p => p.completado).length;
    });
    if (total === 0) return { porcentaje: 0, completados, total };
    return { porcentaje: Math.round((completados / total) * 100), completados, total };
  };

  const calcularPorcentajeMastellone = () => {
    let total = 0;
    let completados = 0;
    filteredClientes.forEach(cliente => {
      total += cliente.productosMastellone.length;
      completados += cliente.productosMastellone.filter(p => p.completado).length;
    });
    if (total === 0) return { porcentaje: 0, completados, total };
    return { porcentaje: Math.round((completados / total) * 100), completados, total };
  };

  const porcentajeTotal = calcularPorcentajeTotal();
  const danoneStats = calcularPorcentajeDanone();
  const mastelloneStats = calcularPorcentajeMastellone();

  return (
    <Box minH="100vh" bg="white" pb={8}>
      {/* Header */}
      <Box bg="secondary.500" color="white" py={4} px={4} shadow="md">
        <Container maxW="container.lg" px={0}>
          <HStack spacing={3}>
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={onBack}
              variant="ghost"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              aria-label="Volver"
            />
            <Heading size={{ base: 'md', md: 'lg' }}>Coberturas</Heading>
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.lg" px={4} py={6}>
        <VStack spacing={6} align="stretch">

          {/* ── Panel de importación de PDF ── */}
          <Box
            bg="gray.50"
            border="2px solid"
            borderColor="gray.200"
            borderRadius="lg"
            p={4}
          >
            <Text fontWeight="bold" fontSize="sm" color="gray.600" mb={3}>
              📄 Importar PDF de coberturas
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              {/* PDF Danone */}
              <Box>
                <input
                  type="file"
                  accept=".pdf"
                  ref={inputDanoneRef}
                  style={{ display: 'none' }}
                  onChange={(e) => handleImportarPDF('danone', e.target.files[0])}
                />
                <Button
                  leftIcon={importandoDanone ? <Spinner size="sm" /> : <AttachmentIcon />}
                  onClick={() => inputDanoneRef.current?.click()}
                  isLoading={importandoDanone}
                  loadingText="Procesando..."
                  colorScheme="blue"
                  variant="outline"
                  w="100%"
                  size="md"
                >
                  🥛 Cargar PDF Danone
                </Button>
              </Box>

              {/* PDF Mastellone */}
              <Box>
                <input
                  type="file"
                  accept=".pdf"
                  ref={inputMastelloneRef}
                  style={{ display: 'none' }}
                  onChange={(e) => handleImportarPDF('mastellone', e.target.files[0])}
                />
                <Button
                  leftIcon={importandoMastellone ? <Spinner size="sm" /> : <AttachmentIcon />}
                  onClick={() => inputMastelloneRef.current?.click()}
                  isLoading={importandoMastellone}
                  loadingText="Procesando..."
                  colorScheme="orange"
                  variant="outline"
                  w="100%"
                  size="md"
                >
                  🧀 Cargar PDF Mastellone
                </Button>
              </Box>
            </SimpleGrid>

            <Text fontSize="xs" color="gray.400" mt={2}>
              Si no hay datos, carga todos los clientes y códigos. Si ya hay datos, marca como completados los códigos que ya no están en el PDF.
            </Text>
          </Box>

          {/* ── Botones de acción ── */}
          <HStack spacing={3}>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="secondary"
              onClick={handleAddCliente}
              size={{ base: 'md', md: 'lg' }}
              flex={1}
            >
              Agregar Cliente
            </Button>
            <Button
              leftIcon={<DeleteIcon />}
              colorScheme="red"
              variant="outline"
              onClick={() => { setShowBorrarModal(true); setConfirmTexto(''); }}
              size={{ base: 'md', md: 'lg' }}
            >
              Borrar todo
            </Button>
          </HStack>

          {/* ── Panel de Progreso General ── */}
          {!isLoading && filteredClientes.length > 0 && (
            <Box
              bg="white"
              border="3px solid"
              borderColor="secondary.500"
              borderRadius="lg"
              p={5}
              shadow="lg"
            >
              <VStack spacing={5}>
                <HStack spacing={3} w="100%" justify="center">
                  <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="accent.900">
                    Progreso Total de Coberturas
                  </Text>
                  {porcentajeTotal === 100 && <CheckCircleIcon w={6} h={6} color="green.500" />}
                </HStack>

                <Flex justify="center" align="center" w="100%">
                  <CircularProgress
                    value={porcentajeTotal}
                    size="130px"
                    thickness="14px"
                    color={porcentajeTotal === 100 ? 'green.400' : 'secondary.500'}
                  >
                    <CircularProgressLabel fontSize="2xl" fontWeight="bold">
                      {porcentajeTotal}%
                    </CircularProgressLabel>
                  </CircularProgress>
                </Flex>

                <Box w="100%">
                  <Progress
                    value={porcentajeTotal}
                    size="lg"
                    colorScheme={porcentajeTotal === 100 ? 'green' : 'secondary'}
                    borderRadius="full"
                    hasStripe
                    isAnimated
                  />
                </Box>

                <HStack spacing={4} fontSize="sm" color="gray.600">
                  <Text>
                    <strong>{filteredClientes.length}</strong>{' '}
                    {filteredClientes.length === 1 ? 'cliente' : 'clientes'}
                  </Text>
                  <Text>•</Text>
                  <Text>
                    <strong>
                      {filteredClientes.filter(c => calcularPorcentajeCliente(c) === 100).length}
                    </strong>{' '}
                    completados
                  </Text>
                </HStack>

                <Divider />

                <SimpleGrid columns={2} spacing={4} w="100%">
                  {/* Danone */}
                  <Box
                    bg="blue.50"
                    border="2px solid"
                    borderColor="blue.200"
                    borderRadius="md"
                    p={4}
                    textAlign="center"
                  >
                    <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={3}>
                      🥛 Danone
                    </Text>
                    <Flex justify="center" mb={3}>
                      <CircularProgress
                        value={danoneStats.porcentaje}
                        size="80px"
                        thickness="10px"
                        color={danoneStats.porcentaje === 100 ? 'green.400' : 'blue.400'}
                      >
                        <CircularProgressLabel fontSize="md" fontWeight="bold" color="blue.700">
                          {danoneStats.porcentaje}%
                        </CircularProgressLabel>
                      </CircularProgress>
                    </Flex>
                    <Progress
                      value={danoneStats.porcentaje}
                      size="sm"
                      colorScheme={danoneStats.porcentaje === 100 ? 'green' : 'blue'}
                      borderRadius="full"
                      mb={2}
                    />
                    <Text fontSize="xs" color="blue.600">
                      {danoneStats.completados} / {danoneStats.total} productos
                    </Text>
                  </Box>

                  {/* Mastellone */}
                  <Box
                    bg="orange.50"
                    border="2px solid"
                    borderColor="orange.200"
                    borderRadius="md"
                    p={4}
                    textAlign="center"
                  >
                    <Text fontSize="sm" fontWeight="bold" color="orange.700" mb={3}>
                      🧀 Mastellone
                    </Text>
                    <Flex justify="center" mb={3}>
                      <CircularProgress
                        value={mastelloneStats.porcentaje}
                        size="80px"
                        thickness="10px"
                        color={mastelloneStats.porcentaje === 100 ? 'green.400' : 'orange.400'}
                      >
                        <CircularProgressLabel fontSize="md" fontWeight="bold" color="orange.700">
                          {mastelloneStats.porcentaje}%
                        </CircularProgressLabel>
                      </CircularProgress>
                    </Flex>
                    <Progress
                      value={mastelloneStats.porcentaje}
                      size="sm"
                      colorScheme={mastelloneStats.porcentaje === 100 ? 'green' : 'orange'}
                      borderRadius="full"
                      mb={2}
                    />
                    <Text fontSize="xs" color="orange.600">
                      {mastelloneStats.completados} / {mastelloneStats.total} productos
                    </Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            </Box>
          )}

          {/* ── Filtros ── */}
          <VStack spacing={3} align="stretch">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Buscar por nombre o apellido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="white"
                border="2px solid"
                borderColor="gray.200"
                _focus={{ borderColor: 'secondary.500' }}
              />
            </InputGroup>

            <Select
              value={frecuenciaFilter}
              onChange={(e) => setFrecuenciaFilter(e.target.value)}
              bg="white"
              border="2px solid"
              borderColor="gray.200"
              _focus={{ borderColor: 'secondary.500' }}
            >
              <option value="todos">Todas las frecuencias</option>
              <option value="LMV">Lunes, Miércoles, Viernes</option>
              <option value="MJS">Martes, Jueves, Sábado</option>
            </Select>

            <Select
              value={coberturaFilter}
              onChange={(e) => setCoberturaFilter(e.target.value)}
              bg="white"
              border="2px solid"
              borderColor="gray.200"
              _focus={{ borderColor: 'secondary.500' }}
            >
              <option value="todos">Todas las coberturas</option>
              <option value="danone">🥛 Con Danone</option>
              <option value="mastellone">🧀 Con Mastellone</option>
              <option value="ambas">🥛🧀 Con ambas empresas</option>
            </Select>
          </VStack>

          {/* ── Lista de Clientes ── */}
          {isLoading ? (
            <Flex justify="center" py={8}>
              <Spinner size="xl" color="secondary.500" thickness="4px" />
            </Flex>
          ) : filteredClientes.length === 0 ? (
            <Text textAlign="center" color="gray.500" py={8}>
              {searchTerm || frecuenciaFilter !== 'todos' || coberturaFilter !== 'todos'
                ? 'No se encontraron clientes con esos filtros'
                : 'No hay clientes. Cargá un PDF o agregá uno manualmente.'}
            </Text>
          ) : (
            <VStack spacing={4} align="stretch" position="relative" pt={4}>
              <Box
                position="absolute"
                left={{ base: '20px', md: '30px' }}
                top="0"
                bottom="0"
                width="3px"
                bg="gray.200"
                zIndex={0}
              />

              {filteredClientes.map((cliente, index) => {
                const borderColor = borderColors[index % borderColors.length];
                const porcentaje = calcularPorcentajeCliente(cliente);
                const totalProductos = cliente.productosDanone.length + cliente.productosMastellone.length;
                const tipo = getTipoCobertura(cliente);

                return (
                  <Flex key={cliente._id} gap={3} position="relative" zIndex={1}>
                    <Box
                      minW={{ base: '40px', md: '50px' }}
                      h={{ base: '40px', md: '50px' }}
                      bg={borderColor}
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="bold"
                      fontSize={{ base: 'lg', md: 'xl' }}
                      color="white"
                      shadow="md"
                      flexShrink={0}
                    >
                      {index + 1}
                    </Box>

                    <Box
                      flex={1}
                      bg="white"
                      border="3px solid"
                      borderColor={borderColor}
                      borderRadius="lg"
                      p={4}
                      shadow="md"
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                      _active={{ transform: 'translateY(0)' }}
                      onClick={() => handleClienteClick(cliente)}
                    >
                      <Flex justify="space-between" align="start">
                        <Box flex={1}>
                          <HStack spacing={2} mb={1}>
                            <Text
                              fontSize={{ base: 'lg', md: 'xl' }}
                              fontWeight="bold"
                              color="accent.900"
                            >
                              {cliente.nombre} {cliente.apellido}
                            </Text>
                            {porcentaje === 100 && <CheckCircleIcon w={5} h={5} color="green.500" />}
                          </HStack>

                          <HStack spacing={2} mb={2} flexWrap="wrap">
                            <Text fontSize="sm" color="gray.600">
                              Frecuencia:{' '}
                              {cliente.frecuencia === 'LMV' ? 'Lun, Mié, Vie' : 'Mar, Jue, Sáb'}
                            </Text>
                            {(tipo === 'danone' || tipo === 'ambas') && (
                              <Badge colorScheme="blue" fontSize="xs">🥛 Danone</Badge>
                            )}
                            {(tipo === 'mastellone' || tipo === 'ambas') && (
                              <Badge colorScheme="orange" fontSize="xs">🧀 Mastellone</Badge>
                            )}
                          </HStack>

                          <HStack spacing={3} align="center" mt={2}>
                            <CircularProgress
                              value={porcentaje}
                              size="50px"
                              thickness="8px"
                              color={porcentaje === 100 ? 'green.400' : 'secondary.500'}
                            >
                              <CircularProgressLabel fontSize="sm" fontWeight="bold">
                                {porcentaje}%
                              </CircularProgressLabel>
                            </CircularProgress>

                            <VStack align="start" spacing={0}>
                              <Badge
                                colorScheme={porcentaje === 100 ? 'green' : 'gray'}
                                fontSize="xs"
                              >
                                {totalProductos}{' '}
                                {totalProductos === 1 ? 'producto' : 'productos'}
                              </Badge>
                              {totalProductos > 0 && (
                                <Text fontSize="xs" color="gray.500">
                                  {Math.round((porcentaje * totalProductos) / 100)} completados
                                </Text>
                              )}
                            </VStack>
                          </HStack>

                          <Box mt={3}>
                            <Progress
                              value={porcentaje}
                              size="sm"
                              colorScheme={porcentaje === 100 ? 'green' : 'secondary'}
                              borderRadius="full"
                              hasStripe={porcentaje < 100}
                              isAnimated={porcentaje < 100}
                            />
                          </Box>
                        </Box>

                        <HStack spacing={1}>
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={(e) => handleEditCliente(cliente, e)}
                            aria-label="Editar cliente"
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={(e) => handleDeleteCliente(cliente._id, e)}
                            aria-label="Eliminar cliente"
                          />
                        </HStack>
                      </Flex>
                    </Box>
                  </Flex>
                );
              })}
            </VStack>
          )}
        </VStack>
      </Container>

      {/* ── Modal Agregar/Editar Cliente ── */}
      <ClienteModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSaveCliente}
        cliente={selectedCliente}
      />

      {/* ── Modal Borrar Todo ── */}
      <Modal
        isOpen={showBorrarModal}
        onClose={() => { setShowBorrarModal(false); setConfirmTexto(''); }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader color="red.600">
            <HStack>
              <WarningIcon />
              <Text>Borrar todos los datos</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Acción irreversible</AlertTitle>
                  <AlertDescription fontSize="sm">
                    Se eliminarán todos los clientes y sus códigos. Esta acción no se puede deshacer.
                  </AlertDescription>
                </Box>
              </Alert>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Escribí <strong>BORRAR</strong> para confirmar:
                </Text>
                <Input
                  value={confirmTexto}
                  onChange={(e) => setConfirmTexto(e.target.value.toUpperCase())}
                  placeholder="BORRAR"
                  border="2px solid"
                  borderColor={confirmTexto === 'BORRAR' ? 'red.400' : 'gray.200'}
                  _focus={{ borderColor: 'red.400' }}
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => { setShowBorrarModal(false); setConfirmTexto(''); }}
            >
              Cancelar
            </Button>
            <Button
              colorScheme="red"
              onClick={handleBorrarTodo}
              isDisabled={confirmTexto !== 'BORRAR'}
              isLoading={borrando}
              loadingText="Borrando..."
            >
              Borrar todo
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Coberturas;
