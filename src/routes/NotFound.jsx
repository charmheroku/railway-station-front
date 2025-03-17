import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack spacing={4} textAlign="center">
        <Heading>404</Heading>
        <Text fontSize="xl">Page not found</Text>
        <Text color="gray.500">
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <Button as={Link} to="/" colorScheme="brand">
          Go to Home
        </Button>
      </VStack>
    </Box>
  );
} 