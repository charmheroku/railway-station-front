import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Icon,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../lib/useUser";
import { FaTrain, FaMapMarkerAlt, FaRoute, FaTicketAlt, FaUsers, FaCouch, FaWifi } from "react-icons/fa";

export default function AdminDashboard() {
  const { isLoggedIn, isLoading, user } = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("blue.50", "blue.900");
  
  // Проверяем, является ли пользователь администратором
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      toast({
        title: "Access denied",
        description: "Please log in as an administrator",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/admin/login");
      return;
    }
    
    if (!isLoading && isLoggedIn && user && !(user.is_staff || user.is_superuser)) {
      toast({
        title: "Access denied",
        description: "You don't have permission to access the admin panel",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/");
    }
  }, [isLoading, isLoggedIn, user, navigate, toast]);
  
  // Массив с элементами админ-панели
  const adminItems = [
    {
      title: "Stations",
      description: "Manage railway stations",
      icon: FaMapMarkerAlt,
      path: "/admin/stations",
    },
    {
      title: "Routes",
      description: "Manage routes between stations",
      icon: FaRoute,
      path: "/admin/routes",
    },
    {
      title: "Trains",
      description: "Manage trains",
      icon: FaTrain,
      path: "/admin/trains",
    },
    {
      title: "Trips",
      description: "Manage trips",
      icon: FaTicketAlt,
      path: "/admin/trips",
    },
    {
      title: "Wagons",
      description: "Manage wagons",
      icon: FaCouch,
      path: "/admin/wagons",
    },
    {
      title: "Wagon Types",
      description: "Manage wagon types",
      icon: FaCouch,
      path: "/admin/wagon-types",
    },
    {
      title: "Wagon Amenities",
      description: "Manage wagon amenities",
      icon: FaWifi,
      path: "/admin/wagon-amenities",
    },
    {
      title: "Passenger Types",
      description: "Manage passenger types",
      icon: FaUsers,
      path: "/admin/passenger-types",
    },
  ];
  
  if (isLoading) {
    return (
      <Container maxW="container.xl" py={10}>
        <Text>Loading...</Text>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h1" size="xl">
            Admin Dashboard
          </Heading>
          
          <Button 
            colorScheme="red" 
            variant="outline"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/admin/login");
            }}
          >
            Logout
          </Button>
        </Flex>
        
        <Grid 
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} 
          gap={6}
        >
          {adminItems.map((item) => (
            <Box
              key={item.title}
              p={6}
              borderWidth="1px"
              borderRadius="lg"
              borderColor={borderColor}
              bg={bgColor}
              _hover={{ bg: hoverBg, borderColor: "blue.500", cursor: "pointer" }}
              onClick={() => navigate(item.path)}
            >
              <VStack spacing={4} align="center">
                <Icon as={item.icon} boxSize={10} color="blue.500" />
                <Heading as="h3" size="md">
                  {item.title}
                </Heading>
                <Text textAlign="center" color="gray.600">
                  {item.description}
                </Text>
              </VStack>
            </Box>
          ))}
        </Grid>
      </VStack>
    </Container>
  );
} 