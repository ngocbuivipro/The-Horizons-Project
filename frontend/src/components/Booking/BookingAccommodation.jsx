import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import {
    createBookingApi,
    calculateBookingPriceApi,
    createOnePayPayment,
    getSystemStatusApi
} from "../../api/client/api";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { Carousel } from "antd";
import { isValidPhoneNumber } from 'react-phone-number-input';
import dayjs from "dayjs";

import AntdPhoneInput from "./AntdPhoneInput";
import {
    FaInfoCircle, FaClock, FaHome, FaBan, FaArrowRight,
    FaCreditCard, FaUniversity, FaUser, FaTag, FaSpinner,
    FaExclamationTriangle, FaCheckCircle, FaStar, FaMapMarkerAlt
} from "react-icons/fa";
import BookingRequest from "./BookingRequest.jsx";

// Custom Arrows
const SampleNextArrow = ({ className, style, onClick }) => (
    <div className={`${className} absolute right-2 top-1/2 z-10 !flex items-center justify-center text-white bg-black/30 p-2 rounded-full cursor-pointer hover:bg-black/50 transition-colors h-8 w-8`} style={{ ...style }} onClick={onClick}>›</div>
);
const SamplePrevArrow = ({ className, style, onClick }) => (
    <div className={`${className} absolute left-2 top-1/2 z-10 !flex items-center justify-center text-white bg-black/30 p-2 rounded-full cursor-pointer hover:bg-black/50 transition-colors h-8 w-8`} style={{ ...style }} onClick={onClick}>‹</div>
);

const BookingAccommodation = () => {
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
    const [contactErrors, setContactErrors] = useState({
        name: "",
        email: "",
        phoneNumber: ""
    });

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState("");

    // UI States
    const [disableButton, setDisableButton] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isSystemLoading, setIsSystemLoading] = useState(true);
    const contactSectionRef = useRef(null);

    // Pricing State
    const [couponCode, setCouponCode] = useState("");
    const [numberOfDays, setNumberOfDays] = useState(0);
    const [priceData, setPriceData] = useState({
        breakdown: [],
        totalPrice: 0,
        originalPrice: 0,
        finalPrice: 0,
        discountAmount: 0,
        processingFee: 0,
        feePercent: 0,
        numberOfDays: 0,
        guests: 1,
        couponMessage: ""
    });

    // --- 1. SYSTEM STATUS & VALIDATION ---
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
        if (!location.state) {
            toast.error("Invalid booking session.");
            navigate("/", { replace: true });
        }
    }, [location.state, navigate]);

    // --- 2. SYNC USER DATA ---
    useEffect(() => {
        if (stateUser?.user) {
            setName(prev => prev || stateUser.user.username || "");
            setEmail(prev => prev || stateUser.user.email || "");
            setPhoneNumber(prev => prev || stateUser.user.phoneNumber || "");
        }
    }, [stateUser]);

    // --- 3. PAYMENT METHOD AUTO-SWITCH ---
    useEffect(() => {
        if (isSystemLoading) return;
        if (paymentMethod === 'card' && !allowCredit) setPaymentMethod(allowTransfer ? 'transfer' : '');
        else if (paymentMethod === 'transfer' && !allowTransfer) setPaymentMethod(allowCredit ? 'card' : '');
        else if (!paymentMethod) {
            if (allowCredit) setPaymentMethod('card');
            else if (allowTransfer) setPaymentMethod('transfer');
        }
    }, [allowCredit, allowTransfer, isSystemLoading, paymentMethod]);

    // --- 4. PRICE CALCULATION ---
    const fetchCalculatedPrice = useCallback(async (bookingData, currentCode = "", currentPaymentMethod = "card") => {
        if (!bookingData?.checkIn || !bookingData?.checkOut || !bookingData?.roomType?._id || !currentPaymentMethod) return;

        try {
            const payload = {
                checkIn: dayjs(bookingData.checkIn).format("YYYY-MM-DD"),
                checkOut: dayjs(bookingData.checkOut).format("YYYY-MM-DD"),
                roomTypeId: bookingData.roomType._id,
                guests: bookingData.guests || 1,
                couponCode: currentCode,
                paymentMethod: currentPaymentMethod
            };

            const res = await calculateBookingPriceApi(payload);

            if (res.success) {
                const apiData = res;
                setNumberOfDays(apiData.numberOfDays);
                setPriceData({
                    totalPrice: apiData.totalPrice,
                    originalPrice: apiData.originalPrice || apiData.finalPrice,
                    finalPrice: apiData.finalPrice,
                    discountAmount: apiData.discountAmount || 0,
                    processingFee: apiData.processingFee || 0,
                    feePercent: apiData.feePercent || 0,
                    numberOfDays: apiData.numberOfDays,
                    guests: apiData.guests,
                    breakdown: apiData.breakdown,
                    couponMessage: apiData.couponMessage
                });
            }
        } catch (error) {
            console.error("Calculate Price Error:", error);
            if (currentCode) {
                toast.error(error.message || "Invalid Coupon Code");
                // Reset to valid state without coupon
                fetchCalculatedPrice(bookingData, "", currentPaymentMethod);
                setCouponCode("");
            }
        }
    }, []);

    useEffect(() => {
        if (data && paymentMethod) {
            fetchCalculatedPrice(data, couponCode, paymentMethod)
                .catch(err => console.log("Silent calc error", err));
        }
    }, [data, paymentMethod, fetchCalculatedPrice]);

    // --- HANDLERS ---
    const handleApplyCoupon = () => {
        if (!couponCode.trim()) return toast.error("Please enter a coupon code");
        if (!paymentMethod) return toast.error("Please select a payment method first");

        const toastId = toast.loading("Checking coupon...");
        fetchCalculatedPrice(data, couponCode, paymentMethod)
            .then(() => toast.success("Price updated!", { id: toastId }))
            .catch(() => toast.dismiss(toastId));
    };

    const handleSubmitBooking = async () => {
        if (!paymentMethod) return toast.error("Please select a payment method");
        if (paymentMethod === 'card' && !allowCredit) return toast.error("Credit card payment is currently disabled.");
        if (paymentMethod === 'transfer' && !allowTransfer) return toast.error("Bank transfer is currently disabled.");

        const nextContactErrors = { name: "", email: "", phoneNumber: "" };
        if (!name?.trim() || /\d/.test(name)) {
            nextContactErrors.name = "Please enter a valid full name";
        }
        if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            nextContactErrors.email = "Please enter a valid email address";
        }
        if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
            nextContactErrors.phoneNumber = "Please enter a valid phone number";
        }

        setContactErrors(nextContactErrors);
        if (nextContactErrors.name || nextContactErrors.email || nextContactErrors.phoneNumber) {
            if (contactSectionRef.current) {
                contactSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
            return;
        }

        if (!isGuest && (!nameGuest?.trim() || /\d/.test(nameGuest))) return toast.error("Invalid guest name");

        setDisableButton(true);
        const toastId = toast.loading("Creating your booking...");

        try {
            const bookingPayload = {
                name, email, phoneNumber, isGuest,
                userId: stateUser?.user?._id || null,
                bookingType: 'HOTEL',
                nameGuest: isGuest ? undefined : nameGuest,
                checkIn: data?.checkIn,
                checkOut: data?.checkOut,
                roomType: data?.roomType?._id,
                guests: data?.guests,
                stepPayment: true,
                paymentMethod: paymentMethod,
                status: "PENDING",
                request: request,
                couponCode: couponCode ? couponCode.toUpperCase() : ""
            };

            const res = await createBookingApi(bookingPayload);

            if (res.success && res.data?._id) {
                const newBookingId = res.data._id;

                if (paymentMethod === 'card') {
                    // toast.loading("Redirecting to OnePay...", { id: toastId });
                    // setIsRedirecting(true);
                    // const paymentRes = await createOnePayPayment(newBookingId, 'hotel');

                    // if (paymentRes.success && paymentRes.data?.paymentUrl) {
                    //     window.location.href = paymentRes.data.paymentUrl;
                    // } else {
                    //     throw new Error(paymentRes.message || "Payment init failed");
                    // }

                    toast.success("Booking Confirmed!", { id: toastId });
                    navigate(`/order/${newBookingId}`, { state: { justBooked: true } });
                } else {
                    toast.success("Booking Confirmed!", { id: toastId });
                    navigate(`/order/${newBookingId}`, { state: { justBooked: true } });
                }
            } else {
                throw new Error(res.message || 'Booking failed.');
            }
        } catch (err) {
            setDisableButton(false);
            setIsRedirecting(false);
            if (err.message === "Payment init failed" && paymentMethod === 'card') {
                navigate(`/order/${err.bookingId || ""}`); // Fallback
            }
            toast.error(err.message || 'Failed to create booking.', { id: toastId });
        }
    };

    if (!data) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><FaSpinner className="animate-spin text-orange-500 text-3xl" /></div>;

    const isSystemDown = !allowCredit && !allowTransfer;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-12 font-sans bg-gray-50/50 min-h-screen">

            {/* Redirect Overlay */}
            {isRedirecting && (
                <div className="fixed inset-0 bg-white/90 z-[9999] flex flex-col items-center justify-center backdrop-blur-sm">
                    <FaSpinner className="animate-spin text-5xl text-orange-600 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Redirecting to OnePay...</h2>
                    <p className="text-gray-500 mt-2">Please do not close this window.</p>
                </div>
            )}

            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Confirm Your Stay</h1>
                <p className="text-gray-500 text-sm md:text-base">Review details and secure your accommodation.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                {/* LEFT COLUMN: Form & Price */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* 1. Contact Info */}
                    <div ref={contactSectionRef} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 md:p-6 border-b border-gray-100">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaUser className="text-orange-500" size={18} /> Contact Details
                            </h2>
                        </div>
                        <div className="p-5 md:p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            if (contactErrors.name) setContactErrors(prev => ({ ...prev, name: "" }));
                                        }}
                                        placeholder="e.g. Nguyen Van A"
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl outline-none transition-all font-medium ${contactErrors.name
                                            ? "border-red-500 focus:ring-2 focus:ring-red-100 focus:border-red-500"
                                            : "border-gray-200 focus:ring-2 focus:ring-orange-100 focus:border-orange-500"
                                            }`}
                                    />
                                    {contactErrors.name && <p className="text-sm text-red-500">{contactErrors.name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (contactErrors.email) setContactErrors(prev => ({ ...prev, email: "" }));
                                        }}
                                        placeholder="email@example.com"
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl outline-none transition-all font-medium ${contactErrors.email
                                            ? "border-red-500 focus:ring-2 focus:ring-red-100 focus:border-red-500"
                                            : "border-gray-200 focus:ring-2 focus:ring-orange-100 focus:border-orange-500"
                                            }`}
                                    />
                                    {contactErrors.email && <p className="text-sm text-red-500">{contactErrors.email}</p>}
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-bold text-gray-700">Phone Number</label>
                                    <div className="relative w-full">
                                        <AntdPhoneInput
                                            value={phoneNumber}
                                            onChange={(value) => {
                                                setPhoneNumber(value);
                                                if (contactErrors.phoneNumber) setContactErrors(prev => ({ ...prev, phoneNumber: "" }));
                                            }}
                                            className={`w-full ${contactErrors.phoneNumber ? "!border-red-500 !ring-2 !ring-red-100" : ""}`}
                                        />
                                    </div>
                                    {contactErrors.phoneNumber && <p className="text-sm text-red-500">{contactErrors.phoneNumber}</p>}
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
                                    <label className="text-sm font-bold text-gray-800">Guest Name</label>
                                    <input type="text" value={nameGuest} onChange={(e) => setNameGuest(e.target.value)} placeholder="Guest's full name" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none font-medium" />
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
                                    <span className="text-sm font-medium">Checking payment gateway...</span>
                                </div>
                            ) : (
                                <>
                                    {isSystemDown && (
                                        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start md:items-center gap-3 mb-4">
                                            <FaExclamationTriangle className="shrink-0 mt-0.5 md:mt-0" />
                                            <span className="text-sm font-medium">Online booking is temporarily unavailable.</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {allowCredit && (
                                            <label className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500 shadow-sm' : 'border-gray-200 hover:border-orange-300 hover:shadow-sm bg-gray-50/30'}`} onClick={() => setPaymentMethod('card')}>
                                                <div className="flex justify-between items-start w-full mb-2">
                                                    <span className="font-bold text-gray-900 flex items-center gap-2"><FaCreditCard className="text-orange-600" /> Credit Card</span>
                                                    <input type="radio" checked={paymentMethod === 'card'} onChange={() => { }} className="h-4 w-4 text-orange-600 focus:ring-orange-500" />
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed">Instant payment (Visa/Master/ATM).</p>
                                                {paymentMethod === 'card' && priceData.feePercent > 0 && (
                                                    <div className="mt-2 text-xs font-bold text-orange-600 bg-orange-100 w-fit px-2 py-1 rounded">+{priceData.feePercent}% fee applies</div>
                                                )}
                                            </label>
                                        )}
                                        {allowTransfer && (
                                            <label className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === 'transfer' ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500 shadow-sm' : 'border-gray-200 hover:border-orange-300 hover:shadow-sm bg-gray-50/30'}`} onClick={() => setPaymentMethod('transfer')}>
                                                <div className="flex justify-between items-start w-full mb-2">
                                                    <span className="font-bold text-gray-900 flex items-center gap-2"><FaUniversity className="text-blue-600" /> Bank Transfer</span>
                                                    <input type="radio" checked={paymentMethod === 'transfer'} onChange={() => { }} className="h-4 w-4 text-orange-600 focus:ring-orange-500" />
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed">Book now, pay via banking app manually.</p>
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
                                <FaTag className="text-orange-500" size={18} /> Price Breakdown
                            </h2>
                        </div>

                        <div className="p-5 md:p-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6 text-xs md:text-sm text-blue-800 flex gap-2 items-start">
                                <FaInfoCircle className="mt-0.5 shrink-0" />
                                <p>Taxes and fees included. The price shown is the final amount.</p>
                            </div>

                            <div className="space-y-4 mb-6 text-sm md:text-base">
                                {priceData.breakdown.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center pb-3 border-b border-gray-100 border-dashed">
                                        <div>
                                            <p className="font-bold text-gray-700">{item.note === "Special Rate" ? "Special Rate" : data?.roomType?.RoomType}</p>
                                            <p className="text-xs text-gray-500 font-medium">{new Date(item.date).toLocaleDateString("en-GB")}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${item.note === "Special Rate" ? "text-orange-600" : "text-gray-900"}`}>
                                                {new Intl.NumberFormat("vi-VN").format(item.totalDailyPrice)} ₫
                                            </p>
                                            {item.guests > 1 && <p className="text-xs text-gray-400">{new Intl.NumberFormat("vi-VN").format(item.unitPrice)} x {item.guests}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Coupon Section - Responsive Fix */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-wider">Discount Code</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="E.g. HOTEL2025"
                                        disabled={isSystemDown}
                                        className="w-full sm:flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none uppercase text-sm font-bold placeholder-gray-400 disabled:bg-gray-100"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={isSystemDown}
                                        className="w-full sm:w-auto bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
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

                            {/* Totals */}
                            <div className="flex flex-col gap-2 pt-2">
                                {priceData.discountAmount > 0 && (
                                    <>
                                        <div className="flex justify-between items-center text-gray-400 text-sm">
                                            <p>Original Price</p>
                                            <p className="line-through decoration-gray-400">{new Intl.NumberFormat("vi-VN").format(priceData.originalPrice || (priceData.finalPrice + priceData.discountAmount))} ₫</p>
                                        </div>
                                        <div className="flex justify-between items-center text-emerald-600 text-sm font-bold">
                                            <p>Discount Applied</p>
                                            <p>- {new Intl.NumberFormat("vi-VN").format(priceData.discountAmount)} ₫</p>
                                        </div>
                                    </>
                                )}

                                {priceData.processingFee > 0 && (
                                    <div className="flex justify-between items-center text-gray-500 text-xs md:text-sm font-medium">
                                        <p>Tax & Fee ({priceData.feePercent}%)</p>
                                        <p>+ {new Intl.NumberFormat("vi-VN").format(priceData.processingFee)} ₫</p>
                                    </div>
                                )}

                                <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100">
                                    <div>
                                        <p className="text-base md:text-lg font-bold text-gray-900">Total Amount</p>
                                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">Includes taxes & fees</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl md:text-3xl font-extrabold text-orange-600 tracking-tight">
                                            {new Intl.NumberFormat("vi-VN").format(priceData.finalPrice)}
                                            <span className="text-base md:text-lg text-gray-500 font-bold ml-1">₫</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Actions */}
                            <div className="mt-8 flex flex-col gap-4">
                                <button
                                    disabled={disableButton || isSystemDown}
                                    onClick={handleSubmitBooking}
                                    className={`w-full py-4 bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/20 transition-all transform active:scale-[0.98] hover:bg-orange-700 flex items-center justify-center gap-2 ${(disableButton || isSystemDown) ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    {disableButton ? (
                                        <>
                                            <FaSpinner className="animate-spin" /> Processing...
                                        </>
                                    ) : (
                                        <>
                                            {paymentMethod === 'card' ? "Pay Now" : "Confirm Booking"} <FaArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                                <div className="flex items-center justify-center text-emerald-600 text-xs md:text-sm font-bold gap-1.5">
                                    <FaClock /> Instant confirmation available
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 md:p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Special Requests</h2>
                            <BookingRequest request={request} setRequest={setRequest} placeholder="Late check-in, high floor, etc." />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6  top-24 self-start order-first lg:order-last">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Carousel */}
                        <div className="relative h-48 md:h-56 lg:h-64 w-full bg-gray-100 group">
                            <Carousel arrows className="h-full custom-carousel" autoplay prevArrow={<SamplePrevArrow />} nextArrow={<SampleNextArrow />}>
                                {data?.roomType?.photos?.map((src, index) => (
                                    <div key={`room-${index}`} className="h-48 md:h-56 lg:h-64 relative">
                                        <img src={src} alt="Room" className="w-full h-full object-cover" loading="lazy" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                                    </div>
                                ))}
                                {data?.roomType?.hotel?.photos?.map((src, index) => (
                                    <div key={`hotel-${index}`} className="h-48 md:h-56 lg:h-64 relative">
                                        <img src={src} alt="Hotel" className="w-full h-full object-cover" loading="lazy" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                                    </div>
                                ))}
                            </Carousel>
                            <div className="absolute bottom-4 left-4 right-4 z-10">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-300 uppercase mb-1 tracking-wide">
                                    <FaMapMarkerAlt /> {data?.roomType?.hotel?.city || "Vietnam"}
                                </div>
                                <h3 className="text-white font-bold text-lg md:text-xl leading-tight line-clamp-2 shadow-black drop-shadow-md">
                                    {data?.roomType?.hotel?.name}
                                </h3>
                            </div>
                        </div>

                        <div className="p-5 md:p-6">
                            <div className="mb-6">
                                <div className="flex items-center gap-1 text-yellow-400 mb-1.5 text-sm">
                                    {[...Array(5)].map((_, i) => <FaStar key={i} size={14} />)}
                                </div>
                                <p className="text-sm md:text-base text-gray-700 font-bold">{data?.roomType?.RoomType}</p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                                <div className="flex justify-between items-start relative">
                                    <div className="z-10 relative">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Check-in</p>
                                        <p className="font-bold text-gray-800 text-sm md:text-base">{dayjs(data?.checkIn).format("DD MMM")}</p>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                                            {data?.roomType?.hotel?.checkIn ? dayjs(data.roomType.hotel.checkIn).format("HH:mm") : "14:00"}
                                        </p>
                                    </div>

                                    {/* Timeline Line */}
                                    <div className="absolute top-4 left-[25%] right-[25%] h-[2px] bg-gray-200 flex items-center justify-center">
                                        <div className="bg-white px-2 text-[10px] font-bold text-gray-400 border border-gray-200 rounded-full whitespace-nowrap">
                                            {numberOfDays} Nights
                                        </div>
                                    </div>

                                    <div className="text-right z-10 relative">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Check-out</p>
                                        <p className="font-bold text-gray-800 text-sm md:text-base">{dayjs(data?.checkOut).format("DD MMM")}</p>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                                            {data?.roomType?.hotel?.checkOut ? dayjs(data.roomType.hotel.checkOut).format("HH:mm") : "12:00"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <FaUser className="text-gray-400" size={12} />
                                        <span className="text-xs text-gray-500 font-bold uppercase">Guests</span>
                                    </div>
                                    <p className="font-bold text-gray-800 text-sm">{data?.guests} {data?.guests > 1 ? "Guests" : "Guest"}</p>
                                </div>
                            </div>

                            {/* <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <FaHome className="text-orange-500 mt-0.5 flex-shrink-0 text-sm" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-700">Property Rules</p>
                                        <ul className="text-[11px] text-gray-500 mt-0.5 list-disc pl-3 leading-tight space-y-0.5">
                                            {data?.roomType?.hotel?.policy?.filter(i => i.type === "Accommodation rules").slice(0, 2).map((i, idx) => (
                                                <li key={idx}>{i.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FaBan className="text-red-500 mt-0.5 flex-shrink-0 text-sm" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-700">Cancellation Policy</p>
                                        <ul className="text-[11px] text-gray-500 mt-0.5 list-disc pl-3 leading-tight">
                                            {data?.roomType?.hotel?.policy?.filter(i => i.type === "Cancellation and refund policy").slice(0, 1).map((i, idx) => (
                                                <li key={idx}>{i.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingAccommodation;
