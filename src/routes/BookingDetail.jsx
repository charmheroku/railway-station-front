import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  List,
  ListItem,
  Spinner,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBooking } from "../api";
import { formatTime, calculateDuration } from "../lib/utils";
import { FaTicketAlt, FaTrain, FaUser, FaCalendarAlt, FaClock } from "react-icons/fa";

export default function BookingDetail() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const { isLoading, data: booking } = useQuery(
    ["booking", bookingId],
    getBooking
  );
  
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
          <Text>Loading booking details...</Text>
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
        <Box>
          <Button
            variant="outline"
            onClick={() => navigate("/my-bookings")}
            mb={4}
          >
            Back to My Bookings
          </Button>
          
          <Flex
            justify="space-between"
            align="center"
            wrap={{ base: "wrap", md: "nowrap" }}
            gap={4}
          >
            <Heading size="lg">Booking #{booking?.id}</Heading>
            <Badge
              px={3}
              py={1}
              borderRadius="md"
              fontSize="md"
              colorScheme={
                booking?.status === "confirmed"
                  ? "green"
                  : booking?.status === "pending"
                  ? "yellow"
                  : "red"
              }
            >
              {booking?.status.charAt(0).toUpperCase() + booking?.status.slice(1)}
            </Badge>
          </Flex>
        </Box>
        
        <Grid
          templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
          gap={6}
        >
          <Box
            p={6}
            borderRadius="lg"
            bg={cardBg}
            borderWidth={1}
            borderColor={borderColor}
            boxShadow="md"
          >
            <Heading size="md" mb={4}>
              Trip Details
            </Heading>
            
            <HStack spacing={2} mb={4}>
              <FaTrain />
              <Text fontWeight="bold">
                {booking?.trip.train_name} ({booking?.trip.train_number})
              </Text>
            </HStack>
            
            <Flex
              justify="space-between"
              mb={6}
              direction={{ base: "column", md: "row" }}
              gap={{ base: 4, md: 0 }}
            >
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="2xl" fontWeight="bold">
                  {formatTime(booking?.trip.departure_time)}
                </Text>
                <Text fontSize="lg">{booking?.trip.origin}</Text>
                <HStack spacing={1}>
                  <FaCalendarAlt size={14} />
                  <Text color="gray.500">
                    {new Date(booking?.trip.departure_time).toLocaleDateString()}
                  </Text>
                </HStack>
              </VStack>
              
              <VStack spacing={1}>
                <HStack spacing={1}>
                  <FaClock />
                  <Text color="gray.600">
                    {calculateDuration(
                      booking?.trip.departure_time,
                      booking?.trip.arrival_time
                    )}
                  </Text>
                </HStack>
                <Divider
                  w="150px"
                  borderWidth={1}
                  borderColor="gray.400"
                  my={2}
                />
                <Text color="gray.600">Direct</Text>
              </VStack>
              
              <VStack align={{ base: "flex-start", md: "flex-end" }} spacing={1}>
                <Text fontSize="2xl" fontWeight="bold">
                  {formatTime(booking?.trip.arrival_time)}
                </Text>
                <Text fontSize="lg">{booking?.trip.destination}</Text>
                <HStack spacing={1}>
                  <FaCalendarAlt size={14} />
                  <Text color="gray.500">
                    {new Date(booking?.trip.arrival_time).toLocaleDateString()}
                  </Text>
                </HStack>
              </VStack>
            </Flex>
            
            <Divider my={6} />
            
            <Heading size="md" mb={4}>
              Passenger Information
            </Heading>
            
            {booking?.passengers.map((passenger, index) => (
              <Box
                key={index}
                p={4}
                mb={4}
                borderWidth={1}
                borderRadius="md"
                borderColor={borderColor}
              >
                <HStack spacing={2} mb={2}>
                  <FaUser />
                  <Text fontWeight="bold">
                    Passenger {index + 1}: {passenger.first_name}{" "}
                    {passenger.last_name}
                  </Text>
                </HStack>
                
                <Grid
                  templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                  gap={4}
                  mt={2}
                >
                  <Box>
                    <Text color="gray.500">Document Type</Text>
                    <Text>
                      {passenger.document_type
                        .split("_")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </Text>
                  </Box>
                  
                  <Box>
                    <Text color="gray.500">Document Number</Text>
                    <Text>{passenger.document_number}</Text>
                  </Box>
                  
                  <Box>
                    <Text color="gray.500">Seat</Text>
                    <Text>
                      {booking.seat_number
                        ? `${booking.seat_number}`
                        : "Auto-assigned"}
                    </Text>
                  </Box>
                </Grid>
              </Box>
            ))}
          </Box>
          
          <Box>
            <Box
              p={6}
              borderRadius="lg"
              bg={cardBg}
              borderWidth={1}
              borderColor={borderColor}
              boxShadow="md"
              mb={6}
            >
              <Heading size="md" mb={4}>
                Booking Summary
              </Heading>
              
              <List spacing={3}>
                <ListItem>
                  <Flex justify="space-between">
                    <Text>Booking Date</Text>
                    <Text>
                      {new Date(booking?.booking_date).toLocaleDateString()}
                    </Text>
                  </Flex>
                </ListItem>
                
                <ListItem>
                  <Flex justify="space-between">
                    <Text>Booking ID</Text>
                    <Text fontWeight="bold">#{booking?.id}</Text>
                  </Flex>
                </ListItem>
                
                <ListItem>
                  <Flex justify="space-between">
                    <Text>Status</Text>
                    <Badge
                      colorScheme={
                        booking?.status === "confirmed"
                          ? "green"
                          : booking?.status === "pending"
                          ? "yellow"
                          : "red"
                      }
                    >
                      {booking?.status.charAt(0).toUpperCase() +
                        booking?.status.slice(1)}
                    </Badge>
                  </Flex>
                </ListItem>
                
                <ListItem>
                  <Flex justify="space-between">
                    <Text>Passengers</Text>
                    <Text>{booking?.passengers.length}</Text>
                  </Flex>
                </ListItem>
              </List>
              
              <Divider my={4} />
              
              <Flex justify="space-between" fontWeight="bold">
                <Text>Total Amount</Text>
                <Text fontSize="xl" color="brand.500">
                  ${booking?.total_price}
                </Text>
              </Flex>
            </Box>
            
            <VStack spacing={4}>
              <Button
                leftIcon={<FaTicketAlt />}
                colorScheme="brand"
                w="100%"
                onClick={() => {
                  // Download ticket functionality would go here
                  alert("Download ticket functionality would go here");
                }}
              >
                Download Ticket
              </Button>
              
              <Button
                variant="outline"
                w="100%"
                onClick={() => {
                  // Cancel booking functionality would go here
                  alert("Cancel booking functionality would go here");
                }}
              >
                Cancel Booking
              </Button>
            </VStack>
          </Box>
        </Grid>
      </VStack>
    </Box>
  );
} 