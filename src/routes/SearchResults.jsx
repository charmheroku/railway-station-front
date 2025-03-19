import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Spinner,
  Text,
  useColorModeValue,
  VStack,
  Container,
  IconButton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchTrips } from "../api";
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaCalendarAlt, FaUsers } from "react-icons/fa";
import SearchFilter from "../components/TrainBooking/SearchFilter";
import TrainCard from "../components/TrainBooking/TrainCard";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");
  
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 5;
  
  // Определяем цвета заранее, до всех условных операторов
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const headerBg = useColorModeValue("blue.900", "blue.900");
  const searchBg = useColorModeValue("gray.100", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  
  // Используем API для поиска поездов
  const { isLoading, data: trips } = useQuery(
    ["trips", from, to, date],
    () => {
      // В реальном приложении используем API
      return searchTrips(from, to, date);
    },
    {
      enabled: !!from && !!to && !!date,
      staleTime: 60000, // Кэшируем данные на 1 минуту
    }
  );
  
  useEffect(() => {
    if (trips) {
      setFilteredTrips(trips);
    }
  }, [trips]);
  
  const handleFilterChange = (filters) => {
    if (!trips) return;
    
    const filtered = trips.filter(trip => {
      const departureHour = new Date(trip.departure_time).getHours();
      const arrivalHour = new Date(trip.arrival_time).getHours();
      
      const isInDepartureRange = departureHour >= filters.departureTimeRange[0] && 
                                departureHour <= filters.departureTimeRange[1];
      
      const isInArrivalRange = arrivalHour >= filters.arrivalTimeRange[0] && 
                              arrivalHour <= filters.arrivalTimeRange[1];
      
      // Проверяем доступность выбранных классов
      let hasSelectedClass = true;
      if (filters.selectedClasses.length > 0) {
        // Проверяем наличие выбранных типов вагонов в поезде
        hasSelectedClass = trip.wagon_types && trip.wagon_types.some(wagonType => 
          filters.selectedClasses.includes(wagonType.name)
        );
        
        // Если wagon_types отсутствует, проверяем available_seats_by_class (для обратной совместимости)
        if (!hasSelectedClass && trip.available_seats_by_class) {
          hasSelectedClass = filters.selectedClasses.some(classType => 
            trip.available_seats_by_class[classType] > 0
          );
        }
      }
      
      return isInDepartureRange && isInArrivalRange && hasSelectedClass;
    });
    
    setFilteredTrips(filtered);
    setCurrentPage(1); // Сбрасываем на первую страницу при изменении фильтров
  };
  
  // Пагинация
  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage);
  
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  const originName = from;
  const destinationName = to;
  const formattedDate = date;
  
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
          <Text>Searching for trains...</Text>
        </VStack>
      </Box>
    );
  }
  
  return (
    <Box bg={bgColor} minH="100vh">
      {/* Header */}
      <Box bg={headerBg} color="white" py={4} px={8}>
        <Container maxW="container.xl">
          <Flex justifyContent="space-between" alignItems="center">
            <Heading size="lg">Trains - List Page</Heading>
            <Breadcrumb separator=">" color="gray.300">
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} to="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} to="/trains">Trains</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>Trains List Page</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </Flex>
        </Container>
      </Box>
      
      {/* Search Bar */}
      <Box bg={searchBg} py={4} px={8} borderBottomWidth="1px" borderColor="gray.200">
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaMapMarkerAlt color="gray.300" />
              </InputLeftElement>
              <Input placeholder="From" value={originName} readOnly bg="white" />
            </InputGroup>
            
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaMapMarkerAlt color="gray.300" />
              </InputLeftElement>
              <Input placeholder="To" value={destinationName} readOnly bg="white" />
            </InputGroup>
            
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaCalendarAlt color="gray.300" />
              </InputLeftElement>
              <Input placeholder="Depart Date" value={formattedDate} readOnly bg="white" />
            </InputGroup>
            
            <Flex>
              <InputGroup mr={2}>
                <InputLeftElement pointerEvents="none">
                  <FaUsers color="gray.300" />
                </InputLeftElement>
                <Input placeholder="Travellers, Class" value="1 Traveller" readOnly bg="white" />
              </InputGroup>
              
              <Button colorScheme="blue" px={8} onClick={() => navigate("/")}>
                Search
              </Button>
            </Flex>
          </Grid>
        </Container>
      </Box>
      
      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        <Grid templateColumns={{ base: "1fr", md: "250px 1fr" }} gap={6}>
          {/* Фильтр */}
          <Box>
            <SearchFilter onFilterChange={handleFilterChange} />
          </Box>
          
          {/* Результаты поиска */}
          <VStack spacing={4} align="stretch">
            <Heading size="lg">
              {originName} to {destinationName}
            </Heading>
            
            {filteredTrips.length === 0 ? (
              <Box
                p={8}
                borderRadius="lg"
                bg={cardBg}
                borderWidth={1}
                borderColor={borderColor}
                textAlign="center"
              >
                <Text fontSize="lg">No trains found for this route and date.</Text>
                <Button
                  mt={4}
                  colorScheme="blue"
                  onClick={() => navigate("/")}
                >
                  Try another search
                </Button>
              </Box>
            ) : (
              <>
                <Box 
                  p={4} 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  borderColor={borderColor}
                  bg={cardBg}
                >
                  <Grid templateColumns="1fr 1fr 1fr" gap={4}>
                    <Box>
                      <Text fontWeight="bold">Train Name</Text>
                    </Box>
                    <Box textAlign="center">
                      <Text fontWeight="bold">Departure - Arrival</Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontWeight="bold">Price</Text>
                    </Box>
                  </Grid>
                </Box>
                
                {currentTrips.map((trip) => (
                  <TrainCard key={trip.id} train={trip} />
                ))}
                
                {/* Пагинация */}
                {totalPages > 1 && (
                  <Flex justify="center" mt={6}>
                    <HStack>
                      <IconButton
                        icon={<FaChevronLeft />}
                        onClick={() => paginate(currentPage - 1)}
                        isDisabled={currentPage === 1}
                        aria-label="Previous page"
                      />
                      
                      {[...Array(totalPages)].map((_, index) => (
                        <Button
                          key={index}
                          colorScheme={currentPage === index + 1 ? "blue" : "gray"}
                          onClick={() => paginate(index + 1)}
                        >
                          {index + 1}
                        </Button>
                      ))}
                      
                      <IconButton
                        icon={<FaChevronRight />}
                        onClick={() => paginate(currentPage + 1)}
                        isDisabled={currentPage === totalPages}
                        aria-label="Next page"
                      />
                    </HStack>
                  </Flex>
                )}
              </>
            )}
          </VStack>
        </Grid>
      </Container>
    </Box>
  );
} 