import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
  Badge,
  Alert,
  AlertIcon,
  useToast,
  Divider,
  Icon
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserOrders, getMockUserOrders } from "../api";
import { formatTime, formatDate, formatDuration } from "../lib/utils";
import { useUser } from "../lib/useUser";
import { FiChevronRight, FiCalendar, FiClock } from "react-icons/fi";

export default function MyBookings() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isLoggedIn, userLoading: isUserLoading } = useUser();
  
  // Получаем список заказов пользователя
  const { data: orders, isLoading, error } = useQuery(
    ["userOrders"],
    () => {
      // В реальном приложении используем API
      // return getUserOrders();
      
      // Для разработки используем моковые данные
      return getMockUserOrders();
    },
    {
      enabled: isLoggedIn,
      staleTime: 60000,
      retry: 1,
      onError: (error) => {
        toast({
          title: "Error loading bookings",
          description: error.message || "Could not load your bookings",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  );
  
  // Проверяем, авторизован ли пользователь
  useEffect(() => {
    if (!isUserLoading && !isLoggedIn) {
      toast({
        title: "Authentication required",
        description: "Please log in to view your bookings",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      navigate("/login", { state: { from: "/bookings" } });
    }
  }, [isUserLoading, isLoggedIn, navigate, toast]);
  
  // Получаем цвет статуса заказа
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "green";
      case "pending":
        return "yellow";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };
  
  if (isLoading || isUserLoading) {
    return (
      <Box
        height="50vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading your bookings...</Text>
        </VStack>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error.message || "An error occurred while loading your bookings."}
        </Alert>
        <Button mt={4} onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">My Bookings</Heading>
        
        {(!orders || orders.length === 0) ? (
          <Box
            p={6}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={useColorModeValue("gray.200", "gray.600")}
            bg={useColorModeValue("white", "gray.700")}
            textAlign="center"
          >
            <Text fontSize="lg" mb={4}>You don't have any bookings yet.</Text>
            <Button
              colorScheme="blue"
              onClick={() => navigate("/")}
            >
              Book a Trip
            </Button>
          </Box>
        ) : (
          <VStack spacing={4} align="stretch">
            {orders.map((order) => (
              <Box
                key={order.id}
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                borderColor={useColorModeValue("gray.200", "gray.600")}
                bg={useColorModeValue("white", "gray.700")}
                _hover={{
                  boxShadow: "md",
                  cursor: "pointer",
                  borderColor: "blue.300"
                }}
                onClick={() => navigate(`/bookings/${order.id}`)}
              >
                <Flex justify="space-between" align="center" mb={2}>
                  <HStack>
                    <Text fontWeight="bold">{order.trip.train_name}</Text>
                    <Text color="gray.500">({order.trip.train_number})</Text>
                  </HStack>
                  
                  <Badge colorScheme={getStatusColor(order.status)} px={2} py={1}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </Flex>
                
                <Divider my={2} />
                
                <Flex justify="space-between" align="center" mt={2}>
                  <Box>
                    <HStack spacing={4}>
                      <VStack align="flex-start" spacing={0}>
                        <Text fontSize="md" fontWeight="bold">
                          {formatTime(order.trip.departure_time)}
                        </Text>
                        <Text>{order.trip.origin}</Text>
                      </VStack>
                      
                      <Text mx={2}>→</Text>
                      
                      <VStack align="flex-start" spacing={0}>
                        <Text fontSize="md" fontWeight="bold">
                          {formatTime(order.trip.arrival_time)}
                        </Text>
                        <Text>{order.trip.destination}</Text>
                      </VStack>
                    </HStack>
                    
                    <HStack mt={2} color="gray.500" fontSize="sm">
                      <Icon as={FiCalendar} />
                      <Text>{order.travel_date}</Text>
                      
                      <Icon as={FiClock} ml={2} />
                      <Text>
                        {formatDuration(
                          (new Date(order.trip.arrival_time) - new Date(order.trip.departure_time)) / 60000
                        )}
                      </Text>
                    </HStack>
                  </Box>
                  
                  <VStack align="flex-end" spacing={1}>
                    <Text fontWeight="bold" color="blue.500">
                      ${order.total_price.toFixed(2)}
                    </Text>
                    <Text fontSize="sm">
                      {order.passengers.length} passenger(s)
                    </Text>
                    <HStack>
                      <Text fontSize="sm" color="blue.500">View Details</Text>
                      <Icon as={FiChevronRight} color="blue.500" />
                    </HStack>
                  </VStack>
                </Flex>
              </Box>
            ))}
          </VStack>
        )}
        
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          alignSelf="flex-start"
        >
          Back to Home
        </Button>
      </VStack>
    </Container>
  );
} 