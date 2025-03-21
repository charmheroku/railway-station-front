import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Grid,
  RadioGroup,
  useColorModeValue,
  Divider,
  Spinner,
  Badge,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { formatTime, formatDate, formatDuration } from "../../lib/utils";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTripAvailability } from "../../api";

export default function TrainAvailabilityModal({ isOpen, onClose, train }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [passengersCount, setPassengersCount] = useState(1);
  const navigate = useNavigate();
  
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "gray.700");
  const highlightBg = useColorModeValue("blue.50", "blue.900");
  
  // Получаем данные из новой структуры
  const trainName = train.train_name || "";
  const trainNumber = train.train_number || "";
  const origin = train.origin_station || "";
  const destination = train.destination_station || "";
  const basePrice = parseFloat(train.base_price) || 0;
  const durationMinutes = train.duration_minutes || 0;
  const durationText = formatDuration(durationMinutes);
  
  // Получаем текущую дату в формате YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  
  // Получаем информацию о доступности поезда
  const { data: tripData, isLoading, refetch } = useQuery(
    ["tripAvailability", train.id, today, passengersCount],
    () => {
      // Передаем параметры даты и количества пассажиров
      return getTripAvailability(train.id, today, passengersCount);
    },
    {
      enabled: isOpen, // Запрос выполняется только когда модальное окно открыто
      staleTime: 60000, // Кэшируем данные на 1 минуту
      initialData: train // Используем данные из пропса как начальные
    }
  );
  
  // Обновляем данные при изменении количества пассажиров
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [passengersCount, isOpen, refetch]);
  
  // Устанавливаем первый доступный класс как выбранный по умолчанию
  useEffect(() => {
    if (tripData && tripData.wagon_types && tripData.wagon_types.length > 0 && !selectedClass) {
      setSelectedClass(tripData.wagon_types[0].name);
    }
  }, [tripData, selectedClass]);
  
  // Получаем выбранную дату
  const getSelectedDateInfo = () => {
    if (!tripData || !tripData.dates_availability || tripData.dates_availability.length === 0) {
      return null;
    }
    
    return tripData.dates_availability[selectedDateIndex];
  };
  
  // Получаем цену для выбранного класса
  const getClassPrice = () => {
    const dateInfo = getSelectedDateInfo();
    if (!dateInfo || !selectedClass || !dateInfo.classes[selectedClass]) {
      return basePrice;
    }
    
    return dateInfo.classes[selectedClass].price_for_passengers;
  };
  
  // Проверяем доступность выбранного класса на выбранную дату
  const isClassAvailable = (className) => {
    const dateInfo = getSelectedDateInfo();
    if (!dateInfo || !dateInfo.is_available || !dateInfo.classes[className]) {
      return false;
    }
    
    return dateInfo.classes[className].available_seats > 0 && 
           dateInfo.classes[className].has_enough_seats;
  };
  
  // Получаем количество доступных мест для выбранного класса
  const getAvailableSeats = (className) => {
    const dateInfo = getSelectedDateInfo();
    if (!dateInfo || !dateInfo.classes[className]) {
      return 0;
    }
    
    return dateInfo.classes[className].available_seats;
  };
  
  const handleBookNow = () => {
    const dateInfo = getSelectedDateInfo();
    if (!dateInfo || !selectedClass) return;
    
    // Получаем информацию о выбранной дате и рейсе
    const selectedTripInfo = dateInfo.trip_info || train;
    
    // Извлекаем дату из времени отправления выбранной даты
    const departureDate = new Date(dateInfo.departure_time);
    const departureDateStr = departureDate.toISOString().split('T')[0];
    
    // Убедимся, что отправляем на страницу бронирования именно ту дату, 
    // которая соответствует выбранному блоку с датой
    onClose();
    navigate(`/trips/${selectedTripInfo.id}/seats`, {
      state: {
        selectedClass,
        // Используем дату отправления из выбранной даты
        selectedDate: departureDateStr,
        actualDepartureTime: dateInfo.departure_time,  // Передаем полное время отправления
        price: basePrice,
        passengersCount,
        // Добавляем полную информацию о выбранном рейсе с правильными датами
        tripInfo: {
          ...selectedTripInfo,
          departure_time: dateInfo.departure_time,
          arrival_time: dateInfo.arrival_time
        }
      }
    });
  };
  
  if (!train) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Train Details</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          {isLoading ? (
            <Flex justify="center" align="center" py={10}>
              <Spinner size="xl" />
            </Flex>
          ) : (
            <VStack spacing={6} align="stretch">
              {/* Train Info */}
              <Box>
                <Flex justifyContent="space-between" alignItems="center" mb={2}>
                  <Text fontWeight="bold" fontSize="lg">
                    {trainName}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    {trainNumber}
                  </Text>
                </Flex>
                
                <Flex justifyContent="space-between" alignItems="flex-start">
                  {/* Departure Info */}
                  <VStack align="flex-start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="bold">
                      {formatTime(train.departure_time)}
                    </Text>
                    <Text>{origin}</Text>
                    <Text color="gray.500" fontSize="sm">
                      {formatDate(train.departure_time, true)}
                    </Text>
                  </VStack>
                  
                  {/* Duration */}
                  <VStack spacing={1} px={4} alignItems="center">
                    <Text fontSize="sm" color="gray.600">
                      {durationText}
                    </Text>
                    <Box 
                      w="100%" 
                      h="2px" 
                      bg="gray.300" 
                      position="relative"
                      my={1}
                    >
                      <Box 
                        position="absolute" 
                        top="-3px" 
                        left="0" 
                        w="2px" 
                        h="8px" 
                        bg="gray.400"
                      />
                      <Box 
                        position="absolute" 
                        top="-3px" 
                        right="0" 
                        w="2px" 
                        h="8px" 
                        bg="gray.400"
                      />
                    </Box>
                    <Text fontSize="sm" color="gray.600">
                      Direct
                    </Text>
                  </VStack>
                  
                  {/* Arrival Info */}
                  <VStack align="flex-end" spacing={0}>
                    <Text fontSize="2xl" fontWeight="bold">
                      {formatTime(train.arrival_time)}
                    </Text>
                    <Text>{destination}</Text>
                    <Text color="gray.500" fontSize="sm">
                      {formatDate(train.arrival_time, true)}
                    </Text>
                  </VStack>
                </Flex>
              </Box>
              
              <Divider />
              
              {/* Passengers Count */}
              <Box>
                <Text fontWeight="medium" mb={2}>Number of Passengers</Text>
                <NumberInput 
                  min={1} 
                  max={10} 
                  value={passengersCount} 
                  onChange={(valueString) => setPassengersCount(parseInt(valueString))}
                  size="md"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
              
              <Divider />
              
              {/* Date Selection */}
              <Box>
                <Text fontWeight="medium" mb={3}>Select Date</Text>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                  {tripData && tripData.dates_availability && tripData.dates_availability.map((dateInfo, index) => {
                    const departureDate = new Date(dateInfo.departure_time);
                    const formattedDate = formatDate(departureDate);
                    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][departureDate.getDay()];
                    
                    return (
                      <Box 
                        key={index}
                        p={3}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor={selectedDateIndex === index ? "blue.500" : borderColor}
                        bg={selectedDateIndex === index ? highlightBg : bgColor}
                        cursor={dateInfo.is_available ? "pointer" : "not-allowed"}
                        opacity={dateInfo.is_available ? 1 : 0.6}
                        onClick={() => dateInfo.is_available && setSelectedDateIndex(index)}
                        textAlign="center"
                      >
                        <Text fontWeight={selectedDateIndex === index ? "bold" : "normal"}>
                          {formattedDate}, {dayOfWeek}
                        </Text>
                        <HStack justify="center" mt={1}>
                          <Badge 
                            colorScheme={dateInfo.is_available ? "green" : "red"}
                            fontSize="xs"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                          >
                            {dateInfo.is_available ? "Available" : "Unavailable"}
                          </Badge>
                        </HStack>
                      </Box>
                    );
                  })}
                </Grid>
              </Box>
              
              <Divider />
              
              {/* Class Selection */}
              <Box>
                <Text fontWeight="medium" mb={3}>Select Class</Text>
                <RadioGroup onChange={setSelectedClass} value={selectedClass}>
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                    {tripData && tripData.wagon_types && tripData.wagon_types.map((wagonType) => {
                      const className = wagonType.name;
                      const fareMultiplier = wagonType.fare_multiplier;
                      const isAvailable = isClassAvailable(className);
                      const availableSeats = getAvailableSeats(className);
                      const dateInfo = getSelectedDateInfo();
                      const price = dateInfo && dateInfo.classes[className] ? 
                        dateInfo.classes[className].price_for_passengers : 
                        (basePrice * parseFloat(wagonType.fare_multiplier));
                      
                      return (
                        <Box 
                          key={className}
                          p={3}
                          borderWidth="1px"
                          borderRadius="md"
                          borderColor={selectedClass === className ? "blue.500" : borderColor}
                          bg={selectedClass === className ? highlightBg : bgColor}
                          cursor={isAvailable ? "pointer" : "not-allowed"}
                          opacity={isAvailable ? 1 : 0.6}
                          onClick={() => isAvailable && setSelectedClass(className)}
                        >
                          <Flex justify="space-between" align="center">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold">{className}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {isAvailable ? `${availableSeats} seats available` : "No seats available"}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                Fare multiplier: x{fareMultiplier}
                              </Text>
                            </VStack>
                            <Text fontWeight="bold" color="blue.500">
                              ${price}
                            </Text>
                          </Flex>
                        </Box>
                      );
                    })}
                  </Grid>
                </RadioGroup>
              </Box>
              
              <Divider />
              
              {/* Price Info */}
              <Box>
                <Flex justifyContent="space-between" alignItems="center">
                  <Text fontWeight="medium">Total Fare:</Text>
                  <Text fontWeight="bold" fontSize="xl">
                    ${getClassPrice()}
                  </Text>
                </Flex>
                
              </Box>
            </VStack>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleBookNow}
            isDisabled={!selectedClass || !getSelectedDateInfo()?.is_available}
          >
            Book Now
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 