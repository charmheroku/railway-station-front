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

// Base API URL
const API_URL = process.env.NODE_ENV === "development"
  ? "http://127.0.0.1:8000/api/"
  : "https://railway-station.onrender.com/api/";

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
  
  // State for modal window for creating/editing wagon
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
  
  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [wagonToDelete, setWagonToDelete] = useState(null);
  const cancelRef = useRef();
  
  // Check if user is an administrator
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
  
  // Load list of wagons
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
  
  // Load list of trains
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
  
  // Load list of wagon types
  const fetchWagonTypes = useCallback(async () => {
    setIsLoadingWagonTypes(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}station/wagon-types/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
  
  // Load list of amenities
  const fetchAmenities = useCallback(async () => {
    setIsLoadingAmenities(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}station/wagon-amenities/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
  
  // Load data when component is mounted
  useEffect(() => {
    if (isLoggedIn && (user?.is_staff || user?.is_superuser)) {
      fetchWagons();
      fetchTrains();
      fetchWagonTypes();
      fetchAmenities();
    }
  }, [isLoggedIn, user, fetchWagons, fetchTrains, fetchWagonTypes, fetchAmenities]);
  
  // Handler for opening modal window for creating wagon
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
  
  // Handler for editing wagon
  const handleEditWagon = (wagon) => {
    setIsEditing(true);
    
    
    // Get ID of train and wagon type
    let trainId = "";
    let wagonTypeId = "";
    let amenityIds = [];
    
    // If we have object train
    if (wagon.train && typeof wagon.train === 'object') {
      trainId = wagon.train.id;
    } else {
      trainId = wagon.train;
    }
    
    // For wagon type - if it's a string, find corresponding type in list
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
    
    // For amenities - process different data formats
    if (wagon.amenities && Array.isArray(wagon.amenities)) {
      
      // If array contains objects with id and name
      if (wagon.amenities.length > 0 && typeof wagon.amenities[0] === 'object' && wagon.amenities[0].id) {
        amenityIds = wagon.amenities
          .filter(amenity => amenity !== null && amenity !== undefined)
          .map(amenity => parseInt(amenity.id))
          .filter(id => !isNaN(id));
      } 
      // If array contains strings (amenity names)
      else if (wagon.amenities.length > 0 && typeof wagon.amenities[0] === 'string') {
        amenityIds = wagon.amenities
          .map(amenityName => {
            const matchingAmenity = amenities.find(a => a.name === amenityName);
            if (matchingAmenity) {
              return matchingAmenity.id;
            }
            return null;
          })
          .filter(id => id !== null);
      }
      // If array contains numbers (amenity IDs)
      else if (wagon.amenities.length > 0 && typeof wagon.amenities[0] === 'number') {
        amenityIds = wagon.amenities.filter(id => !isNaN(id));
      }
      // If array is empty, check if wagon has amenity_ids field
      else if (wagon.amenities.length === 0 && wagon.amenity_ids && Array.isArray(wagon.amenity_ids)) {
        amenityIds = wagon.amenity_ids.map(id => parseInt(id)).filter(id => !isNaN(id));
      }
      
    }
    
    // If wagon has amenity_ids field, but no amenities field
    if ((!wagon.amenities || wagon.amenities.length === 0) && 
        wagon.amenity_ids && Array.isArray(wagon.amenity_ids)) {
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
    
    
    setCurrentWagon(updatedWagon);
    onOpen();
  };
  
  // Handler for changing form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentWagon({
      ...currentWagon,
      [name]: value,
    });
  };
  
  // Handler for changing numeric field capacity
  const handleCapacityChange = (value) => {
    setCurrentWagon({
      ...currentWagon,
      capacity: Number(value),
    });
  };
  
  // Handler for changing amenities
  const handleAmenityChange = (amenityId) => {
    
    // Convert amenityId to string for comparison
    const amenityIdStr = String(amenityId);
    
    // Check if amenity is already in list (compare as strings)
    const isSelected = currentWagon.amenities.some(id => String(id) === amenityIdStr);
    
    if (isSelected) {
      // If amenity is already selected, remove it
      const updatedAmenities = currentWagon.amenities.filter(id => String(id) !== amenityIdStr);
      setCurrentWagon({
        ...currentWagon,
        amenities: updatedAmenities
      });
    } else {
      // If amenity is not selected, add it
      const updatedAmenities = [...currentWagon.amenities, parseInt(amenityId)];
      setCurrentWagon({
        ...currentWagon,
        amenities: updatedAmenities
      });
    }
  };
  
  // Handler for saving wagon
  const handleSaveWagon = async () => {
    // Check if all required fields are filled
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
    
    // Convert amenities to array of numbers for sending to server
    const amenityIds = currentWagon.amenities
      .filter(id => id !== null && id !== undefined && id !== "")
      .map(id => {
        const parsedId = parseInt(id);
        return isNaN(parsedId) ? null : parsedId;
      })
      .filter(id => id !== null);
    
    
    try {
      const token = localStorage.getItem("token");
      const wagonData = {
        train: parseInt(currentWagon.train),
        wagon_type: parseInt(currentWagon.wagon_type),
        number: currentWagon.number,
        seats: parseInt(currentWagon.capacity),
        amenities: amenityIds,
      };
      
      
      if (isEditing) {
        // Update existing wagon
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
        // Create new wagon
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
      
      // Close modal window and update list of wagons
      onClose();
      fetchWagons();
    } catch (error) {
      console.error("Error saving wagon:", error);
      
      // Show detailed error information if available
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          "Failed to save wagon. Please try again.";
      
      
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handler for opening delete dialog
  const handleDeleteClick = (wagon) => {
    setWagonToDelete(wagon);
    setIsDeleteDialogOpen(true);
  };
  
  // Handler for deleting wagon
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
      
      // Close dialog and update list of wagons
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
      
      {/* Modal window for creating/editing wagon */}
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
                      
                      // Convert amenity ID to string for more reliable comparison
                      const amenityIdStr = String(amenity.id);
                      const isChecked = currentWagon.amenities.some(id => 
                        String(id) === amenityIdStr
                      );
                      
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
      
      {/* Delete confirmation dialog */}
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