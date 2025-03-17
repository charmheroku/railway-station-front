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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  Badge,
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

export default function AdminWagons() {
  const { isLoggedIn, isLoading, user } = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const [wagons, setWagons] = useState([]);
  const [trains, setTrains] = useState([]);
  const [wagonTypes, setWagonTypes] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [isLoadingWagons, setIsLoadingWagons] = useState(false);
  const [isLoadingTrains, setIsLoadingTrains] = useState(false);
  const [isLoadingWagonTypes, setIsLoadingWagonTypes] = useState(false);
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(false);
  const [error, setError] = useState(null);
  
  // Состояние для модального окна создания/редактирования вагона
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [currentWagon, setCurrentWagon] = useState({
    id: null,
    train: "",
    wagon_type: "",
    number: "",
    capacity: 0,
    amenities: []
  });
  
  // Состояние для диалога удаления
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [wagonToDelete, setWagonToDelete] = useState(null);
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
  
  // Загружаем список вагонов
  const fetchWagons = useCallback(async () => {
    setIsLoadingWagons(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}station/wagons/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Wagons data:", response.data);
      setWagons(response.data);
    } catch (error) {
      console.error("Error fetching wagons:", error);
      setError("Failed to load wagons. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load wagons",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingWagons(false);
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
      console.log("Trains data:", response.data);
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
  
  // Загружаем список типов вагонов
  const fetchWagonTypes = useCallback(async () => {
    setIsLoadingWagonTypes(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}station/wagon-types/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Wagon types data:", response.data);
      setWagonTypes(response.data);
    } catch (error) {
      console.error("Error fetching wagon types:", error);
      toast({
        title: "Error",
        description: "Failed to load wagon types",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingWagonTypes(false);
    }
  }, [toast]);
  
  // Загружаем список удобств
  const fetchAmenities = useCallback(async () => {
    setIsLoadingAmenities(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}station/wagon-amenities/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Amenities data:", response.data);
      setAmenities(response.data);
    } catch (error) {
      console.error("Error fetching amenities:", error);
      toast({
        title: "Error",
        description: "Failed to load amenities",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingAmenities(false);
    }
  }, [toast]);
  
  // Загружаем данные при монтировании компонента
  useEffect(() => {
    if (isLoggedIn && (user?.is_staff || user?.is_superuser)) {
      fetchWagons();
      fetchTrains();
      fetchWagonTypes();
      fetchAmenities();
    }
  }, [isLoggedIn, user, fetchWagons, fetchTrains, fetchWagonTypes, fetchAmenities]);
  
  // Обработчик открытия модального окна для создания вагона
  const handleAddWagon = () => {
    setIsEditing(false);
    setCurrentWagon({
      id: null,
      train: "",
      wagon_type: "",
      number: "",
      capacity: 0,
      amenities: [],
    });
    onOpen();
  };
  
  // Обработчик редактирования вагона
  const handleEditWagon = (wagon) => {
    setIsEditing(true);
    
    console.log("Editing wagon:", wagon);
    console.log("Wagon amenities:", wagon.amenities);
    
    // Получаем ID поезда и типа вагона
    let trainId = "";
    let wagonTypeId = "";
    let amenityIds = [];
    
    // Если у нас есть объект train
    if (wagon.train && typeof wagon.train === 'object') {
      trainId = wagon.train.id;
    } else {
      trainId = wagon.train;
    }
    
    // Для типа вагона - если это строка, ищем соответствующий тип в списке
    if (typeof wagon.wagon_type === 'string') {
      const matchingType = wagonTypes.find(wt => wt.name === wagon.wagon_type);
      if (matchingType) {
        wagonTypeId = matchingType.id;
      }
    } else if (wagon.wagon_type && typeof wagon.wagon_type === 'object') {
      wagonTypeId = wagon.wagon_type.id;
    } else {
      wagonTypeId = wagon.wagon_type;
    }
    
    // Для удобств - обрабатываем разные форматы данных
    if (wagon.amenities && Array.isArray(wagon.amenities)) {
      console.log("Processing amenities:", wagon.amenities);
      
      // Если массив содержит объекты с id и name
      if (wagon.amenities.length > 0 && typeof wagon.amenities[0] === 'object' && wagon.amenities[0].id) {
        console.log("Amenities are objects with id");
        amenityIds = wagon.amenities
          .filter(amenity => amenity !== null && amenity !== undefined)
          .map(amenity => parseInt(amenity.id))
          .filter(id => !isNaN(id));
      } 
      // Если массив содержит строки (названия удобств)
      else if (wagon.amenities.length > 0 && typeof wagon.amenities[0] === 'string') {
        console.log("Amenities are strings, finding matching IDs");
        amenityIds = wagon.amenities
          .map(amenityName => {
            const matchingAmenity = amenities.find(a => a.name === amenityName);
            if (matchingAmenity) {
              console.log(`Found matching amenity for ${amenityName}:`, matchingAmenity);
              return matchingAmenity.id;
            }
            return null;
          })
          .filter(id => id !== null);
      }
      // Если массив содержит числа (ID удобств)
      else if (wagon.amenities.length > 0 && typeof wagon.amenities[0] === 'number') {
        console.log("Amenities are numbers");
        amenityIds = wagon.amenities.filter(id => !isNaN(id));
      }
      // Если массив пустой, проверяем, есть ли у вагона поле amenity_ids
      else if (wagon.amenities.length === 0 && wagon.amenity_ids && Array.isArray(wagon.amenity_ids)) {
        console.log("Using amenity_ids instead:", wagon.amenity_ids);
        amenityIds = wagon.amenity_ids.map(id => parseInt(id)).filter(id => !isNaN(id));
      }
      
      console.log("Processed amenity IDs:", amenityIds);
    }
    
    // Если у вагона есть поле amenity_ids, но нет поля amenities
    if ((!wagon.amenities || wagon.amenities.length === 0) && 
        wagon.amenity_ids && Array.isArray(wagon.amenity_ids)) {
      console.log("Using amenity_ids field:", wagon.amenity_ids);
      amenityIds = wagon.amenity_ids.map(id => parseInt(id)).filter(id => !isNaN(id));
    }
    
    const updatedWagon = {
      id: wagon.id,
      train: trainId,
      wagon_type: wagonTypeId,
      number: wagon.number,
      capacity: wagon.seats || wagon.capacity || 0,
      amenities: amenityIds,
    };
    
    console.log("Updated wagon state:", updatedWagon);
    
    setCurrentWagon(updatedWagon);
    onOpen();
  };
  
  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentWagon({
      ...currentWagon,
      [name]: value,
    });
  };
  
  // Обработчик изменения числового поля вместимости
  const handleCapacityChange = (value) => {
    setCurrentWagon({
      ...currentWagon,
      capacity: Number(value),
    });
  };
  
  // Обработчик изменения удобств
  const handleAmenityChange = (amenityId) => {
    console.log("Amenity change:", amenityId);
    console.log("Current amenities:", currentWagon.amenities);
    
    // Преобразуем amenityId в строку для сравнения
    const amenityIdStr = String(amenityId);
    
    // Проверяем, есть ли уже это удобство в списке (сравниваем как строки)
    const isSelected = currentWagon.amenities.some(id => String(id) === amenityIdStr);
    console.log("Is selected:", isSelected);
    
    if (isSelected) {
      // Если удобство уже выбрано, удаляем его
      const updatedAmenities = currentWagon.amenities.filter(id => String(id) !== amenityIdStr);
      console.log("Updated amenities (after removal):", updatedAmenities);
      setCurrentWagon({
        ...currentWagon,
        amenities: updatedAmenities
      });
    } else {
      // Если удобство не выбрано, добавляем его
      const updatedAmenities = [...currentWagon.amenities, parseInt(amenityId)];
      console.log("Updated amenities (after addition):", updatedAmenities);
      setCurrentWagon({
        ...currentWagon,
        amenities: updatedAmenities
      });
    }
  };
  
  // Обработчик сохранения вагона
  const handleSaveWagon = async () => {
    // Проверяем, что все обязательные поля заполнены
    if (!currentWagon.train || !currentWagon.wagon_type || !currentWagon.number) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Преобразуем amenities в массив чисел для отправки на сервер
    const amenityIds = currentWagon.amenities
      .filter(id => id !== null && id !== undefined && id !== "")
      .map(id => {
        const parsedId = parseInt(id);
        return isNaN(parsedId) ? null : parsedId;
      })
      .filter(id => id !== null);
    
    console.log("Saving wagon with amenities:", amenityIds);
    
    try {
      const token = localStorage.getItem("token");
      const wagonData = {
        train: parseInt(currentWagon.train),
        type: parseInt(currentWagon.wagon_type),
        number: currentWagon.number,
        seats: parseInt(currentWagon.capacity),
        amenities: amenityIds,
      };
      
      console.log("Sending wagon data:", wagonData);
      
      if (isEditing) {
        // Обновляем существующий вагон
        await axios.put(`${API_URL}station/wagons/${currentWagon.id}/`, wagonData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast({
          title: "Success",
          description: "Wagon updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Создаем новый вагон
        await axios.post(`${API_URL}station/wagons/`, wagonData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast({
          title: "Success",
          description: "Wagon created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Закрываем модальное окно и обновляем список вагонов
      onClose();
      fetchWagons();
    } catch (error) {
      console.error("Error saving wagon:", error);
      
      // Показываем детальную информацию об ошибке, если она доступна
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          "Failed to save wagon. Please try again.";
      
      console.log("Error details:", error.response?.data);
      
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Обработчик открытия диалога удаления
  const handleDeleteClick = (wagon) => {
    setWagonToDelete(wagon);
    setIsDeleteDialogOpen(true);
  };
  
  // Обработчик удаления вагона
  const handleDeleteWagon = async () => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `${API_URL}station/wagons/${wagonToDelete.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast({
        title: "Success",
        description: "Wagon deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Закрываем диалог и обновляем список вагонов
      setIsDeleteDialogOpen(false);
      fetchWagons();
    } catch (error) {
      console.error("Error deleting wagon:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete wagon",
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
              Manage Wagons
            </Heading>
          </HStack>
          
          <Button colorScheme="blue" onClick={handleAddWagon}>
            Add Wagon
          </Button>
        </Flex>
        
        {isLoadingWagons ? (
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
                  <Th>Type</Th>
                  <Th>Number</Th>
                  <Th>Seats</Th>
                  <Th>Fare Multiplier</Th>
                  <Th>Amenities</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {wagons.length === 0 ? (
                  <Tr>
                    <Td colSpan={8} textAlign="center">
                      No wagons found
                    </Td>
                  </Tr>
                ) : (
                  wagons.map((wagon) => (
                    <Tr key={wagon.id}>
                      <Td>{wagon.id}</Td>
                      <Td>{wagon.train?.name || wagon.train_name} ({wagon.train?.number || wagon.train_number})</Td>
                      <Td>{wagon.wagon_type}</Td>
                      <Td>{wagon.number}</Td>
                      <Td>{wagon.seats}</Td>
                      <Td>{wagon.wagon_fare_multiplier}</Td>
                      <Td>
                        <HStack spacing={1} flexWrap="wrap">
                          {wagon.amenities && wagon.amenities.length > 0 ? (
                            wagon.amenities.map((amenity) => (
                              <Badge key={typeof amenity === 'object' ? amenity.id : amenity} 
                                     colorScheme="blue" mr={1} mb={1}>
                                {typeof amenity === 'object' ? amenity.name : amenity}
                              </Badge>
                            ))
                          ) : (
                            <Text fontSize="sm" color="gray.500">No amenities</Text>
                          )}
                        </HStack>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FaEdit />}
                            aria-label="Edit wagon"
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEditWagon(wagon)}
                          />
                          <IconButton
                            icon={<FaTrash />}
                            aria-label="Delete wagon"
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteClick(wagon)}
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
      
      {/* Модальное окно для создания/редактирования вагона */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Edit Wagon" : "Add Wagon"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Train</FormLabel>
                <Select
                  name="train"
                  value={currentWagon.train}
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
                <FormLabel>Wagon Type</FormLabel>
                <Select
                  name="wagon_type"
                  value={currentWagon.wagon_type}
                  onChange={handleInputChange}
                  placeholder="Select wagon type"
                  isDisabled={isLoadingWagonTypes}
                >
                  {wagonTypes.map((wagonType) => (
                    <option key={wagonType.id} value={wagonType.id}>
                      {wagonType.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Wagon Number</FormLabel>
                <Input
                  name="number"
                  value={currentWagon.number}
                  onChange={handleInputChange}
                  placeholder="Enter wagon number"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Capacity</FormLabel>
                <NumberInput
                  min={1}
                  value={currentWagon.capacity}
                  onChange={handleCapacityChange}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel>Amenities</FormLabel>
                <Box maxH="200px" overflowY="auto" p={2} borderWidth={1} borderRadius="md">
                  {isLoadingAmenities ? (
                    <Spinner size="sm" />
                  ) : amenities.length === 0 ? (
                    <Text>No amenities available</Text>
                  ) : (
                    amenities.map((amenity) => {
                      console.log("Rendering amenity checkbox:", amenity);
                      console.log("Current wagon amenities:", currentWagon.amenities);
                      
                      // Преобразуем ID удобства в строку для более надежного сравнения
                      const amenityIdStr = String(amenity.id);
                      const isChecked = currentWagon.amenities.some(id => 
                        String(id) === amenityIdStr
                      );
                      
                      console.log(`Amenity ${amenity.name} (${amenity.id}) is checked:`, isChecked);
                      return (
                        <Checkbox
                          key={amenity.id}
                          isChecked={isChecked}
                          onChange={() => handleAmenityChange(amenity.id)}
                          mb={2}
                          width="100%"
                        >
                          {amenity.name}
                        </Checkbox>
                      );
                    })
                  )}
                </Box>
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSaveWagon}
              isDisabled={
                !currentWagon.train ||
                !currentWagon.wagon_type ||
                !currentWagon.number ||
                currentWagon.capacity < 1
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
              Delete Wagon
            </AlertDialogHeader>
            
            <AlertDialogBody>
              Are you sure you want to delete wagon #{wagonToDelete?.number} 
              {wagonToDelete?.train?.name ? ` from train ${wagonToDelete.train.name}` : ""}? 
              This action cannot be undone.
            </AlertDialogBody>
            
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteWagon} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
} 