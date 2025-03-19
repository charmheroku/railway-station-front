import React, { useState, useEffect } from "react";
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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
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
  
  // Цвета
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "gray.700");
  const selectedBgColor = useColorModeValue("blue.50", "blue.900");
  const occupiedBgColor = useColorModeValue("gray.100", "gray.800");
  const selectedBorderColor = useColorModeValue("blue.500", "blue.300");
  
  // Получаем данные из state
  const [selectedClass, setSelectedClass] = useState(location.state?.selectedClass || "");
  const [selectedDate] = useState(location.state?.selectedDate || new Date().toISOString().split("T")[0]);
  const selectedPrice = location.state?.price || 0;
  const passengersCount = location.state?.passengersCount || 1;
  const tripInfo = location.state?.tripInfo || null;
  
  // Состояния для выбора вагона и мест
  const [selectedWagon, setSelectedWagon] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerData, setPassengerData] = useState([]);
  
  // Состояние для модального окна с данными пассажира
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentSeat, setCurrentSeat] = useState(null);
  const [currentPassenger, setCurrentPassenger] = useState({
    name: "",
    document: "",
    passengerType: "adult" // Используем строковый код типа пассажира
  });
  
  // Получаем информацию о поездке
  const { data: trip, isLoading: isTripLoading } = useQuery(
    ["trip", tripId],
    () => getTrip({ queryKey: ["trip", tripId] }),
    {
      enabled: !!tripId && !tripInfo,
      staleTime: 60000,
      initialData: tripInfo
    }
  );
  
  // Получаем информацию о доступности
  const { data: availability, isLoading: isAvailabilityLoading, refetch: refetchAvailability, error: availabilityError } = useQuery(
    ["tripAvailability", tripId, selectedDate, passengersCount],
    () => {
      console.log("Requesting availability data with params:", {
        tripId, date: selectedDate, passengersCount
      });
      return getTripAvailability(tripId, selectedDate, passengersCount);
    },
    {
      enabled: !!tripId && !!selectedDate,
      staleTime: 300000, // Данные считаются свежими в течение 5 минут
      cacheTime: 600000, // Кэш действителен 10 минут
      retry: 2, // Допускаем 2 повторные попытки
      refetchOnWindowFocus: false, // Не обновлять при фокусе окна
      refetchOnMount: true, // Обновлять при монтировании компонента
      onSuccess: (data) => {
        console.log("Successfully loaded availability data:", data);
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
  
  // Получаем типы пассажиров
  const { data: passengerTypes } = useQuery(
    ["passengerTypes"],
    () => {
      // В реальном приложении используем API
      return getPassengerTypes();
    },
    {
      staleTime: 300000
    }
  );
  
  // Используем данные из availability для получения вагонов
  const getWagonsFromAvailability = async () => {
    console.log("Getting wagons from availability data");
    
    // Проверяем наличие объекта availability
    if (!availability) {
      console.log("No availability data yet");
      return [];
    }
    
    // Ищем вагоны для текущей даты в dates_availability
    if (availability.dates_availability && Array.isArray(availability.dates_availability)) {
      // Находим информацию о доступности для выбранной даты
      const dateInfo = availability.dates_availability.find(d => d.departure_date === selectedDate);
      
      if (dateInfo) {
        console.log("Found date info for selected date:", dateInfo);
        
        // Проверяем наличие выбранного класса
        if (dateInfo.classes && dateInfo.classes[selectedClass]) {
          const classInfo = dateInfo.classes[selectedClass];
          console.log("Found wagons for selected class:", classInfo);
          
          // Создаем один вагон с данными из API
          return [{
            id: classInfo.wagon_id,
            number: "1",
            type: selectedClass,
            available_seats: classInfo.available_seats,
            total_seats: classInfo.total_seats
          }];
        } else {
          console.log(`No wagons found for class '${selectedClass}', checking other classes`);
          
          // Если класс не найден, ищем любой доступный класс
          const availableClasses = Object.keys(dateInfo.classes || {});
          if (availableClasses.length > 0) {
            const firstAvailableClass = availableClasses[0];
            console.log(`Using first available class: ${firstAvailableClass}`);
            
            // Обновляем выбранный класс
            setSelectedClass(firstAvailableClass);
            
            const classInfo = dateInfo.classes[firstAvailableClass];
            return [{
              id: classInfo.wagon_id,
              number: "1",
              type: firstAvailableClass,
              available_seats: classInfo.available_seats,
              total_seats: classInfo.total_seats
            }];
          }
        }
      } else {
        console.log(`No availability info found for date '${selectedDate}', using first available date`);
        
        // Если дата не найдена, используем первую доступную дату
        if (availability.dates_availability.length > 0) {
          const firstDateInfo = availability.dates_availability[0];
          console.log("Using first available date:", firstDateInfo.departure_date);
          
          // Проверяем наличие классов для этой даты
          if (firstDateInfo.classes) {
            const availableClasses = Object.keys(firstDateInfo.classes);
            if (availableClasses.length > 0) {
              const firstClass = availableClasses[0];
              console.log(`Using class: ${firstClass}`);
              
              // Обновляем выбранный класс
              setSelectedClass(firstClass);
              
              const classInfo = firstDateInfo.classes[firstClass];
              return [{
                id: classInfo.wagon_id,
                number: "1",
                type: firstClass,
                available_seats: classInfo.available_seats,
                total_seats: classInfo.total_seats
              }];
            }
          }
        }
      }
    } else if (availability.wagon_types && Array.isArray(availability.wagon_types)) {
      // Резервный путь для старого формата данных
      console.log("Using wagon_types fallback");
      
      // Ищем вагон для выбранного класса
      const wagonTypeInfo = availability.wagon_types.find(wt => wt.name === selectedClass);
      
      if (wagonTypeInfo) {
        console.log("Found wagon type for selected class:", wagonTypeInfo);
        
        // Создаем вагон-заглушку
        return [{
          id: wagonTypeInfo.id || 1,
          number: "1",
          type: selectedClass,
          available_seats: 20,
          total_seats: 24
        }];
      }
    }
    
    console.log("No wagons found in availability data");
    return [];
  };
  
  // Заменяем запрос на вагоны нашей функцией
  const { data: wagons = [], isLoading: isWagonsLoading, refetch: refetchWagons, status: wagonsStatus, error: wagonsError } = useQuery(
    ["wagons", tripId, selectedClass, selectedDate],
    getWagonsFromAvailability,
    {
      enabled: !!tripId && !!selectedClass && !!selectedDate && !!availability,
      staleTime: 300000, // Данные считаются свежими в течение 5 минут
      cacheTime: 600000, // Кэш действителен 10 минут
      initialData: [],
      retry: 2, // Допускаем 2 повторные попытки
      refetchOnWindowFocus: false, // Не обновлять при фокусе окна
      refetchOnMount: true, // Обновлять при монтировании компонента
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

  // Автоматически загружаем вагоны при изменении необходимых данных или после получения availability
  useEffect(() => {
    if (tripId && selectedClass && selectedDate && availability) {
      console.log("Auto-loading wagons due to data changes or availability update");
      refetchWagons();
    }
  }, [tripId, selectedClass, selectedDate, availability, refetchWagons]);

  // Обработка ошибки при загрузке вагонов
  useEffect(() => {
    if (wagonsError) {
      console.error("Error loading wagons:", wagonsError);
      // Через некоторое время автоматически повторяем запрос
      const errorRetryTimer = setTimeout(() => {
        console.log("Retrying after error...");
        refetchWagons();
      }, 2000);
      
      return () => clearTimeout(errorRetryTimer);
    }
  }, [wagonsError, refetchWagons]);
  
  // Получаем информацию о местах в выбранном вагоне
  const getSeatsForSelectedWagon = async () => {
    if (!selectedWagon) return [];
    
    // Проверяем, есть ли у нас данные о доступности с подробной информацией о местах
    if (availability && availability.wagon_types) {
      // Ищем конкретный вагон в данных
      const wagonTypeInfo = availability.wagon_types.find(wt => wt.name === selectedClass);
      
      if (wagonTypeInfo && wagonTypeInfo.wagons) {
        const selectedWagonData = wagonTypeInfo.wagons.find(w => w.id === selectedWagon.id);
        
        if (selectedWagonData && selectedWagonData.seats) {
          console.log("Found seats in availability data:", selectedWagonData.seats);
          return selectedWagonData.seats.map(seat => ({
            id: seat.id,
            number: seat.number,
            occupied: !seat.available
          }));
        }
      }
    }
    
    try {
      // Получаем данные о местах из API
      console.log("Fetching seats from API for wagon:", selectedWagon.id);
      const seatsFromAPI = await getSeatsForWagon(tripId, selectedWagon.id, selectedDate);
      console.log("API response for seats:", seatsFromAPI);
      
      if (seatsFromAPI && Array.isArray(seatsFromAPI)) {
        return seatsFromAPI;
      }
      
      // Если API вернул пустой результат или не массив
      console.warn("API returned invalid or empty seats data");
      return [];
    } catch (error) {
      console.error("Error fetching seats from API:", error);
      return [];
    }
  };
  
  // Мутация для бронирования билетов
  const bookTicketsMutation = useMutation(
    (ticketsData) => {
      console.log("Отправляемые данные:", JSON.stringify(ticketsData, null, 2));
      // Используем API для бронирования билетов
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
  
  // Проверяем авторизацию пользователя
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
    // Если место занято, не делаем ничего
    if (seat.occupied) return;
    
    // Если место уже выбрано, отменяем выбор
    if (selectedSeats.some(s => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
      setPassengerData(passengerData.filter(p => p.seatId !== seat.id));
      return;
    }
    
    // Проверяем, что количество выбранных мест не превышает количество пассажиров
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
    
    // Добавляем место в выбранные
    setSelectedSeats([...selectedSeats, seat]);
    setCurrentSeat(seat);
    setCurrentPassenger({
      name: "",
      document: "",
      passengerType: "adult" // Используем строковый код типа пассажира
    });
    onOpen();
  };
  
  // Обработчик изменения данных пассажира
  const handlePassengerChange = (field, value) => {
    setCurrentPassenger({
      ...currentPassenger,
      [field]: value
    });
  };
  
  // Обработчик сохранения данных пассажира
  const handleSavePassenger = () => {
    // Проверяем заполнение обязательных полей
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
    
    console.log("Saving passenger data for seat:", currentSeat, "wagon:", selectedWagon);
    
    // Добавляем данные пассажира
    setPassengerData([
      ...passengerData,
      {
        seatId: currentSeat.id,
        seatNumber: currentSeat.number,
        wagonId: selectedWagon.id, // Используем ID вагона из данных
        wagonNumber: selectedWagon.number,
        passengerName: currentPassenger.name,
        passengerDocument: currentPassenger.document,
        passengerType: currentPassenger.passengerType
      }
    ]);
    
    onClose();
  };
  
  // Обработчик редактирования данных пассажира
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
  
  // Обработчик подтверждения бронирования
  const handleConfirmBooking = () => {
    // Проверяем, что для всех выбранных мест заполнены данные пассажиров
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
    
    // Формируем данные для бронирования с корректными ID
    const ticketsData = {
      tickets: passengerData.map(passenger => {
        // Находим выбранный тип пассажира для получения корректного ID
        let passengerTypeId = 1; // По умолчанию 1 (обычно Adult)
        
        if (passengerTypes && Array.isArray(passengerTypes)) {
          // Сначала попробуем найти по коду типа пассажира
          const passengerTypeObj = passengerTypes.find(pt => pt.code === passenger.passengerType);
          
          if (passengerTypeObj) {
            console.log(`Found passenger type by code: ${passenger.passengerType}`, passengerTypeObj);
            passengerTypeId = passengerTypeObj.id || 1;
          } else {
            // Если не нашли по коду, пробуем найти по id
            const passengerTypeById = passengerTypes.find(pt => {
              const ptId = pt.id !== undefined ? pt.id.toString() : '';
              const passType = passenger.passengerType !== undefined ? passenger.passengerType.toString() : '';
              return ptId === passType;
            });
            
            if (passengerTypeById) {
              console.log(`Found passenger type by id: ${passenger.passengerType}`, passengerTypeById);
              passengerTypeId = passengerTypeById.id || 1;
            } else {
              console.warn("Passenger type not found:", passenger.passengerType);
              // Используем первый тип пассажира как fallback
              if (passengerTypes[0]) {
                passengerTypeId = passengerTypes[0].id || 1;
              }
            }
          }
        } else {
          console.warn("Passenger types not loaded, using default ID 1");
        }
        
        // Убеждаемся, что passengerTypeId точно число
        if (typeof passengerTypeId !== 'number' || isNaN(passengerTypeId)) {
          passengerTypeId = 1; // Fallback к 1, если что-то пошло не так
        }
        
        console.log(`Creating ticket with wagon_id=${passenger.wagonId}, seat=${passenger.seatNumber}, passenger_type=${passengerTypeId} (${typeof passengerTypeId}), original passenger type=${passenger.passengerType}`);
        
        return {
          trip: parseInt(tripId),
          wagon: parseInt(passenger.wagonId), // Важно: используем ID вагона, а не его номер
          seat_number: parseInt(passenger.seatNumber),
          passenger_name: passenger.passengerName,
          passenger_document: passenger.passengerDocument,
          passenger_type: passengerTypeId // Всегда числовое значение
        };
      })
    };
    
    console.log("Booking data:", JSON.stringify(ticketsData, null, 2));
    
    // Отправляем запрос на бронирование
    bookTicketsMutation.mutate(ticketsData);
  };
  
  // Получаем данные о поездке
  const actualTrip = trip || tripInfo;
  const isLoading = isTripLoading || isWagonsLoading || isUserLoading;
  
  // Получаем информацию о местах в выбранном вагоне
  const { data: seats, isLoading: isSeatsLoading } = useQuery(
    ["seats", tripId, selectedWagon?.id, selectedDate],
    () => getSeatsForSelectedWagon(),
    {
      enabled: !!tripId && !!selectedWagon && !!selectedDate,
      staleTime: 30000
    }
  );
  
  // Первоначальная установка класса вагона по умолчанию из location state
  useEffect(() => {
    // Если класс не был установлен, и есть доступные классы в данных availability, устанавливаем первый доступный
    if ((!selectedClass || selectedClass === "") && availability) {
      console.log("Setting default class from availability:", availability);
      
      // Проверяем наличие данных о типах вагонов
      if (availability.wagon_types && availability.wagon_types.length > 0) {
        const firstAvailableClass = availability.wagon_types[0].name;
        console.log("Setting default class to:", firstAvailableClass);
        setSelectedClass(firstAvailableClass);
      } 
      // Проверяем альтернативный формат данных
      else if (availability.dates_availability && availability.dates_availability.length > 0) {
        const dateInfo = availability.dates_availability.find(d => {
          const dateStr = new Date(d.departure_time).toISOString().split('T')[0];
          return dateStr === selectedDate;
        });
        
        if (dateInfo && dateInfo.classes) {
          const availableClasses = Object.keys(dateInfo.classes);
          if (availableClasses.length > 0) {
            console.log("Setting default class to:", availableClasses[0]);
            setSelectedClass(availableClasses[0]);
          }
        }
      }
      // Если в данных нет информации о классах, используем "Normal" по умолчанию
      else {
        console.log("No available classes in data, setting default class to 'Normal'");
        setSelectedClass("Normal");
      }
    }
  }, [availability, selectedClass, selectedDate]);

  // Явно выводим все состояния для отладки
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
  
  // useEffect с проверкой на наличие wagons
  useEffect(() => {
    if (availability && !isWagonsLoading && (!wagons || wagons.length === 0)) {
      console.log("No wagons found, checking availability", availability);
      // Проверяем доступность других классов
      const allAvailableClasses = availability?.dates_availability
        ?.map(d => Object.keys(d.classes || {}))
        .flat()
        .filter(Boolean);
      
      if (allAvailableClasses && allAvailableClasses.length > 0) {
        console.log("Available classes:", allAvailableClasses);
        
        // Если текущий класс не найден, но есть другие классы
        if (!allAvailableClasses.includes(selectedClass) && allAvailableClasses[0]) {
          console.log(`Selected class ${selectedClass} is not available, switching to ${allAvailableClasses[0]}`);
          setSelectedClass(allAvailableClasses[0]);
        }
      }
    }
  }, [wagons, isWagonsLoading, selectedClass, availability]);
  
  // Обработка ошибки доступности
  useEffect(() => {
    if (availabilityError) {
      console.error("Availability error:", availabilityError);
      // Создаем таймер для повторной попытки
      const retryTimer = setTimeout(() => {
        console.log("Retrying availability data fetch...");
        refetchAvailability();
      }, 2000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [availabilityError, refetchAvailability]);
  
  // Отображаем спиннер при загрузке
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
  
  // Отображаем сообщение, если нет данных о поездке
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
  
  // Отображаем главную страницу выбора мест
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Select Your Seats</Heading>
        
        {/* Информация о поездке */}
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
              <Text>Price per ticket: ${selectedPrice}</Text>
              <Text>Passengers: {passengersCount}</Text>
            </Box>
          </Grid>
        </Box>
        
        {/* Выбор вагона */}
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
                    console.log("Manual refresh triggered");
                    // Запускаем запросы без очистки кэша
                    refetchAvailability().then(() => {
                      // После получения availability обновляем вагоны
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
        
        {/* Схема мест в вагоне */}
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
                {/* Легенда */}
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
                
                {/* Визуализация мест */}
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
                            ? "Occupied"
                            : isSelected && passengerInfo
                            ? `${passengerInfo.passengerName}`
                            : `Seat ${seat.number}`
                        }
                      >
                        <Box
                          p={2}
                          borderWidth="1px"
                          borderRadius="md"
                          borderColor={isSelected ? selectedBorderColor : borderColor}
                          bg={
                            seat.occupied
                              ? occupiedBgColor
                              : isSelected
                              ? selectedBgColor
                              : bgColor
                          }
                          cursor={seat.occupied ? "not-allowed" : "pointer"}
                          onClick={() => handleSeatClick(seat)}
                          textAlign="center"
                          position="relative"
                        >
                          <Text fontSize="sm" fontWeight="bold">
                            {seat.number}
                          </Text>
                          
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
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Grid>
              </VStack>
            )}
          </Box>
        )}
        
        {/* Список выбранных мест и пассажиров */}
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
                                passengerType: "adult" // Используем строковый код типа пассажира
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
      
      {/* Модальное окно для заполнения данных пассажира */}
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
                    // Преобразуем значение в число, если оно числовое
                    const value = !isNaN(parseInt(e.target.value)) ? parseInt(e.target.value) : e.target.value;
                    console.log("Selected passenger type:", value, typeof value);
                    handlePassengerChange("passengerType", value);
                  }}
                >
                  {passengerTypes ? (
                    passengerTypes.map(type => (
                      <option key={type.code} value={type.code}>
                        {type.name} {type.discount_percent > 0 && `(${type.discount_percent}% off)`}
                      </option>
                    ))
                  ) : (
                    <option value="adult">Adult</option>
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