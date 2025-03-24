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
  Textarea,
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

export default function AdminWagonAmenities() {
  const { isLoggedIn, isLoading, user } = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const [amenities, setAmenities] = useState([]);
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(false);
  const [error, setError] = useState(null);
  
  // State for modal window for creating/editing amenity
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [currentAmenity, setCurrentAmenity] = useState({
    id: null,
    name: "",
    description: "",
  });
  
  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [amenityToDelete, setAmenityToDelete] = useState(null);
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
  
  // Load list of amenities
  const fetchAmenities = useCallback(async () => {
    setIsLoadingAmenities(true);
    setError(null);
    
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
      setError("Failed to load amenities. Please try again.");
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
  
  // Load amenities when component is mounted
  useEffect(() => {
    if (isLoggedIn && (user?.is_staff || user?.is_superuser)) {
      fetchAmenities();
    }
  }, [isLoggedIn, user, fetchAmenities]);
  
  // Handler for opening modal window for creating amenity
  const handleAddAmenity = () => {
    setIsEditing(false);
    setCurrentAmenity({
      id: null,
      name: "",
      description: "",
    });
    onOpen();
  };
  
  // Handler for opening modal window for editing amenity
  const handleEditAmenity = (amenity) => {
    setIsEditing(true);
    setCurrentAmenity({
      id: amenity.id,
      name: amenity.name,
      description: amenity.description || "",
    });
    onOpen();
  };
  
  // Handler for changing form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAmenity({
      ...currentAmenity,
      [name]: value,
    });
  };
  
  // Handler for saving amenity
  const handleSaveAmenity = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (isEditing) {
        // Update existing amenity
        await axios.put(
          `${API_URL}station/wagon-amenities/${currentAmenity.id}/`,
          currentAmenity,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        toast({
          title: "Success",
          description: "Amenity updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new amenity
        await axios.post(
          `${API_URL}station/wagon-amenities/`,
          currentAmenity,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        toast({
          title: "Success",
          description: "Amenity created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Close modal window and update list of amenities
      onClose();
      fetchAmenities();
    } catch (error) {
      console.error("Error saving amenity:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save amenity",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handler for opening delete dialog
  const handleDeleteClick = (amenity) => {
    setAmenityToDelete(amenity);
    setIsDeleteDialogOpen(true);
  };
  
  // Handler for deleting amenity
  const handleDeleteAmenity = async () => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `${API_URL}station/wagon-amenities/${amenityToDelete.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast({
        title: "Success",
        description: "Amenity deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Close dialog and update list of amenities
      setIsDeleteDialogOpen(false);
      fetchAmenities();
    } catch (error) {
      console.error("Error deleting amenity:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete amenity",
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
              Manage Wagon Amenities
            </Heading>
          </HStack>
          
          <Button colorScheme="blue" onClick={handleAddAmenity}>
            Add Amenity
          </Button>
        </Flex>
        
        {isLoadingAmenities ? (
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
                  <Th>Description</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {amenities.length === 0 ? (
                  <Tr>
                    <Td colSpan={4} textAlign="center">
                      No amenities found
                    </Td>
                  </Tr>
                ) : (
                  amenities.map((amenity) => (
                    <Tr key={amenity.id}>
                      <Td>{amenity.id}</Td>
                      <Td>{amenity.name}</Td>
                      <Td>{amenity.description || "-"}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FaEdit />}
                            aria-label="Edit amenity"
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEditAmenity(amenity)}
                          />
                          <IconButton
                            icon={<FaTrash />}
                            aria-label="Delete amenity"
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteClick(amenity)}
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
      
      {/* Modal window for creating/editing amenity */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Edit Amenity" : "Add Amenity"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={currentAmenity.name}
                  onChange={handleInputChange}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={currentAmenity.description}
                  onChange={handleInputChange}
                  placeholder="Enter description (optional)"
                  rows={4}
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
              onClick={handleSaveAmenity}
              isDisabled={!currentAmenity.name}
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
              Delete Amenity
            </AlertDialogHeader>
            
            <AlertDialogBody>
              Are you sure you want to delete the amenity "{amenityToDelete?.name}"? This action cannot be undone.
            </AlertDialogBody>
            
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteAmenity} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
} 