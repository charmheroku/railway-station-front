import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../lib/useUser";
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";

export default function ProtectedPage({ children }) {
  const { isLoggedIn, isLoading } = useUser();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <Box
        height="50vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading...</Text>
        </VStack>
      </Box>
    );
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return children;
} 