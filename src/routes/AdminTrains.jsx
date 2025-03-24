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

export default function AdminTrains() {
  const { isLoggedIn, isLoading, user } = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const [trains, setTrains] = useState([]);
  const [isLoadingTrains, setIsLoadingTrains] = useState(false);
  const [error, setError] = useState(null);
  
  // State for modal window for creating/editing train
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [currentTrain, setCurrentTrain] = useState({
    id: null,
    name: "",
    number: "",
    train_type: "passenger",
  });
  
  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [trainToDelete, setTrainToDelete] = useState(null);
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
  
  // Load list of trains
  const fetchTrains = useCallback(async () => {
    setIsLoadingTrains(true);
    setError(null);
    
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
      setError("Failed to load trains. Please try again.");
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
  
  // Load trains when component is mounted
  useEffect(() => {
    if (isLoggedIn && (user?.is_staff || user?.is_superuser)) {
      fetchTrains();
    }
  }, [isLoggedIn, user, fetchTrains]);
  
  // Handler for opening modal window for creating train
  const handleAddTrain = () => {
    setIsEditing(false);
    setCurrentTrain({
      id: null,
      name: "",
      number: "",
      train_type: "passenger",
    });
    onOpen();
  };
  
  // Handler for opening modal window for editing train
  const handleEditTrain = (train) => {
    setIsEditing(true);
    setCurrentTrain({
      id: train.id,
      name: train.name,
      number: train.number,
      train_type: train.train_type,
    });
    onOpen();
  };
  
  // Handler for changing form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTrain({
      ...currentTrain,
      [name]: value,
    });
  };
  
  // Handler for saving train
  const handleSaveTrain = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (isEditing) {
        // Update existing train
        await axios.put(
          `${API_URL}station/trains/${currentTrain.id}/`,
          currentTrain,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        toast({
          title: "Success",
          description: "Train updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new train
        await axios.post(
          `${API_URL}station/trains/`,
          currentTrain,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        toast({
          title: "Success",
          description: "Train created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Close modal window and update list of trains
      onClose();
      fetchTrains();
    } catch (error) {
      console.error("Error saving train:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save train",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handler for opening delete dialog
  const handleDeleteClick = (train) => {
    setTrainToDelete(train);
    setIsDeleteDialogOpen(true);
  };
  
  // Handler for deleting train
  const handleDeleteTrain = async () => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `${API_URL}station/trains/${trainToDelete.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast({
        title: "Success",
        description: "Train deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Close dialog and update list of trains
      setIsDeleteDialogOpen(false);
      fetchTrains();
    } catch (error) {
      console.error("Error deleting train:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete train",
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
              Manage Trains
            </Heading>
          </HStack>
          
          <Button colorScheme="blue" onClick={handleAddTrain}>
            Add Train
          </Button>
        </Flex>
        
        {isLoadingTrains ? (
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
                  <Th>Number</Th>
                  <Th>Type</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {trains.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} textAlign="center">
                      No trains found
                    </Td>
                  </Tr>
                ) : (
                  trains.map((train) => (
                    <Tr key={train.id}>
                      <Td>{train.id}</Td>
                      <Td>{train.name}</Td>
                      <Td>{train.number}</Td>
                      <Td>{train.train_type}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FaEdit />}
                            aria-label="Edit train"
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEditTrain(train)}
                          />
                          <IconButton
                            icon={<FaTrash />}
                            aria-label="Delete train"
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteClick(train)}
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
      
      {/* Modal window for creating/editing train */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Edit Train" : "Add Train"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={currentTrain.name}
                  onChange={handleInputChange}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Number</FormLabel>
                <Input
                  name="number"
                  value={currentTrain.number}
                  onChange={handleInputChange}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Type</FormLabel>
                <Select
                  name="train_type"
                  value={currentTrain.train_type}
                  onChange={handleInputChange}
                >
                  <option value="passenger">Passenger</option>
                  <option value="express">Express</option>
                  <option value="suburban">Suburban</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSaveTrain}
              isDisabled={!currentTrain.name || !currentTrain.number}
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
              Delete Train
            </AlertDialogHeader>
            
            <AlertDialogBody>
              Are you sure you want to delete the train "{trainToDelete?.name}"? This action cannot be undone.
            </AlertDialogBody>
            
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteTrain} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
} 