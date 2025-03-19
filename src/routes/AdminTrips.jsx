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
  Select,
  FormHelperText,
} from "@chakra-ui/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../lib/useUser";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import axios from "axios";

// Базовый URL API
const API_URL = process.env.NODE_ENV === "development"
  ? "http://127.0.0.1:8000/api/"
  : "https://api.railway-station.com/api/";

export default function AdminTrips() {
  const { isLoggedIn, isLoading, user } = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [trains, setTrains] = useState([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isLoadingTrains, setIsLoadingTrains] = useState(false);
  const [error, setError] = useState(null);
  
  // Состояние для модального окна создания/редактирования поездки
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [currentTrip, setCurrentTrip] = useState({
    id: null,
    route: "",
    train: "",
    departure_time: "",
    arrival_time: "",
    base_price: "",
  });
  
  // Состояние для диалога удаления
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
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
  
  // Загружаем список поездок
  const fetchTrips = useCallback(async () => {
    setIsLoadingTrips(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}station/trips/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Trips data:", response.data);
      setTrips(response.data);
    } catch (error) {
      console.error("Error fetching trips:", error);
      setError("Failed to load trips. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load trips",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingTrips(false);
    }
  }, [toast]);
  
  // Загружаем список маршрутов
  const fetchRoutes = useCallback(async () => {
    setIsLoadingRoutes(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}station/routes/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRoutes(response.data);
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast({
        title: "Error",
        description: "Failed to load routes",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingRoutes(false);
    }
  }, [toast]);
  
  // Загружаем список поездов
  const fetchTrains = useCallback(async () => {
    setIsLoadingTrains(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}station/trains/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTrains(response.data);
    } catch (error) {
      console.error("Error fetching trains:", error);
      toast({
        title: "Error",
        description: "Failed to load trains",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingTrains(false);
    }
  }, [toast]);
  
  // Загружаем данные при монтировании компонента
  useEffect(() => {
    if (isLoggedIn && (user?.is_staff || user?.is_superuser)) {
      fetchTrips();
      fetchRoutes();
      fetchTrains();
    }
  }, [isLoggedIn, user, fetchTrips, fetchRoutes, fetchTrains]);
  
  // Обработчик открытия модального окна для создания поездки
  const handleAddTrip = () => {
    setIsEditing(false);
    setCurrentTrip({
      id: null,
      route: "",
      train: "",
      departure_time: "",
      arrival_time: "",
      base_price: "",
    });
    onOpen();
  };
  
  // Обработчик открытия модального окна для редактирования поездки
  const handleEditTrip = (trip) => {
    setIsEditing(true);
    
    // Форматируем дату и время для полей ввода
    const formatDateTime = (dateTimeStr) => {
      if (!dateTimeStr) return "";
      const date = new Date(dateTimeStr);
      return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
    };
    
    // Находим ID маршрута и поезда по названиям станций и поезда
    let routeId = "";
    let trainId = "";
    
    // Если у нас есть объекты route и train
    if (trip.route && typeof trip.route === 'object') {
      routeId = trip.route.id;
    } 
    // Если у нас есть строковые названия станций
    else if (trip.origin_station && trip.destination_station) {
      // Ищем маршрут с такими же станциями
      const matchingRoute = routes.find(r => 
        (r.origin_station === trip.origin_station || r.origin?.name === trip.origin_station) && 
        (r.destination_station === trip.destination_station || r.destination?.name === trip.destination_station)
      );
      if (matchingRoute) {
        routeId = matchingRoute.id;
      }
    }
    
    // Если у нас есть объект train
    if (trip.train && typeof trip.train === 'object') {
      trainId = trip.train.id;
    } 
    // Если у нас есть строковые названия поезда и номер
    else if (trip.train_name && trip.train_number) {
      // Ищем поезд с таким же названием и номером
      const matchingTrain = trains.find(t => 
        t.name === trip.train_name && t.number === trip.train_number
      );
      if (matchingTrain) {
        trainId = matchingTrain.id;
      }
    }
    
    setCurrentTrip({
      id: trip.id,
      route: routeId,
      train: trainId,
      departure_time: formatDateTime(trip.departure_time),
      arrival_time: formatDateTime(trip.arrival_time),
      base_price: trip.base_price,
    });
    onOpen();
  };
  
  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTrip({
      ...currentTrip,
      [name]: value,
    });
  };
  
  // Обработчик сохранения поездки
  const handleSaveTrip = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (isEditing) {
        // Обновляем существующую поездку
        await axios.put(
          `${API_URL}station/trips/${currentTrip.id}/`,
          currentTrip,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        toast({
          title: "Success",
          description: "Trip updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Создаем новую поездку
        await axios.post(
          `${API_URL}station/trips/`,
          currentTrip,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        toast({
          title: "Success",
          description: "Trip created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Закрываем модальное окно и обновляем список поездок
      onClose();
      fetchTrips();
    } catch (error) {
      console.error("Error saving trip:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save trip",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Обработчик открытия диалога удаления
  const handleDeleteClick = (trip) => {
    setTripToDelete(trip);
    setIsDeleteDialogOpen(true);
  };
  
  // Обработчик удаления поездки
  const handleDeleteTrip = async () => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `${API_URL}station/trips/${tripToDelete.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast({
        title: "Success",
        description: "Trip deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Закрываем диалог и обновляем список поездок
      setIsDeleteDialogOpen(false);
      fetchTrips();
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete trip",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Форматирование даты и времени для отображения
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "-";
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };
  
  // Вычисление продолжительности поездки
  const calculateDuration = (departure, arrival) => {
    if (!departure || !arrival) return "-";
    
    const departureDate = new Date(departure);
    const arrivalDate = new Date(arrival);
    const durationMs = arrivalDate - departureDate;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
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
              Manage Trips
            </Heading>
          </HStack>
          
          <Button colorScheme="blue" onClick={handleAddTrip}>
            Add Trip
          </Button>
        </Flex>
        
        {isLoadingTrips ? (
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
                  <Th>Train</Th>
                  <Th>Origin</Th>
                  <Th>Destination</Th>
                  <Th>Departure</Th>
                  <Th>Arrival</Th>
                  <Th>Duration</Th>
                  <Th>Base Price</Th>
                  <Th>Wagon Types</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {trips.length === 0 ? (
                  <Tr>
                    <Td colSpan={10} textAlign="center">
                      No trips found
                    </Td>
                  </Tr>
                ) : (
                  trips.map((trip) => (
                    <Tr key={trip.id}>
                      <Td>{trip.id}</Td>
                      <Td>{trip.train_name} ({trip.train_number})</Td>
                      <Td>{trip.origin_station}</Td>
                      <Td>{trip.destination_station}</Td>
                      <Td>{formatDateTime(trip.departure_time)}</Td>
                      <Td>{formatDateTime(trip.arrival_time)}</Td>
                      <Td>{trip.duration_minutes ? `${Math.floor(trip.duration_minutes / 60)}h ${trip.duration_minutes % 60}m` : calculateDuration(trip.departure_time, trip.arrival_time)}</Td>
                      <Td>{trip.base_price}</Td>
                      <Td>
                        {trip.wagon_types && trip.wagon_types.length > 0 ? (
                          <HStack spacing={1} flexWrap="wrap">
                            {trip.wagon_types.map(type => (
                              <Text key={type.id} fontSize="sm">
                                {type.name} (x{type.fare_multiplier})
                              </Text>
                            ))}
                          </HStack>
                        ) : (
                          <Text fontSize="sm" color="gray.500">No types</Text>
                        )}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FaEdit />}
                            aria-label="Edit trip"
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEditTrip(trip)}
                          />
                          <IconButton
                            icon={<FaTrash />}
                            aria-label="Delete trip"
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteClick(trip)}
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
      
      {/* Модальное окно для создания/редактирования поездки */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Edit Trip" : "Add Trip"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Route</FormLabel>
                <Select
                  name="route"
                  value={currentTrip.route}
                  onChange={handleInputChange}
                  placeholder="Select route"
                  isDisabled={isLoadingRoutes}
                >
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {typeof route.origin_station === 'string' && typeof route.destination_station === 'string' ? 
                        `${route.origin_station} - ${route.destination_station}` : 
                        (route.origin?.name && route.destination?.name) ? 
                        `${route.origin.name} - ${route.destination.name}` : 
                        "Unknown route"}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Train</FormLabel>
                <Select
                  name="train"
                  value={currentTrip.train}
                  onChange={handleInputChange}
                  placeholder="Select train"
                  isDisabled={isLoadingTrains}
                >
                  {trains.map((train) => (
                    <option key={train.id} value={train.id}>
                      {`${train.name} (${train.number})`}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Departure Time</FormLabel>
                <Input
                  name="departure_time"
                  type="datetime-local"
                  value={currentTrip.departure_time}
                  onChange={handleInputChange}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Arrival Time</FormLabel>
                <Input
                  name="arrival_time"
                  type="datetime-local"
                  value={currentTrip.arrival_time}
                  onChange={handleInputChange}
                />
                <FormHelperText>
                  Arrival time must be after departure time
                </FormHelperText>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Base Price</FormLabel>
                <Input
                  name="base_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentTrip.base_price}
                  onChange={handleInputChange}
                  placeholder="Enter base price"
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
              onClick={handleSaveTrip}
              isDisabled={
                !currentTrip.route ||
                !currentTrip.train ||
                !currentTrip.departure_time ||
                !currentTrip.arrival_time ||
                !currentTrip.base_price
              }
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
              Delete Trip
            </AlertDialogHeader>
            
            <AlertDialogBody>
              Are you sure you want to delete this trip? This action cannot be undone.
            </AlertDialogBody>
            
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteTrip} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
} 