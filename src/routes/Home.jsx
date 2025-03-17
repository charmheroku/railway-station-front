import { Box, Heading, Text, VStack, Tabs, TabList, Tab, Flex, Image } from "@chakra-ui/react";
import SearchForm from "../components/TrainBooking/SearchForm";
import { FaHotel, FaPlane, FaTrain, FaBus, FaCar } from "react-icons/fa";
import { useState } from "react";

export default function Home() {
  const [tabIndex, setTabIndex] = useState(2); // Устанавливаем поезда как активную вкладку

  return (
    <Box>
      {/* Навигационные вкладки */}
      <Box bg="#0e2654" py={0}>
        <Flex 
          maxW="1200px" 
          mx="auto" 
          px={4}
          justify="flex-start"
        >
          <Tabs 
            index={tabIndex} 
            onChange={(index) => setTabIndex(index)}
            variant="unstyled"
            colorScheme="blue"
          >
            <TabList>
              <Tab 
                color="white" 
                opacity={tabIndex === 0 ? 1 : 0.7}
                py={4}
                px={6}
                _selected={{ bg: tabIndex === 0 ? "white" : "#0e2654", color: tabIndex === 0 ? "#0e2654" : "white" }}
                borderTopRadius="md"
              >
                <Flex direction="column" align="center">
                  <FaHotel size={20} />
                  <Text mt={1} fontSize="sm">Hotels</Text>
                </Flex>
              </Tab>
              <Tab 
                color="white" 
                opacity={tabIndex === 1 ? 1 : 0.7}
                py={4}
                px={6}
                _selected={{ bg: tabIndex === 1 ? "white" : "#0e2654", color: tabIndex === 1 ? "#0e2654" : "white" }}
                borderTopRadius="md"
              >
                <Flex direction="column" align="center">
                  <FaPlane size={20} />
                  <Text mt={1} fontSize="sm">Flights</Text>
                </Flex>
              </Tab>
              <Tab 
                color="white" 
                opacity={tabIndex === 2 ? 1 : 0.7}
                py={4}
                px={6}
                _selected={{ bg: tabIndex === 2 ? "white" : "#0e2654", color: tabIndex === 2 ? "#0e2654" : "white" }}
                borderTopRadius="md"
              >
                <Flex direction="column" align="center">
                  <FaTrain size={20} />
                  <Text mt={1} fontSize="sm">Trains</Text>
                </Flex>
              </Tab>
              <Tab 
                color="white" 
                opacity={tabIndex === 3 ? 1 : 0.7}
                py={4}
                px={6}
                _selected={{ bg: tabIndex === 3 ? "white" : "#0e2654", color: tabIndex === 3 ? "#0e2654" : "white" }}
                borderTopRadius="md"
              >
                <Flex direction="column" align="center">
                  <FaBus size={20} />
                  <Text mt={1} fontSize="sm">Bus</Text>
                </Flex>
              </Tab>
              <Tab 
                color="white" 
                opacity={tabIndex === 4 ? 1 : 0.7}
                py={4}
                px={6}
                _selected={{ bg: tabIndex === 4 ? "white" : "#0e2654", color: tabIndex === 4 ? "#0e2654" : "white" }}
                borderTopRadius="md"
              >
                <Flex direction="column" align="center">
                  <FaCar size={20} />
                  <Text mt={1} fontSize="sm">Cars</Text>
                </Flex>
              </Tab>
            </TabList>
          </Tabs>
        </Flex>
      </Box>

      {/* Основной контент */}
      <Box bg="gray.100" py={8}>
        <Flex 
          maxW="1200px" 
          mx="auto" 
          px={4}
          direction={{ base: "column", lg: "row" }}
          gap={6}
        >
          {/* Форма поиска */}
          <Box 
            w={{ base: "100%", lg: "50%" }}
            bg="white"
            p={6}
            borderRadius="md"
            boxShadow="sm"
          >
            <Heading as="h2" size="md" mb={6}>
              Book Train Tickets
            </Heading>
            <SearchForm />
          </Box>

          {/* Баннер */}
          <Box 
            w={{ base: "100%", lg: "50%" }}
            bg="#2d4a8a"
            borderRadius="md"
            overflow="hidden"
            position="relative"
            height="400px"
          >
            <Box 
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="rgba(0,0,0,0.3)"
              zIndex={1}
            />
            <Image 
              src="https://demo.harnishdesign.net/html/quickai/images/hero-bg-train.jpg" 
              alt="Train"
              objectFit="cover"
              w="100%"
              h="100%"
            />
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              textAlign="center"
              color="white"
              zIndex={2}
              w="80%"
            >
              <Heading as="h1" size="xl" mb={4}>
                BOOK TRAIN TICKETS ONLINE
              </Heading>
              <Text fontSize="lg">
                Save Time and Money!
              </Text>
            </Box>
          </Box>
        </Flex>
      </Box>

      {/* Секция "Почему выбирают нас" */}
      <Box py={16}>
        <VStack spacing={8} maxW="1200px" mx="auto" px={4}>
          <Heading as="h2" size="xl" textAlign="center">
            Why Book Trains with Quickai
          </Heading>
          <Text fontSize="lg" textAlign="center" color="gray.600">
            Book Train Tickets Online. Save Time and Money!
          </Text>

          <Flex 
            wrap="wrap" 
            justify="space-between" 
            w="100%" 
            mt={8}
            gap={6}
          >
            {/* Преимущество 1 */}
            <Box 
              w={{ base: "100%", md: "45%", lg: "22%" }}
              display="flex"
              alignItems="flex-start"
              gap={4}
            >
              <Flex
                bg="#3d7bfc"
                w="50px"
                h="50px"
                borderRadius="full"
                justify="center"
                align="center"
                color="white"
                flexShrink={0}
              >
                <Box as="span" fontSize="xl">%</Box>
              </Flex>
              <Box>
                <Heading as="h3" size="md" mb={2}>
                  Cheapest Price
                </Heading>
                <Text color="gray.600">
                  Always get cheapest price with the best in the industry. So you get the best deal every time!
                </Text>
              </Box>
            </Box>

            {/* Преимущество 2 */}
            <Box 
              w={{ base: "100%", md: "45%", lg: "22%" }}
              display="flex"
              alignItems="flex-start"
              gap={4}
            >
              <Flex
                bg="#3d7bfc"
                w="50px"
                h="50px"
                borderRadius="full"
                justify="center"
                align="center"
                color="white"
                flexShrink={0}
              >
                <Box as="span" fontSize="xl">×</Box>
              </Flex>
              <Box>
                <Heading as="h3" size="md" mb={2}>
                  Easy Cancellation & Refunds
                </Heading>
                <Text color="gray.600">
                  Get instant refund and get any booking fees waived off!
                </Text>
              </Box>
            </Box>

            {/* Преимущество 3 */}
            <Box 
              w={{ base: "100%", md: "45%", lg: "22%" }}
              display="flex"
              alignItems="flex-start"
              gap={4}
            >
              <Flex
                bg="#3d7bfc"
                w="50px"
                h="50px"
                borderRadius="full"
                justify="center"
                align="center"
                color="white"
                flexShrink={0}
              >
                <Box as="span" fontSize="xl">$</Box>
              </Flex>
              <Box>
                <Heading as="h3" size="md" mb={2}>
                  No Booking Charges
                </Heading>
                <Text color="gray.600">
                  No hidden charges, no payment fees, and free customer service. So you get the best deal every time!
                </Text>
              </Box>
            </Box>

            {/* Преимущество 4 */}
            <Box 
              w={{ base: "100%", md: "45%", lg: "22%" }}
              display="flex"
              alignItems="flex-start"
              gap={4}
            >
              <Flex
                bg="#3d7bfc"
                w="50px"
                h="50px"
                borderRadius="full"
                justify="center"
                align="center"
                color="white"
                flexShrink={0}
              >
                <Box as="span" fontSize="xl">♥</Box>
              </Flex>
              <Box>
                <Heading as="h3" size="md" mb={2}>
                  Every time, anywhere
                </Heading>
                <Text color="gray.600">
                  Because your trip doesn't end with a ticket, we're here for you all the way
                </Text>
              </Box>
            </Box>
          </Flex>
        </VStack>
      </Box>
    </Box>
  );
} 