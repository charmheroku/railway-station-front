import { extendTheme, theme as chakraTheme } from "@chakra-ui/react";

const config = {
    initialColorMode: "light",
    useSystemColorMode: false,
};

const theme = extendTheme({
    config,
    colors: {
        brand: {
            50: "#e6f2ff",
            100: "#b3d9ff",
            200: "#80bfff",
            300: "#4da6ff",
            400: "#1a8cff",
            500: "#0073e6", // Primary blue
            600: "#0059b3",
            700: "#004080",
            800: "#00264d",
            900: "#000d1a",
        },
        blue: {
            50: "#e6f2ff",
            100: "#b3d9ff",
            200: "#80bfff",
            300: "#4da6ff",
            400: "#1a8cff",
            500: "#0073e6", // Primary blue
            600: "#0059b3",
            700: "#004080",
            800: "#0e2654", // Dark blue for header
            900: "#000d1a",
        },
    },
    fonts: {
        heading: "'Poppins', sans-serif",
        body: "'Poppins', sans-serif",
    },
    components: {
        Button: {
            baseStyle: {
                fontWeight: "500",
                borderRadius: "md",
            },
            variants: {
                solid: {
                    bg: "#0073e6",
                    color: "white",
                    _hover: {
                        bg: "#0059b3",
                    },
                },
            },
        },
        Input: {
            baseStyle: {
                field: {
                    borderRadius: "md",
                },
            },
        },
    },
});

export default theme; 