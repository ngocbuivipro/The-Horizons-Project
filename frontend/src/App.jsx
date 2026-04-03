import { useEffect } from 'react';
import { Route, Routes, useLocation } from "react-router-dom"; // 1. Thêm useLocation
import { Toaster } from 'react-hot-toast';

import './App.css'

import { loadAdminAction } from './redux/actions/AdminAction.js';
import { getAllRoomsAction } from './redux/actions/RoomAction.js';
import { loadUserAction } from './redux/actions/UserAction.js';

import PublicLayout from "./layouts/PublicLayout.jsx";
import PrivateRouteAdmin from './components/Admin/PrivateRouteAdmin/PrivateRouteAdmin.jsx';
import PageNotFound from './components/Utils/PageNotFound/PageNotFound.jsx';

import LoginUserPage from './pages/auth/LoginUserPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import UserProfilePage from './pages/auth/UserProfilePage.jsx';


import HomePage from './pages/services/homepage/HomePage';
import AboutUsPage from './pages/services/aboutPage/AboutUsPage.jsx';
import HotelDetailPage from './pages/services/hotel/HotelDetailPage/HotelDetailPage.jsx';
import HotelListPage from './pages/services/hotel/HotelListPage/HotelListPage.jsx';
import PackageTourPage from './pages/services/tour/PackageTourPage.jsx';
import TourListPage from "./pages/services/tour/TourListPage.jsx";
import TourDetailPage from "./pages/services/tour/TourDetailPage.jsx";
import BusPage from './pages/services/bus/BusPage.jsx';

import BookingAccommodationPage from './pages/booking/BookingAccommodationPage.jsx';
import BookingTourPage from "./pages/booking/BookingTourPage.jsx";
import BookingBusPage from "./pages/booking/BookingBusPage.jsx";
import OrderDetailAccommodationPage from './pages/order/OrderDetailAccommodationPage.jsx';

import LoginAdminPage from './pages/LoginAdminPage/LoginAdminPage.jsx';
import AdminCreatePage from './pages/admin/hotel/AdminCreatePage/AdminCreatePage.jsx';
import DashboardPage from './pages/admin/DashboardPage/DashboardPage.jsx';
import AdminCreateHotelPage from './pages/admin/hotel/AdminCreateHotelPage/AdminCreateHotelPage.jsx';
import AdminViewHotelPage from './pages/admin/hotel/AdminViewHotelPage/AdminViewHotelPage.jsx';
import AdminViewEditHotelPage from './pages/admin/hotel/AdminViewEditHotelPage/AdminViewEditHotelPage.jsx';
import AdminCreateRoomPage from './pages/admin/hotel/AdminCreateRoomPage/AdminCreateRoomPage.jsx';
import AdminViewRoomPage from './pages/admin/hotel/AdminViewRoomPage/AdminViewRoomPage.jsx';
import AdminViewRoomDetailPage from './pages/admin/hotel/AdminViewRoomDetailPage/AdminViewRoomDetailPage.jsx';
import AdminEditRoomPage from './pages/admin/hotel/AdminEditRoomPage/AdminEditRoomPage.jsx';
import AdminViewOrdersPage from './pages/admin/AdminViewOrdersPage/AdminViewOrdersPage.jsx';
import AdminSettingPage from "./pages/admin/AdminSettingPage/AdminSettingPage.jsx";
import AdminUserSettingPage from "./pages/admin/AdminUserSettingPage/AdminUserSettingPage.jsx";
import AdminSystemSettingPage from "./pages/admin/AdminSettingPage/AdminSystemSettingPage.jsx";
import AdminCouponPage from "./pages/admin/AdminSettingPage/AdminCouponPage.jsx";
import AdminAboutPage from './pages/admin/AdminAboutPage/AdminAboutPage.jsx';

import AdminViewTourPage from "./pages/admin/tour/AdminViewTourPage.jsx";
import AdminCreateTourPage from "./pages/admin/tour/AdminCreateTourPage.jsx";
import AdminUpdateTourPage from "./pages/admin/tour/AdminUpdateTourPage.jsx";

import AdminViewBusPage from "./pages/admin/bus/AdminViewBusPage.jsx";
import AdminCreateBusPage from "./pages/admin/bus/AdminCreateBusPage.jsx";
import AdminUpdateBusPage from "./pages/admin/bus/AdminUpdateBusPage.jsx";
import { useDispatch } from "react-redux";
import OrderDetailBusPage from "./pages/order/OrderDetailBusPage.jsx";
import CruiseListPage from "./pages/services/cruise/CruiseListPage.jsx";
import AdminViewCruisePage from "./pages/admin/cruise/AdminViewCruisePage.jsx";
import AdminCreateCruisePage from "./pages/admin/cruise/AdminCreateCruisePage.jsx";
import AdminUpdateCruisePage from "./pages/admin/cruise/AdminUpdateCruisePage.jsx";
import CruiseDetailPage from "./pages/services/cruise/CruiseDetailPage.jsx";
import OrderDetailCruisePage from "./pages/order/OrderDetailCruisePage.jsx";
import BookingCruisePage from "./pages/booking/BookingCruisePage.jsx";
import FloatingWhatsApp from "./components/Utils/FloatingWhatsApp.jsx";
import ContactUsPage from "./pages/UtilPage/ContactUsPage.jsx";
import OrderDetailTourPage from "./pages/order/OrderTourDetailPage.jsx";
import { fetchSystemStatus } from "./redux/actions/SystemAction.js";
import PaymentResultPage from "./pages/PaymentResultPage.jsx";
import CarTransferPage from "./pages/car/CarTransferPage.jsx";
import CarSelectionPage from "./pages/car/CarSelectionPage.jsx";
import CarBookingPage from "./pages/car/CarBookingPage.jsx";
import AdminUpdateCarTransferPage from "./pages/admin/car/AdminUpdateCarTransferPage.jsx";
import AdminViewCarTransferPage from "./pages/admin/car/AdminViewCarTransferPage.jsx";
import AdminCreateCarTransferPage from "./pages/admin/car/AdminCreateCarTransferPage.jsx";
import AdminCreateRouteTransferPage from "./pages/admin/car/AdminCreateRouteTransferPage.jsx";
import AdminUpdateRouteTransferPage from "./pages/admin/car/AdminUpdateRouteTransferPage.jsx";

function App() {

    const dispatch = useDispatch();
    const location = useLocation(); // 3. Hook lấy đường dẫn hiện tại

    useEffect(() => {
        const fetchApi = async () => {
            await dispatch(loadAdminAction())
            dispatch(getAllRoomsAction())
            dispatch(fetchSystemStatus());
            dispatch(loadUserAction()); // Khôi phục session user khi refresh trang
        }
        fetchApi()
    }, [dispatch])

    // 4. Logic kiểm tra: Nếu là trang Admin hoặc dashboard thì KHÔNG hiện nút WhatsApp
    const isAdminRoute = location.pathname.startsWith('/dashboard')
        || location.pathname.startsWith('/Admin')
        || location.pathname === '/login-Admin';

    return (
        <>
            <Toaster />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
                <Route path="/about" element={<PublicLayout><AboutUsPage /></PublicLayout>} />
                <Route path="/contact" element={<PublicLayout><ContactUsPage /></PublicLayout>} />

                {/* Accommodation */}
                <Route path="/homes" element={<PublicLayout><HotelListPage /></PublicLayout>} />
                <Route path="/homes/:slug" element={<PublicLayout><HotelDetailPage /></PublicLayout>} />

                {/* Tour */}
                <Route path="/tours" element={<PublicLayout><TourListPage /></PublicLayout>} />
                <Route path="/tours/:slug" element={<PublicLayout><TourDetailPage /></PublicLayout>} />
                <Route path="/package-tour/:slug" element={<PublicLayout><PackageTourPage /></PublicLayout>} />

                {/* Bus  */}
                <Route path="/bus" element={<PublicLayout><BusPage /></PublicLayout>} />

                {/*Car */}
                <Route path="/transfers" element={<PublicLayout><CarTransferPage /></PublicLayout>} />
                <Route path="/transfers/select" element={<PublicLayout><CarSelectionPage /></PublicLayout>} />

                {/*Cruises*/}
                <Route path={"/cruises"} element={<PublicLayout><CruiseListPage /></PublicLayout>} />
                <Route path={"/cruises/:slug"} element={<PublicLayout><CruiseDetailPage /></PublicLayout>} />

                {/* User Auth */}
                <Route path="/login" element={<LoginUserPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<UserProfilePage />} />

                {/* Booking & Payment */}
                <Route path="/booking" element={<PublicLayout><BookingAccommodationPage /></PublicLayout>} />
                <Route path="/booking/tour" element={<PublicLayout><BookingTourPage /></PublicLayout>} />
                <Route path="/booking/bus" element={<PublicLayout><BookingBusPage /></PublicLayout>} />
                <Route path="/booking/cruise" element={<PublicLayout><BookingCruisePage /></PublicLayout>} />
                <Route path="/booking/transfers" element={<PublicLayout><CarBookingPage /></PublicLayout>} />

                <Route path="/payment/result" element={<PublicLayout><PaymentResultPage /></PublicLayout>} />

                {/* Orders */}
                <Route path="/order/:id" element={<PublicLayout><OrderDetailAccommodationPage /></PublicLayout>} />
                <Route path="/order-bus/:id" element={<PublicLayout><OrderDetailBusPage /></PublicLayout>} />
                <Route path="/order-tour/:id" element={<PublicLayout><OrderDetailTourPage /></PublicLayout>} />
                <Route path="/order-cruise/:id" element={<PublicLayout><OrderDetailCruisePage /></PublicLayout>} />

                {/* Admin Auth */}
                <Route path="/admin-create" element={<AdminCreatePage />} />
                <Route path="/login-admin" element={<LoginAdminPage />} />

                {/* Admin Dashboard */}
                <Route
                    path="/dashboard"
                    element={<PrivateRouteAdmin><DashboardPage /></PrivateRouteAdmin>}
                />

                {/* Admin Hotel & Room */}
                <Route
                    path="/dashboard-create-home"
                    element={<PrivateRouteAdmin><AdminCreateHotelPage /></PrivateRouteAdmin>}
                />
                <Route
                    path="/dashboard-view-homes"
                    element={<PrivateRouteAdmin><AdminViewHotelPage /></PrivateRouteAdmin>}
                />
                <Route
                    path="/dashboard-hotel/:slug"
                    element={<PrivateRouteAdmin><AdminViewEditHotelPage /></PrivateRouteAdmin>}
                />

                <Route
                    path="/dashboard-create-room"
                    element={<PrivateRouteAdmin><AdminCreateRoomPage /></PrivateRouteAdmin>}
                />
                <Route
                    path="/dashboard-view-room"
                    element={<PrivateRouteAdmin><AdminViewRoomPage /></PrivateRouteAdmin>}
                />
                <Route
                    path="/dashboard-view-roomDetail/:slug"
                    element={<PrivateRouteAdmin><AdminViewRoomDetailPage /></PrivateRouteAdmin>}
                />
                <Route
                    path="/dashboard-edit-roomDetail/:slug"
                    element={<PrivateRouteAdmin><AdminEditRoomPage /></PrivateRouteAdmin>}
                />

                {/* Admin Tour */}
                <Route
                    path="/dashboard-view-tours"
                    element={<PrivateRouteAdmin><AdminViewTourPage /></PrivateRouteAdmin>}
                />
                <Route
                    path="/dashboard-create-tour"
                    element={<PrivateRouteAdmin><AdminCreateTourPage /></PrivateRouteAdmin>}
                />
                <Route
                    path="/dashboard-tour/:slug"
                    element={<PrivateRouteAdmin><AdminUpdateTourPage /></PrivateRouteAdmin>}
                />

                {/* Admin Bus */}
                <Route
                    path="/dashboard-view-bus"
                    element={<PrivateRouteAdmin><AdminViewBusPage /></PrivateRouteAdmin>}
                />
                <Route
                    path="/dashboard-add-bus"
                    element={<PrivateRouteAdmin><AdminCreateBusPage /></PrivateRouteAdmin>}
                />
                <Route
                    path="/dashboard-update-bus/:id"
                    element={<PrivateRouteAdmin><AdminUpdateBusPage /></PrivateRouteAdmin>}
                />

                {/*Admin Create cruise*/}
                <Route
                    path="/dashboard-view-cruise"
                    element={<PrivateRouteAdmin><AdminViewCruisePage /></PrivateRouteAdmin>}
                />
                <Route
                    path="/dashboard-add-cruise"
                    element={<PrivateRouteAdmin><AdminCreateCruisePage /></PrivateRouteAdmin>}
                />
                <Route
                    path="/dashboard-update-cruise/:slug"
                    element={<PrivateRouteAdmin><AdminUpdateCruisePage /></PrivateRouteAdmin>}
                />

                <Route
                    path="/dashboard-update-car/:slug"
                    element={<PrivateRouteAdmin><AdminUpdateCarTransferPage /></PrivateRouteAdmin>}
                />

                <Route
                    path="/dashboard-view-car"
                    element={<PrivateRouteAdmin><AdminViewCarTransferPage /></PrivateRouteAdmin>}
                />

                <Route
                    path="/dashboard-create-car-transfer"
                    element={<PrivateRouteAdmin><AdminCreateCarTransferPage /></PrivateRouteAdmin>}
                />

                <Route
                    path="/dashboard-create-route-transfer"
                    element={<PrivateRouteAdmin><AdminCreateRouteTransferPage /></PrivateRouteAdmin>}
                />
                <Route
                    path="/dashboard-update-route-transfer/:id"
                    element={<PrivateRouteAdmin><AdminUpdateRouteTransferPage /></PrivateRouteAdmin>}
                />

                {/* Admin Orders & Settings */}
                <Route
                    path="/dashboard-view-orders/"
                    element={<PrivateRouteAdmin><AdminViewOrdersPage /></PrivateRouteAdmin>}
                />
                <Route
                    path="/dashboard-settings-rate/"
                    element={<PrivateRouteAdmin><AdminSettingPage /></PrivateRouteAdmin>}
                />
                <Route
                    path="/dashboard-settings-user/"
                    element={<PrivateRouteAdmin><AdminUserSettingPage /></PrivateRouteAdmin>}
                />
                <Route
                    path="/dashboard-settings-system"
                    element={<PrivateRouteAdmin><AdminSystemSettingPage /></PrivateRouteAdmin>}
                />
                <Route
                    path="/dashboard-settings-coupon"
                    element={<PrivateRouteAdmin><AdminCouponPage /></PrivateRouteAdmin>}
                />
                <Route
                    path="/dashboard-about"
                    element={<PrivateRouteAdmin><AdminAboutPage /></PrivateRouteAdmin>}
                />

                <Route path="*" element={<PublicLayout><PageNotFound /></PublicLayout>} />
            </Routes>

            {/* 5. Hiển thị nút WhatsApp nếu KHÔNG phải trang Admin */}
            {!isAdminRoute && <FloatingWhatsApp />}
        </>
    )
}

export default App