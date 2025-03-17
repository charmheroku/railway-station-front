import {
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../api";

export default function LoginModal({ isOpen, onClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const toast = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation(
    ({ email, password }) => login(email, password),
    {
      onSuccess: () => {
        toast({
          title: "Welcome back!",
          description: "Happy to have you back!",
          status: "success",
        });
        onClose();
        queryClient.refetchQueries(["me"]);
        reset();
      },
      onError: (error) => {
        toast({
          title: "Login failed",
          description: error.response?.data?.detail || "Something went wrong",
          status: "error",
        });
      },
    }
  );
  
  const onSubmit = (data) => {
    mutation.mutate(data);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Log in</ModalHeader>
        <ModalCloseButton />
        <ModalBody as="form" onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={4}>
            <InputGroup>
              <InputLeftElement children={<FaEnvelope color="gray.500" />} />
              <Input
                isInvalid={Boolean(errors.email?.message)}
                {...register("email", {
                  required: "Please enter your email",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                variant="filled"
                placeholder="Email"
                type="email"
              />
            </InputGroup>
            <InputGroup>
              <InputLeftElement children={<FaLock color="gray.500" />} />
              <Input
                isInvalid={Boolean(errors.password?.message)}
                {...register("password", {
                  required: "Please enter a password",
                })}
                type="password"
                variant="filled"
                placeholder="Password"
              />
            </InputGroup>
            {mutation.isError ? (
              <Text color="red.500" fontSize="sm" textAlign="center">
                {mutation.error?.response?.data?.detail || "Invalid credentials"}
              </Text>
            ) : null}
            <Button
              isLoading={mutation.isLoading}
              type="submit"
              mt={4}
              colorScheme="brand"
              w="100%"
            >
              Log in
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 