import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  HStack,
  Input,
  Select,
  Spinner,
  Text,
  useColorModeValue,
  VStack,
  Alert,
  AlertIcon,
  useToast
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTrip, getTripAvailability, createOrder, getMockPassengerTypes } from "../api";
import { formatTime, formatDate, formatDuration } from "../lib/utils";
import { useUser } from "../lib/useUser";

export default function BookingForm() {
  const { tripId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isLoggedIn, userLoading: isUserLoading } = useUser();
  
  // Определяем цвета заранее, до всех условных операторов
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "gray.700");
  
  // Получаем данные из location state (если есть)
  const selectedClass = location.state?.selectedClass || "";
  const selectedDate = location.state?.selectedDate || new Date().toISOString().split("T")[0];
  const selectedPrice = location.state?.price || 0;
  const passengersCount = location.state?.passengersCount || 1;
  
  // Состояние для пассажиров
  const [passengers, setPassengers] = useState(Array(passengersCount).fill().map(() => ({
    firstName: "", lastName: "", document: "", type: "adult"
  })));
  
  // Получаем информацию о поездке
  const { data: trip, isLoading: isTripLoading } = useQuery(
    ["trip", tripId],
    () => getTrip({ queryKey: ["trip", tripId] }),
    {
      enabled: !!tripId,
      staleTime: 60000,
    }
  );
  
  // Получаем информацию о доступности
  const { data: availability, isLoading: isAvailabilityLoading } = useQuery(
    ["tripAvailability", tripId, selectedDate, passengersCount],
    () => getTripAvailability(tripId, selectedDate, passengersCount),
    {
      enabled: !!tripId && !!selectedDate,
      staleTime: 60000,
    }
  );
  
  // Получаем типы пассажиров
  const { data: passengerTypes, isLoading: isPassengerTypesLoading } = useQuery(
    ["passengerTypes"],
    () => {
      // В реальном приложении используем API
      // return getPassengerTypes();
      
      // Для разработки используем моковые данные
      return getMockPassengerTypes();
    },
    {
      staleTime: 300000, // Кэшируем на 5 минут
    }
  );
  
  // Мутация для создания заказа
  const createOrderMutation = useMutation(
    (orderData) => createOrder(orderData),
    {
      onSuccess: (data) => {
        toast({
          title: "Booking successful!",
          description: `Your booking has been created with ID: ${data.id}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        queryClient.invalidateQueries(["orders"]);
        navigate(`/bookings/${data.id}`);
      },
      onError: (error) => {
        toast({
          title: "Booking failed",
          description: error.message || "An error occurred while creating your booking",
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
        description: "Please log in to book tickets",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      navigate("/login", { state: { from: `/trips/${tripId}/booking` } });
    }
  }, [isUserLoading, isLoggedIn, navigate, tripId, toast]);
  
  // Находим информацию о выбранной дате
  const getSelectedDateInfo = () => {
    if (!availability || !availability.dates_availability) return null;
    
    return availability.dates_availability.find(dateInfo => {
      const dateStr = new Date(dateInfo.departure_time).toISOString().split('T')[0];
      return dateStr === selectedDate;
    });
  };
  
  // Получаем цену для выбранного класса
  const getClassPrice = () => {
    if (selectedPrice > 0) return selectedPrice;
    
    const dateInfo = getSelectedDateInfo();
    if (!dateInfo || !selectedClass || !dateInfo.classes[selectedClass]) {
      return parseFloat(trip?.base_price) || 0;
    }
    
    return dateInfo.classes[selectedClass].price_for_passengers;
  };
  
  // Проверяем доступность выбранного класса
  const isClassAvailable = () => {
    const dateInfo = getSelectedDateInfo();
    if (!dateInfo || !selectedClass || !dateInfo.classes[selectedClass]) {
      return false;
    }
    
    return dateInfo.is_available && dateInfo.classes[selectedClass].available_seats > 0;
  };
  
  // Добавляем пассажира
  const addPassenger = () => {
    setPassengers([...passengers, { firstName: "", lastName: "", document: "", type: "adult" }]);
  };
  
  // Удаляем пассажира
  const removePassenger = (index) => {
    if (passengers.length > 1) {
      const newPassengers = [...passengers];
      newPassengers.splice(index, 1);
      setPassengers(newPassengers);
    }
  };
  
  // Обновляем данные пассажира
  const updatePassenger = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setPassengers(newPassengers);
  };
  
  // Рассчитываем общую стоимость
  const calculateTotalPrice = () => {
    if (!passengerTypes) return 0;
    
    const basePrice = getClassPrice();
    return passengers.reduce((total, passenger) => {
      const passengerType = passengerTypes.find(pt => pt.code === passenger.type);
      if (!passengerType) return total + basePrice;
      
      const discount = passengerType.discount_percent / 100;
      return total + (basePrice * (1 - discount));
    }, 0);
  };
  
  // Отправляем форму
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Проверяем заполнение формы
    const isFormValid = passengers.every(p => 
      p.firstName.trim() !== "" && 
      p.lastName.trim() !== "" && 
      (p.type !== "adult" || p.document.trim() !== "")
    );
    
    if (!isFormValid) {
      toast({
        title: "Form incomplete",
        description: "Please fill in all required fields",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Создаем данные для заказа
    const orderData = {
      trip: tripId,
      travel_date: selectedDate,
      wagon_class: selectedClass,
      passengers: passengers.map(p => ({
        first_name: p.firstName,
        last_name: p.lastName,
        document: p.document,
        passenger_type: p.type
      })),
      total_price: calculateTotalPrice()
    };
    
    // Отправляем заказ
    createOrderMutation.mutate(orderData);
  };
  
  // Получаем данные из новой структуры
  const getTrainInfo = () => {
    if (!trip) return { name: "", number: "", origin: "", destination: "" };
    
    return {
      name: trip.train_name || "",
      number: trip.train_number || "",
      origin: trip.origin_station || "",
      destination: trip.destination_station || "",
      departureTime: trip.departure_time || "",
      arrivalTime: trip.arrival_time || "",
      duration: formatDuration(trip.duration_minutes) || ""
    };
  };
  
  const trainInfo = getTrainInfo();
  const isLoading = isTripLoading || isAvailabilityLoading || isPassengerTypesLoading || isUserLoading;
  const totalPrice = calculateTotalPrice();
  
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
          <Text>Loading booking information...</Text>
        </VStack>
      </Box>
    );
  }
  
  if (!isClassAvailable()) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          The selected class is not available for the selected date. Please go back and select another class or date.
        </Alert>
        <Button mt={4} onClick={() => navigate(`/trips/${tripId}`)}>
          Back to Trip Details
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Book Your Tickets</Heading>
        
        {/* Trip Information */}
        <Box
          p={6}
          borderWidth="1px"
          borderRadius="lg"
          borderColor={borderColor}
          bg={bgColor}
        >
          <Heading size="md" mb={4}>Trip Details</Heading>
          
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            <Box>
              <Text fontWeight="bold">{trainInfo.name} ({trainInfo.number})</Text>
              <HStack mt={2}>
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="lg" fontWeight="bold">
                    {formatTime(trainInfo.departureTime)}
                  </Text>
                  <Text>{trainInfo.origin}</Text>
                  <Text color="gray.500" fontSize="sm">
                    {formatDate(trainInfo.departureTime, true)}
                  </Text>
                </VStack>
                
                <Text mx={2}>→</Text>
                
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="lg" fontWeight="bold">
                    {formatTime(trainInfo.arrivalTime)}
                  </Text>
                  <Text>{trainInfo.destination}</Text>
                  <Text color="gray.500" fontSize="sm">
                    {formatDate(trainInfo.arrivalTime, true)}
                  </Text>
                </VStack>
              </HStack>
            </Box>
            
            <Box>
              <Text fontWeight="bold">Booking Details</Text>
              <Text mt={2}>Date: {selectedDate}</Text>
              <Text>Class: {selectedClass}</Text>
              <Text>Price per ticket: ${getClassPrice()}</Text>
              <Text>Passengers: {passengersCount}</Text>
              <Text fontWeight="bold" mt={2}>Total: ${totalPrice.toFixed(2)}</Text>
            </Box>
          </Grid>
        </Box>
        
        {/* Passenger Information Form */}
        <Box
          p={6}
          borderWidth="1px"
          borderRadius="lg"
          borderColor={borderColor}
          bg={bgColor}
        >
          <Heading size="md" mb={4}>Passenger Information</Heading>
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              {passengers.map((passenger, index) => (
                <Box key={index} p={4} borderWidth="1px" borderRadius="md">
                  <Flex justify="space-between" align="center" mb={4}>
                    <Text fontWeight="bold">Passenger {index + 1}</Text>
                    {passengers.length > 1 && (
                      <Button 
                        size="sm" 
                        colorScheme="red" 
                        variant="outline"
                        onClick={() => removePassenger(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </Flex>
                  
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <FormControl isRequired>
                      <FormLabel>First Name</FormLabel>
                      <Input 
                        value={passenger.firstName}
                        onChange={(e) => updatePassenger(index, "firstName", e.target.value)}
                      />
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>Last Name</FormLabel>
                      <Input 
                        value={passenger.lastName}
                        onChange={(e) => updatePassenger(index, "lastName", e.target.value)}
                      />
                    </FormControl>
                  </Grid>
                  
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mt={4}>
                    <FormControl isRequired={passenger.type === "adult"}>
                      <FormLabel>Document Number</FormLabel>
                      <Input 
                        value={passenger.document}
                        onChange={(e) => updatePassenger(index, "document", e.target.value)}
                        placeholder={passenger.type === "adult" ? "Required" : "Optional"}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Passenger Type</FormLabel>
                      <Select 
                        value={passenger.type}
                        onChange={(e) => updatePassenger(index, "type", e.target.value)}
                      >
                        {passengerTypes && passengerTypes.map((type) => (
                          <option key={type.code} value={type.code}>
                            {type.name} {type.discount_percent > 0 && `(${type.discount_percent}% off)`}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Box>
              ))}
              
              <Button 
                leftIcon={<span>+</span>} 
                variant="outline" 
                onClick={addPassenger}
              >
                Add Passenger
              </Button>
              
              <Divider />
              
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold" fontSize="lg">
                  Total: ${totalPrice.toFixed(2)}
                </Text>
                
                <HStack>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/trips/${tripId}`)}
                  >
                    Cancel
                  </Button>
                  
                  <Button 
                    colorScheme="blue" 
                    type="submit"
                    isLoading={createOrderMutation.isLoading}
                  >
                    Complete Booking
                  </Button>
                </HStack>
              </Flex>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  );
} 