import Cookie from "js-cookie";
import axios from "axios";

const instance = axios.create({
    baseURL:
        process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/"
            : "https://api.railway-station.com/api/",
    withCredentials: true,
});

// Добавляем интерцептор для добавления токена к запросам
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Аутентификация
export const login = async (email, password) => {
    try {
        const response = await instance.post('user/token/', { email, password });
        // Сохраняем токен в localStorage
        localStorage.setItem('token', response.data.access);

        // Получаем информацию о пользователе
        const userResponse = await instance.get('user/me/', {
            headers: {
                Authorization: `Bearer ${response.data.access}`,
            },
        });

        // Сохраняем информацию о пользователе в localStorage
        localStorage.setItem('user', JSON.stringify(userResponse.data));

        return userResponse.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

export const register = (email, password, firstName, lastName) =>
    instance.post('user/create/', { email, password, first_name: firstName, last_name: lastName })
        .then(response => response.data);

export const refreshToken = (refresh) =>
    instance.post('user/token/refresh/', { refresh })
        .then(response => {
            localStorage.setItem('token', response.data.access);
            return response.data;
        });

export const logout = () => {
    localStorage.removeItem('token');
    return Promise.resolve();
};

// Station API calls
export const getStations = () =>
    instance.get("station/stations/").then((response) => response.data);

export const getStationsAutocomplete = (query) =>
    instance.get(`station/stations/autocomplete/?query=${query}`).then((response) => response.data);

export const getStation = ({ queryKey }) => {
    const [, stationId] = queryKey;
    return instance.get(`station/stations/${stationId}/`).then((response) => response.data);
};

// Trip API calls
export const searchTrips = (origin, destination, date, passengersCount = 1) =>
    instance.get(
        `station/trips/search/?origin=${origin}&destination=${destination}&date=${date}&passengers_count=${passengersCount}`
    ).then((response) => response.data);

export const getTrip = async ({ queryKey }) => {
    const [, tripId] = queryKey;
    const response = await instance.get(`station/trips/${tripId}/`);
    return response.data;
};

// Получение информации о доступности поездки
export const getTripAvailability = async (tripId, date, passengersCount = 1) => {
    const response = await instance.get(`station/trips/${tripId}/availability/`, {
        params: {
            date: date,
            passengers_count: passengersCount
        }
    });
    return response.data;
};

// User API calls
export const getMe = () =>
    instance.get(`user/me/`).then((response) => response.data);

// Booking API calls
export const createOrder = async (orderData) => {
    const response = await instance.post(
        `booking/orders/`,
        orderData,
        {
            headers: {
                "X-CSRFToken": Cookie.get("csrftoken") || "",
            },
        }
    );
    return response.data;
};

export const getMyOrders = () =>
    instance.get(`booking/orders/`).then((response) => response.data);

export const getOrder = async (orderId) => {
    const response = await instance.get(`booking/orders/${orderId}/`);
    return response.data;
};

export const getPassengerTypes = async () => {
    const response = await instance.get(`booking/passenger-types/`);
    return response.data;
};

// Fallback mock functions for development
export const getMockTrips = (origin, destination, date) => {
    const mockTrips = [
        {
            id: 1,
            train: {
                id: 1,
                name: "Ashram Express",
                number: "12916",
                train_type: "express"
            },
            route: {
                id: 1,
                origin_station: {
                    id: 1,
                    name: origin || "Delhi",
                    city: "Delhi"
                },
                destination_station: {
                    id: 2,
                    name: destination || "Ahmedabad",
                    city: "Ahmedabad"
                },
                distance_km: 934
            },
            departure_time: "2023-06-15T23:00:00",
            arrival_time: "2023-06-16T18:15:00",
            base_price: 120,
            available_seats: 45,
            duration_in_minutes: 1155, // 19h 15m
            total_seats: 120,
            available_seats_by_class: {
                "First Class": 15,
                "Second Class": 30,
                "First Class Sleeper": 10,
                "Second Class Sleeper": 20,
                "Business": 5
            }
        },
        {
            id: 2,
            train: {
                id: 2,
                name: "PBR Express",
                number: "10401",
                train_type: "express"
            },
            route: {
                id: 1,
                origin_station: {
                    id: 1,
                    name: origin || "Delhi",
                    city: "Delhi"
                },
                destination_station: {
                    id: 2,
                    name: destination || "Ahmedabad",
                    city: "Ahmedabad"
                },
                distance_km: 934
            },
            departure_time: "2023-06-15T23:00:00",
            arrival_time: "2023-06-16T18:15:00",
            base_price: 110,
            available_seats: 32,
            duration_in_minutes: 1155, // 19h 15m
            total_seats: 100,
            available_seats_by_class: {
                "First Class": 10,
                "Second Class": 22,
                "First Class Sleeper": 8,
                "Second Class Sleeper": 15,
                "Business": 0
            }
        },
        {
            id: 3,
            train: {
                id: 3,
                name: "Okha Rajdhani",
                number: "29013",
                train_type: "express"
            },
            route: {
                id: 1,
                origin_station: {
                    id: 1,
                    name: origin || "Delhi",
                    city: "Delhi"
                },
                destination_station: {
                    id: 2,
                    name: destination || "Ahmedabad",
                    city: "Ahmedabad"
                },
                distance_km: 934
            },
            departure_time: "2023-06-15T23:00:00",
            arrival_time: "2023-06-16T18:15:00",
            base_price: 130,
            available_seats: 18,
            duration_in_minutes: 1155, // 19h 15m
            total_seats: 90,
            available_seats_by_class: {
                "First Class": 5,
                "Second Class": 13,
                "First Class Sleeper": 0,
                "Second Class Sleeper": 0,
                "Business": 0
            }
        }
    ];

    return Promise.resolve(mockTrips);
};

export const getMockTripAvailability = async (tripId, date) => {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        trip_id: tripId,
        available_dates: [
            {
                date: date,
                available: true,
                available_seats_by_class: {
                    "First Class": 12,
                    "Second Class": 48,
                    "Third Class": 120
                }
            },
            {
                date: new Date(new Date(date).getTime() + 86400000).toISOString().split('T')[0],
                available: true,
                available_seats_by_class: {
                    "First Class": 8,
                    "Second Class": 32,
                    "Third Class": 95
                }
            }
        ],
        prices_by_class: {
            "First Class": 120,
            "Second Class": 80,
            "Third Class": 40
        }
    };
};

export const getMockPassengerTypes = async () => {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
        {
            code: "adult",
            name: "Adult",
            discount_percent: 0,
            requires_document: true
        },
        {
            code: "child",
            name: "Child (2-12 years)",
            discount_percent: 50,
            requires_document: false
        },
        {
            code: "infant",
            name: "Infant (under 2 years)",
            discount_percent: 100,
            requires_document: false
        },
        {
            code: "senior",
            name: "Senior (65+ years)",
            discount_percent: 30,
            requires_document: true
        },
        {
            code: "student",
            name: "Student",
            discount_percent: 20,
            requires_document: true
        }
    ];
};

export const getMockUserOrders = async () => {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 700));

    return [
        {
            id: "ORD-12345",
            trip: {
                id: "1",
                train_name: "Express 101",
                train_number: "EX101",
                origin: "Moscow",
                destination: "Saint Petersburg",
                departure_time: "2023-06-15T08:30:00Z",
                arrival_time: "2023-06-15T12:45:00Z"
            },
            travel_date: "2023-06-15",
            wagon_class: "Second Class",
            passengers: [
                {
                    first_name: "John",
                    last_name: "Doe",
                    passenger_type: "adult"
                }
            ],
            total_price: 80,
            status: "confirmed",
            created_at: "2023-06-01T14:23:45Z"
        },
        {
            id: "ORD-67890",
            trip: {
                id: "3",
                train_name: "Night Train",
                train_number: "NT202",
                origin: "Moscow",
                destination: "Kazan",
                departure_time: "2023-07-20T22:15:00Z",
                arrival_time: "2023-07-21T08:30:00Z"
            },
            travel_date: "2023-07-20",
            wagon_class: "First Class",
            passengers: [
                {
                    first_name: "John",
                    last_name: "Doe",
                    passenger_type: "adult"
                },
                {
                    first_name: "Jane",
                    last_name: "Doe",
                    passenger_type: "adult"
                }
            ],
            total_price: 240,
            status: "confirmed",
            created_at: "2023-07-05T09:12:30Z"
        }
    ];
};

export const getMockOrder = async (orderId) => {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 600));

    if (orderId === "ORD-12345") {
        return {
            id: "ORD-12345",
            trip: {
                id: "1",
                train_name: "Express 101",
                train_number: "EX101",
                origin: "Moscow",
                destination: "Saint Petersburg",
                departure_time: "2023-06-15T08:30:00Z",
                arrival_time: "2023-06-15T12:45:00Z",
                duration: "4h 15m"
            },
            travel_date: "2023-06-15",
            wagon_class: "Second Class",
            passengers: [
                {
                    first_name: "John",
                    last_name: "Doe",
                    document: "AB123456",
                    passenger_type: "adult"
                }
            ],
            total_price: 80,
            status: "confirmed",
            created_at: "2023-06-01T14:23:45Z",
            tickets: [
                {
                    id: "TKT-123456",
                    passenger_name: "John Doe",
                    seat_number: "23A",
                    wagon_number: "5",
                    qr_code: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TKT-123456"
                }
            ]
        };
    } else if (orderId === "ORD-67890") {
        return {
            id: "ORD-67890",
            trip: {
                id: "3",
                train_name: "Night Train",
                train_number: "NT202",
                origin: "Moscow",
                destination: "Kazan",
                departure_time: "2023-07-20T22:15:00Z",
                arrival_time: "2023-07-21T08:30:00Z",
                duration: "10h 15m"
            },
            travel_date: "2023-07-20",
            wagon_class: "First Class",
            passengers: [
                {
                    first_name: "John",
                    last_name: "Doe",
                    document: "AB123456",
                    passenger_type: "adult"
                },
                {
                    first_name: "Jane",
                    last_name: "Doe",
                    document: "CD789012",
                    passenger_type: "adult"
                }
            ],
            total_price: 240,
            status: "confirmed",
            created_at: "2023-07-05T09:12:30Z",
            tickets: [
                {
                    id: "TKT-234567",
                    passenger_name: "John Doe",
                    seat_number: "12B",
                    wagon_number: "2",
                    qr_code: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TKT-234567"
                },
                {
                    id: "TKT-234568",
                    passenger_name: "Jane Doe",
                    seat_number: "12C",
                    wagon_number: "2",
                    qr_code: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TKT-234568"
                }
            ]
        };
    } else {
        throw new Error("Order not found");
    }
}; 