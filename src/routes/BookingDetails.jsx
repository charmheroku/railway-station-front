import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  Link,
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
  useToast
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOrder, getMockOrder } from "../api";
import { formatTime, formatDate, formatDuration } from "../lib/utils";
import { useUser } from "../lib/useUser";
import { FiDownload, FiPrinter } from "react-icons/fi";

export default function BookingDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isLoggedIn, userLoading: isUserLoading } = useUser();
  
  // Получаем информацию о заказе
  const { data: order, isLoading, error } = useQuery(
    ["order", orderId],
    () => {
      // В реальном приложении используем API
      // return getOrder(orderId);
      
      // Для разработки используем моковые данные
      return getMockOrder(orderId);
    },
    {
      enabled: !!orderId,
      staleTime: 60000,
      retry: 1,
      onError: (error) => {
        toast({
          title: "Error loading booking",
          description: error.message || "Could not load booking details",
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
        description: "Please log in to view booking details",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      navigate("/login", { state: { from: `/bookings/${orderId}` } });
    }
  }, [isUserLoading, isLoggedIn, navigate, orderId, toast]);
  
  // Функция для печати билетов
  const handlePrint = () => {
    window.print();
  };
  
  // Функция для скачивания билетов (в реальном приложении)
  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Your tickets are being downloaded",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
    
    // В реальном приложении здесь был бы запрос на скачивание PDF
  };
  
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
          <Text>Loading booking details...</Text>
        </VStack>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error.message || "An error occurred while loading the booking details."}
        </Alert>
        <Button mt={4} onClick={() => navigate("/bookings")}>
          Back to My Bookings
        </Button>
      </Container>
    );
  }
  
  if (!order) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          Booking not found. It may have been deleted or you don't have permission to view it.
        </Alert>
        <Button mt={4} onClick={() => navigate("/bookings")}>
          Back to My Bookings
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.lg" py={8} className="booking-details-page">
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Booking Details</Heading>
          <HStack>
            <Button
              leftIcon={<FiPrinter />}
              onClick={handlePrint}
              variant="outline"
            >
              Print
            </Button>
            <Button
              leftIcon={<FiDownload />}
              onClick={handleDownload}
              colorScheme="blue"
            >
              Download
            </Button>
          </HStack>
        </Flex>
        
        {/* Booking Summary */}
        <Box
          p={6}
          borderWidth="1px"
          borderRadius="lg"
          borderColor={useColorModeValue("gray.200", "gray.600")}
          bg={useColorModeValue("white", "gray.700")}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">Booking Summary</Heading>
            <Badge colorScheme={getStatusColor(order.status)} fontSize="md" px={2} py={1}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </Flex>
          
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            <Box>
              <Text fontWeight="bold">Booking ID</Text>
              <Text>{order.id}</Text>
              
              <Text fontWeight="bold" mt={3}>Booking Date</Text>
              <Text>{formatDate(order.created_at)}</Text>
              
              <Text fontWeight="bold" mt={3}>Travel Date</Text>
              <Text>{order.travel_date}</Text>
              
              <Text fontWeight="bold" mt={3}>Class</Text>
              <Text>{order.wagon_class}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold">Total Amount</Text>
              <Text fontSize="xl" fontWeight="bold" color="blue.500">
                ${order.total_price.toFixed(2)}
              </Text>
              
              <Text fontWeight="bold" mt={3}>Passengers</Text>
              <Text>{order.passengers.length} passenger(s)</Text>
              
              <Text fontWeight="bold" mt={3}>Contact</Text>
              <Text>{user?.email || "Not available"}</Text>
            </Box>
          </Grid>
        </Box>
        
        {/* Trip Details */}
        <Box
          p={6}
          borderWidth="1px"
          borderRadius="lg"
          borderColor={useColorModeValue("gray.200", "gray.600")}
          bg={useColorModeValue("white", "gray.700")}
        >
          <Heading size="md" mb={4}>Trip Details</Heading>
          
          <Box>
            <Text fontWeight="bold">{order.trip.train_name} ({order.trip.train_number})</Text>
            
            <HStack mt={4} spacing={8}>
              <VStack align="flex-start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold">
                  {formatTime(order.trip.departure_time)}
                </Text>
                <Text>{order.trip.origin}</Text>
                <Text color="gray.500" fontSize="sm">
                  {formatDate(order.trip.departure_time, true)}
                </Text>
              </VStack>
              
              <VStack align="center" spacing={0}>
                <Text fontSize="sm" color="gray.500">
                  {order.trip.duration || formatDuration(
                    (new Date(order.trip.arrival_time) - new Date(order.trip.departure_time)) / 60000
                  )}
                </Text>
                <Box w="100px" h="2px" bg="gray.300" my={2} />
                <Text fontSize="sm" color="gray.500">Direct</Text>
              </VStack>
              
              <VStack align="flex-start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold">
                  {formatTime(order.trip.arrival_time)}
                </Text>
                <Text>{order.trip.destination}</Text>
                <Text color="gray.500" fontSize="sm">
                  {formatDate(order.trip.arrival_time, true)}
                </Text>
              </VStack>
            </HStack>
          </Box>
        </Box>
        
        {/* Passenger Details */}
        <Box
          p={6}
          borderWidth="1px"
          borderRadius="lg"
          borderColor={useColorModeValue("gray.200", "gray.600")}
          bg={useColorModeValue("white", "gray.700")}
        >
          <Heading size="md" mb={4}>Passenger Details</Heading>
          
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Document</Th>
              </Tr>
            </Thead>
            <Tbody>
              {order.passengers.map((passenger, index) => (
                <Tr key={index}>
                  <Td>{passenger.first_name} {passenger.last_name}</Td>
                  <Td>{passenger.passenger_type.charAt(0).toUpperCase() + passenger.passenger_type.slice(1)}</Td>
                  <Td>{passenger.document || "N/A"}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        
        {/* Tickets */}
        {order.tickets && order.tickets.length > 0 && (
          <Box
            p={6}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={useColorModeValue("gray.200", "gray.600")}
            bg={useColorModeValue("white", "gray.700")}
          >
            <Heading size="md" mb={4}>Tickets</Heading>
            
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
              {order.tickets.map((ticket, index) => (
                <Box
                  key={index}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={useColorModeValue("gray.200", "gray.600")}
                  bg={useColorModeValue("gray.50", "gray.800")}
                >
                  <Flex justify="space-between">
                    <VStack align="flex-start" spacing={2}>
                      <Text fontWeight="bold">Ticket #{ticket.id}</Text>
                      <Text>Passenger: {ticket.passenger_name}</Text>
                      <Text>Wagon: {ticket.wagon_number}</Text>
                      <Text>Seat: {ticket.seat_number}</Text>
                    </VStack>
                    
                    {ticket.qr_code && (
                      <Image
                        src={ticket.qr_code}
                        alt="Ticket QR Code"
                        boxSize="100px"
                      />
                    )}
                  </Flex>
                </Box>
              ))}
            </Grid>
          </Box>
        )}
        
        {/* Actions */}
        <Flex justify="space-between" mt={4}>
          <Button
            variant="outline"
            onClick={() => navigate("/bookings")}
          >
            Back to My Bookings
          </Button>
          
          {order.status === "confirmed" && (
            <Button
              colorScheme="red"
              variant="outline"
              onClick={() => {
                toast({
                  title: "Not implemented",
                  description: "Cancellation functionality is not implemented in this demo",
                  status: "info",
                  duration: 5000,
                  isClosable: true,
                });
              }}
            >
              Cancel Booking
            </Button>
          )}
        </Flex>
      </VStack>
    </Container>
  );
} 