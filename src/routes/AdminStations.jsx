import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  useDisclosure,
  useToast,
  IconButton,
  HStack,
  Spinner,
  Text,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../lib/useUser";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import axios from "axios";

// Базовый URL API
const API_URL = process.env.NODE_ENV === "development"
  ? "http://127.0.0.1:8000/api/"
  : "https://api.railway-station.com/api/";

export default function AdminStations() {
  const { isLoggedIn, isLoading, user } = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const [stations, setStations] = useState([]);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [error, setError] = useState(null);
  
  // Состояние для модального окна создания/редактирования станции
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [currentStation, setCurrentStation] = useState({
    id: null,
    name: "",
    city: "",
    address: "",
  });
  
  // Состояние для диалога удаления
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [stationToDelete, setStationToDelete] = useState(null);
  const cancelRef = useRef();
  
  // Проверяем, является ли пользователь администратором
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      toast({
        title: "Access denied",
        description: "Please log in as an administrator",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/admin/login");
      return;
    }
    
    if (!isLoading && isLoggedIn && user && !(user.is_staff || user.is_superuser)) {
      toast({
        title: "Access denied",
        description: "You don't have permission to access the admin panel",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/");
    }
  }, [isLoading, isLoggedIn, user, navigate, toast]);
  
  // Загружаем список станций
  const fetchStations = async () => {
    setIsLoadingStations(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}station/stations/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStations(response.data);
    } catch (error) {
      console.error("Error fetching stations:", error);
      setError("Failed to load stations. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load stations",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingStations(false);
    }
  };
  
  // Загружаем станции при монтировании компонента
  useEffect(() => {
    if (isLoggedIn && (user?.is_staff || user?.is_superuser)) {
      fetchStations();
    }
  }, [isLoggedIn, user]);
  
  // Обработчик открытия модального окна для создания станции
  const handleAddStation = () => {
    setIsEditing(false);
    setCurrentStation({
      id: null,
      name: "",
      city: "",
      address: "",
    });
    onOpen();
  };
  
  // Обработчик открытия модального окна для редактирования станции
  const handleEditStation = (station) => {
    setIsEditing(true);
    setCurrentStation({
      id: station.id,
      name: station.name,
      city: station.city,
      address: station.address,
    });
    onOpen();
  };
  
  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentStation({
      ...currentStation,
      [name]: value,
    });
  };
  
  // Обработчик сохранения станции
  const handleSaveStation = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (isEditing) {
        // Обновляем существующую станцию
        await axios.put(
          `${API_URL}station/stations/${currentStation.id}/`,
          currentStation,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        toast({
          title: "Success",
          description: "Station updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Создаем новую станцию
        await axios.post(
          `${API_URL}station/stations/`,
          currentStation,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        toast({
          title: "Success",
          description: "Station created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Закрываем модальное окно и обновляем список станций
      onClose();
      fetchStations();
    } catch (error) {
      console.error("Error saving station:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save station",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Обработчик открытия диалога удаления
  const handleDeleteClick = (station) => {
    setStationToDelete(station);
    setIsDeleteDialogOpen(true);
  };
  
  // Обработчик удаления станции
  const handleDeleteStation = async () => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `${API_URL}station/stations/${stationToDelete.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast({
        title: "Success",
        description: "Station deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Закрываем диалог и обновляем список станций
      setIsDeleteDialogOpen(false);
      fetchStations();
    } catch (error) {
      console.error("Error deleting station:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete station",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  if (isLoading) {
    return (
      <Container maxW="container.xl" py={10}>
        <Text>Loading...</Text>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <HStack>
            <IconButton
              icon={<FaArrowLeft />}
              aria-label="Back to dashboard"
              onClick={() => navigate("/admin/dashboard")}
              variant="outline"
            />
            <Heading as="h1" size="xl">
              Manage Stations
            </Heading>
          </HStack>
          
          <Button colorScheme="blue" onClick={handleAddStation}>
            Add Station
          </Button>
        </Flex>
        
        {isLoadingStations ? (
          <Flex justify="center" py={10}>
            <Spinner size="xl" />
          </Flex>
        ) : error ? (
          <Box p={4} bg="red.100" color="red.800" borderRadius="md">
            {error}
          </Box>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Name</Th>
                  <Th>City</Th>
                  <Th>Address</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {stations.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} textAlign="center">
                      No stations found
                    </Td>
                  </Tr>
                ) : (
                  stations.map((station) => (
                    <Tr key={station.id}>
                      <Td>{station.id}</Td>
                      <Td>{station.name}</Td>
                      <Td>{station.city}</Td>
                      <Td>{station.address}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FaEdit />}
                            aria-label="Edit station"
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEditStation(station)}
                          />
                          <IconButton
                            icon={<FaTrash />}
                            aria-label="Delete station"
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteClick(station)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>
      
      {/* Модальное окно для создания/редактирования станции */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Edit Station" : "Add Station"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={currentStation.name}
                  onChange={handleInputChange}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>City</FormLabel>
                <Input
                  name="city"
                  value={currentStation.city}
                  onChange={handleInputChange}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Address</FormLabel>
                <Input
                  name="address"
                  value={currentStation.address}
                  onChange={handleInputChange}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSaveStation}
              isDisabled={!currentStation.name || !currentStation.city || !currentStation.address}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Диалог подтверждения удаления */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Station
            </AlertDialogHeader>
            
            <AlertDialogBody>
              Are you sure you want to delete the station "{stationToDelete?.name}"? This action cannot be undone.
            </AlertDialogBody>
            
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteStation} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
} 