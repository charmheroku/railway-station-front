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
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { register as registerUser } from "../api";

export default function SignUpModal({ isOpen, onClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const toast = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation(
    (userData) => registerUser(userData.email, userData.password, userData.firstName, userData.lastName),
    {
      onSuccess: () => {
        toast({
          title: "Account created!",
          description: "Welcome to Railway Station!",
          status: "success",
        });
        onClose();
        queryClient.refetchQueries(["me"]);
        reset();
      },
      onError: (error) => {
        toast({
          title: "Sign up failed",
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
        <ModalHeader>Sign up</ModalHeader>
        <ModalCloseButton />
        <ModalBody as="form" onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={4}>
            <InputGroup>
              <InputLeftElement children={<FaUser color="gray.500" />} />
              <Input
                isInvalid={Boolean(errors.firstName?.message)}
                {...register("firstName", {
                  required: "Please enter your first name",
                })}
                variant="filled"
                placeholder="First Name"
              />
            </InputGroup>
            <InputGroup>
              <InputLeftElement children={<FaUser color="gray.500" />} />
              <Input
                isInvalid={Boolean(errors.lastName?.message)}
                {...register("lastName", {
                  required: "Please enter your last name",
                })}
                variant="filled"
                placeholder="Last Name"
              />
            </InputGroup>
            <InputGroup>
              <InputLeftElement children={<FaEnvelope color="gray.500" />} />
              <Input
                isInvalid={Boolean(errors.email?.message)}
                {...register("email", {
                  required: "Please enter an email",
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
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                type="password"
                variant="filled"
                placeholder="Password"
              />
            </InputGroup>
            <Button
              isLoading={mutation.isLoading}
              type="submit"
              mt={4}
              colorScheme="brand"
              w="100%"
            >
              Sign up
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 