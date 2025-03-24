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
  FormHelperText,
  Checkbox,
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

export default function AdminPassengerTypes() {
  const { isLoggedIn, isLoading, user } = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const [passengerTypes, setPassengerTypes] = useState([]);
  const [isLoadingPassengerTypes, setIsLoadingPassengerTypes] = useState(false);
  const [error, setError] = useState(null);
  
  // State for modal window for creating/editing passenger type
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassengerType, setCurrentPassengerType] = useState({
    id: null,
    name: "",
    discount_percent: 0,
    requires_document: false,
    is_active: true,
  });
  
  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [passengerTypeToDelete, setPassengerTypeToDelete] = useState(null);
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
  
  // Load list of passenger types
  const fetchPassengerTypes = useCallback(async () => {
    setIsLoadingPassengerTypes(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}booking/passenger-types/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPassengerTypes(response.data);
    } catch (error) {
      console.error("Error fetching passenger types:", error);
      setError("Failed to load passenger types. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load passenger types",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingPassengerTypes(false);
    }
  }, [toast]);
  
  useEffect(() => {
    if (isLoggedIn && (user?.is_staff || user?.is_superuser)) {
      fetchPassengerTypes();
    }
  }, [isLoggedIn, user, fetchPassengerTypes]);
  
  const handleAddPassengerType = () => {
    setIsEditing(false);
    setCurrentPassengerType({
      id: null,
      name: "",
      discount_percent: 0,
      requires_document: false,
      is_active: true
    });
    onOpen();
  };
  
  const handleEditPassengerType = (passengerType) => {
    setIsEditing(true);
    setCurrentPassengerType({
      id: passengerType.id,
      name: passengerType.name,
      discount_percent: passengerType.discount_percent,
      requires_document: passengerType.requires_document,
      is_active: passengerType.is_active
    });
    onOpen();
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPassengerType({
      ...currentPassengerType,
      [name]: value,
    });
  };
  
  const handleDiscountChange = (value) => {
    setCurrentPassengerType({
      ...currentPassengerType,
      discount_percent: Number(value),
    });
  };
  
  const handleSavePassengerType = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (isEditing) {
        // Update existing passenger type
        await axios.put(
          `${API_URL}booking/passenger-types/${currentPassengerType.id}/`,
          currentPassengerType,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        toast({
          title: "Success",
          description: "Passenger type updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new passenger type
        await axios.post(
          `${API_URL}booking/passenger-types/`,
          currentPassengerType,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        toast({
          title: "Success",
          description: "Passenger type created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      onClose();
      fetchPassengerTypes();
    } catch (error) {
      console.error("Error saving passenger type:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save passenger type",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handler for opening delete dialog
  const handleDeleteClick = (passengerType) => {
    setPassengerTypeToDelete(passengerType);
    setIsDeleteDialogOpen(true);
  };
  
  // Handler for deleting passenger type
  const handleDeletePassengerType = async () => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `${API_URL}booking/passenger-types/${passengerTypeToDelete.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast({
        title: "Success",
        description: "Passenger type deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Close dialog and update list of passenger types
      setIsDeleteDialogOpen(false);
      fetchPassengerTypes();
    } catch (error) {
      console.error("Error deleting passenger type:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete passenger type",
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
              Manage Passenger Types
            </Heading>
          </HStack>
          
          <Button colorScheme="blue" onClick={handleAddPassengerType}>
            Add Passenger Type
          </Button>
        </Flex>
        
        {isLoadingPassengerTypes ? (
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
                  <Th>Discount (%)</Th>
                  <Th>Requires Document</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {passengerTypes.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center">
                      No passenger types found
                    </Td>
                  </Tr>
                ) : (
                  passengerTypes.map((passengerType) => (
                    <Tr key={passengerType.id}>
                      <Td>{passengerType.id}</Td>
                      <Td>{passengerType.name}</Td>
                      <Td>{passengerType.discount_percent}%</Td>
                      <Td>{passengerType.requires_document ? "Yes" : "No"}</Td>
                      <Td>{passengerType.is_active ? "Active" : "Inactive"}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FaEdit />}
                            aria-label="Edit passenger type"
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEditPassengerType(passengerType)}
                          />
                          <IconButton
                            icon={<FaTrash />}
                            aria-label="Delete passenger type"
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteClick(passengerType)}
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
      
      {/* Modal window for creating/editing passenger type */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Edit Passenger Type" : "Add Passenger Type"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={currentPassengerType.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Adult, Child, Senior"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Discount (%)</FormLabel>
                <NumberInput
                  min={0}
                  max={100}
                  value={currentPassengerType.discount_percent}
                  onChange={handleDiscountChange}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>Discount percentage for this passenger type</FormHelperText>
              </FormControl>
              
              <FormControl>
                <FormLabel>Requires Document</FormLabel>
                <Checkbox
                  isChecked={currentPassengerType.requires_document}
                  onChange={(e) => setCurrentPassengerType({
                    ...currentPassengerType,
                    requires_document: e.target.checked
                  })}
                >
                  Passenger must provide identification document
                </Checkbox>
              </FormControl>
              
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Checkbox
                  isChecked={currentPassengerType.is_active}
                  onChange={(e) => setCurrentPassengerType({
                    ...currentPassengerType,
                    is_active: e.target.checked
                  })}
                >
                  Active
                </Checkbox>
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSavePassengerType}
              isDisabled={!currentPassengerType.name}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Passenger Type
            </AlertDialogHeader>
            
            <AlertDialogBody>
              Are you sure you want to delete the passenger type "{passengerTypeToDelete?.name}"? This action cannot be undone.
            </AlertDialogBody>
            
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeletePassengerType} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
} 