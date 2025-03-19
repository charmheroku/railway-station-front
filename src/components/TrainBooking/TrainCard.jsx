import {
  Box,
  Button,
  Flex,
  Grid,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure
} from "@chakra-ui/react";
import { formatTime, formatDate, formatDuration, calculateDuration } from "../../lib/utils";
import TrainAvailabilityModal from "./TrainAvailabilityModal";

export default function TrainCard({ train }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  
  const handleCheckAvailability = () => {
    onOpen();
  };
  
  // Получаем данные из новой структуры
  const trainName = train.train?.name || train.train_name;
  const trainNumber = train.train?.number || train.train_number;
  const origin = train.route?.origin_station?.name || train.origin_station;
  const destination = train.route?.destination_station?.name || train.destination_station;
  const price = train.base_price || train.price;
  
  // Правильно получаем длительность
  const durationText = train.duration_minutes ? 
    formatDuration(train.duration_minutes) : 
    calculateDuration(train.departure_time, train.arrival_time);
    
  const stops = train.stops || "Multiple";
  
  console.log("Train duration:", train.duration_minutes, "Duration text:", durationText);
  
  return (
    <>
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="lg"
        borderColor={borderColor}
        bg={cardBg}
        boxShadow="sm"
        _hover={{ boxShadow: "md" }}
        transition="all 0.2s"
        width="100%"
      >
        <Grid templateColumns={{ base: "1fr", md: "3fr 1fr" }} gap={4}>
          <Box>
            <Flex 
              justifyContent="space-between" 
              alignItems="center" 
              mb={3}
            >
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
                <Text fontSize="sm" fontWeight="bold" color="gray.600">
                  Duration
                </Text>
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
                  {stops}
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
          
          <Flex 
            direction="column" 
            justifyContent="center" 
            alignItems="flex-end"
            borderLeftWidth={{ base: 0, md: "1px" }}
            borderLeftColor={borderColor}
            pl={{ base: 0, md: 4 }}
            pt={{ base: 4, md: 0 }}
            borderTopWidth={{ base: "1px", md: 0 }}
            borderTopColor={borderColor}
          >
            <Text fontSize="xl" fontWeight="bold" color="blue.500" mb={2}>
              ${price}
            </Text>
            <Button
              colorScheme="blue"
              size="md"
              width="100%"
              onClick={handleCheckAvailability}
            >
              Check Availability
            </Button>
          </Flex>
        </Grid>
      </Box>
      
      <TrainAvailabilityModal 
        isOpen={isOpen} 
        onClose={onClose} 
        train={train} 
      />
    </>
  );
} 