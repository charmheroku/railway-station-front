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
  : "https://railway-station.onrender.com/api/";

export default function AdminWagonTypes() {
  const { isLoggedIn, isLoading, user } = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const [wagonTypes, setWagonTypes] = useState([]);
  const [isLoadingWagonTypes, setIsLoadingWagonTypes] = useState(false);
  const [error, setError] = useState(null);
  
  // State for modal window for creating/editing wagon type
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [currentWagonType, setCurrentWagonType] = useState({
    id: null,
    name: "",
    fare_multiplier: "1.00",
  });
  
  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [wagonTypeToDelete, setWagonTypeToDelete] = useState(null);
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
  
  // Load list of wagon types
  const fetchWagonTypes = useCallback(async () => {
    setIsLoadingWagonTypes(true);
    setError(null);
    
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
      setError("Failed to load wagon types. Please try again.");
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
  
  // Load wagon types when component is mounted
  useEffect(() => {
    if (isLoggedIn && (user?.is_staff || user?.is_superuser)) {
      fetchWagonTypes();
    }
  }, [isLoggedIn, user, fetchWagonTypes]);
  
  // Handler for opening modal window for creating wagon type
  const handleAddWagonType = () => {
    setIsEditing(false);
    setCurrentWagonType({
      id: null,
      name: "",
      fare_multiplier: "1.00",
    });
    onOpen();
  };
  
  // Handler for opening modal window for editing wagon type
  const handleEditWagonType = (wagonType) => {
    setIsEditing(true);
    setCurrentWagonType({
      id: wagonType.id,
      name: wagonType.name,
      fare_multiplier: wagonType.fare_multiplier,
    });
    onOpen();
  };
  
  // Handler for changing form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentWagonType({
      ...currentWagonType,
      [name]: value,
    });
  };
  
  // Handler for changing numeric field
  const handleNumberInputChange = (name, value) => {
    setCurrentWagonType({
      ...currentWagonType,
      [name]: value,
    });
  };
  
  // Handler for saving wagon type
  const handleSaveWagonType = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (isEditing) {
        // Update existing wagon type
        await axios.put(
          `${API_URL}station/wagon-types/${currentWagonType.id}/`,
          currentWagonType,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        toast({
          title: "Success",
          description: "Wagon type updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new wagon type
        await axios.post(
          `${API_URL}station/wagon-types/`,
          currentWagonType,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        toast({
          title: "Success",
          description: "Wagon type created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Close modal window and update list of wagon types
      onClose();
      fetchWagonTypes();
    } catch (error) {
      console.error("Error saving wagon type:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save wagon type",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handler for opening delete dialog
  const handleDeleteClick = (wagonType) => {
    setWagonTypeToDelete(wagonType);
    setIsDeleteDialogOpen(true);
  };
  
  // Handler for deleting wagon type
  const handleDeleteWagonType = async () => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `${API_URL}station/wagon-types/${wagonTypeToDelete.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast({
        title: "Success",
        description: "Wagon type deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Close dialog and update list of wagon types
      setIsDeleteDialogOpen(false);
      fetchWagonTypes();
    } catch (error) {
      console.error("Error deleting wagon type:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete wagon type",
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
              Manage Wagon Types
            </Heading>
          </HStack>
          
          <Button colorScheme="blue" onClick={handleAddWagonType}>
            Add Wagon Type
          </Button>
        </Flex>
        
        {isLoadingWagonTypes ? (
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
                  <Th>Fare Multiplier</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {wagonTypes.length === 0 ? (
                  <Tr>
                    <Td colSpan={4} textAlign="center">
                      No wagon types found
                    </Td>
                  </Tr>
                ) : (
                  wagonTypes.map((wagonType) => (
                    <Tr key={wagonType.id}>
                      <Td>{wagonType.id}</Td>
                      <Td>{wagonType.name}</Td>
                      <Td>x{wagonType.fare_multiplier}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FaEdit />}
                            aria-label="Edit wagon type"
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEditWagonType(wagonType)}
                          />
                          <IconButton
                            icon={<FaTrash />}
                            aria-label="Delete wagon type"
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteClick(wagonType)}
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
      
      {/* Modal window for creating/editing wagon type */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Edit Wagon Type" : "Add Wagon Type"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={currentWagonType.name}
                  onChange={handleInputChange}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Fare Multiplier</FormLabel>
                <NumberInput
                  min={0.1}
                  max={10}
                  step={0.1}
                  precision={2}
                  value={currentWagonType.fare_multiplier}
                  onChange={(value) => handleNumberInputChange("fare_multiplier", value)}
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
              onClick={handleSaveWagonType}
              isDisabled={!currentWagonType.name || !currentWagonType.fare_multiplier}
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
              Delete Wagon Type
            </AlertDialogHeader>
            
            <AlertDialogBody>
              Are you sure you want to delete the wagon type "{wagonTypeToDelete?.name}"? This action cannot be undone.
            </AlertDialogBody>
            
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteWagonType} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
} 