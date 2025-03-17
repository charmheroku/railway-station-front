import { FaTrain, FaMoon, FaSun, FaUser, FaUserShield } from "react-icons/fa";
import {
  Box,
  Button,
  HStack,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import SignUpModal from "./SignUpModal";
import { useUser } from "../lib/useUser";
import { logout } from "../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function Header() {
  const { isLoading: userLoading, isLoggedIn, user } = useUser();
  const {
    isOpen: isLoginOpen,
    onClose: onLoginClose,
    onOpen: onLoginOpen,
  } = useDisclosure();
  const {
    isOpen: isSignUpOpen,
    onClose: onSignUpClose,
    onOpen: onSignUpOpen,
  } = useDisclosure();
  const { toggleColorMode } = useColorMode();
  const logoColor = useColorModeValue("brand.500", "brand.200");
  const Icon = useColorModeValue(FaMoon, FaSun);
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const mutation = useMutation(logout, {
    onSuccess: () => {
      toast({
        title: "Logged out!",
        description: "See you later!",
        status: "success",
      });
      queryClient.refetchQueries(["me"]);
      navigate("/");
    },
  });
  
  const onLogOut = () => {
    mutation.mutate();
  };
  
  // Проверяем, является ли пользователь администратором
  const isAdmin = user && (user.is_staff || user.is_superuser);
  
  return (
    <Stack
      py={5}
      px={{
        base: 10,
        lg: 40,
      }}
      direction={{
        sm: "column",
        md: "row",
      }}
      spacing={{
        sm: 4,
        md: 0,
      }}
      justifyContent="space-between"
      alignItems="center"
      borderBottomWidth={1}
    >
      <Box color={logoColor}>
        <Link to="/">
          <HStack spacing={2}>
            <FaTrain size={32} />
            <Text fontSize="xl" fontWeight="bold">
              Railway Station
            </Text>
          </HStack>
        </Link>
      </Box>
      <HStack spacing={2}>
        <IconButton
          onClick={toggleColorMode}
          variant="ghost"
          aria-label="Toggle dark mode"
          icon={<Icon />}
        />
        {!userLoading ? (
          !isLoggedIn ? (
            <>
              <Button onClick={onLoginOpen}>Log in</Button>
              <Button onClick={onSignUpOpen} colorScheme="brand">
                Sign up
              </Button>
              <Button 
                as={Link} 
                to="/admin/login" 
                leftIcon={<FaUserShield />}
                variant="ghost"
                size="sm"
              >
                Admin
              </Button>
            </>
          ) : (
            <Menu>
              <MenuButton>
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    w={8}
                    h={8}
                    borderRadius="full"
                  />
                ) : (
                  <FaUser size={24} />
                )}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => navigate("/bookings")}>
                  My Bookings
                </MenuItem>
                {isAdmin && (
                  <MenuItem 
                    onClick={() => navigate("/admin/dashboard")}
                    icon={<FaUserShield />}
                  >
                    Admin Panel
                  </MenuItem>
                )}
                <MenuItem onClick={onLogOut}>Log out</MenuItem>
              </MenuList>
            </Menu>
          )
        ) : null}
      </HStack>
      <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />
      <SignUpModal isOpen={isSignUpOpen} onClose={onSignUpClose} />
    </Stack>
  );
} 