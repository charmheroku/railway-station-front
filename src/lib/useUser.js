import { useQuery } from "@tanstack/react-query";
import { getMe } from "../api";

export function useUser() {
    // Проверяем наличие токена
    const token = localStorage.getItem('token');

    // Выполняем запрос только если есть токен
    const { isLoading, data, isError, refetch } = useQuery(["me"], getMe, {
        retry: false,
        enabled: !!token,
        // Не кэшируем результат, чтобы всегда получать актуальные данные
        cacheTime: 0,
        onSuccess: (userData) => {
            // Сохраняем данные пользователя в localStorage
            localStorage.setItem('user', JSON.stringify(userData));
        },
        onError: () => {
            // Удаляем данные пользователя из localStorage при ошибке
            localStorage.removeItem('user');
        }
    });

    // Если нет токена, то пользователь не аутентифицирован
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