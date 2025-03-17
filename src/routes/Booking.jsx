import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  Select,
  Spinner,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getTrip, createBooking } from "../api";
import { useState } from "react";
import { formatTime, calculateDuration } from "../lib/utils";

export default function Booking() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [passengers, setPassengers] = useState([
    { first_name: "", last_name: "", document_type: "passport", document_number: "" },
  ]);
  
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  const { isLoading, data: trip } = useQuery(["trip", tripId], getTrip);
  
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  
  const mutation = useMutation(
    (bookingData) => createBooking(tripId, bookingData.passengers, bookingData.seats),
    {
      onSuccess: (data) => {
        toast({
          title: "Booking successful!",
          description: `Your booking reference is ${data.id}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        navigate(`/bookings/${data.id}`);
      },
      onError: () => {
        toast({
          title: "Booking failed",
          description: "There was an error processing your booking",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );
  
  const addPassenger = () => {
    if (passengers.length < 5) {
      setPassengers([
        ...passengers,
        { first_name: "", last_name: "", document_type: "passport", document_number: "" },
      ]);
    } else {
      toast({
        title: "Maximum passengers reached",
        description: "You can book for a maximum of 5 passengers",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const removePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };
  
  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const isValid = passengers.every(
      (p) => p.first_name && p.last_name && p.document_number
    );
    
    if (!isValid) {
      toast({
        title: "Missing information",
        description: "Please fill in all passenger details",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Process booking
    mutation.mutate({
      passengers,
      seats: selectedSeats.length ? selectedSeats : ["auto"],
    });
  };
  
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
          <Text>Loading booking form...</Text>
        </VStack>
      </Box>
    );
  }
  
  return (
    <Box
      py={10}
      px={{
        base: 4,
        md: 10,
        lg: 20,
      }}
    >
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Book Your Trip</Heading>
        
        <Box
          p={6}
          borderRadius="lg"
          bg={cardBg}
          borderWidth={1}
          borderColor={borderColor}
          boxShadow="md"
        >
          <Grid
            templateColumns={{ base: "1fr", md: "2fr 1fr" }}
            gap={8}
          >
            <Box>
              <Heading size="md" mb={4}>
                Trip Details
              </Heading>
              
              <Text fontWeight="bold">
                {trip?.train_name} ({trip?.train_number})
              </Text>
              
              <Flex justify="space-between" my={4}>
                <Box>
                  <Text fontSize="lg" fontWeight="bold">
                    {formatTime(trip?.departure_time)}
                  </Text>
                  <Text>{trip?.origin}</Text>
                </Box>
                
                <Box textAlign="center">
                  <Text fontSize="sm">
                    {calculateDuration(trip?.departure_time, trip?.arrival_time)}
                  </Text>
                  <Text fontSize="sm">→</Text>
                </Box>
                
                <Box textAlign="right">
                  <Text fontSize="lg" fontWeight="bold">
                    {formatTime(trip?.arrival_time)}
                  </Text>
                  <Text>{trip?.destination}</Text>
                </Box>
              </Flex>
              
              <Text>
                Date: {new Date(trip?.departure_time).toLocaleDateString()}
              </Text>
            </Box>
            
            <Box
              p={4}
              bg={useColorModeValue("gray.50", "gray.800")}
              borderRadius="md"
            >
              <Heading size="md" mb={4}>
                Price Summary
              </Heading>
              
              <Flex justify="space-between" mb={2}>
                <Text>Base fare × {passengers.length}</Text>
                <Text>${trip?.price * passengers.length}</Text>
              </Flex>
              
              <Flex justify="space-between" mb={2}>
                <Text>Taxes & fees</Text>
                <Text>${(trip?.price * passengers.length * 0.1).toFixed(2)}</Text>
              </Flex>
              
              <Divider my={2} />
              
              <Flex justify="space-between">
                <Text fontWeight="bold">Total</Text>
                <Text fontWeight="bold" color="brand.500">
                  ${(trip?.price * passengers.length * 1.1).toFixed(2)}
                </Text>
              </Flex>
            </Box>
          </Grid>
        </Box>
        
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <Heading size="md">Passenger Information</Heading>
            
            {passengers.map((passenger, index) => (
              <Box
                key={index}
                p={6}
                borderRadius="lg"
                bg={cardBg}
                borderWidth={1}
                borderColor={borderColor}
              >
                <Flex justify="space-between" mb={4}>
                  <Heading size="sm">Passenger {index + 1}</Heading>
                  {passengers.length > 1 && (
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removePassenger(index)}
                    >
                      Remove
                    </Button>
                  )}
                </Flex>
                
                <Grid
                  templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                  gap={4}
                >
                  <FormControl isRequired>
                    <FormLabel>First Name</FormLabel>
                    <Input
                      value={passenger.first_name}
                      onChange={(e) =>
                        handlePassengerChange(index, "first_name", e.target.value)
                      }
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Last Name</FormLabel>
                    <Input
                      value={passenger.last_name}
                      onChange={(e) =>
                        handlePassengerChange(index, "last_name", e.target.value)
                      }
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Document Type</FormLabel>
                    <Select
                      value={passenger.document_type}
                      onChange={(e) =>
                        handlePassengerChange(
                          index,
                          "document_type",
                          e.target.value
                        )
                      }
                    >
                      <option value="passport">Passport</option>
                      <option value="id_card">ID Card</option>
                      <option value="driving_license">Driving License</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Document Number</FormLabel>
                    <Input
                      value={passenger.document_number}
                      onChange={(e) =>
                        handlePassengerChange(
                          index,
                          "document_number",
                          e.target.value
                        )
                      }
                    />
                  </FormControl>
                </Grid>
              </Box>
            ))}
            
            <Button
              leftIcon={<span>+</span>}
              variant="outline"
              onClick={addPassenger}
              alignSelf="flex-start"
            >
              Add Passenger
            </Button>
            
            <Flex justify="space-between" mt={6}>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="brand"
                isLoading={mutation.isLoading}
              >
                Complete Booking
              </Button>
            </Flex>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
} 