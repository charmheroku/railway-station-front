import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Link,
  Alert,
  AlertIcon,
  useToast
} from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { login } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  // Получаем URL для перенаправления после входа
  const from = location.state?.from || "/";
  
  // Мутация для входа
  const loginMutation = useMutation(
    () => login(email, password),
    {
      onSuccess: () => {
        toast({
          title: "Login successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate(from, { replace: true });
      },
      onError: (error) => {
        toast({
          title: "Login failed",
          description: error.response?.data?.detail || "Invalid credentials",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  );
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    loginMutation.mutate();
  };
  
  return (
    <Container maxW="md" py={12}>
      <Box
        p={8}
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="lg"
      >
        <Stack spacing={4}>
          <Heading size="lg" textAlign="center">Log In</Heading>
          
          {from !== "/" && (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              Please log in to continue
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              
              <FormControl id="password" isRequired>
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
                fontSize="md"
                isLoading={loginMutation.isLoading}
              >
                Log In
              </Button>
            </Stack>
          </form>
          
          <Text align="center">
            Don't have an account?{" "}
            <Link as={RouterLink} to="/register" color="blue.500">
              Register
            </Link>
          </Text>
        </Stack>
      </Box>
    </Container>
  );
} 