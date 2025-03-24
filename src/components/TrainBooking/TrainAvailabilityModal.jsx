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
  
  // Базовая информация о поезде
  const trainName = train?.train_name || "";
  const trainNumber = train?.train_number || "";
  const origin = train?.origin_station || "";
  const destination = train?.destination_station || "";
  const basePrice = parseFloat(train?.base_price) || 0;
  const durationMinutes = train?.duration_minutes || 0;
  const durationText = formatDuration(durationMinutes);
  
  // Получаем текущую дату
  const today = new Date().toISOString().split('T')[0];
  
  // Запрос данных о доступности
  const { data: availability, isLoading } = useQuery(
    ["tripAvailability", train?.id, today, passengersCount],
    () => getTripAvailability(train?.id, today, passengersCount),
    {
      enabled: isOpen && !!train?.id,
      staleTime: 60000,
    }
  );

  // Получаем информацию о выбранной дате
  const selectedDateInfo = availability?.dates_availability?.[selectedDateIndex];

  // Устанавливаем класс по умолчанию при загрузке данных
  useEffect(() => {
    if (availability?.wagon_types?.length > 0 && !selectedClass) {
      setSelectedClass(availability.wagon_types[0].name);
    }
  }, [availability, selectedClass]);

  // Функции для работы с данными вагонов
  const getWagonsByType = (className) => {
    return selectedDateInfo?.wagons?.filter(w => w.wagon_type === className) || [];
  };

  const getClassInfo = (className) => {
    const wagons = getWagonsByType(className);
    const summary = selectedDateInfo?.wagon_types_summary?.[className];
    
    if (!summary || !wagons.length) return null;
    
    return {
      isAvailable: summary.has_enough_seats,
      availableSeats: summary.available_seats,
      totalSeats: summary.total_seats,
      price: wagons[0].price_per_passenger,
      totalPrice: wagons[0].total_price
    };
  };

  const handleBookNow = () => {
    if (!selectedDateInfo || !selectedClass) return;
    
    onClose();
    navigate(`/trips/${train.id}/seats`, {
      state: {
        selectedClass,
        selectedDate: selectedDateInfo.departure_date,
        actualDepartureTime: selectedDateInfo.departure_time,
        price: basePrice,
        passengersCount,
        tripInfo: {
          ...train,
          departure_time: selectedDateInfo.departure_time,
          arrival_time: selectedDateInfo.arrival_time
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
                  {availability?.dates_availability?.map((dateInfo, index) => {
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
                      >
                        <Text fontWeight={selectedDateIndex === index ? "bold" : "normal"}>
                          {formattedDate}, {dayOfWeek}
                        </Text>
                        <Badge 
                          colorScheme={dateInfo.is_available ? "green" : "red"}
                          fontSize="xs"
                        >
                          {dateInfo.is_available ? "Available" : "Unavailable"}
                        </Badge>
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
                    {availability?.wagon_types?.map((wagonType) => {
                      const className = wagonType.name;
                      const classInfo = getClassInfo(className);
                      
                      if (!classInfo) return null;

                      return (
                        <Box 
                          key={className}
                          p={4}
                          borderWidth="1px"
                          borderRadius="lg"
                          borderColor={selectedClass === className ? "blue.500" : "gray.200"}
                          bg={selectedClass === className ? "blue.50" : "white"}
                          cursor={classInfo.isAvailable ? "pointer" : "not-allowed"}
                          opacity={classInfo.isAvailable ? 1 : 0.6}
                          onClick={() => classInfo.isAvailable && setSelectedClass(className)}
                          _hover={classInfo.isAvailable ? { borderColor: "blue.400", shadow: "md" } : {}}
                        >
                          <Flex justify="space-between" align="center">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold">{className}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {classInfo.availableSeats} of {classInfo.totalSeats} seats available
                              </Text>
                              <Badge colorScheme={classInfo.isAvailable ? "green" : "red"}>
                                {classInfo.isAvailable ? "Available" : "Not Available"}
                              </Badge>
                            </VStack>
                            <Text fontWeight="bold" fontSize="xl" color="blue.600">
                              ${classInfo.price}
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
                    ${getClassInfo(selectedClass)?.totalPrice || basePrice}
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
            isDisabled={!selectedClass || !selectedDateInfo?.is_available}
          >
            Book Now
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 