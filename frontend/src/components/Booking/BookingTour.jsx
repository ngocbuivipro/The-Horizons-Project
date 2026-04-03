import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { createBookingApi, calculateBookingTourPriceApi, createOnePayPayment, getSystemStatusApi } from "../../api/client/api";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { Carousel } from "antd";
import { isValidPhoneNumber } from 'react-phone-number-input';
import dayjs from "dayjs";

import AntdPhoneInput from "./AntdPhoneInput";
import {
    FaInfoCircle, FaClock, FaMapMarkerAlt, FaCalendarAlt, FaArrowRight,
    FaCreditCard, FaUniversity, FaUser, FaEnvelope, FaTag, FaUsers, FaExclamationTriangle, FaSpinner, FaCheckCircle
} from "react-icons/fa";
import BookingRequest from "./BookingRequest.jsx";

// Custom Arrows for Carousel
const SampleNextArrow = ({ className, style, onClick }) => (
    <div className={`${className} absolute right-2 top-1/2 z-10 !flex items-center justify-center text-white bg-black/30 p-2 rounded-full cursor-pointer hover:bg-black/50 transition-colors h-8 w-8`} style={{ ...style }} onClick={onClick}>›</div>
);
const SamplePrevArrow = ({ className, style, onClick }) => (
    <div className={`${className} absolute left-2 top-1/2 z-10 !flex items-center justify-center text-white bg-black/30 p-2 rounded-full cursor-pointer hover:bg-black/50 transition-colors h-8 w-8`} style={{ ...style }} onClick={onClick}>‹</div>
);

const BookingTour = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const stateUser = useSelector((state) => state.UserReducer);
    const systemStore = useSelector(state => state.SystemReducer) || {};

    const allowCredit = systemStore.credit ?? true;
    const allowTransfer = systemStore.transfer ?? true;

    const [data] = useState(location.state || null);

    // Form State
    const [request, setRequest] = useState("");
    const [isGuest, setIsGuest] = useState(true);
    const [name, setName] = useState(stateUser?.user?.username || "");
    const [email, setEmail] = useState(stateUser?.user?.email || "");
    const [phoneNumber, setPhoneNumber] = useState(stateUser?.user?.phoneNumber || "");
    const [nameGuest, setNameGuest] = useState("");

    const [paymentMethod, setPaymentMethod] = useState("");
    const [disableButton, setDisableButton] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isSystemLoading, setIsSystemLoading] = useState(true);

    const [couponCode, setCouponCode] = useState("");

    // Price State - Mapped to match JSON Response Structure
    const [priceData, setPriceData] = useState({
        tourName: "",
        duration: "",
        adultPrice: 0,      // Unit Price
        childPrice: 0,      // Unit Price
        numAdults: 0,
        numChildren: 0,
        originalPrice: 0,   // Subtotal before fee/discount
        couponApplied: false,
        appliedCode: null,
        discountAmount: 0,
        couponMessage: null,
        feePercent: 0,
        processingFee: 0,
        finalPrice: 0,
        note: ""
    });

    // 1. Fetch System Status
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

    // 2. Validate Session
    useEffect(() => {
        if (!location.state || !location.state.tour) {
            toast.error("Invalid booking session. Please select a Tour again.");
            navigate("/tours", { replace: true });
        }
    }, [location.state, navigate]);

    // 3. Sync User Data
    useEffect(() => {
        if (stateUser?.user) {
            setName(prev => prev || stateUser.user.username || "");
            setEmail(prev => prev || stateUser.user.email || "");
            setPhoneNumber(prev => prev || stateUser.user.phoneNumber || "");
        }
    }, [stateUser]);

    // 4. Payment Method Auto-Switch
    useEffect(() => {
        if (isSystemLoading) return;
        if (paymentMethod === 'card' && !allowCredit) setPaymentMethod(allowTransfer ? 'transfer' : '');
        else if (paymentMethod === 'transfer' && !allowTransfer) setPaymentMethod(allowCredit ? 'card' : '');
        else if (!paymentMethod) {
            if (allowCredit) setPaymentMethod('card');
            else if (allowTransfer) setPaymentMethod('transfer');
        }
    }, [allowCredit, allowTransfer, paymentMethod, isSystemLoading]);

    // 5. Price Calculation - Mapped strictly to JSON response
    const fetchCalculatedPrice = useCallback(async (currentData, currentCoupon = "", currentPaymentMethod = "card") => {
        if (!currentData?.tour?._id || !currentPaymentMethod) return;

        try {
            const payload = {
                tourId: currentData.tour._id,
                checkIn: dayjs(currentData.startDate).format("YYYY-MM-DD"),
                adults: currentData?.adults || 0,
                children: currentData?.children || 0,
                couponCode: currentCoupon,
                paymentMethod: currentPaymentMethod
            };

            const res = await calculateBookingTourPriceApi(payload);

            if (res.success && res.data) {
                // Map API response directly to state
                setPriceData(prev => ({
                    ...prev,
                    ...res.data, // This spreads: adultPrice, childPrice, feePercent, processingFee, finalPrice, etc.
                }));
            }
        } catch (error) {
            console.error("Calc Error:", error);
            if (currentCoupon) {
                toast.error(error.message || "Invalid Coupon Code");
                // Retry without coupon to reset price
                fetchCalculatedPrice(currentData, "", currentPaymentMethod);
                setCouponCode("");
            }
        }
    }, []);

    // Trigger Calculation on Dependency Change
    useEffect(() => {
        if (data && paymentMethod) {
            fetchCalculatedPrice(data, couponCode, paymentMethod)
                .catch(err => console.log("Calculation error", err));
        }
    }, [data, paymentMethod, fetchCalculatedPrice]);

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) return toast.error("Please enter a coupon code");
        if (!paymentMethod) return toast.error("Please select a payment method first");

        const toastId = toast.loading("Checking coupon...");
        fetchCalculatedPrice(data, couponCode, paymentMethod)
            .then(() => toast.success("Updated price!", { id: toastId }))
            .catch(() => toast.dismiss(toastId));
    };

    const handleSubmitBooking = async () => {
        if (!paymentMethod) return toast.error("Please select a payment method");
        if (paymentMethod === 'card' && !allowCredit) return toast.error("Credit card payment is currently disabled.");
        if (paymentMethod === 'transfer' && !allowTransfer) return toast.error("Bank transfer is currently disabled.");

        if (!name || /\d/.test(name)) return toast.error("Invalid name format");
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Invalid email address");
        if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) return toast.error("Invalid phone number");
        if (!isGuest && (!nameGuest || /\d/.test(nameGuest))) return toast.error("Please check passenger name");

        setDisableButton(true);
        const toastId = toast.loading("Processing your Tour booking...");

        try {
            const bookingPayload = {
                name, email, phoneNumber, isGuest,
                userId: stateUser?.user?._id || null,
                nameGuest: isGuest ? undefined : nameGuest,
                paymentMethod,
                request,
                couponCode: couponCode ? couponCode.toUpperCase() : "",
                bookingType: "TOUR",
                tour: data?.tour?._id,
                checkIn: dayjs(data?.startDate).format("YYYY-MM-DD"),
                adults: data?.adults || 0,
                children: data?.children || 0
            };

            const res = await createBookingApi(bookingPayload);

            if (res?.success && res?.data?._id) {
                const bookingId = res.data._id;

                if (paymentMethod === 'card') {
                    toast.loading("Redirecting to OnePay...", { id: toastId });
                    setIsRedirecting(true);
                    const paymentRes = await createOnePayPayment(bookingId, 'tour');
                    if (paymentRes.success && paymentRes.data?.paymentUrl) {
                        window.location.href = paymentRes.data.paymentUrl;
                    } else {
                        throw new Error(paymentRes.message || "Payment initialization failed");
                    }
                } else {
                    setDisableButton(false);
                    toast.success('Booking Confirmed!', { id: toastId });
                    navigate(`/order-tour/${bookingId}`, { state: { justBooked: true } });
                }
            } else {
                throw new Error(res.data?.message || res.message || 'Booking failed.');
            }
        } catch (err) {
            setDisableButton(false);
            setIsRedirecting(false);
            if (err.message === "Payment initialization failed" && paymentMethod === 'card') {
                toast.error("Payment failed. Please retry from order details.", { id: toastId });
            } else {
                toast.error(err.message || 'Failed to create booking.', { id: toastId });
            }
        }
    };

    if (!data) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><FaSpinner className="animate-spin text-orange-500 text-3xl" /></div>;

    const totalPax = (data.adults || 0) + (data?.children || 0);
    const isSystemDown = !allowCredit && !allowTransfer;

    // Computed Values based on mapped data
    const totalAdultAmount = (priceData.adultPrice || 0) * (priceData.numAdults || 0);
    const totalChildAmount = (priceData.childPrice || 0) * (priceData.numChildren || 0);

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
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Confirm Tour Booking</h1>
                <p className="text-gray-500 text-sm md:text-base">Review your details and secure your adventure.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                {/* LEFT COLUMN: Form & Payment */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* Contact Info */}
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
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-medium" placeholder="e.g. Nguyen Van A" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Email Address</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-medium" placeholder="email@example.com" />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-bold text-gray-700">Phone Number</label>
                                    <div className="relative w-full">
                                        <AntdPhoneInput value={phoneNumber} onChange={setPhoneNumber} className="w-full" />
                                    </div>
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
                                    <label className="text-sm font-bold text-gray-800">Lead Passenger Name</label>
                                    <input type="text" value={nameGuest} onChange={(e) => setNameGuest(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none font-medium" placeholder="Passenger's full name" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Method */}
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
                                    <span className="text-sm font-medium">Loading secure payment options...</span>
                                </div>
                            ) : (
                                <>
                                    {isSystemDown && (
                                        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start md:items-center gap-3 mb-4">
                                            <FaExclamationTriangle className="shrink-0 mt-0.5 md:mt-0" />
                                            <span className="text-sm font-medium">Online booking is temporarily unavailable. Please try again later.</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {allowCredit && (
                                            <label
                                                className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500 shadow-sm' : 'border-gray-200 hover:border-orange-300 hover:shadow-sm bg-gray-50/30'}`}
                                                onClick={() => setPaymentMethod('card')}
                                            >
                                                <div className="flex justify-between items-start w-full mb-2">
                                                    <span className="font-bold text-gray-900 flex items-center gap-2"><FaCreditCard className="text-orange-600" /> Credit Card</span>
                                                    <input type="radio" checked={paymentMethod === 'card'} onChange={() => { }} className="h-4 w-4 text-orange-600 focus:ring-orange-500" />
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed">Instant payment via Visa, MasterCard, JCB, ATM.</p>
                                                {paymentMethod === 'card' && priceData.feePercent > 0 && (
                                                    <div className="mt-2 text-xs font-bold text-orange-600 bg-orange-100 w-fit px-2 py-1 rounded">
                                                        +{priceData.feePercent}% fee applies
                                                    </div>
                                                )}
                                            </label>
                                        )}
                                        {allowTransfer && (
                                            <label
                                                className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === 'transfer' ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500 shadow-sm' : 'border-gray-200 hover:border-orange-300 hover:shadow-sm bg-gray-50/30'}`}
                                                onClick={() => setPaymentMethod('transfer')}
                                            >
                                                <div className="flex justify-between items-start w-full mb-2">
                                                    <span className="font-bold text-gray-900 flex items-center gap-2"><FaUniversity className="text-blue-600" /> Bank Transfer</span>
                                                    <input type="radio" checked={paymentMethod === 'transfer'} onChange={() => { }} className="h-4 w-4 text-orange-600 focus:ring-orange-500" />
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed">Book now, pay later via banking app manually.</p>
                                            </label>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 md:p-6 border-b border-gray-100">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaTag className="text-orange-500" size={18} /> Price Breakdown
                            </h2>
                        </div>

                        <div className="p-5 md:p-6">
                            {priceData.note && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6 text-xs md:text-sm text-blue-800 flex gap-2 items-start">
                                    <FaInfoCircle className="mt-0.5 shrink-0" />
                                    <span>{priceData.note}</span>
                                </div>
                            )}

                            <div className="space-y-4 mb-6 text-sm md:text-base">
                                {priceData.numAdults > 0 && (
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100 border-dashed">
                                        <div>
                                            <p className="font-bold text-gray-800">Adults</p>
                                            <p className="text-xs text-gray-500 font-medium">x {priceData.numAdults} passengers</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{new Intl.NumberFormat("vi-VN").format(totalAdultAmount)} ₫</p>
                                            <p className="text-xs text-gray-400">{new Intl.NumberFormat("vi-VN").format(priceData.adultPrice)} ₫ / pax</p>
                                        </div>
                                    </div>
                                )}

                                {priceData.numChildren > 0 && (
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100 border-dashed">
                                        <div>
                                            <p className="font-bold text-gray-800">Children</p>
                                            <p className="text-xs text-gray-500 font-medium">x {priceData.numChildren} passengers</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{new Intl.NumberFormat("vi-VN").format(totalChildAmount)} ₫</p>
                                            <p className="text-xs text-gray-400">{new Intl.NumberFormat("vi-VN").format(priceData.childPrice)} ₫ / pax</p>
                                        </div>
                                    </div>
                                )}

                                {priceData.processingFee > 0 && (
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100 border-dashed text-gray-600">
                                        <div>
                                            <p className="font-medium">Processing Fee</p>
                                            <p className="text-xs text-gray-400">({priceData.feePercent}% via {paymentMethod === 'card' ? 'Card' : 'Transfer'})</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-800">+ {new Intl.NumberFormat("vi-VN").format(priceData.processingFee)} ₫</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Coupon Section */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-wider">
                                    Discount Code
                                </label>

                                {/* UPDATE: flex-col cho mobile, sm:flex-row cho tablet/desktop */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="E.g. SUMMER2025"
                                        disabled={isSystemDown}
                                        // UPDATE: w-full cho mobile, sm:flex-1 để tự giãn trên desktop
                                        // Tăng py-2.5 để ô nhập cao hơn xíu, dễ bấm trên mobile
                                        className="w-full sm:flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none uppercase text-sm font-bold placeholder-gray-400 disabled:bg-gray-100"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={isSystemDown || !couponCode}
                                        // UPDATE: w-full cho mobile (nút dài ra), sm:w-auto cho desktop (nút gọn lại)
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
                            {/* Total Calculation */}
                            <div className="flex flex-col gap-2 pt-2">
                                {priceData.discountAmount > 0 && (
                                    <>
                                        <div className="flex justify-between items-center text-gray-400 text-sm">
                                            <p>Original Price</p>
                                            <p className="line-through decoration-gray-400">{new Intl.NumberFormat("vi-VN").format(priceData.originalPrice)} ₫</p>
                                        </div>
                                        <div className="flex justify-between items-center text-emerald-600 text-sm font-bold">
                                            <p>Discount Applied</p>
                                            <p>- {new Intl.NumberFormat("vi-VN").format(priceData.discountAmount)} ₫</p>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100">
                                    <div>
                                        <p className="text-base md:text-lg font-bold text-gray-900">Total Amount</p>
                                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">{totalPax} Passenger(s)</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl md:text-3xl font-extrabold text-orange-600 tracking-tight">
                                            {new Intl.NumberFormat("vi-VN").format(priceData.finalPrice)}
                                            <span className="text-base md:text-lg text-gray-500 font-bold ml-1">₫</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

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
                                            {paymentMethod === 'card' ? "Pay Securely Now" : "Confirm Booking"} <FaArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                                <div className="flex items-center justify-center text-emerald-600 text-xs md:text-sm font-bold gap-1.5">
                                    <FaClock /> Instant confirmation available
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Requests */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 md:p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Special Requests</h2>
                            <BookingRequest request={request} setRequest={setRequest} placeholder="Any dietary restrictions, pickup location details, or special occasions?" />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Tour Info Sticky */}
                <div className="lg:col-span-4 flex flex-col gap-6 top-24 self-start order-first lg:order-last">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Image Carousel */}
                        <div className="relative h-48 md:h-56 lg:h-64 w-full bg-gray-100 group">
                            {data?.tour?.images && data.tour.images.length > 0 ? (
                                <Carousel arrows className="h-full custom-carousel" autoplay prevArrow={<SamplePrevArrow />} nextArrow={<SampleNextArrow />}>
                                    {data.tour.images.map((src, index) => (
                                        <div key={`tour-img-${index}`} className="h-48 md:h-56 lg:h-64 relative">
                                            <img src={src} alt="Tour" className="w-full h-full object-cover" loading="lazy" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                                        </div>
                                    ))}
                                </Carousel>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-gray-200 text-gray-400">No Image</div>
                            )}
                            <div className="absolute bottom-4 left-4 right-4 z-10">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-300 uppercase mb-1 tracking-wide">
                                    <FaMapMarkerAlt /> {data?.tour?.destination || "Vietnam"}
                                </div>
                                <h3 className="text-white font-bold text-lg md:text-xl leading-tight line-clamp-2 shadow-black drop-shadow-md">
                                    {data?.tour?.title}
                                </h3>
                            </div>
                        </div>

                        <div className="p-5 md:p-6">
                            {/* Trip Dates */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                                <div className="flex justify-between items-start relative">
                                    <div className="z-10 relative">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Departure</p>
                                        <p className="font-bold text-gray-800 text-sm md:text-base">{dayjs(data?.startDate).format("DD MMM YYYY")}</p>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">{data?.tour?.startTime || "08:00 AM"}</p>
                                    </div>

                                    {/* Timeline Line */}
                                    <div className="absolute top-4 left-[25%] right-[25%] h-[2px] bg-gray-200 flex items-center justify-center">
                                        <div className="bg-white px-2 text-[10px] font-bold text-gray-400 border border-gray-200 rounded-full whitespace-nowrap">
                                            {priceData.duration || "N/A"}
                                        </div>
                                    </div>

                                    <div className="text-right z-10 relative">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Return</p>
                                        <p className="font-bold text-gray-800 text-sm md:text-base">
                                            {data?.tour?.durationDays
                                                ? dayjs(data.startDate).add(data.tour.durationDays, 'day').format("DD MMM YYYY")
                                                : "Flexible"}
                                        </p>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">Approx.</p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <FaUsers className="text-gray-400" />
                                        <span className="text-xs text-gray-500 font-bold uppercase">Passengers</span>
                                    </div>
                                    <p className="font-bold text-gray-800 text-sm">{totalPax} People</p>
                                </div>
                            </div>

                            {/* Policies */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Policies & Info</h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <FaCalendarAlt className="text-blue-500 mt-0.5 flex-shrink-0 text-sm" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-700">Free Rescheduling</p>
                                            <p className="text-[11px] text-gray-500 leading-tight">Request change up to 72 hours before departure.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0 text-sm" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-700">What's Included</p>
                                            <p className="text-[11px] text-gray-500 leading-tight">Transportation, English Guide, Entrance Fees, Lunch.</p>
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

export default BookingTour;