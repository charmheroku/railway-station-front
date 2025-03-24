import { useQuery } from "@tanstack/react-query";
import { getMe } from "../api";

export function useUser() {
    // Check for token presence
    const token = localStorage.getItem('token');

    // Perform request only if there is a token
    const { isLoading, data, isError, refetch } = useQuery(["me"], getMe, {
        retry: false,
        enabled: !!token,
        // Do not cache result to always get fresh data
        cacheTime: 0,
        onSuccess: (userData) => {
            // Save user data to localStorage
            localStorage.setItem('user', JSON.stringify(userData));
        },
        onError: () => {
            // RemoveuusertdataSfromrage on erroronerror
            localStorage.removeItem('user');
        }
    });

    if (!token) {
        return {
            isLoading: false,
            user: null,
            isLoggedIn: false,
            refetch
        };
    }

    return {
        isLoading,
        user: data,
        isLoggedIn: !isError && !!data,
        refetch
    };
} 