import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { createBookingApi, calculateBookingBusPriceApi, createOnePayPayment, getSystemStatusApi } from "../../api/client/api";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { isValidPhoneNumber } from 'react-phone-number-input';
import dayjs from "dayjs";

import AntdPhoneInput from "./AntdPhoneInput";
import {
    FaInfoCircle, FaClock, FaMapMarkerAlt, FaCalendarAlt, FaCreditCard,
    FaUser, FaBus, FaSpinner, FaExclamationTriangle,
    FaTag, FaArrowRight, FaCheckCircle
} from "react-icons/fa";
import BookingRequest from "./BookingRequest.jsx";

const BookingBus = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // --- REDUX STATE ---
    const stateUser = useSelector((state) => state.UserReducer);
    const systemStore = useSelector(state => state.SystemReducer) || {};

    const allowCredit = systemStore.credit ?? true;
    const allowTransfer = systemStore.transfer ?? true;

    // --- LOCAL STATE ---
    const [data] = useState(location.state || null);

    // Form States
    const [request, setRequest] = useState("");
    const [isGuest, setIsGuest] = useState(true);
    const [name, setName] = useState(stateUser?.user?.username || "");
    const [email, setEmail] = useState(stateUser?.user?.email || "");
    const [phoneNumber, setPhoneNumber] = useState(stateUser?.user?.phoneNumber || "");
    const [nameGuest, setNameGuest] = useState("");
    const [couponCode, setCouponCode] = useState("");

    // Payment States
    const [paymentMethod, setPaymentMethod] = useState("");

    // UI States
    const [disableButton, setDisableButton] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isSystemLoading, setIsSystemLoading] = useState(true);

    // Initial Pricing
    const initUnitPrice = data?.bus?.currentPrice || data?.bus?.price || 0;
    const initSeats = data?.seats || 1;
    const initTotal = initUnitPrice * initSeats;

    const [priceData, setPriceData] = useState({
        originalPrice: initTotal,
        finalPrice: initTotal,
        discountAmount: 0,
        unitPrice: initUnitPrice,
        seats: initSeats,
        couponMessage: "",
        note: ""
    });

    // --- 1. SYSTEM STATUS & SECURITY ---
    useEffect(() => {
        const fetchSystemConfig = async () => {
            try {
                const res = await getSystemStatusApi();
                if (res && res.success) {
                    dispatch({ type: "SET_SYSTEM_STATUS", payload: res });
                }
            } catch (error) {
                console.error("Failed to fetch system status", error);
            } finally {
                setIsSystemLoading(false);
            }
        };
        fetchSystemConfig();
    }, [dispatch]);

    useEffect(() => {
        if (!data || !data.bus) {
            toast.error("Invalid session. Please select a bus trip.");
            navigate("/bus", { replace: true });
        }
    }, [data, navigate]);

    // --- 2. DATA SYNC & AUTO-SWITCH ---
    useEffect(() => {
        if (stateUser?.user) {
            setName(prev => prev || stateUser.user.username || "");
            setEmail(prev => prev || stateUser.user.email || "");
            setPhoneNumber(prev => prev || stateUser.user.phoneNumber || "");
        }
    }, [stateUser]);

    useEffect(() => {
        if (isSystemLoading) return;
        if (paymentMethod === 'card' && !allowCredit) setPaymentMethod(allowTransfer ? 'transfer' : '');
        else if (paymentMethod === 'transfer' && !allowTransfer) setPaymentMethod(allowCredit ? 'card' : '');
        else if (!paymentMethod) {
            if (allowCredit) setPaymentMethod('card');
            else if (allowTransfer) setPaymentMethod('transfer');
        }
    }, [allowCredit, allowTransfer, paymentMethod, isSystemLoading]);

    // --- 3. PRICE CALCULATION ---
    const fetchCalculatedPrice = useCallback(async (currentData, currentCoupon = "") => {
        if (!currentData?.bus?._id || !paymentMethod) return;

        try {
            const payload = {
                busId: currentData.bus._id,
                date: dayjs(currentData.date).format("YYYY-MM-DD"),
                seats: currentData.seats || 1,
                couponCode: currentCoupon,
                paymentMethod: paymentMethod
            };
            const res = await calculateBookingBusPriceApi(payload);

            if (res && res.success) {
                const apiData = res.data;
                setPriceData({
                    originalPrice: apiData.originalPrice,
                    finalPrice: apiData.finalPrice,
                    discountAmount: apiData.discountAmount || 0,
                    unitPrice: apiData.unitPrice,
                    seats: apiData.seats,
                    couponMessage: apiData.couponMessage,
                    note: apiData.note
                });
            }
        } catch (error) {
            console.error("Calc Error:", error);
            if (currentCoupon) {
                toast.error("Invalid coupon code");
                // Reset calculation
                fetchCalculatedPrice(currentData, "");
                setCouponCode("");
            }
        }
    }, [paymentMethod]);

    useEffect(() => {
        if (data && paymentMethod) {
            fetchCalculatedPrice(data, couponCode);
        }
    }, [data, paymentMethod, fetchCalculatedPrice]);

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) return toast.error("Please enter a coupon code");
        if (!paymentMethod) return toast.error("Please select a payment method first");
        const toastId = toast.loading("Checking...");
        fetchCalculatedPrice(data, couponCode)
            .then(() => toast.success("Price updated!", { id: toastId }))
            .catch(() => toast.dismiss(toastId));
    };

    // --- 4. SUBMIT ---
    const handleSubmitBooking = async () => {
        if (!paymentMethod) return toast.error("Please select a payment method");
        if (paymentMethod === 'card' && !allowCredit) return toast.error("Credit card payment disabled");
        if (paymentMethod === 'transfer' && !allowTransfer) return toast.error("Transfer payment disabled");

        if (!name?.trim() || /\d/.test(name)) return toast.error("Invalid contact name");
        if (!email?.trim().includes("@")) return toast.error("Invalid email");
        if (!isValidPhoneNumber(phoneNumber)) return toast.error("Invalid phone number");
        if (!isGuest && (!nameGuest || /\d/.test(nameGuest))) return toast.error("Invalid passenger name");

        setDisableButton(true);
        const toastId = toast.loading('Processing booking...');

        try {
            const bookingPayload = {
                name, email, phoneNumber, isGuest,
                userId: stateUser?.user?._id || null,
                nameGuest: isGuest ? undefined : nameGuest,
                paymentMethod,
                request,
                couponCode: couponCode ? couponCode.toUpperCase() : "",
                bookingType: "BUS",
                bus: data?.bus?._id,
                departureDate: dayjs(data?.date).format("YYYY-MM-DD"),
                seats: data?.seats || 1,
                selectedSeatNumbers: data?.selectedSeatNumbers || []
            };

            const res = await createBookingApi(bookingPayload);
            if (res.success && res.data?._id) {
                const bookingId = res.data._id;
                if (paymentMethod === 'card') {
                    toast.loading("Redirecting to OnePay...", { id: toastId });
                    setIsRedirecting(true);
                    const paymentRes = await createOnePayPayment(bookingId, 'bus');
                    if (paymentRes.success && paymentRes.data?.paymentUrl) {
                        window.location.href = paymentRes.data.paymentUrl;
                    } else {
                        throw new Error(paymentRes.message || "Payment init failed");
                    }
                } else {
                    toast.success("Booking successful!", { id: toastId });
                    navigate(`/order-bus/${bookingId}`, { state: { justBooked: true } });
                }
            } else {
                throw new Error(res?.message || 'Booking failed');
            }
        } catch (err) {
            setDisableButton(false);
            setIsRedirecting(false);
            if (err.message === "Payment init failed" && paymentMethod === 'card') {
                navigate(`/order-bus/${err.bookingId || ""}`);
            }
            toast.error(err.message || 'System error', { id: toastId });
        }
    };

    if (!data) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><FaSpinner className="animate-spin text-orange-500 text-3xl" /></div>;

    const depTime = dayjs(data.bus?.departureTime);
    const arrTime = dayjs(data.bus?.arrivalTime);
    const isSystemDown = !allowCredit && !allowTransfer;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-12 bg-gray-50/50 min-h-screen font-sans">

            {/* Redirect Overlay */}
            {isRedirecting && (
                <div className="fixed inset-0 bg-white/90 z-[9999] flex flex-col items-center justify-center backdrop-blur-sm">
                    <FaSpinner className="animate-spin text-5xl text-orange-600 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Redirecting to OnePay...</h2>
                    <p className="text-gray-500 mt-2">Please do not close this window.</p>
                </div>
            )}

            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Confirm Bus Ticket</h1>
                <p className="text-gray-500 text-sm md:text-base">Secure your seat for a smooth journey.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                {/* LEFT COLUMN: Form & Price */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* 1. Contact Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 md:p-6 border-b border-gray-100">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaUser className="text-orange-500" size={18} /> Contact Information
                            </h2>
                        </div>
                        <div className="p-5 md:p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Full Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-medium" placeholder="e.g. John Doe" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Email Address</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-medium" placeholder="email@example.com" />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-bold text-gray-700">Phone Number</label>
                                    <AntdPhoneInput value={phoneNumber} onChange={setPhoneNumber} />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="inline-flex items-center cursor-pointer gap-2 select-none">
                                    <input type="checkbox" checked={!isGuest} onChange={(e) => setIsGuest(!e.target.checked)} className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 border-gray-300" />
                                    <span className="text-sm text-gray-700 font-medium">I am booking for someone else</span>
                                </label>
                            </div>

                            {!isGuest && (
                                <div className="space-y-1.5 bg-orange-50 p-4 rounded-xl border border-orange-100 animate-fadeIn">
                                    <label className="text-sm font-bold text-gray-800">Passenger Name</label>
                                    <input type="text" value={nameGuest} onChange={(e) => setNameGuest(e.target.value)} placeholder="Passenger's full name" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none font-medium" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Payment Method */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 md:p-6 border-b border-gray-100">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaCreditCard className="text-orange-500" size={18} /> Payment Method
                            </h2>
                        </div>
                        <div className="p-5 md:p-6">
                            {isSystemLoading ? (
                                <div className="p-8 flex flex-col items-center justify-center text-gray-400 gap-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <FaSpinner className="animate-spin text-2xl" />
                                    <span className="text-sm font-medium">Verifying payment options...</span>
                                </div>
                            ) : (
                                <>
                                    {isSystemDown && (
                                        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-3 mb-4">
                                            <FaExclamationTriangle className="mt-0.5 shrink-0" />
                                            <span className="text-sm font-medium">Online booking is temporarily unavailable.</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-3">
                                        {allowCredit && (
                                            <label className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500 shadow-sm' : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50/50'}`} onClick={() => setPaymentMethod('card')}>
                                                <input type="radio" checked={paymentMethod === 'card'} onChange={() => { }} className="w-5 h-5 text-orange-600 focus:ring-orange-500" />
                                                <div className="ml-4">
                                                    <span className="block font-bold text-gray-900">Credit Card / OnePay</span>
                                                    <span className="text-xs text-gray-500">Instant payment via Visa, MasterCard, ATM.</span>
                                                </div>
                                            </label>
                                        )}
                                        {allowTransfer && (
                                            <label className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'transfer' ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500 shadow-sm' : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50/50'}`} onClick={() => setPaymentMethod('transfer')}>
                                                <input type="radio" checked={paymentMethod === 'transfer'} onChange={() => { }} className="w-5 h-5 text-orange-600 focus:ring-orange-500" />
                                                <div className="ml-4">
                                                    <span className="block font-bold text-gray-900">Bank Transfer</span>
                                                    <span className="text-xs text-gray-500">Book now, transfer via banking app later.</span>
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 3. Price Breakdown */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 md:p-6 border-b border-gray-100">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaTag className="text-orange-500" size={18} /> Payment Details
                            </h2>
                        </div>
                        <div className="p-5 md:p-6">
                            {/* Breakdown List */}
                            <div className="space-y-3 pb-6 border-b border-gray-100 border-dashed text-sm md:text-base">
                                <div className="flex justify-between items-center text-gray-700">
                                    <span className="font-medium">Ticket Price (x{priceData.seats})</span>
                                    <span className="font-bold">{new Intl.NumberFormat("vi-VN").format(priceData.originalPrice)} ₫</span>
                                </div>
                                {priceData.discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-emerald-600">
                                        <span className="font-medium">Discount Applied</span>
                                        <span className="font-bold">- {new Intl.NumberFormat("vi-VN").format(priceData.discountAmount)} ₫</span>
                                    </div>
                                )}
                            </div>

                            {/* Coupon Input - Responsive */}
                            <div className="py-6">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-wider">Discount Code</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="E.g. BUS2025"
                                        disabled={isSystemDown}
                                        className="w-full sm:flex-1 border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 uppercase font-bold text-sm disabled:bg-gray-100"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={isSystemDown}
                                        className="w-full sm:w-auto bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {priceData.couponMessage && (
                                    <div className="mt-3 flex items-center gap-1.5 text-emerald-600 text-xs font-bold animate-fadeIn">
                                        <FaCheckCircle className="shrink-0" />
                                        <span>{priceData.couponMessage}</span>
                                    </div>
                                )}
                            </div>

                            {/* Total & Action */}
                            <div className="pt-2">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-base md:text-lg font-bold text-gray-900">Total Payment</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Includes all fees</p>
                                    </div>
                                    <p className="text-2xl md:text-3xl font-extrabold text-orange-600 tracking-tight">
                                        {new Intl.NumberFormat("vi-VN").format(priceData.finalPrice)} ₫
                                    </p>
                                </div>

                                <button
                                    disabled={disableButton || isSystemDown}
                                    onClick={handleSubmitBooking}
                                    className={`w-full mt-6 py-4 rounded-xl font-bold text-lg text-white shadow-lg shadow-orange-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${(disableButton || isSystemDown) ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-orange-600 hover:bg-orange-700'}`}
                                >
                                    {disableButton ? (
                                        <><FaSpinner className="animate-spin" /> Processing...</>
                                    ) : (
                                        <>{paymentMethod === 'card' ? "Pay Now" : "Confirm Booking"} <FaArrowRight size={16} /></>
                                    )}
                                </button>

                                <div className="mt-4 flex items-center justify-center text-emerald-600 text-xs md:text-sm font-bold gap-1.5">
                                    <FaClock /> Instant ticket issuance
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Requests */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Trip Requests</h2>
                        <BookingRequest request={request} setRequest={setRequest} placeholder="Notes for driver (pickup details, luggage...)" />
                    </div>
                </div>

                {/* RIGHT COLUMN: Bus Info Sticky */}
                <div className="lg:col-span-4 flex flex-col gap-6 top-24 self-start order-first lg:order-last">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header Image */}
                        <div className="relative h-48 w-full bg-gray-100 overflow-hidden group">
                            {data.bus?.photos && data.bus.photos.length > 0 ? (
                                <img src={data.bus.photos[0]} alt="Bus" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-slate-100"><FaBus size={50} /></div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">{data.bus?.busType}</span>
                                </div>
                                <h3 className="text-xl font-bold leading-tight">{data.bus?.operator}</h3>
                            </div>
                        </div>

                        <div className="p-5 md:p-6">
                            {/* Route Summary */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    <FaMapMarkerAlt className="text-orange-500" /> Route Info
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-lg font-bold text-gray-900">{data.bus?.cityFrom}</h3>
                                    <span className="text-gray-300">➝</span>
                                    <h3 className="text-lg font-bold text-gray-900">{data.bus?.cityTo}</h3>
                                </div>
                                <p className="text-sm text-gray-500 mt-1 font-medium flex items-center gap-1.5">
                                    <FaCalendarAlt /> {dayjs(data.date).format("dddd, DD MMM YYYY")}
                                </p>
                            </div>

                            {/* Timeline Visual */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-6 relative">
                                {/* Vertical Dotted Line */}
                                <div className="absolute left-[29px] top-8 bottom-8 w-[2px] border-l-2 border-dashed border-gray-300"></div>

                                {/* Departure */}
                                <div className="relative pl-8 mb-8">
                                    <div className="absolute left-[21px] top-1.5 w-4 h-4  bg-white border-4 border-indigo-500 rounded-full z-10 shadow-sm"></div>
                                    <div className="ml-3">
                                        <p className="font-bold text-gray-900 text-lg leading-none">{depTime.format("HH:mm")}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 mb-0.5">Departure</p>
                                        <p className="text-sm font-medium text-gray-700 truncate">{data.bus?.cityFrom}</p>
                                        <p className="text-xs text-gray-400 truncate w-full" title={data.bus?.boardingPoints?.[0]?.name}>{data.bus?.boardingPoints?.[0]?.name || "Main Station"}</p>
                                    </div>
                                </div>

                                {/* Arrival */}
                                <div className="relative pl-8">
                                    <div className="absolute left-[21px] top-1.5 w-4 h-4 bg-indigo-500 rounded-full z-10 border-4 border-indigo-100 shadow-sm"></div>
                                    <div className="ml-3">
                                        <p className="font-bold text-gray-900 text-lg leading-none">{arrTime.format("HH:mm")}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 mb-0.5">Arrival</p>
                                        <p className="text-sm font-medium text-gray-700 truncate">{data.bus?.cityTo}</p>
                                        <p className="text-xs text-gray-400 truncate w-full" title={data.bus?.droppingPoints?.[0]?.name}>{data.bus?.droppingPoints?.[0]?.name || "City Center"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Seat Info */}
                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 font-bold uppercase">Seats</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 text-lg">{priceData.seats}</p>
                                        {data?.selectedSeatNumbers && data.selectedSeatNumbers.length > 0 && (
                                            <p className="text-xs text-indigo-600 font-bold mt-0.5 max-w-[150px] break-words text-right">
                                                {data.selectedSeatNumbers.join(", ")}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Policies */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Bus Policies</h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0 text-sm" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-700">Luggage Policy</p>
                                            <p className="text-[11px] text-gray-500 leading-tight">Max 20kg check-in luggage per passenger.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FaClock className="text-orange-500 mt-0.5 flex-shrink-0 text-sm" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-700">Boarding Time</p>
                                            <p className="text-[11px] text-gray-500 leading-tight">Please arrive at the station 30 mins early.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingBus;