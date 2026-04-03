import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    FaCheck,
    FaTimes,
    FaHome,
    FaArrowRight,
    FaReceipt,
    FaMapMarkerAlt
} from "react-icons/fa";
import { getBookingApi } from "../api/client/api.js";
import Header from "../components/Utils/Header/Header.jsx";
import Footer from "../components/Hotel/Footer/Footer.jsx";
import dayjs from "dayjs";

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const bookingId = searchParams.get("bookingId");
    const status = searchParams.get("status");
    const code = searchParams.get("code");

    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState(null);
    const [error, setError] = useState(null);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchBookingType = async () => {
            if (!bookingId) {
                setLoading(false);
                return;
            }
            try {
                const res = await getBookingApi(bookingId);
                if (res.success) {
                    setBookingData(res.data);
                } else {
                    setError("Could not retrieve booking details.");
                }
            } catch (err) {
                console.error("Error fetching booking:", err);
                setError("System error while fetching booking.");
            } finally {
                setLoading(false);
            }
        };
        fetchBookingType();
    }, [bookingId]);

    // --- NAVIGATION LOGIC ---
    const getDetailRoute = () => {
        if (!bookingData) return "/";
        const type = bookingData.type?.toLowerCase();
        switch (type) {
            case 'bus': return `/order-bus/${bookingId}`;
            case 'tour': return `/order-tour/${bookingId}`;
            case 'cruise': return `/order-cruise/${bookingId}`;
            case 'hotel':
            case 'accommodation':
            default: return `/order/${bookingId}`;
        }
    };

    // --- ERROR MESSAGE MAPPING ---
    const getErrorMessage = (code) => {
        const messages = {
            "0": "Transaction successful.",
            "1": "Bank denied the transaction.",
            "3": "Card expired.",
            "4": "Insufficient funds.",
            "24": "Customer cancelled the transaction.",
            "99": "Unknown error from gateway."
        };
        return messages[code] || "Transaction failed. Please try again.";
    };

    // --- LOADING STATE ---
    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-[#165027]/20 border-t-[#165027] rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-[#165027]">BETEL</span>
                        </div>
                    </div>
                    <p className="mt-4 text-gray-500 font-medium tracking-wide animate-pulse">Verifying payment...</p>
                </div>
                <Footer />
            </div>
        );
    }

    // --- ERROR STATE ---
    if (!bookingId || error) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center px-4">
                    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-100">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaTimes className="text-2xl text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                        <p className="text-gray-500 mb-6">{error || "Invalid booking reference."}</p>
                        <button onClick={() => navigate("/")} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all">
                            Return to Home
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const isSuccess = status === "success";

    return (
        <div className="flex flex-col min-h-screen bg-[#F8F9FA] font-sans text-slate-900 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[#165027]/5 to-transparent pointer-events-none" />

            <Header />

            <main className="w-full flex-grow flex items-center justify-center p-4 pt-28 pb-20 relative z-10">
                <div className="w-full max-w-lg animate-fade-in-up">

                    {/* --- RECEIPT CARD --- */}
                    <div className="bg-white rounded-[24px] shadow-2xl shadow-gray-200/50 overflow-hidden relative">

                        {/* Decorative Top Line */}
                        <div className={`h-2 w-full ${isSuccess ? 'bg-[#165027]' : 'bg-red-500'}`} />

                        {/* Top Section: Status */}
                        <div className="px-8 pt-10 pb-8 text-center bg-white relative">
                            {/* Icon Wrapper */}
                            <div className="mb-5 relative inline-block">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-50' : 'bg-red-50'} relative z-10`}>
                                    {isSuccess ? (
                                        <FaCheck className="text-3xl text-[#165027]" />
                                    ) : (
                                        <FaTimes className="text-3xl text-red-500" />
                                    )}
                                </div>
                                {/* Ripple Effect (Decoration) */}
                                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full opacity-20 ${isSuccess ? 'bg-green-200' : 'bg-red-200'} animate-pulse`} />
                            </div>

                            <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                                {isSuccess ? "Payment Successful!" : "Payment Failed"}
                            </h1>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-[80%] mx-auto">
                                {isSuccess
                                    ? `Great! Your ${bookingData?.type || "service"} has been confirmed.`
                                    : getErrorMessage(code)
                                }
                            </p>
                        </div>

                        {/* Dashed Divider with Cutouts (Ticket Style) */}
                        <div className="relative flex items-center justify-between px-6">
                            <div className="w-6 h-6 bg-[#F8F9FA] rounded-full -ml-9" /> {/* Left Cutout */}
                            <div className="flex-1 h-px border-t-2 border-dashed border-gray-200" />
                            <div className="w-6 h-6 bg-[#F8F9FA] rounded-full -mr-9" /> {/* Right Cutout */}
                        </div>

                        {/* Bottom Section: Details */}
                        <div className="p-8 bg-white">
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-8 space-y-4">

                                {/* Order ID */}
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        <FaReceipt className="text-gray-300"/> Order ID
                                    </span>
                                    <span className="font-mono text-sm font-bold text-gray-800 tracking-wide">
                                        {bookingId}
                                    </span>
                                </div>

                                {/* Service Type & Name (If available) */}
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1 flex items-center gap-1">
                                        <FaMapMarkerAlt className="text-gray-300"/> Service
                                    </span>
                                    <div className="text-right">
                                        <span className="block text-sm font-bold text-gray-800 capitalize">
                                            {bookingData?.type}
                                        </span>
                                        {/* Optional: Show check-in date if avail */}
                                        {bookingData?.checkIn && (
                                            <span className="text-xs text-gray-500">
                                                {dayjs(bookingData.checkIn).format('DD MMM YYYY')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-200/50 my-2"></div>

                                {/* Total Amount */}
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Paid</span>
                                    <span className="text-xl font-bold text-[#D4A23A]">
                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(bookingData?.totalPriceVND || 0)}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => navigate(getDetailRoute())}
                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2
                                        ${isSuccess
                                        ? 'bg-[#165027] hover:bg-[#124220] shadow-[#165027]/20'
                                        : 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/20'
                                    }`}
                                >
                                    {isSuccess ? "View Ticket Details" : "Try Payment Again"} <FaArrowRight className="text-sm opacity-80" />
                                </button>

                                <button
                                    onClick={() => navigate("/")}
                                    className="w-full py-4 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FaHome className="text-gray-400" /> Back to Home
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Support Text */}
                    <p className="text-center text-gray-400 text-xs mt-6">
                        Need help? <a href="/contact" className="text-[#165027] underline hover:text-[#D4A23A]">Contact Us</a>
                    </p>

                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PaymentResultPage;
