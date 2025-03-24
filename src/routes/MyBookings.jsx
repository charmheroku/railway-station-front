import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Spinner,
  Text,
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
import { getMyOrders } from "../api";
import { formatTime, formatDate, formatDuration } from "../lib/utils";
import { useUser } from "../lib/useUser";
import { FiChevronRight, FiCalendar, FiClock } from "react-icons/fi";

export default function MyBookings() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isLoggedIn, userLoading: isUserLoading } = useUser();
  
  // Define colors at the top level of the component
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "gray.700");
  
  // Get user orders list
  const { data: orders, isLoading, error } = useQuery(
    ["userOrders"],
    () => {
      // In a real application, we use the API
      return getMyOrders();
      
      // For development, we use mock data
      //return getMockUserOrders();
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
  
  // Check if user is authorized
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
  
  // Get order status color
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
            borderColor={borderColor}
            bg={bgColor}
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
            {orders.map((order) => {
              // Get trip data if it is available
              const hasTickets = order.tickets && order.tickets.length > 0;
              const trip = hasTickets ? order.tickets[0].trip : null;
              
              return (
                <Box
                  key={order.id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  borderColor={borderColor}
                  bg={bgColor}
                  _hover={{
                    boxShadow: "md",
                    cursor: "pointer",
                    borderColor: "blue.300"
                  }}
                  onClick={() => navigate(`/bookings/${order.id}`)}
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <HStack>
                      {trip ? (
                        <>
                          <Text fontWeight="bold">{trip.train.name || 'Unknown Train'}</Text>
                          <Text color="gray.500">({trip.train.number || 'N/A'})</Text>
                        </>
                      ) : (
                        <Text fontWeight="bold">Empty Order</Text>
                      )}
                    </HStack>
                    
                    <Badge colorScheme={getStatusColor(order.status)} px={2} py={1}>
                      {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                    </Badge>
                  </Flex>
                  
                  <Divider my={2} />
                  
                  {trip ? (
                    <Flex justify="space-between" align="center" mt={2}>
                      <Box>
                        <HStack spacing={4}>
                          <VStack align="flex-start" spacing={0}>
                            <Text fontSize="md" fontWeight="bold">
                              {formatTime(trip.departure_time || '00:00')}
                            </Text>
                            <Text>{trip.route.origin_station || 'Unknown Origin'}</Text>
                          </VStack>
                          
                          <Text mx={2}>→</Text>
                          
                          <VStack align="flex-start" spacing={0}>
                            <Text fontSize="md" fontWeight="bold">
                              {formatTime(trip.arrival_time || '00:00')}
                            </Text>
                            <Text>{trip.route.destination_station || 'Unknown Destination'}</Text>
                          </VStack>
                        </HStack>
                        
                        <HStack mt={2} color="gray.500" fontSize="sm">
                          <Icon as={FiCalendar} />
                          <Text>{hasTickets ? formatDate(trip.departure_time) : 'No date'}</Text>
                          
                          <Icon as={FiClock} ml={2} />
                          <Text>
                            {formatDuration(
                              trip.arrival_time && trip.departure_time
                                ? (new Date(trip.arrival_time) - new Date(trip.departure_time)) / 60000
                                : 0
                            )}
                          </Text>
                        </HStack>
                      </Box>
                      
                      <VStack align="flex-end" spacing={1}>
                        <Text fontWeight="bold" color="blue.500">
                          ${parseFloat(order.total_price || 0).toFixed(2)}
                        </Text>
                        <Text fontSize="sm">
                          {order.tickets.length} ticket(s)
                        </Text>
                        <HStack>
                          <Text fontSize="sm" color="blue.500">View Details</Text>
                          <Icon as={FiChevronRight} color="blue.500" />
                        </HStack>
                      </VStack>
                    </Flex>
                  ) : (
                    <Flex justify="space-between" align="center" mt={2}>
                      <Text color="gray.500">No ticket information available</Text>
                      <VStack align="flex-end" spacing={1}>
                        <Text fontWeight="bold" color="blue.500">
                          ${parseFloat(order.total_price || 0).toFixed(2)}
                        </Text>
                        <HStack>
                          <Text fontSize="sm" color="blue.500">View Details</Text>
                          <Icon as={FiChevronRight} color="blue.500" />
                        </HStack>
                      </VStack>
                    </Flex>
                  )}
                </Box>
              );
            })}
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