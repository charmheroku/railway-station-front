import { createBrowserRouter } from "react-router-dom";
import Root from "./components/Root";
import Home from "./routes/Home";
import NotFound from "./routes/NotFound";
import TripDetail from "./routes/TripDetail";
import SearchResults from "./routes/SearchResults";
import BookingForm from "./routes/BookingForm";
import MyBookings from "./routes/MyBookings";
import BookingDetails from "./routes/BookingDetails";
import Login from "./routes/Login";
import Register from "./routes/Register";
import ProtectedPage from "./components/ProtectedPage";
import AdminProtectedPage from "./components/AdminProtectedPage";
import AdminLogin from "./routes/AdminLogin";
import AdminDashboard from "./routes/AdminDashboard";
import AdminStations from "./routes/AdminStations";
import AdminTrains from "./routes/AdminTrains";
import AdminWagonTypes from "./routes/AdminWagonTypes";
import AdminRoutes from "./routes/AdminRoutes";
import AdminWagonAmenities from "./routes/AdminWagonAmenities";
import AdminPassengerTypes from "./routes/AdminPassengerTypes";
import AdminWagons from "./routes/AdminWagons";
import AdminTrips from "./routes/AdminTrips";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <NotFound />,
        children: [
            {
                path: "",
                element: <Home />,
            },
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "register",
                element: <Register />,
            },
            {
                path: "search",
                element: <SearchResults />,
            },
            {
                path: "trips/:tripId",
                element: <TripDetail />,
            },
            {
                path: "trips/:tripId/booking",
                element: (
                    <ProtectedPage>
                        <BookingForm />
                    </ProtectedPage>
                ),
            },
            {
                path: "bookings",
                element: (
                    <ProtectedPage>
                        <MyBookings />
                    </ProtectedPage>
                ),
            },
            {
                path: "bookings/:orderId",
                element: (
                    <ProtectedPage>
                        <BookingDetails />
                    </ProtectedPage>
                ),
            },
            {
                path: "admin/login",
                element: <AdminLogin />,
            },
            {
                path: "admin/dashboard",
                element: (
                    <AdminProtectedPage>
                        <AdminDashboard />
                    </AdminProtectedPage>
                ),
            },
            {
                path: "admin/stations",
                element: (
                    <AdminProtectedPage>
                        <AdminStations />
                    </AdminProtectedPage>
                ),
            },
            {
                path: "admin/trains",
                element: (
                    <AdminProtectedPage>
                        <AdminTrains />
                    </AdminProtectedPage>
                ),
            },
            {
                path: "admin/wagon-types",
                element: (
                    <AdminProtectedPage>
                        <AdminWagonTypes />
                    </AdminProtectedPage>
                ),
            },
            {
                path: "admin/routes",
                element: (
                    <AdminProtectedPage>
                        <AdminRoutes />
                    </AdminProtectedPage>
                ),
            },
            {
                path: "admin/wagon-amenities",
                element: (
                    <AdminProtectedPage>
                        <AdminWagonAmenities />
                    </AdminProtectedPage>
                ),
            },
            {
                path: "admin/passenger-types",
                element: (
                    <AdminProtectedPage>
                        <AdminPassengerTypes />
                    </AdminProtectedPage>
                ),
            },
            {
                path: "admin/wagons",
                element: (
                    <AdminProtectedPage>
                        <AdminWagons />
                    </AdminProtectedPage>
                ),
            },
            {
                path: "admin/trips",
                element: (
                    <AdminProtectedPage>
                        <AdminTrips />
                    </AdminProtectedPage>
                ),
            },
        ],
    },
]);

export default router; 