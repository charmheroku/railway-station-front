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
  Radio,
  RadioGroup,
  useColorModeValue,
  Divider
} from "@chakra-ui/react";
import { useState } from "react";
import { formatTime, formatDate } from "../../lib/utils";
import { useNavigate } from "react-router-dom";

export default function TrainDetailsModal({ isOpen, onClose, train }) {
  const [selectedClass, setSelectedClass] = useState("First Class");
  const [selectedDate, setSelectedDate] = useState("19 Jun, Sat");
  const navigate = useNavigate();
  
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "gray.700");
  const highlightBg = useColorModeValue("blue.50", "blue.900");
  
  // Генерируем даты для выбора (5 дней начиная с текущей даты поезда)
  const generateDates = () => {
    if (!train) return [];
    
    const dates = [];
    const baseDate = new Date(train.departure_time);
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      const day = date.getDate();
      const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()];
      const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
      
      // Случайная доступность для демонстрации
      const isAvailable = Math.random() > 0.2;
      
      dates.push({
        date: `${day} ${month}, ${dayOfWeek}`,
        available: isAvailable,
        dateObj: date
      });
    }
    
    return dates;
  };
  
  const dates = train ? generateDates() : [];
  
  const handleBookNow = () => {
    onClose();
    navigate(`/trips/${train.id}/booking`);
  };
  
  if (!train) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Train Details</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Train Info */}
            <Box>
              <Flex justifyContent="space-between" alignItems="center" mb={2}>
                <Text fontWeight="bold" fontSize="lg">
                  {train.train_name}
                </Text>
                <Text color="gray.500" fontSize="sm">
                  {train.train_number}
                </Text>
              </Flex>
              
              <Flex justifyContent="space-between" alignItems="flex-start">
                {/* Departure Info */}
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {formatTime(train.departure_time)}
                  </Text>
                  <Text>{train.origin}</Text>
                  <Text color="gray.500" fontSize="sm">
                    {formatDate(train.departure_time, true)}
                  </Text>
                </VStack>
                
                {/* Duration */}
                <VStack spacing={1} px={4} alignItems="center">
                  <Text fontSize="sm" color="gray.600">
                    {train.duration}
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
                    {train.stops} Stops
                  </Text>
                </VStack>
                
                {/* Arrival Info */}
                <VStack align="flex-end" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {formatTime(train.arrival_time)}
                  </Text>
                  <Text>{train.destination}</Text>
                  <Text color="gray.500" fontSize="sm">
                    {formatDate(train.arrival_time, true)}
                  </Text>
                </VStack>
              </Flex>
            </Box>
            
            <Divider />
            
            {/* Class Selection */}
            <Box>
              <Text fontWeight="medium" mb={3}>Select Class</Text>
              <RadioGroup onChange={setSelectedClass} value={selectedClass}>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={3}>
                  <Radio value="First Class">First Class</Radio>
                  <Radio value="Second Class">Second Class</Radio>
                  <Radio value="First Class Sleeper">First Class Sleeper</Radio>
                </Grid>
              </RadioGroup>
            </Box>
            
            <Divider />
            
            {/* Date Selection */}
            <Box>
              <Text fontWeight="medium" mb={3}>Select Date</Text>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr 1fr 1fr" }} gap={3}>
                {dates.map((date, index) => (
                  <Box 
                    key={index}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={selectedDate === date.date ? "blue.500" : borderColor}
                    bg={selectedDate === date.date ? highlightBg : bgColor}
                    cursor={date.available ? "pointer" : "not-allowed"}
                    opacity={date.available ? 1 : 0.6}
                    onClick={() => date.available && setSelectedDate(date.date)}
                    textAlign="center"
                  >
                    <Text fontWeight={selectedDate === date.date ? "bold" : "normal"}>
                      {date.date}
                    </Text>
                    <Text 
                      fontSize="sm" 
                      color={date.available ? "green.500" : "red.500"}
                      fontWeight="medium"
                    >
                      {date.available ? "Available" : "Unavailable"}
                    </Text>
                  </Box>
                ))}
              </Grid>
            </Box>
            
            <Divider />
            
            {/* Price Info */}
            <Box>
              <Flex justifyContent="space-between" alignItems="center">
                <Text fontWeight="medium">Total Fare:</Text>
                <Text fontWeight="bold" fontSize="xl">
                  ${train.price}
                </Text>
              </Flex>
            </Box>
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button colorScheme="blue" onClick={handleBookNow}>
            Book Now
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 