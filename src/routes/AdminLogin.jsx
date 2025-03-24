import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import { useUser } from "../lib/useUser";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const toast = useToast();
  const { refetch } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const userData = await login(email, password);
      
      //Check if user is an administrator
      await refetch();
      const user = JSON.parse(localStorage.getItem("user"));
      
      if (user && (user.is_staff || user.is_superuser)) {
        toast({
          title: "Login successful",
          description: "Welcome to the admin panel",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate("/admin/dashboard");
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("You don't have permission to access the admin panel");
      }
    } catch (error) {
      setError(
        error.response?.data?.detail || 
        "Invalid credentials. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Admin Login
        </Heading>
        
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <Box as="form" onSubmit={handleSubmit} p={6} borderWidth="1px" borderRadius="lg" bg="white">
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              isLoading={isLoading}
              loadingText="Logging in"
              w="100%"
              mt={4}
            >
              Login
            </Button>
          </VStack>
        </Box>
        
        <Text textAlign="center">
          This page is for administrators only.
        </Text>
      </VStack>
    </Container>
  );
} 