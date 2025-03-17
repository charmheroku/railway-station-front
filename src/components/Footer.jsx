import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { FaGithub, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <Box
      as="footer"
      py={10}
      borderTopWidth={1}
      mt={20}
    >
      <VStack spacing={5}>
        <HStack spacing={4}>
          <Box as="a" href="https://github.com" target="_blank">
            <FaGithub size={24} />
          </Box>
          <Box as="a" href="https://twitter.com" target="_blank">
            <FaTwitter size={24} />
          </Box>
          <Box as="a" href="https://instagram.com" target="_blank">
            <FaInstagram size={24} />
          </Box>
        </HStack>
        <Text fontSize="sm" color="gray.500">
          &copy; {new Date().getFullYear()} Railway Station. All rights reserved.
        </Text>
      </VStack>
    </Box>
  );
} 