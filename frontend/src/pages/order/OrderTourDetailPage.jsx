import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {
    FaReceipt,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaTag,
    FaArrowLeft,
    FaMapMarkedAlt,
    FaClock,
    FaCheckCircle,
    FaFlag,
    FaInfoCircle,
    FaUsers
} from "react-icons/fa";
import { getBookingApi } from "../../api/client/api.js";
import Header from "../../components/Utils/Header/Header.jsx";
import Footer from "../../components/Hotel/Footer/Footer.jsx";

const OrderDetailTourPage = () => {
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
            try {
                const res = await getBookingApi(id);
                if (res.success) {
                    // Check ownership
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
            } catch (error) {
                console.error("Error fetching booking:", error);
                toast.error("Failed to load booking details.");
                navigate("/");
            }
        }
    };

    useEffect(() => {
        authenticate();
    }, [id, stateUser.isAuthenticated, stateUser.loading]); // Added dependencies

    // --- LOGIC: BACK TO TOUR SEARCH ---
    const handleBackToTours = () => {
        navigate("/tours");
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
        return dayjs(dateString).format("ddd, DD MMM YYYY");
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
                    <p className="text-lg font-semibold text-gray-600">Loading booking details...</p>
                </div>
            </div>
        );
    }

    // Safely access Tour object (in case it was populated by backend)
    const tourInfo = data.tour || {};
    // Calculate End Date based on CheckIn + Duration
    const endDate = tourInfo.durationDays
        ? dayjs(data.checkIn).add(tourInfo.durationDays, 'day').format("YYYY-MM-DD")
        : null;

    // --- RENDER ---
    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
            <Header />

            {/* Main Content: Adjusted padding for mobile/tablet/desktop */}
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 pt-20 md:pt-28">

                {/* Page Header: Flex column on mobile, row on desktop */}
                <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                        <button
                            onClick={handleBackToTours}
                            className="group flex items-center gap-2 text-gray-500 hover:text-orange-600 mb-3 transition-colors font-medium text-sm sm:text-base w-fit"
                        >
                            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                            Back to Tours
                        </button>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                            Tour Booking Details
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500">
                            View your itinerary and booking confirmation.
                        </p>
                    </div>

                    {/* Status Badge: Full width on mobile if needed, or inline */}
                    <div className={`mt-2 md:mt-0 px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide w-fit self-start md:self-center ${getStatusStyle(data.status)}`}>
                        {data.status}
                    </div>
                </div>

                {/* Main Grid Layout: 1 col on mobile, 12 cols on large screens */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                    {/* LEFT COLUMN: Booking & Guest Info (Spans 8 cols on desktop) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Booking Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-100 p-4 sm:p-6 flex items-center gap-3">
                                <FaReceipt className="text-orange-500 text-lg sm:text-xl" />
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Payment Summary</h2>
                            </div>

                            <div className="p-4 sm:p-6 space-y-6">
                                {/* Grid for details: 1 col mobile, 2 cols tablet+ */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Booking ID</label>
                                        <p className="font-mono text-base sm:text-lg font-semibold text-gray-800 break-all">{data._id}</p>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Payment Method</label>
                                        <p className="font-medium text-gray-800 capitalize">{data.paymentMethod === 'transfer' ? 'Bank Transfer' : 'Online Card Payment'}</p>
                                    </div>

                                    {/* Price Box */}
                                    <div className="sm:col-span-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-3">
                                            <div className="w-full sm:w-auto">
                                                <p className="text-sm text-gray-500 font-bold mb-1">Price Breakdown</p>

                                                {/* Adult Price Detail */}
                                                {data.adults > 0 && (
                                                    <p className="text-xs text-gray-600 flex justify-between gap-4">
                                                        <span>Adults ({data.adultPrice} pax):</span>
                                                        <span className="font-mono">{formatCurrency(data.adultPrice|| 0)}/pax</span>
                                                    </p>
                                                )}

                                                {/* Child Price Detail */}
                                                {data.children > 0 && (
                                                    <p className="text-xs text-gray-600 flex justify-between gap-4 mt-1">
                                                        <span>Children ({data.children} pax):</span>
                                                        <span className="font-mono">{formatCurrency(data.unitPriceChild || 0)}/pax</span>
                                                    </p>
                                                )}
                                            </div>

                                            {data.couponCode && (
                                                <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-bold border border-green-200 self-start">
                                                    <FaTag /> {data.couponCode}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1 mt-4 pt-3 border-t border-gray-200 border-dashed">
                                            {data.discountAmount > 0 && (
                                                <>
                                                    <div className="flex justify-between items-center text-sm text-gray-400">
                                                        <span>Subtotal:</span>
                                                        <span className="line-through decoration-gray-400">
                                                            {formatCurrency(data.originalPriceVND)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm text-emerald-600 font-medium">
                                                        <span>Discount:</span>
                                                        <span>- {formatCurrency(data.discountAmount)}</span>
                                                    </div>
                                                    <div className="w-full h-[1px] bg-gray-200 my-1"></div>
                                                </>
                                            )}

                                            <div className="flex items-center justify-between w-full mt-1">
                                                <span className="text-gray-700 font-bold text-base">Total Paid:</span>
                                                <p className="text-xl sm:text-2xl font-extrabold text-orange-600">
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
                            <div className="border-b border-gray-100 p-4 sm:p-6 flex items-center gap-3">
                                <FaUser className="text-blue-500 text-lg sm:text-xl" />
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Passenger Contact</h2>
                            </div>
                            <div className="p-4 sm:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                            <FaUser />
                                        </div>
                                        <div className="min-w-0"> {/* Allow truncation */}
                                            <p className="text-xs text-gray-500">Contact Name</p>
                                            <p className="font-medium text-gray-900 truncate">{data.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                                            <FaEnvelope />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-medium text-gray-900 truncate">{data.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                            <FaPhone />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="font-medium text-gray-900">{data.phoneNumber}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                                            <FaUsers />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Participants</p>
                                            <p className="font-medium text-gray-900">
                                                {data.adults} Adult(s) {data.children > 0 ? `, ${data.children} Child(ren)` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Additional info if guest name is different */}
                                    {data.isGuest === false && data.nameGuest && (
                                        <div className="col-span-1 md:col-span-2 flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg transition mt-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs shrink-0">
                                                <FaInfoCircle />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-500">Lead Passenger</p>
                                                <p className="font-medium text-gray-900 truncate">{data.nameGuest}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Request Note */}
                        {data.request && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Special Request</h3>
                                <p className="text-gray-700 italic text-sm sm:text-base">"{data.request}"</p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Tour Info Summary (Spans 4 cols on desktop) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden lg:sticky lg:top-24">

                            {/* Header Image */}
                            <div className="relative h-40 sm:h-48 w-full bg-gray-800 overflow-hidden">
                                {tourInfo.images && tourInfo.images.length > 0 ? (
                                    <img src={tourInfo.images[0]} alt="Tour" className="w-full h-full object-cover opacity-90" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                        <FaMapMarkedAlt size={64} />
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-5">
                                    <div className="flex gap-1 text-orange-400 text-xs font-bold uppercase mb-1 items-center">
                                        <FaFlag /> {tourInfo.destination || "Tour Destination"}
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-white leading-tight line-clamp-2">
                                        {tourInfo.title || "Tour Title"}
                                    </h3>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6">
                                {/* Duration Badge */}
                                <div className="mb-6 flex items-center gap-2 text-gray-700 bg-orange-50 p-3 rounded-lg border border-orange-100">
                                    <FaClock className="text-orange-500 shrink-0" />
                                    <span className="font-bold text-sm sm:text-base">
                                        {tourInfo.duration || "N/A"}
                                    </span>
                                </div>

                                {/* Timeline Visualization */}
                                <div className="relative pl-6 border-l-2 border-dashed border-gray-300 ml-3 space-y-8">
                                    {/* Start Date */}
                                    <div className="relative">
                                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-4 border-indigo-600"></div>
                                        <div>
                                            <p className="text-base sm:text-lg font-bold text-gray-800">{formatDate(data.checkIn)}</p>
                                            <p className="text-xs font-bold text-gray-400 uppercase mt-1">Start Date</p>
                                            <p className="text-gray-900 font-medium mt-1 text-sm">{tourInfo.startTime || "08:00 AM"}</p>
                                        </div>
                                    </div>

                                    {/* End Date */}
                                    <div className="relative">
                                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-indigo-100"></div>
                                        <div>
                                            <p className="text-base sm:text-lg font-bold text-gray-800">
                                                {endDate ? formatDate(endDate) : "Flexible Return"}
                                            </p>
                                            <p className="text-xs font-bold text-gray-400 uppercase mt-1">End Date</p>
                                            <p className="text-gray-500 text-xs mt-1">
                                                (Based on {tourInfo.durationDays || 0} days duration)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Check status info */}
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Booking Status</h4>
                                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                                        <FaCheckCircle className={`text-xl shrink-0 ${data.status === 'Paid' ? 'text-emerald-500' : 'text-yellow-500'}`} />
                                        <div>
                                            <p className="font-bold text-gray-800 capitalize text-sm sm:text-base">{data.status}</p>
                                            <p className="text-xs text-gray-500">
                                                {data.status === 'Paid'
                                                    ? "Your Tour is fully confirmed."
                                                    : "Please complete payment."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Policies / Notes */}
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Tour Policy</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Free cancellation up to 72 hours before departure.
                                        Please be present at the meeting point 15 minutes early.
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

export default OrderDetailTourPage;