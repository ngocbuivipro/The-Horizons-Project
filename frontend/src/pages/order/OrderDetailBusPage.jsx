import { useEffect, useState } from "react";
import Header from "../../components/Utils/Header/Header.jsx";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getBookingApi } from "../../api/client/api.js";
import Footer from "../../components/Hotel/Footer/Footer.jsx";
import {
    FaReceipt,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaTag,
    FaArrowLeft,
    FaBus,
    FaMapMarkerAlt,
    FaClock,
    FaChair,
    FaCheckCircle
} from "react-icons/fa";

const OrderDetailBusPage = () => {
    const { id } = useParams();
    const stateUser = useSelector((state) => state.UserReducer);
    const navigate = useNavigate();
    const [data, setData] = useState();

    // --- AUTHENTICATION & FETCH DATA ---
    const authenticate = async () => {
        if (!stateUser.isAuthenticated && stateUser.loading === "false") {
            toast.error("Access Denied");
            navigate("/");
        } else {
            const res = await getBookingApi(id);
            if (res.success) {
                // Kiểm tra quyền sở hữu booking
                if (
                    stateUser.loading === "false" &&
                    stateUser?.user?.email !== res.data.email
                ) {
                    toast.error("Access Denied");
                    navigate("/");
                } else {
                    setData(res.data);
                }
            } else {
                toast.error(res.message);
                navigate("/");
            }
        }
    };

    useEffect(() => {
        authenticate();
    }, [id]);

    // --- LOGIC: BACK TO BUS SEARCH ---
    const handleBackToBus = () => {
        // Nếu bạn có Redux cho Bus search thì dispatch action restore state ở đây
        // Ví dụ:
        // dispatch({ type: "RESET_BUS_SEARCH" });
        navigate("/bus");
    };

    // --- FORMATTERS ---
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-GB", {
            weekday: "short", day: "numeric", month: "short", year: "numeric"
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return "--:--";
        return new Date(dateString).toLocaleTimeString("en-GB", {
            hour: "2-digit", minute: "2-digit"
        });
    };

    const getStatusStyle = (status) => {
        const s = status?.toLowerCase();
        if (s === 'request') return 'bg-red-50 text-red-700 border border-red-200';
        if (s === 'pending') return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
        if (s === 'unpaid') return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    };

    // --- LOADING STATE ---
    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-lg font-semibold text-gray-600">Loading your ticket...</p>
                </div>
            </div>
        );
    }

    const busInfo = data.bus || {};

    // --- RENDER ---
    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
            <Header />

            <main className="flex-grow max-w-7xl mx-auto px-4 md:px-10 py-8 w-full pt-18 md:pt-25">

                {/* Page Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={handleBackToBus}
                            className="group flex items-center gap-2 text-gray-500 hover:text-orange-600 mb-3 transition-colors font-medium w-fit"
                        >
                            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                            Back to Bus Search
                        </button>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                            Bus Ticket Details
                        </h1>
                        <p className="text-gray-500">
                            View your trip schedule and ticket information.
                        </p>
                    </div>

                    <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide w-fit ${getStatusStyle(data.status)}`}>
                        {data.status}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Booking & Guest Info */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Booking Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-100 p-6 flex items-center gap-3">
                                <FaReceipt className="text-orange-500 text-xl" />
                                <h2 className="text-xl font-bold text-gray-900">Payment Summary</h2>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Booking ID</label>
                                        <p className="font-mono text-lg font-semibold text-gray-800">{data._id}</p>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Payment Method</label>
                                        <p className="font-medium text-gray-800 capitalize">{data.paymentMethod || "N/A"}</p>
                                    </div>

                                    {/* Price Box */}
                                    <div className="md:col-span-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-sm text-gray-500 font-bold">Price Breakdown</p>
                                                <p className="text-xs text-gray-400">
                                                    {data.guests} Ticket(s) x {formatCurrency(data.unitPrice || (data.originalPriceVND / data.guests))}
                                                </p>
                                            </div>
                                            {data.couponCode && (
                                                <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-bold border border-green-200">
                                                    <FaTag /> {data.couponCode}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1 items-end">
                                            {data.discountAmount > 0 && (
                                                <>
                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                        <span>Subtotal:</span>
                                                        <span className="line-through decoration-gray-400">
                                                            {formatCurrency(data.originalPriceVND)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-emerald-600 font-medium">
                                                        <span>Discount:</span>
                                                        <span>- {formatCurrency(data.discountAmount)}</span>
                                                    </div>
                                                    <div className="w-full h-[1px] bg-gray-200 my-1"></div>
                                                </>
                                            )}

                                            <div className="flex items-center justify-between w-full mt-1">
                                                <span className="text-gray-700 font-bold text-base">Total Paid:</span>
                                                <p className="text-2xl font-extrabold text-orange-600">
                                                    {formatCurrency(data.totalPriceVND)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Guest Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-100 p-6 flex items-center gap-3">
                                <FaUser className="text-blue-500 text-xl" />
                                <h2 className="text-xl font-bold text-gray-900">Passenger Contact</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <FaUser />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Name</p>
                                            <p className="font-medium text-gray-900">{data.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                            <FaEnvelope />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-medium text-gray-900 break-all">{data.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <FaPhone />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="font-medium text-gray-900">{data.phoneNumber}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <FaCheckCircle />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Seats Booked</p>
                                            <p className="font-medium text-gray-900">{data.guests} Seat(s)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Bus Route Summary */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden top-24">

                            {/* Header Image / Operator Info */}
                            <div className="relative h-48 w-full bg-gray-800 overflow-hidden">
                                {busInfo.photos && busInfo.photos.length > 0 ? (
                                    <img src={busInfo.photos[0]} alt="Bus" className="w-full h-full object-cover opacity-80" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                        <FaBus size={64} />
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                                    <h3 className="text-xl font-bold text-white leading-tight">
                                        {busInfo.operator}
                                    </h3>
                                    <p className="text-sm text-gray-300 mt-1">{busInfo.busType || "Standard Bus"}</p>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Date */}
                                <div className="mb-6 flex items-center gap-2 text-gray-700 bg-orange-50 p-3 rounded-lg border border-orange-100">
                                    <FaClock className="text-orange-500" />
                                    <span className="font-bold">
                                        {formatDate(data.checkIn)} {/* Hoặc data.departureDate */}
                                    </span>
                                </div>

                                {/* Route Visualization */}
                                <div className="relative pl-6 border-l-2 border-dashed border-gray-300 ml-3 space-y-8">
                                    {/* Departure */}
                                    <div className="relative">
                                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-4 border-indigo-600"></div>
                                        <div>
                                            <p className="text-xl font-bold text-gray-800">{formatTime(busInfo.departureTime)}</p>
                                            <p className="text-xs font-bold text-gray-400 uppercase mt-1">Departure</p>
                                            <p className="text-gray-900 font-medium mt-1">{busInfo.cityFrom}</p>
                                            <div className="text-sm text-gray-500 flex items-start gap-1 mt-1">
                                                <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-indigo-500" />
                                                <span>{busInfo.boardingPoints?.[0]?.name || "Bến xe trung tâm"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Arrival */}
                                    <div className="relative">
                                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-indigo-100"></div>
                                        <div>
                                            <p className="text-xl font-bold text-gray-800">{formatTime(busInfo.arrivalTime)}</p>
                                            <p className="text-xs font-bold text-gray-400 uppercase mt-1">Arrival</p>
                                            <p className="text-gray-900 font-medium mt-1">{busInfo.cityTo}</p>
                                            <div className="text-sm text-gray-500 flex items-start gap-1 mt-1">
                                                <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-red-500" />
                                                <span>{busInfo.droppingPoints?.[0]?.name || "Bến xe trung tâm"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Seat Info */}
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Seat Information</h4>
                                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <FaChair className="text-indigo-600 text-lg" />
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold">Total Seats</p>
                                                <p className="font-bold text-gray-800">{data.guests}</p>
                                            </div>
                                        </div>
                                        {/* Nếu backend trả về số ghế cụ thể */}
                                        {/* data.selectedSeatNumbers là mảng ví dụ ["A01", "A02"] */}
                                        {data.selectedSeatNumbers && data.selectedSeatNumbers.length > 0 && (
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 font-bold">Seat Numbers</p>
                                                <p className="font-bold text-indigo-600">
                                                    {data.selectedSeatNumbers.join(", ")}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Policies / Notes */}
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Policy</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Please arrive at the boarding point 30 minutes before departure.
                                        Max luggage weight: 20kg per passenger.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OrderDetailBusPage;