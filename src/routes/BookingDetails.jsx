import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Spinner,
  Text,
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
import { formatTime, formatDate, formatDuration } from "../lib/utils";
import { useUser } from "../lib/useUser";
import { FiDownload, FiPrinter } from "react-icons/fi";
import { getOrder } from "../api";

export default function BookingDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isLoggedIn, userLoading: isUserLoading } = useUser();
  
  // Определяем цвета на верхнем уровне компонента
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "gray.700");
  
  // Получаем информацию о заказе
  const { data: order, isLoading, error } = useQuery(
    ["order", orderId],
    () => {
      // В реальном приложении используем API
      return getOrder(orderId);
      
      // Для разработки используем моковые данные
      //return getMockOrder(orderId);
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
          borderColor={borderColor}
          bg={bgColor}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">Booking Summary</Heading>
            <Badge colorScheme={getStatusColor(order?.status)} fontSize="md" px={2} py={1}>
              {order?.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
            </Badge>
          </Flex>
          
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            <Box>
              <Text fontWeight="bold">Booking ID</Text>
              <Text>{order?.id || 'N/A'}</Text>
              
              <Text fontWeight="bold" mt={3}>Booking Date</Text>
              <Text>{order?.created_at ? formatDate(order.created_at) : 'N/A'}</Text>
              
              <Text fontWeight="bold" mt={3}>Travel Date</Text>
              <Text>{order?.tickets?.[0]?.trip?.departure_time 
                ? formatDate(order.tickets[0].trip.departure_time) 
                : 'N/A'}</Text>
              
              <Text fontWeight="bold" mt={3}>Class</Text>
              <Text>{order?.tickets?.[0]?.wagon?.wagon_type || 'N/A'}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold">Total Amount</Text>
              <Text fontSize="xl" fontWeight="bold" color="blue.500">
                ${typeof order?.total_price === 'string' 
                    ? parseFloat(order.total_price).toFixed(2) 
                    : typeof order?.total_price === 'number' 
                      ? order.total_price.toFixed(2) 
                      : '0.00'}
              </Text>
              
              <Text fontWeight="bold" mt={3}>Passengers</Text>
              <Text>{order?.tickets?.length || 0} passenger(s)</Text>
              
              <Text fontWeight="bold" mt={3}>Contact</Text>
              <Text>{order?.user || user?.email || "Not available"}</Text>
            </Box>
          </Grid>
        </Box>
        
        {/* Trip Details */}
        <Box
          p={6}
          borderWidth="1px"
          borderRadius="lg"
          borderColor={borderColor}
          bg={bgColor}
        >
          <Heading size="md" mb={4}>Trip Details</Heading>
          
          {order?.tickets?.length > 0 ? (
            <Box>
              <Text fontWeight="bold">
                {order.tickets[0]?.trip?.train?.name || 'Unknown Train'} ({order.tickets[0]?.trip?.train?.number || 'N/A'})
              </Text>
              
              <HStack mt={4} spacing={8}>
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="lg" fontWeight="bold">
                    {order.tickets[0]?.trip?.departure_time ? formatTime(order.tickets[0].trip.departure_time) : 'N/A'}
                  </Text>
                  <Text>{order.tickets[0]?.trip?.route?.origin_station || 'Unknown Origin'}</Text>
                  <Text color="gray.500" fontSize="sm">
                    {order.tickets[0]?.trip?.departure_time ? formatDate(order.tickets[0].trip.departure_time, true) : 'N/A'}
                  </Text>
                </VStack>
                
                <VStack align="center" spacing={0}>
                  <Text fontSize="sm" color="gray.500">
                    {order.tickets[0]?.trip?.arrival_time && order.tickets[0]?.trip?.departure_time
                      ? formatDuration(
                          (new Date(order.tickets[0].trip.arrival_time) - new Date(order.tickets[0].trip.departure_time)) / 60000
                        )
                      : 'N/A'}
                  </Text>
                  <Box w="150px" h="2px" bg="gray.200" my={2} />
                  <Text fontSize="sm" color="gray.500">{order.tickets[0]?.trip?.stops || 0} stops</Text>
                </VStack>
                
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="lg" fontWeight="bold">
                    {order.tickets[0]?.trip?.arrival_time ? formatTime(order.tickets[0].trip.arrival_time) : 'N/A'}
                  </Text>
                  <Text>{order.tickets[0]?.trip?.route?.destination_station || 'Unknown Destination'}</Text>
                  <Text color="gray.500" fontSize="sm">
                    {order.tickets[0]?.trip?.arrival_time ? formatDate(order.tickets[0].trip.arrival_time, true) : 'N/A'}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          ) : (
            <Text>No trip information available</Text>
          )}
        </Box>
        
        {/* Passenger Information */}
        <Box
          p={6}
          borderWidth="1px"
          borderRadius="lg"
          borderColor={borderColor}
          bg={bgColor}
        >
          <Heading size="md" mb={4}>Passenger Information</Heading>
          
          {order?.tickets?.length > 0 ? (
            order.tickets.map((ticket, index) => (
              <Box 
                key={index}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                borderColor={borderColor}
                bg={bgColor}
                mb={index < (order.tickets.length || 0) - 1 ? 4 : 0}
              >
                <Flex justify="space-between" wrap="wrap">
                  <Box mb={3} minW="200px">
                    <Text fontWeight="bold">Passenger Name</Text>
                    <Text>{ticket?.passenger_name || 'N/A'}</Text>
                  </Box>
                  
                  <Box mb={3} minW="200px">
                    <Text fontWeight="bold">Document</Text>
                    <Text>{ticket?.passenger_document || 'N/A'}</Text>
                  </Box>
                  
                  <Box mb={3} minW="200px">
                    <Text fontWeight="bold">Passenger Type</Text>
                    <Text>{ticket?.passenger_type?.name || 'N/A'}</Text>
                  </Box>
                  
                  <Box mb={3} minW="200px">
                    <Text fontWeight="bold">Seat</Text>
                    <Text>Wagon {ticket?.wagon?.number || 'N/A'}, Seat {ticket?.seat_number || 'N/A'}</Text>
                  </Box>
                  
                  <Box mb={3} minW="200px">
                    <Text fontWeight="bold">Price</Text>
                    <Text>${typeof ticket?.price === 'string' ? parseFloat(ticket.price).toFixed(2) : typeof ticket?.price === 'number' ? ticket.price.toFixed(2) : '0.00'}</Text>
                  </Box>
                </Flex>
              </Box>
            ))
          ) : (
            <Text>No passenger information available</Text>
          )}
        </Box>
        
        {/* Additional Information */}
        <Box
          p={6}
          borderWidth="1px"
          borderRadius="lg"
          borderColor={borderColor}
          bg={bgColor}
        >
          <Heading size="md" mb={4}>Additional Information</Heading>
          
          <Box>
            <Text fontWeight="bold">Refund Policy</Text>
            <Text mb={3}>
              Tickets can be refunded up to 24 hours before departure with a 10% fee.
              Cancellations made less than 24 hours before departure are subject to a 50% fee.
            </Text>
            
            <Text fontWeight="bold">Check-in Information</Text>
            <Text mb={3}>
              Please arrive at the station at least 30 minutes before departure.
              Bring a valid ID matching the passenger information for each traveler.
            </Text>
            
            <Text fontWeight="bold">Contact Information</Text>
            <Text>
              For any questions or assistance, please contact our support team at
              support@railwaystation.com or call +1 (555) 123-4567.
            </Text>
          </Box>
        </Box>
        
        <Button
          variant="outline"
          onClick={() => navigate("/bookings")}
          alignSelf="flex-start"
        >
          Back to My Bookings
        </Button>
      </VStack>
    </Container>
  );
} 