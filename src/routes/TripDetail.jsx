import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  List,
  ListItem,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTrip } from "../api";
import { formatTime, formatDate, formatDuration } from "../lib/utils";
import { FaTrain, FaClock, FaChair, FaMapMarkerAlt, FaRoute } from "react-icons/fa";
import { useUser } from "../lib/useUser";
import TrainAvailabilityModal from "../components/TrainBooking/TrainAvailabilityModal";

export default function TripDetail() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const { isLoading, data: trip } = useQuery(["trip", tripId], getTrip);
  
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  
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
          <Text>Loading trip details...</Text>
        </VStack>
      </Box>
    );
  }
  
  // Get data from new structure
  const getTrainInfo = () => {
    if (!trip) return { name: "", number: "", origin: "", destination: "" };
    
    return {
      name: trip.train?.name || trip.train_name || "",
      number: trip.train?.number || trip.train_number || "",
      origin: trip.route?.origin_station?.name || trip.origin || "",
      destination: trip.route?.destination_station?.name || trip.destination || "",
      departureTime: trip.departure_time || "",
      arrivalTime: trip.arrival_time || "",
      duration: trip.duration || formatDuration(trip.duration_in_minutes) || "",
      price: trip.base_price || trip.price || 0
    };
  };
  
  const trainInfo = getTrainInfo();
  
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
        <Box>
          <Button
            leftIcon={<FaRoute />}
            variant="outline"
            onClick={() => navigate(-1)}
            mb={4}
          >
            Back to Search Results
          </Button>
          
          <Heading size="lg" mb={2}>
            Trip Details
          </Heading>
          
          <Text fontSize="lg" color="gray.600">
            {trainInfo.origin} to {trainInfo.destination} on{" "}
            {formatDate(trainInfo.departureTime)}
          </Text>
        </Box>
        
        <Box
          p={6}
          borderRadius="lg"
          bg={cardBg}
          borderWidth={1}
          borderColor={borderColor}
          boxShadow="lg"
        >
          <Grid
            templateColumns={{ base: "1fr", md: "2fr 1fr" }}
            gap={8}
          >
            <Box>
              <HStack spacing={2} mb={4}>
                <FaTrain size={24} color="brand.500" />
                <Heading size="md">
                  {trainInfo.name} ({trainInfo.number})
                </Heading>
              </HStack>
              
              <Flex justify="space-between" mb={6}>
                <VStack align="flex-start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="bold">
                    {formatTime(trainInfo.departureTime)}
                  </Text>
                  <Text fontSize="lg">{trainInfo.origin}</Text>
                  <Text color="gray.500">
                    {formatDate(trainInfo.departureTime, true)}
                  </Text>
                </VStack>
                
                <VStack spacing={1}>
                  <HStack spacing={1}>
                    <FaClock />
                    <Text color="gray.600">
                      {trainInfo.duration}
                    </Text>
                  </HStack>
                  <Divider
                    w="150px"
                    borderWidth={1}
                    borderColor="gray.400"
                    my={2}
                  />
                  <Text color="gray.600">{trip?.distance || "Direct"}</Text>
                </VStack>
                
                <VStack align="flex-end" spacing={1}>
                  <Text fontSize="3xl" fontWeight="bold">
                    {formatTime(trainInfo.arrivalTime)}
                  </Text>
                  <Text fontSize="lg">{trainInfo.destination}</Text>
                  <Text color="gray.500">
                    {formatDate(trainInfo.arrivalTime, true)}
                  </Text>
                </VStack>
              </Flex>
            </Box>
            
            <VStack
              align="stretch"
              justify="space-between"
              p={4}
              bg={useColorModeValue("gray.50", "gray.800")}
              borderRadius="md"
            >
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Fare Summary</Heading>
                <Flex justify="space-between">
                  <Text>Base Fare</Text>
                  <Text fontWeight="bold">${trainInfo.price}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text>Taxes & Fees</Text>
                  <Text fontWeight="bold">${(trainInfo.price * 0.1).toFixed(2)}</Text>
                </Flex>
                <Divider />
                <Flex justify="space-between">
                  <Text fontWeight="bold">Total</Text>
                  <Text fontWeight="bold" fontSize="xl" color="brand.500">
                    ${(trainInfo.price * 1.1).toFixed(2)}
                  </Text>
                </Flex>
                
                <HStack>
                  <FaChair />
                  <Text>
                    {trip?.available_seats || "Limited"} seats available
                  </Text>
                </HStack>
              </VStack>
              
              <Button
                colorScheme="brand"
                size="lg"
                onClick={() => {
                  if (isLoggedIn) {
                    onOpen(); // Open availability modal
                  } else {
                    // Redirect to login page
                    navigate("/login", { state: { from: `/trips/${tripId}` } });
                  }
                }}
              >
                Check Availability & Book
              </Button>
            </VStack>
          </Grid>
        </Box>
        
        <Tabs colorScheme="brand" mt={6}>
          <TabList>
            <Tab>Trip Details</Tab>
            <Tab>Amenities</Tab>
            <Tab>Stops</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Trip Information</Heading>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <Box>
                    <Text fontWeight="bold">Train Number</Text>
                    <Text>{trainInfo.number}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Train Name</Text>
                    <Text>{trainInfo.name}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Duration</Text>
                    <Text>{trainInfo.duration}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Distance</Text>
                    <Text>{trip?.distance || "N/A"}</Text>
                  </Box>
                </Grid>
              </VStack>
            </TabPanel>
            
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Amenities</Heading>
                {trip?.amenities?.length > 0 ? (
                  <Grid
                    templateColumns={{
                      base: "1fr",
                      md: "1fr 1fr",
                      lg: "1fr 1fr 1fr",
                    }}
                    gap={4}
                  >
                    {trip.amenities.map((amenity) => (
                      <HStack
                        key={amenity.id}
                        p={3}
                        borderWidth={1}
                        borderRadius="md"
                        borderColor={borderColor}
                      >
                        <Icon as={amenity.icon || FaChair} />
                        <Text>{amenity.name}</Text>
                      </HStack>
                    ))}
                  </Grid>
                ) : (
                  <Text>No amenities information available.</Text>
                )}
              </VStack>
            </TabPanel>
            
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Stops</Heading>
                {trip?.stops?.length > 0 ? (
                  <List spacing={3}>
                    {trip.stops.map((stop, index) => (
                      <ListItem key={index}>
                        <HStack>
                          <FaMapMarkerAlt />
                          <Text fontWeight="bold">{stop.station}</Text>
                          <Text>
                            Arrival: {formatTime(stop.arrival_time)} | Departure:{" "}
                            {formatTime(stop.departure_time)}
                          </Text>
                          <Badge colorScheme="green">
                            {stop.stop_duration} min stop
                          </Badge>
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Text>No stops information available.</Text>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
      
      {/* Availability modal */}
      <TrainAvailabilityModal 
        isOpen={isOpen} 
        onClose={onClose} 
        train={trip} 
      />
    </Box>
  );
} 