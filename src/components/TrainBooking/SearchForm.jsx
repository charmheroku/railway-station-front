import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputLeftElement,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  useToast,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Text,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStations } from "../../api";
import { formatDate } from "../../lib/utils";
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers } from "react-icons/fa";

export default function SearchForm() {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    departDate: formatDate(new Date()),
    returnDate: "",
    passengers: 1,
  });
  
  const [isPassengersOpen, setIsPassengersOpen] = useState(false);
  
  const navigate = useNavigate();
  const toast = useToast();
  
  const { data: stations, isLoading } = useQuery(["stations"], getStations);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handlePassengersChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      passengers: value,
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.from || !formData.to || !formData.departDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (formData.from === formData.to) {
      toast({
        title: "Invalid selection",
        description: "Origin and destination cannot be the same",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    navigate(
      `/search?from=${formData.from}&to=${formData.to}&date=${formData.departDate}&passengers=${formData.passengers}`
    );
  };
  
  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Grid gap={4}>
        {/* From */}
        <GridItem>
          <FormControl isRequired>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaMapMarkerAlt} color="gray.400" />
              </InputLeftElement>
              <Input
                name="from"
                value={formData.from}
                onChange={handleChange}
                placeholder="From"
                isDisabled={isLoading}
                variant="filled"
                bg="gray.100"
                _hover={{ bg: "gray.200" }}
                _focus={{ bg: "white", borderColor: "blue.500" }}
                h="50px"
                fontSize="md"
              />
            </InputGroup>
          </FormControl>
        </GridItem>
        
        {/* To */}
        <GridItem>
          <FormControl isRequired>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaMapMarkerAlt} color="gray.400" />
              </InputLeftElement>
              <Input
                name="to"
                value={formData.to}
                onChange={handleChange}
                placeholder="To"
                isDisabled={isLoading}
                variant="filled"
                bg="gray.100"
                _hover={{ bg: "gray.200" }}
                _focus={{ bg: "white", borderColor: "blue.500" }}
                h="50px"
                fontSize="md"
              />
            </InputGroup>
          </FormControl>
        </GridItem>
        
        {/* Depart Date */}
        <GridItem>
          <FormControl isRequired>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaCalendarAlt} color="gray.400" />
              </InputLeftElement>
              <Input
                name="departDate"
                type="date"
                value={formData.departDate}
                onChange={handleChange}
                min={formatDate(new Date())}
                variant="filled"
                bg="gray.100"
                _hover={{ bg: "gray.200" }}
                _focus={{ bg: "white", borderColor: "blue.500" }}
                h="50px"
                fontSize="md"
                placeholder="Depart Date"
              />
            </InputGroup>
          </FormControl>
        </GridItem>
        
        {/* Travellers, Class */}
        <GridItem>
          <FormControl>
            <Popover
              isOpen={isPassengersOpen}
              onClose={() => setIsPassengersOpen(false)}
              placement="bottom"
              closeOnBlur={true}
            >
              <PopoverTrigger>
                <InputGroup onClick={() => setIsPassengersOpen(!isPassengersOpen)}>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaUsers} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    readOnly
                    value={`${formData.passengers} Traveller${formData.passengers > 1 ? 's' : ''}, Class`}
                    variant="filled"
                    bg="gray.100"
                    _hover={{ bg: "gray.200" }}
                    cursor="pointer"
                    h="50px"
                    fontSize="md"
                  />
                </InputGroup>
              </PopoverTrigger>
              <PopoverContent p={4} width="300px">
                <PopoverBody>
                  <Box mb={4}>
                    <Text fontWeight="bold" mb={2}>Passengers</Text>
                    <NumberInput
                      min={1}
                      max={10}
                      value={formData.passengers}
                      onChange={handlePassengersChange}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={2}>Class</Text>
                    <Select defaultValue="economy">
                      <option value="economy">Economy</option>
                      <option value="business">Business</option>
                      <option value="first">First Class</option>
                    </Select>
                  </Box>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </FormControl>
        </GridItem>
        
        {/* Search Button */}
        <GridItem>
          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            width="100%"
            isLoading={isLoading}
            h="50px"
            fontSize="md"
          >
            Search Trains
          </Button>
        </GridItem>
      </Grid>
    </Box>
  );
}