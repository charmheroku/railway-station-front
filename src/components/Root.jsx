import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Root() {
  return (
    <Box>
      <Header />
      <Outlet />
      <Footer />
    </Box>
  );
} 