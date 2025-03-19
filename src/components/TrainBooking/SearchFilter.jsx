import {
  Box,
  Heading,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Checkbox,
  CheckboxGroup,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  Flex,
  Stack,
  useColorModeValue
} from "@chakra-ui/react";
import { useState } from "react";

export default function SearchFilter({ onFilterChange }) {
  const [departureTimeRange, setDepartureTimeRange] = useState([0, 24]);
  const [arrivalTimeRange, setArrivalTimeRange] = useState([0, 24]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "gray.700");
  
  const handleDepartureTimeChange = (val) => {
    setDepartureTimeRange(val);
    if (onFilterChange) {
      onFilterChange({
        departureTimeRange: val,
        arrivalTimeRange,
        selectedClasses
      });
    }
  };
  
  const handleArrivalTimeChange = (val) => {
    setArrivalTimeRange(val);
    if (onFilterChange) {
      onFilterChange({
        departureTimeRange,
        arrivalTimeRange: val,
        selectedClasses
      });
    }
  };
  
  const handleClassChange = (val) => {
    setSelectedClasses(val);
    if (onFilterChange) {
      onFilterChange({
        departureTimeRange,
        arrivalTimeRange,
        selectedClasses: val
      });
    }
  };
  
  const formatTimeDisplay = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };
  
  return (
    <Box 
      p={4} 
      borderWidth="1px" 
      borderRadius="lg" 
      borderColor={borderColor}
      bg={bgColor}
      boxShadow="sm"
      width="100%"
    >
      <VStack align="stretch" spacing={4}>
        <Heading size="md">Filter</Heading>
        
        <Accordion allowMultiple defaultIndex={[0, 1, 2]}>
          {/* Departure Time Filter */}
          <AccordionItem border="none">
            <AccordionButton px={0} _hover={{ bg: "transparent" }}>
              <Box flex="1" textAlign="left" fontWeight="medium">
                Departure Time
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} px={0}>
              <VStack align="stretch" spacing={2}>
                <RangeSlider
                  min={0}
                  max={24}
                  step={1}
                  value={departureTimeRange}
                  onChange={handleDepartureTimeChange}
                  colorScheme="blue"
                >
                  <RangeSliderTrack>
                    <RangeSliderFilledTrack />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} boxSize={6} />
                  <RangeSliderThumb index={1} boxSize={6} />
                </RangeSlider>
                <Flex justify="space-between">
                  <Text>{formatTimeDisplay(departureTimeRange[0])}</Text>
                  <Text>{formatTimeDisplay(departureTimeRange[1])}</Text>
                </Flex>
                <Text fontSize="sm" color="gray.500">
                  00:00 - 23:59
                </Text>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
          
          {/* Arrival Time Filter */}
          <AccordionItem border="none">
            <AccordionButton px={0} _hover={{ bg: "transparent" }}>
              <Box flex="1" textAlign="left" fontWeight="medium">
                Arrival Time
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} px={0}>
              <VStack align="stretch" spacing={2}>
                <RangeSlider
                  min={0}
                  max={24}
                  step={1}
                  value={arrivalTimeRange}
                  onChange={handleArrivalTimeChange}
                  colorScheme="blue"
                >
                  <RangeSliderTrack>
                    <RangeSliderFilledTrack />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} boxSize={6} />
                  <RangeSliderThumb index={1} boxSize={6} />
                </RangeSlider>
                <Flex justify="space-between">
                  <Text>{formatTimeDisplay(arrivalTimeRange[0])}</Text>
                  <Text>{formatTimeDisplay(arrivalTimeRange[1])}</Text>
                </Flex>
                <Text fontSize="sm" color="gray.500">
                  00:00 - 23:59
                </Text>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
          
          {/* Fare Class Filter */}
          <AccordionItem border="none">
            <AccordionButton px={0} _hover={{ bg: "transparent" }}>
              <Box flex="1" textAlign="left" fontWeight="medium">
                Fare Class
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} px={0}>
              <CheckboxGroup 
                colorScheme="blue" 
                value={selectedClasses} 
                onChange={handleClassChange}
              >
                <Stack spacing={2} direction="column">
                  <Checkbox value="Lux">Lux (x1.50)</Checkbox>
                  <Checkbox value="Normal">Normal (x1.00)</Checkbox>
                </Stack>
              </CheckboxGroup>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    </Box>
  );
} 