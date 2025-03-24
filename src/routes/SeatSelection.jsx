import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Container,
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
  VStack,
  useColorModeValue,
  useToast,
  Badge,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Divider
} from "@chakra-ui/react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTrip, getSeatsForWagon, bookTickets, getPassengerTypes, getTripAvailability, getWagonsForTrip } from "../api";
import { formatTime, formatDate } from "../lib/utils";
import { useUser } from "../lib/useUser";
import { FaUserCheck, FaExclamationTriangle, FaArrowLeft, FaSyncAlt } from "react-icons/fa";

export default function SeatSelection() {
  const { tripId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isLoggedIn, userLoading: isUserLoading } = useUser();
  
  // Colors
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "gray.700");
  const selectedBgColor = useColorModeValue("blue.50", "blue.900");
  const occupiedBgColor = useColorModeValue("gray.100", "gray.800");
  const selectedBorderColor = useColorModeValue("blue.500", "blue.300");
  
  // Get data from state
  const [selectedClass, setSelectedClass] = useState(location.state?.selectedClass || "");
  const [selectedDate, setSelectedDate] = useState(location.state?.selectedDate || new Date().toISOString().split("T")[0]);
  const selectedPrice = location.state?.price || 0;
  const passengersCount = location.state?.passengersCount || 1;
  const tripInfo = location.state?.tripInfo || null;
  
  // States for selecting wagon and seats
  const [selectedWagon, setSelectedWagon] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerData, setPassengerData] = useState([]);
  
  // Add state for storing current trip ID
  const [currentTripId, setCurrentTripId] = useState(tripId);
  // Add state for storing current trip info
  const [currentTripInfo, setCurrentTripInfo] = useState(null);
  
  // State for modal window with passenger data
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentSeat, setCurrentSeat] = useState(null);
  const [currentPassenger, setCurrentPassenger] = useState({
    name: "",
    document: "",
    passengerType: 1 // Use numerical ID of passenger type (default 1 - adult)
  });
  
  // Get trip info
  const { data: trip, isLoading: isTripLoading } = useQuery(
    ["trip", currentTripId],
    () => getTrip({ queryKey: ["trip", currentTripId] }),
    {
      enabled: !!currentTripId && !tripInfo && !currentTripInfo,
      staleTime: 60000,
      initialData: tripInfo || currentTripInfo
    }
  );
  
  // Get availability info
  const { data: availability, isLoading: isAvailabilityLoading, refetch: refetchAvailability, error: availabilityError } = useQuery(
    ["tripAvailability", currentTripId, selectedDate, passengersCount],
    () => {
      return getTripAvailability(currentTripId, selectedDate, passengersCount);
    },
    {
      enabled: !!currentTripId && !!selectedDate,
      staleTime: 300000, // Data is considered fresh for 5 minutes
      cacheTime: 600000, // Cache is valid for 10 minutes
      retry: 2, // Allow 2 retries
      refetchOnWindowFocus: false, // Do not update when window is focused
      refetchOnMount: true, // Update when component is mounted
      onSuccess: (data) => {
        
        // After successful loading, check if we need to update the trip ID
        if (data.dates_availability && Array.isArray(data.dates_availability)) {
          const dateInfo = data.dates_availability.find(d => d.departure_date === selectedDate);
          
          if (dateInfo && dateInfo.trip_id) {
            // If for the selected date another trip ID is specified, update it
            if (dateInfo.trip_id !== currentTripId) {
              setCurrentTripId(dateInfo.trip_id);
              
              // Load info about new trip
              if (dateInfo.trip_info) {
                setCurrentTripInfo(dateInfo.trip_info);
              } else {
                // If there is no info, we need to load it through API
                getTrip({ queryKey: ["trip", dateInfo.trip_id] })
                  .then(tripData => {
                    setCurrentTripInfo(tripData);
                  })
                  .catch(error => {
                    console.error("Failed to load new trip info:", error);
                  });
              }
            }
          }
        }
      },
      onError: (error) => {
        console.error("Failed to load availability data:", error);
        toast({
          title: "Failed to load availability",
          description: "Could not load trip availability information. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  );
  
  // Get passenger types
  const { data: passengerTypes } = useQuery(
    ["passengerTypes"],
    () => {
      // In a real application, we use the API
      return getPassengerTypes();
    },
    {
      staleTime: 300000
    }
  );
  
  // Use data from availability to get wagons
  const getWagonsFromAvailability = async () => {
    
    if (!availability) {
      return [];
    }
    
    if (availability.dates_availability && Array.isArray(availability.dates_availability)) {
      const dateInfo = availability.dates_availability.find(d => d.departure_date === selectedDate);
      
      if (dateInfo) {
        
        if (dateInfo.trip_id && dateInfo.trip_id !== currentTripId) {
          setCurrentTripId(dateInfo.trip_id);
          
          if (dateInfo.trip_info) {
            setCurrentTripInfo(dateInfo.trip_info);
          }
        }

        // Get wagons of selected type
        if (dateInfo.wagons && Array.isArray(dateInfo.wagons)) {
          const wagonsOfSelectedType = dateInfo.wagons.filter(wagon => wagon.wagon_type === selectedClass);

          return wagonsOfSelectedType.map(wagon => ({
            id: wagon.wagon_id,
            number: wagon.wagon_number.toString(),
            type: wagon.wagon_type,
            available_seats: wagon.available_seats,
            total_seats: wagon.total_seats,
            type_id: availability.wagon_types.find(wt => wt.name === wagon.wagon_type)?.id,
            price: wagon.price_per_passenger,
            amenities: wagon.amenities
          }));
        }
      }
    }
    
    return [];
  };
  
  const { data: wagons = [], isLoading: isWagonsLoading, refetch: refetchWagons, status: wagonsStatus, error: wagonsError } = useQuery(
    ["wagons", currentTripId, selectedClass, selectedDate],
    getWagonsFromAvailability,
    {
      enabled: !!currentTripId && !!selectedClass && !!selectedDate && !!availability,
      staleTime: 300000, // Data is considered fresh for 5 minutes
      cacheTime: 600000, // Cache is valid for 10 minutes
      initialData: [],
      retry: 2, // Allow 2 retries
      refetchOnWindowFocus: false, // Do not update when window is focused
      refetchOnMount: true, // Update when component is mounted
      onError: (error) => {
        console.error("Failed to load wagons:", error);
        toast({
          title: "Failed to load wagons",
          description: "Could not load wagons information. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  );

  // Automatically load wagons when necessary data changes or after receiving availability
  useEffect(() => {
    if (currentTripId && selectedClass && selectedDate && availability) {
      refetchWagons();
    }
  }, [currentTripId, selectedClass, selectedDate, availability, refetchWagons]);

  // Error handling when loading wagons
  useEffect(() => {
    if (wagonsError) {
      console.error("Error loading wagons:", wagonsError);
      // After some time, automatically repeat the request
      const errorRetryTimer = setTimeout(() => {
        refetchWagons();
      }, 2000);
      
      return () => clearTimeout(errorRetryTimer);
    }
  }, [wagonsError, refetchWagons]);
  
  // Get info about seats in selected wagon
  const getSeatsForSelectedWagon = async () => {
    
    if (!selectedWagon) {
      return [];
    }
    
    try {
      // Get data about seats from API
      const response = await getSeatsForWagon(currentTripId, selectedWagon.id, selectedDate);
      
      // Check the structure of the response
      if (response && response.seats && Array.isArray(response.seats)) {
        
        // Convert data to the desired format
        const formattedSeats = response.seats.map(seat => ({
          id: seat.number, // Use seat number as ID
          number: seat.number.toString(),
          occupied: !seat.is_available, // Invert is_available to get occupied
          price: seat.price // Save price info
        }));
        
        return formattedSeats;
      }
      
      // If we received data in another format (direct array of seats)
      if (response && Array.isArray(response) && response.length > 0) {
        return response.map(seat => ({
          id: seat.id || seat.number,
          number: seat.number.toString(),
          occupied: seat.occupied || !seat.available || !seat.is_available,
          price: seat.price
        }));
      }
      
      // If API returned empty result or not an array, create mock seats
      console.warn("API returned invalid or empty seats data, generating mock seats");
      
      // Generate seats with predictable distribution of occupied seats
      const totalSeats = selectedWagon.total_seats || 24;
      const availableSeats = selectedWagon.available_seats || 20;
      const occupiedCount = totalSeats - availableSeats;
      
      
      // Create an array to track occupied seats
      // Use a predictable pattern: first fill from the end
      const occupiedSeats = new Set();
      
      // Mark the last N seats as occupied
      for (let i = totalSeats; i > totalSeats - occupiedCount; i--) {
        occupiedSeats.add(i);
      }
      
      // Create seats
      const mockSeats = [];
      for (let i = 1; i <= totalSeats; i++) {
        mockSeats.push({
          id: i,
          number: i.toString(),
          occupied: occupiedSeats.has(i),
          price: selectedPrice || 200 // Use price from selected class or default
        });
      }
      
      return mockSeats;
    } catch (error) {
      console.error("Error fetching seats from API:", error);
      
      // Even in case of an error, create mock seats
      
      const totalSeats = selectedWagon.total_seats || 24;
      const availableSeats = selectedWagon.available_seats || 20;
      const occupiedCount = totalSeats - availableSeats;
      
      // Create an array to track occupied seats
      // Use a predictable pattern: distribute occupied seats through one
      const occupiedSeats = new Set();
      
      // Mark every third seat as occupied until we reach the desired number
      let count = 0;
      for (let i = 1; count < occupiedCount && i <= totalSeats; i += 3) {
        occupiedSeats.add(i);
        count++;
      }
      
      // Create seats
      const mockSeats = [];
      for (let i = 1; i <= totalSeats; i++) {
        mockSeats.push({
          id: i,
          number: i.toString(),
          occupied: occupiedSeats.has(i),
          price: selectedPrice || 200 // Use price from selected class or default
        });
      }
      
      return mockSeats;
    }
  };
  
  // Mutation for booking tickets
  const bookTicketsMutation = useMutation(
    (ticketsData) => {
      // Use API for booking tickets
      return bookTickets(ticketsData);
    },
    {
      onSuccess: (data) => {
        toast({
          title: "Booking successful!",
          description: `Your tickets have been booked successfully!`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        queryClient.invalidateQueries(["bookings"]);
        navigate(`/bookings/${data.id || data.booking_id || 'success'}`);
      },
      onError: (error) => {
        toast({
          title: "Booking failed",
          description: error.response?.data?.detail || error.message || "An error occurred while booking your tickets",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        console.error("Booking error:", error.response?.data || error);
      }
    }
  );
  
  // Check user authorization
  useEffect(() => {
    if (!isUserLoading && !isLoggedIn) {
      toast({
        title: "Authentication required",
        description: "Please log in to book tickets",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      navigate("/login", { state: { from: `/trips/${tripId}/seats` } });
    }
  }, [isUserLoading, isLoggedIn, navigate, tripId, toast]);
  
  // Обработчик выбора места
  const handleSeatClick = (seat) => {
    // If the seat is occupied, do nothing
    if (seat.occupied) return;
    
    // If the seat is already selected, cancel the selection
    if (selectedSeats.some(s => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
      setPassengerData(passengerData.filter(p => p.seatId !== seat.id));
      return;
    }
    
    // Check that the number of selected seats does not exceed the number of passengers
    if (selectedSeats.length >= passengersCount) {
      toast({
        title: "Selection limit reached",
        description: `You can select up to ${passengersCount} seats`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Get price from wagon data
    const wagonData = availability?.dates_availability?.[0]?.wagons
      ?.find(w => w.wagon_id === selectedWagon.id);
    const seatPrice = wagonData?.price_per_passenger || seat.price;
    
    // Add seat to selected with consideration of its price
    setSelectedSeats([...selectedSeats, { ...seat, price: seatPrice }]);
    setCurrentSeat(seat);
    setCurrentPassenger({
      name: "",
      document: "",
      passengerType: 1,
      seatPrice: seatPrice
    });
    onOpen();
  };
  
  // Handler for changing passenger data
  const handlePassengerChange = (field, value) => {
    setCurrentPassenger({
      ...currentPassenger,
      [field]: value
    });
  };
  
  // Handler for saving passenger data
  const handleSavePassenger = () => {
    // Check that all required fields are filled
    if (!currentPassenger.name || !currentPassenger.document) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    
    // Get the price of the seat (either from seat, or from selected class)
    const seatPrice = currentSeat.price || selectedPrice;
    
    // Add passenger data
    setPassengerData([
      ...passengerData,
      {
        seatId: currentSeat.id,
        seatNumber: currentSeat.number,
        wagonId: selectedWagon.id, // Use wagon ID from data
        wagonNumber: selectedWagon.number,
        passengerName: currentPassenger.name,
        passengerDocument: currentPassenger.document,
        passengerType: currentPassenger.passengerType,
        price: seatPrice // Save seat price
      }
    ]);
    
    onClose();
  };
  
  // Handler for editing passenger data
  const handleEditPassenger = (passenger) => {
    const seat = selectedSeats.find(s => s.id === passenger.seatId);
    if (!seat) return;
    
    setCurrentSeat(seat);
    setCurrentPassenger({
      name: passenger.passengerName,
      document: passenger.passengerDocument,
      passengerType: passenger.passengerType
    });
    onOpen();
  };
  
  // Handler for confirming booking
  const handleConfirmBooking = () => {
    // Check that all selected seats have passenger data
    if (selectedSeats.length !== passengerData.length) {
      toast({
        title: "Missing passenger data",
        description: "Please fill in passenger information for all selected seats",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Form data for booking with correct IDs
    const ticketsData = {
      tickets: passengerData.map(passenger => {
        // Use passenger type ID that was saved
        let passengerTypeId = parseInt(passenger.passengerType) || 1;
        
        // Ensure that passengerTypeId is a number and not NaN
        if (isNaN(passengerTypeId)) {
          console.warn("Invalid passenger type ID, using default (1):", passenger.passengerType);
          passengerTypeId = 1; // Fallback to 1 (adult), if something went wrong
        }
        
        
        return {
          trip: parseInt(currentTripId),
          wagon: parseInt(passenger.wagonId), // Важно: используем ID вагона, а не его номер
          seat_number: parseInt(passenger.seatNumber),
          passenger_name: passenger.passengerName,
          passenger_document: passenger.passengerDocument,
          passenger_type: passengerTypeId // Всегда числовое значение
        };
      })
    };
    
    
    // Отправляем запрос на бронирование
    bookTicketsMutation.mutate(ticketsData);
  };
  
  // Get actual trip data
  const actualTrip = currentTripInfo || trip || tripInfo;
  const isLoading = isTripLoading || isWagonsLoading || isUserLoading;
  
  // Track changes in selected wagon
  useEffect(() => {
    if (selectedWagon) {
      console.log("Wagon selected:", selectedWagon);
      console.log("Will fetch seats for wagon ID:", selectedWagon.id);
    }
  }, [selectedWagon]);
  
  // Get information about seats in selected wagon
  const { 
    data: seats, 
    isLoading: isSeatsLoading, 
    refetch: refetchSeats 
  } = useQuery(
    ["seats", tripId, selectedWagon?.id, selectedDate],
    () => getSeatsForSelectedWagon(),
    {
      enabled: !!tripId && !!selectedWagon && !!selectedDate,
      staleTime: 30000,
      retry: 2,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        console.log("Successfully loaded seats data:", data?.length || 0, "seats");
      },
      onError: (error) => {
        console.error("Failed to load seats:", error);
        toast({
          title: "Failed to load seats",
          description: "Could not load seats information. Using generated data instead.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  );
  
  // Automatically load seats when selected wagon changes
  useEffect(() => {
    if (selectedWagon) {
      refetchSeats();
    }
  }, [selectedWagon, refetchSeats]);
  
  // Update useEffect for setting default class
  useEffect(() => {
    if ((!selectedClass || selectedClass === "") && availability) {
      console.log("Setting default class from availability:", availability);
      
      if (availability.wagon_types && availability.wagon_types.length > 0) {
        const firstAvailableClass = availability.wagon_types[0].name;
        setSelectedClass(firstAvailableClass);
      }
    }
  }, [availability, selectedClass]);

  // Update display of price in booking details
  const getSelectedClassPrice = () => {
    if (!availability?.dates_availability?.[0]?.wagons) return selectedPrice;
    
    const wagonsOfSelectedType = availability.dates_availability[0].wagons
      .filter(wagon => wagon.wagon_type === selectedClass);
    
    if (wagonsOfSelectedType.length > 0) {
      return wagonsOfSelectedType[0].total_price;
    }
    
    return selectedPrice;
  };
  
  // Explicitly display all states for debugging
  useEffect(() => {
    console.log("Current state updated:", { 
      selectedClass, 
      selectedDate, 
      availability, 
      wagons: wagons?.length || 0,
      isWagonsLoading,
      isAvailabilityLoading
    });
  }, [selectedClass, selectedDate, availability, wagons, isWagonsLoading, isAvailabilityLoading]);
  
  // useEffect with check for wagons presence
  useEffect(() => {
    if (availability && !isWagonsLoading && (!wagons || wagons.length === 0)) {
      // Check availability of other classes
      const allAvailableClasses = availability?.dates_availability
        ?.map(d => Object.keys(d.classes || {}))
        .flat()
        .filter(Boolean);
      
      if (allAvailableClasses && allAvailableClasses.length > 0) {
        
        // If current class is not found, but there are other classes
        if (!allAvailableClasses.includes(selectedClass) && allAvailableClasses[0]) {
          setSelectedClass(allAvailableClasses[0]);
        }
      }
    }
  }, [wagons, isWagonsLoading, selectedClass, availability]);
  
  // Error handling for availability
  useEffect(() => {
    if (availabilityError) {
      console.error("Availability error:", availabilityError);
      // Create a timer for retrying
      const retryTimer = setTimeout(() => {
        refetchAvailability();
      }, 2000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [availabilityError, refetchAvailability]);
  
  // Display spinner when loading
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
          <Text>Loading trip information...</Text>
        </VStack>
      </Box>
    );
  }
  
  // Display message if there is no trip data
  if (!actualTrip) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={4} align="start">
          <Heading size="lg">Seat Selection</Heading>
          <Text>No trip information available. Please go back and try again.</Text>
          <Button onClick={() => navigate(-1)} leftIcon={<FaArrowLeft />}>
            Go Back
          </Button>
        </VStack>
      </Container>
    );
  }
  
  // Display main page for seat selection
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Select Your Seats</Heading>
        
        {/* Trip information */}
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
              <Text fontWeight="bold">{actualTrip.train_name} ({actualTrip.train_number})</Text>
              <HStack mt={2}>
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="lg" fontWeight="bold">
                    {formatTime(actualTrip.departure_time)}
                  </Text>
                  <Text>{actualTrip.origin_station}</Text>
                  <Text color="gray.500" fontSize="sm">
                    {formatDate(actualTrip.departure_time, true)}
                  </Text>
                </VStack>
                
                <Text mx={2}>→</Text>
                
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="lg" fontWeight="bold">
                    {formatTime(actualTrip.arrival_time)}
                  </Text>
                  <Text>{actualTrip.destination_station}</Text>
                  <Text color="gray.500" fontSize="sm">
                    {formatDate(actualTrip.arrival_time, true)}
                  </Text>
                </VStack>
              </HStack>
            </Box>
            
            <Box>
              <Text fontWeight="bold">Booking Details</Text>
              <Text mt={2}>Date: {formatDate(selectedDate)}</Text>
              <Text>Class: {selectedClass}</Text>
              <Text>Total price: ${getSelectedClassPrice()}</Text>
              <Text>Passengers: {passengersCount}</Text>
            </Box>
          </Grid>
        </Box>
        
        {/* Wagon selection */}
        <Box
          p={6}
          borderWidth="1px"
          borderRadius="lg"
          borderColor={borderColor}
          bg={bgColor}
        >
          <Heading size="md" mb={4}>Select Wagon</Heading>
          
          {isWagonsLoading ? (
            <VStack spacing={4} py={4}>
              <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
              <Text color="blue.600" fontWeight="medium">Loading available wagons...</Text>
            </VStack>
          ) : !wagons || wagons.length === 0 ? (
            <VStack spacing={4} align="stretch">
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>No wagons available</AlertTitle>
                  <AlertDescription>
                    We couldn't find any wagons for the selected class and date.
                  </AlertDescription>
                </Box>
              </Alert>
              
              <HStack justifyContent="center" mt={2}>
                <Button 
                  colorScheme="blue" 
                  leftIcon={<FaSyncAlt />}
                  onClick={() => {
                    // Start requests without clearing cache
                    refetchAvailability().then(() => {
                      // After getting availability, update wagons
                      setTimeout(() => refetchWagons(), 300);
                    });
                  }}
                >
                  Try Again
                </Button>
              </HStack>
              
              {(availabilityError || wagonsError) && (
                <Alert status="error" mt={2} borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Error loading data</AlertTitle>
                    <AlertDescription>
                      {availabilityError ? "Failed to load availability data." : ""}
                      {wagonsError ? "Failed to load wagon data." : ""}
                      Please try refreshing.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          ) : (
            <>
              <Text fontSize="md" fontWeight="medium" mb={4}>Found {wagons.length} wagons for {selectedClass} class</Text>
              
              <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)", lg: "repeat(6, 1fr)" }} gap={4}>
                {wagons.map(wagon => (
                  <Box
                    key={wagon.id}
                    p={4}
                    borderWidth="2px"
                    borderRadius="lg"
                    borderColor={selectedWagon?.id === wagon.id ? "blue.500" : borderColor}
                    bg={selectedWagon?.id === wagon.id ? "blue.50" : bgColor}
                    cursor="pointer"
                    onClick={() => setSelectedWagon(wagon)}
                    textAlign="center"
                    transition="all 0.3s"
                    _hover={{
                      borderColor: "blue.400",
                      shadow: "md",
                      transform: "translateY(-2px)"
                    }}
                    boxShadow={selectedWagon?.id === wagon.id ? "md" : "sm"}
                  >
                    <Heading size="md" mb={2}>Wagon {wagon.number}</Heading>
                    <Badge colorScheme="blue" mb={2}>{wagon.type || selectedClass}</Badge>
                    <Text fontWeight="medium" mt={2}>
                      <Text as="span" color={wagon.available_seats > 10 ? "green.500" : wagon.available_seats > 0 ? "orange.500" : "red.500"} fontWeight="bold">
                        {wagon.available_seats}
                      </Text> / {wagon.total_seats} seats available
                    </Text>
                  </Box>
                ))}
              </Grid>
            </>
          )}
        </Box>
        
        {/* Seat map in wagon */}
        {selectedWagon && (
          <Box
            p={6}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={borderColor}
            bg={bgColor}
          >
            <Heading size="md" mb={4}>
              Seat Map - Wagon {selectedWagon.number}
            </Heading>
            
            {isSeatsLoading ? (
              <Flex justify="center" py={4}>
                <Spinner />
              </Flex>
            ) : !seats || seats.length === 0 ? (
              <Text>No seats information available</Text>
            ) : (
              <VStack spacing={6} align="stretch">
                {/* Legend */}
                <Flex gap={4} flexWrap="wrap">
                  <HStack>
                    <Box
                      w="20px"
                      h="20px"
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor={borderColor}
                      bg={bgColor}
                    />
                    <Text fontSize="sm">Available</Text>
                  </HStack>
                  
                  <HStack>
                    <Box
                      w="20px"
                      h="20px"
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor={selectedBorderColor}
                      bg={selectedBgColor}
                    />
                    <Text fontSize="sm">Selected</Text>
                  </HStack>
                  
                  <HStack>
                    <Box
                      w="20px"
                      h="20px"
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor={borderColor}
                      bg={occupiedBgColor}
                    />
                    <Text fontSize="sm">Occupied</Text>
                  </HStack>
                </Flex>
                
                {/* Visualization of seats */}
                <Grid 
                  templateColumns="repeat(auto-fill, minmax(60px, 1fr))" 
                  gap={2}
                  justifyContent="center"
                >
                  {seats.map(seat => {
                    const isSelected = selectedSeats.some(s => s.id === seat.id);
                    const passengerInfo = passengerData.find(p => p.seatId === seat.id);
                    
                    return (
                      <Tooltip
                        key={seat.id}
                        label={
                          seat.occupied
                            ? "This seat is occupied"
                            : isSelected && passengerInfo
                            ? `${passengerInfo.passengerName}`
                            : `Seat ${seat.number} - $${seat.price || selectedPrice}`
                        }
                      >
                        <Box
                          p={2}
                          borderWidth={seat.occupied ? "2px" : "1px"}
                          borderRadius="md"
                          borderColor={
                            seat.occupied 
                              ? "red.500" 
                              : isSelected 
                                ? selectedBorderColor 
                                : borderColor
                          }
                          bg={
                            seat.occupied
                              ? "red.100"
                              : isSelected
                                ? selectedBgColor
                                : bgColor
                          }
                          color={seat.occupied ? "red.600" : "inherit"}
                          cursor={seat.occupied ? "not-allowed" : "pointer"}
                          onClick={() => !seat.occupied && handleSeatClick(seat)}
                          textAlign="center"
                          position="relative"
                          _hover={
                            !seat.occupied 
                              ? { 
                                  bg: "blue.50", 
                                  borderColor: "blue.300",
                                  transform: "scale(1.05)",
                                } 
                              : {}
                          }
                          transition="all 0.2s"
                        >
                          {seat.occupied ? (
                            <Tooltip label="This seat is occupied" placement="top">
                              <Box>
                                <Text fontWeight="bold">{seat.number}</Text>
                                <Text color="red.600" fontWeight="bold">X</Text>
                              </Box>
                            </Tooltip>
                          ) : (
                            <>
                              <Text fontWeight="bold">{seat.number}</Text>
                              <Text fontSize="xs" mt={1} color="gray.500">${seat.price || selectedPrice}</Text>
                              
                              {isSelected && passengerInfo && (
                                <Box
                                  position="absolute"
                                  bottom="2px"
                                  right="2px"
                                  color="blue.500"
                                  fontSize="sm"
                                >
                                  <FaUserCheck />
                                </Box>
                              )}
                              
                              {isSelected && !passengerInfo && (
                                <Box
                                  position="absolute"
                                  bottom="2px"
                                  right="2px"
                                  color="orange.500"
                                  fontSize="sm"
                                >
                                  <FaExclamationTriangle />
                                </Box>
                              )}
                            </>
                          )}
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Grid>
              </VStack>
            )}
          </Box>
        )}
        
        {/* List of selected seats and passengers */}
        {selectedSeats.length > 0 && (
          <Box
            p={6}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={borderColor}
            bg={bgColor}
          >
            <Heading size="md" mb={4}>Selected Seats</Heading>
            
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Wagon</Th>
                  <Th>Seat</Th>
                  <Th>Passenger</Th>
                  <Th>Document</Th>
                  <Th>Type</Th>
                  <Th>Price</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {selectedSeats.map(seat => {
                  const passengerInfo = passengerData.find(p => p.seatId === seat.id);
                  
                  return (
                    <Tr key={seat.id}>
                      <Td>{selectedWagon.number}</Td>
                      <Td>{seat.number}</Td>
                      <Td>
                        {passengerInfo?.passengerName || (
                          <Badge colorScheme="orange">Not provided</Badge>
                        )}
                      </Td>
                      <Td>
                        {passengerInfo?.passengerDocument || (
                          <Badge colorScheme="orange">Not provided</Badge>
                        )}
                      </Td>
                      <Td>
                        {passengerInfo ? (
                          passengerTypes?.find(
                            pt => pt.id === passengerInfo.passengerType
                          )?.name || `Type ${passengerInfo.passengerType}`
                        ) : (
                          <Badge colorScheme="orange">Not provided</Badge>
                        )}
                      </Td>
                      <Td>
                        ${passengerInfo?.price || seat.price || selectedPrice}
                      </Td>
                      <Td>
                        {passengerInfo ? (
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEditPassenger(passengerInfo)}
                          >
                            Edit
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => {
                              setCurrentSeat(seat);
                              setCurrentPassenger({
                                name: "",
                                document: "",
                                passengerType: 1, // Use numerical ID of passenger type (default 1 - adult)
                                seatPrice: seat.price || selectedPrice
                              });
                              onOpen();
                            }}
                          >
                            Add
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
            
            {/* Total order amount */}
            {selectedSeats.length > 0 && (
              <Box mt={4} p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor} bg={bgColor}>
                <Flex justify="space-between" align="center">
                  <Text fontWeight="bold">Total:</Text>
                  <Box>
                    <Text fontWeight="bold" fontSize="lg" color="blue.600">
                      ${selectedSeats.reduce((sum, seat) => {
                        const passengerInfo = passengerData.find(p => p.seatId === seat.id);
                        // Use price from seat data or passenger data
                        const price = passengerInfo?.price || seat.price;
                        return sum + (price || 0);
                      }, 0).toFixed(2)}
                    </Text>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Total for {selectedSeats.length} passengers
                    </Text>
                  </Box>
                </Flex>
              </Box>
            )}
            
            <Flex mt={6} justify="space-between">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedSeats([]);
                  setPassengerData([]);
                }}
              >
                Clear Selection
              </Button>
              
              <Button
                colorScheme="blue"
                isDisabled={selectedSeats.length === 0 || selectedSeats.length !== passengerData.length}
                onClick={handleConfirmBooking}
                isLoading={bookTicketsMutation.isLoading}
              >
                Confirm Booking
              </Button>
            </Flex>
          </Box>
        )}
      </VStack>
      
      {/* Modal window for filling passenger data */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Passenger Information</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input
                  value={currentPassenger.name}
                  onChange={(e) => handlePassengerChange("name", e.target.value)}
                  placeholder="Enter passenger's full name"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Document Number</FormLabel>
                <Input
                  value={currentPassenger.document}
                  onChange={(e) => handlePassengerChange("document", e.target.value)}
                  placeholder="Enter passport or ID number"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Passenger Type</FormLabel>
                <Select
                  value={currentPassenger.passengerType}
                  onChange={(e) => {
                    // Save passenger type ID
                    const value = parseInt(e.target.value);
                    handlePassengerChange("passengerType", value);
                  }}
                >
                  {passengerTypes ? (
                    passengerTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} {type.discount_percent > 0 && `(${type.discount_percent}% off)`}
                      </option>
                    ))
                  ) : (
                    <option value="1">Adult</option>
                  )}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSavePassenger}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
} 