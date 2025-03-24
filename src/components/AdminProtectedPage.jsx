import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../lib/useUser";
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";

export default function AdminProtectedPage({ children }) {
  const { isLoggedIn, isLoading, user } = useUser();
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
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }
  
  if (!(user?.is_staff || user?.is_superuser)) {
    return <Navigate to="/" replace />;
  }
  
  // If user is authorized and is an admin, show protected content
  return children;
} 