import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../lib/useUser";
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";

export default function AdminProtectedPage({ children }) {
  const { isLoggedIn, isLoading, user } = useUser();
  const location = useLocation();
  
  // Если данные пользователя загружаются, показываем спиннер
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
  
  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isLoggedIn) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }
  
  // Если пользователь не является администратором, перенаправляем на главную страницу
  if (!(user?.is_staff || user?.is_superuser)) {
    return <Navigate to="/" replace />;
  }
  
  // Если пользователь авторизован и является администратором, показываем защищенный контент
  return children;
} 