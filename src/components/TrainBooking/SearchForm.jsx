import {
  Box,
  Button,
  FormControl,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Icon,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStations } from "../../api";
import { formatDate } from "../../lib/utils";
import { FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";

export default function SearchForm() {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    departDate: formatDate(new Date()),
  });
  
  const navigate = useNavigate();
  const toast = useToast();
  
  const { isLoading } = useQuery(["stations"], getStations);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      `/search?from=${formData.from}&to=${formData.to}&date=${formData.departDate}`
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