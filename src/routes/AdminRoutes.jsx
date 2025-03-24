import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
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
} from "@chakra-ui/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../lib/useUser";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import axios from "axios";

// Base API URL
const API_URL = process.env.NODE_ENV === "development"
  ? "http://127.0.0.1:8000/api/"
  : "https://api.railway-station.com/api/";

export default function AdminRoutes() {
  const { isLoggedIn, isLoading, user } = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const [routes, setRoutes] = useState([]);
  const [stations, setStations] = useState([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [error, setError] = useState(null);
  
  // State for modal window for creating/editing route
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoute, setCurrentRoute] = useState({
    id: null,
    origin_station: "",
    destination_station: "",
    distance_km: 0,
  });
  
  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState(null);
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
  
  // Load list of routes
  const fetchRoutes = useCallback(async () => {
    setIsLoadingRoutes(true);
    setError(null);
    
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
      setError("Failed to load routes. Please try again.");
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
  
  // Load list of stations for dropdown lists
  const fetchStations = useCallback(async () => {
    setIsLoadingStations(true);
    
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
  }, [toast]);
  
  // Load routes and stations when component is mounted
  useEffect(() => {
    if (isLoggedIn && (user?.is_staff || user?.is_superuser)) {
      fetchRoutes();
      fetchStations();
    }
  }, [isLoggedIn, user, fetchRoutes, fetchStations]);
  
  // Handler for opening modal window for creating route
  const handleAddRoute = () => {
    setIsEditing(false);
    setCurrentRoute({
      id: null,
      origin_station: "",
      destination_station: "",
      distance_km: 0,
    });
    onOpen();
  };
  
  // Handler for opening modal window for editing route
  const handleEditRoute = (route) => {
    setIsEditing(true);
    
    // Find station IDs by their names, if they are represented as strings
    let originId = route.origin?.id || route.origin_station?.id || "";
    let destinationId = route.destination?.id || route.destination_station?.id || "";
    
    if (typeof route.origin_station === 'string') {
      const originStation = stations.find(s => s.name === route.origin_station);
      if (originStation) {
        originId = originStation.id;
      }
    }
    
    if (typeof route.destination_station === 'string') {
      const destinationStation = stations.find(s => s.name === route.destination_station);
      if (destinationStation) {
        destinationId = destinationStation.id;
      }
    }
    
    setCurrentRoute({
      id: route.id,
      origin_station: originId,
      destination_station: destinationId,
      distance_km: route.distance_km,
    });
    onOpen();
  };
  
  // Handler for changing form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentRoute({
      ...currentRoute,
      [name]: value,
    });
  };
  
  // Handler for changing numeric field
  const handleNumberInputChange = (name, value) => {
    setCurrentRoute({
      ...currentRoute,
      [name]: parseInt(value),
    });
  };
  
  // Handler for saving route
  const handleSaveRoute = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (isEditing) {
        // Update existing route
        await axios.put(
          `${API_URL}station/routes/${currentRoute.id}/`,
          currentRoute,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        toast({
          title: "Success",
          description: "Route updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new route
        await axios.post(
          `${API_URL}station/routes/`,
          currentRoute,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        toast({
          title: "Success",
          description: "Route created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Close modal window and update list of routes
      onClose();
      fetchRoutes();
    } catch (error) {
      console.error("Error saving route:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save route",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handler for opening delete dialog
  const handleDeleteClick = (route) => {
    setRouteToDelete(route);
    setIsDeleteDialogOpen(true);
  };
  
  // Handler for deleting route
  const handleDeleteRoute = async () => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `${API_URL}station/routes/${routeToDelete.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast({
        title: "Success",
        description: "Route deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Close dialog and update list of routes
      setIsDeleteDialogOpen(false);
      fetchRoutes();
    } catch (error) {
      console.error("Error deleting route:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete route",
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
              Manage Routes
            </Heading>
          </HStack>
          
          <Button colorScheme="blue" onClick={handleAddRoute}>
            Add Route
          </Button>
        </Flex>
        
        {isLoadingRoutes ? (
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
                  <Th>Origin Station</Th>
                  <Th>Destination Station</Th>
                  <Th>Distance (km)</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {routes.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} textAlign="center">
                      No routes found
                    </Td>
                  </Tr>
                ) : (
                  routes.map((route) => (
                    <Tr key={route.id}>
                      <Td>{route.id}</Td>
                      <Td>{typeof route.origin_station === 'string' ? route.origin_station : route.origin?.name || route.origin_station?.name || "Unknown"}</Td>
                      <Td>{typeof route.destination_station === 'string' ? route.destination_station : route.destination?.name || route.destination_station?.name || "Unknown"}</Td>
                      <Td>{route.distance_km}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FaEdit />}
                            aria-label="Edit route"
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEditRoute(route)}
                          />
                          <IconButton
                            icon={<FaTrash />}
                            aria-label="Delete route"
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteClick(route)}
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
      
      {/* Modal window for creating/editing route */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Edit Route" : "Add Route"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Origin Station</FormLabel>
                <Select
                  name="origin_station"
                  value={currentRoute.origin_station}
                  onChange={handleInputChange}
                  placeholder="Select origin station"
                  isDisabled={isLoadingStations}
                >
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name} ({station.city})
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Destination Station</FormLabel>
                <Select
                  name="destination_station"
                  value={currentRoute.destination_station}
                  onChange={handleInputChange}
                  placeholder="Select destination station"
                  isDisabled={isLoadingStations}
                >
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name} ({station.city})
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Distance (km)</FormLabel>
                <NumberInput
                  min={1}
                  value={currentRoute.distance_km}
                  onChange={(value) => handleNumberInputChange("distance_km", value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSaveRoute}
              isDisabled={
                !currentRoute.origin_station || 
                !currentRoute.destination_station || 
                currentRoute.origin_station === currentRoute.destination_station ||
                currentRoute.distance_km <= 0
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
              Delete Route
            </AlertDialogHeader>
            
            <AlertDialogBody>
              Are you sure you want to delete the route from "{typeof routeToDelete?.origin_station === 'string' ? routeToDelete?.origin_station : routeToDelete?.origin?.name || routeToDelete?.origin_station?.name || "Unknown"}" to "{typeof routeToDelete?.destination_station === 'string' ? routeToDelete?.destination_station : routeToDelete?.destination?.name || routeToDelete?.destination_station?.name || "Unknown"}"? This action cannot be undone.
            </AlertDialogBody>
            
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteRoute} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
} 