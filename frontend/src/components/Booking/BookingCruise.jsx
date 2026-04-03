import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import {
    createBookingApi,
    createOnePayPayment,
    getSystemStatusApi
} from "../../api/client/api"; // Unified imports
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { isValidPhoneNumber } from 'react-phone-number-input';
import dayjs from "dayjs";

import AntdPhoneInput from "./AntdPhoneInput";
import {
    FaInfoCircle, FaClock, FaMapMarkerAlt, FaCreditCard, FaUser, FaShip,
    FaUsers, FaAnchor, FaSpinner, FaArrowRight, FaTag, FaUniversity,
    FaBed, FaWater, FaExclamationTriangle
} from "react-icons/fa";
import { calculateBookingCruisePriceApi } from "../../api/client/service.api.js";

const BookingCruise = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // --- REDUX & SYSTEM STATE ---
    const stateUser = useSelector((state) => state.UserReducer);
    const systemStore = useSelector(state => state.SystemReducer) || {};

    const allowCredit = systemStore.credit ?? true;
    const allowTransfer = systemStore.transfer ?? true;

    // --- LOCAL STATE ---
    const [data] = useState(location.state || null);

    // Initial Calculation Data
    const selectedCabin = data?.cruise?.selectedCabin || null;
    const selectedCurrency = data?.selectedCurrency || "VND";
    const exchangeRateApplied = data?.exchangeRateApplied || 1;
    const initTotal = data?.totalPriceVND || 0;
    const initGuests = data?.guests || 1;
    const initUnitPrice = initGuests > 0 ? (initTotal / initGuests) : 0;

    // Pricing State
    const [priceData, setPriceData] = useState({
        originalPrice: initTotal,
        finalPrice: initTotal,
        discountAmount: 0,
        unitPrice: initUnitPrice,
        guests: initGuests,
        processingFee: 0,
        feePercent: 0,
        couponMessage: "",
        note: ""
    });

    // Form States (Lazy Init from Redux)
    const [request, setRequest] = useState("");
    const [isGuest, setIsGuest] = useState(true);
    const [name, setName] = useState(stateUser?.user?.username || "");
    const [email, setEmail] = useState(stateUser?.user?.email || "");
    const [phoneNumber, setPhoneNumber] = useState(stateUser?.user?.phoneNumber || "");
    const [nameGuest, setNameGuest] = useState("");
    const [couponCode, setCouponCode] = useState("");

    // Payment & UI States
    const [paymentMethod, setPaymentMethod] = useState(() => {
        if (allowCredit) return "card";
        if (allowTransfer) return "transfer";
        return "";
    });

    const [disableButton, setDisableButton] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isSystemLoading, setIsSystemLoading] = useState(true);

    // --- 1. SYSTEM STATUS SYNC ---
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

    // --- 2. PAYMENT AUTO-SWITCH ---
    useEffect(() => {
        if (isSystemLoading) return;
        if (paymentMethod === 'card' && !allowCredit) {
            setPaymentMethod(allowTransfer ? 'transfer' : '');
        } else if (paymentMethod === 'transfer' && !allowTransfer) {
            setPaymentMethod(allowCredit ? 'card' : '');
        } else if (!paymentMethod) {
            if (allowCredit) setPaymentMethod('card');
            else if (allowTransfer) setPaymentMethod('transfer');
        }
    }, [allowCredit, allowTransfer, paymentMethod, isSystemLoading]);

    // --- 3. SECURITY REDIRECT ---
    useEffect(() => {
        if (!data || !data.cruise) {
            toast.error("Please select a cruise trip first.");
            navigate("/cruise", { replace: true });
        }
    }, [data, navigate]);

    // --- 4. DATA SYNC (Optimized) ---
    // Only updates if Redux loads later than mount, respects user input
    useEffect(() => {
        if (stateUser?.user) {
            setName(prev => prev || stateUser.user.username || "");
            setEmail(prev => prev || stateUser.user.email || "");
            setPhoneNumber(prev => prev || stateUser.user.phoneNumber || "");
        }
    }, [stateUser]);

    // --- 5. PRICE CALCULATION ---
    const fetchCalculatedPrice = useCallback(async (currentData, currentCoupon = "", currentPaymentMethod = "card") => {
        if (!currentData?.cruise?._id) return;
        if (!currentPaymentMethod) return;

        try {
            const payload = {
                cruiseId: currentData.cruise._id,
                cabinId: currentData.cruise.selectedCabin?._id,
                checkIn: currentData.checkIn,
                checkOut: currentData.checkOut,
                guests: currentData.guests,
                couponCode: currentCoupon,
                paymentMethod: currentPaymentMethod,
                currency: currentData.selectedCurrency
            };

            const res = await calculateBookingCruisePriceApi(payload);

            if (res && res.success) {
                const apiData = res.data;
                setPriceData({
                    originalPrice: apiData.originalPrice,
                    finalPrice: apiData.finalPrice,
                    discountAmount: apiData.discountAmount || 0,
                    unitPrice: apiData.unitPrice,
                    guests: apiData.guests,
                    processingFee: apiData.processingFee || 0,
                    feePercent: apiData.feePercent || 0,
                    couponMessage: apiData.couponMessage,
                    note: apiData.note
                });
            } else {
                throw new Error(res?.message || "Price calculation failed");
            }
        } catch (error) {
            console.error("Calc Error:", error);
            if (currentCoupon) {
                toast.error(error.message || "Invalid coupon code");
                // Don't reset coupon code here, let user correct it
            }
        }
    }, []);

    // Trigger calc when payment method changes (for fees)
    useEffect(() => {
        if (data && paymentMethod) {
            fetchCalculatedPrice(data, couponCode, paymentMethod);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, paymentMethod, fetchCalculatedPrice]);

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) return toast.error("Please enter a coupon code");
        if (!paymentMethod) return toast.error("Please select a payment method first");

        const toastId = toast.loading("Checking...");
        fetchCalculatedPrice(data, couponCode, paymentMethod)
            .then(() => toast.success("Price updated!", { id: toastId }))
            .catch(() => toast.dismiss(toastId));
    };

    const handleSubmitBooking = async () => {
        if (!paymentMethod) return toast.error("Please select a payment method");
        if (paymentMethod === 'card' && !allowCredit) return toast.error("Credit card payment is disabled.");
        if (paymentMethod === 'transfer' && !allowTransfer) return toast.error("Bank transfer is disabled.");

        if (!name?.trim()) return toast.error("Please enter contact name");
        if (!email?.trim().includes("@")) return toast.error("Invalid email");
        if (!isValidPhoneNumber(phoneNumber)) return toast.error("Invalid phone number");
        if (!isGuest && !nameGuest?.trim()) return toast.error("Please enter guest name");

        setDisableButton(true);
        const toastId = toast.loading("Creating booking...");

        try {
            const bookingPayload = {
                name,
                email,
                phoneNumber,
                isGuest,
                userId: stateUser?.user?._id || null,
                nameGuest: isGuest ? undefined : nameGuest,
                request,
                paymentMethod,
                couponCode: couponCode ? couponCode.toUpperCase() : "",
                bookingType: "CRUISE",
                cruise: data?.cruise?._id,
                cabinId: selectedCabin?._id,
                checkIn: data?.checkIn,
                checkOut: data?.checkOut,
                guests: data?.guests || 1,
            };

            const res = await createBookingApi(bookingPayload);

            if (res.success && res.data?._id) {
                const bookingId = res.data._id;

                if (paymentMethod === 'card') {
                    toast.loading("Redirecting to OnePay...", { id: toastId });
                    setIsRedirecting(true);
                    const paymentRes = await createOnePayPayment(bookingId, 'cruise');
                    if (paymentRes.success && paymentRes.data?.paymentUrl) {
                        window.location.href = paymentRes.data.paymentUrl;
                    } else {
                        setIsRedirecting(false);
                        setDisableButton(false);
                        toast.error(paymentRes.message || "Payment initialization failed", { id: toastId });
                        navigate(`/order-cruise/${bookingId}`);
                    }
                } else {
                    toast.success("Booking Successful!", { id: toastId });
                    navigate(`/order-cruise/${bookingId}`);
                }
            } else {
                throw new Error(res?.message || 'Booking failed');
            }
        } catch (err) {
            setDisableButton(false);
            setIsRedirecting(false);
            toast.error(err.message || 'System error', { id: toastId });
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
    };

    if (!data) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

    const checkInDate = dayjs(data.checkIn);
    const checkOutDate = dayjs(data.checkOut);
    const cruiseDuration = data.cruise?.duration || 1;
    const isSystemDown = !allowCredit && !allowTransfer;

    return (
        <div className="max-w-10/12 mx-auto px-4 md:px-10">
            {isRedirecting && (
                <div className="fixed inset-0 bg-white/80 z-[9999] flex flex-col items-center justify-center backdrop-blur-sm">
                    <FaSpinner className="animate-spin text-5xl text-orange-600 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Redirecting to OnePay...</h2>
                    <p className="text-gray-500">Please do not close this window.</p>
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Confirm Cruise Booking</h1>
                <p className="text-gray-500 text-lg">Please review your trip details before payment.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FaUser className="text-blue-600" /> Contact Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                                <div className="relative">
                                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                                <div className="relative">
                                    <FaCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="email@example.com" />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
                                <AntdPhoneInput value={phoneNumber} onChange={setPhoneNumber} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <input type="checkbox" id="isGuest" checked={!isGuest} onChange={(e) => setIsGuest(!e.target.checked)} className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                            <label htmlFor="isGuest" className="text-sm text-gray-700 font-medium select-none cursor-pointer">I am booking for someone else</label>
                        </div>
                        {!isGuest && (
                            <div className="mt-3">
                                <label className="text-sm font-medium text-gray-600">Guest Name</label>
                                <div className="relative">
                                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" value={nameGuest} onChange={(e) => setNameGuest(e.target.value)} placeholder="Enter guest's full name" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
                                </div>
                            </div>
                        )}
                        <div className="mt-4">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Special Requests</label>
                            <textarea rows={2} value={request} onChange={(e) => setRequest(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Dietary requirements, anniversary, etc." />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">Payment Method</h2>

                        {isSystemLoading ? (
                            <div className="p-4 flex items-center justify-center text-gray-500 gap-2 bg-gray-50 rounded-xl">
                                <FaSpinner className="animate-spin" /> Verifying payment options...
                            </div>
                        ) : (
                            <>
                                {isSystemDown && (
                                    <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3 mb-4">
                                        <FaExclamationTriangle />
                                        <span className="font-medium">Online booking is temporarily unavailable. Please try again later.</span>
                                    </div>
                                )}
                                <div className="flex flex-col gap-4">
                                    {allowCredit && (
                                        <label className={`relative flex items-start p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 hover:border-orange-300'}`} onClick={() => setPaymentMethod('card')}>
                                            <input type="radio" name="payment-method" value="card" checked={paymentMethod === 'card'} onChange={() => { }} className="mt-1 h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500" />
                                            <div className="ml-3 w-full">
                                                <span className="block text-base font-bold text-gray-900 flex items-center gap-2"><FaCreditCard className="text-orange-500" /> Pay by Credit Card (OnePay)</span>
                                                <span className="block text-gray-500 mt-1 text-sm">
                                                    Instant payment via Visa/Master/ATM.
                                                    {paymentMethod === 'card' && priceData.feePercent > 0 && (
                                                        <span className="text-orange-600 ml-1">({priceData.feePercent}% processing fee applies)</span>
                                                    )}
                                                </span>
                                            </div>
                                        </label>
                                    )}
                                    {allowTransfer && (
                                        <label className={`relative flex items-start p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'transfer' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 hover:border-orange-300'}`} onClick={() => setPaymentMethod('transfer')}>
                                            <input type="radio" name="payment-method" value="transfer" checked={paymentMethod === 'transfer'} onChange={() => { }} className="mt-1 h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500" />
                                            <div className="ml-3 w-full">
                                                <span className="block text-base font-bold text-gray-900 flex items-center gap-2"><FaUniversity className="text-blue-600" /> Bank Transfer</span>
                                                <span className="block text-gray-500 mt-1 text-sm">Hold booking and pay later via manual transfer.</span>
                                            </div>
                                        </label>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">Payment Details</h2>
                        <div className="mb-6 pt-4 border-t border-gray-100">
                            <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2"><FaTag className="text-orange-500" /> Coupon Code</label>
                            <div className="flex gap-2 flex-col sm:flex-row">
                                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter code" disabled={isSystemDown} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none uppercase disabled:bg-gray-100" />
                                <button onClick={handleApplyCoupon} disabled={isSystemDown} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400">Apply</button>
                            </div>
                            {priceData.couponMessage && <p className="text-emerald-600 text-sm mt-2 font-medium">{priceData.couponMessage}</p>}
                        </div>

                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <div className="flex justify-between text-gray-600"><span>Cruise Fare ({priceData.guests} guests)</span><span>{formatCurrency(priceData.originalPrice)}</span></div>
                            {priceData.discountAmount > 0 && (<div className="flex justify-between text-emerald-600 font-medium"><span>Discount</span><span>- {formatCurrency(priceData.discountAmount)}</span></div>)}
                            {priceData.processingFee > 0 && (<div className="flex justify-between text-gray-600 text-sm"><span>Processing Fee ({priceData.feePercent}%)</span><span>+ {formatCurrency(priceData.processingFee)}</span></div>)}
                            <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
                                <span className="text-lg font-bold text-gray-900">Total Payment</span>
                                <div className="text-right">
                                    <span className="block text-2xl font-extrabold text-orange-600">{formatCurrency(priceData.finalPrice)}</span>
                                    {selectedCurrency !== "VND" && (<span className="text-xs text-gray-400">(Exchange Rate: {selectedCurrency} 1 = {exchangeRateApplied} VND)</span>)}
                                </div>
                            </div>
                        </div>

                        <button disabled={disableButton || isSystemDown} onClick={handleSubmitBooking} className={`w-full mt-6 py-3.5 rounded-xl font-bold text-lg text-white shadow-lg transition-all flex items-center justify-center gap-2 ${(disableButton || isSystemDown) ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 hover:shadow-orange-500/30'}`}>
                            {disableButton ? <><FaSpinner className="animate-spin" /> Processing...</> : <>{paymentMethod === 'card' ? "Pay Now" : "Confirm Booking"} <FaArrowRight size={16} /></>}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden lg:sticky top-24">
                        <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                            {selectedCabin?.photos && selectedCabin.photos.length > 0 ? (<img src={selectedCabin.photos[0]} alt="Cabin" className="w-full h-full object-cover" />) : (data.cruise?.photos && data.cruise.photos.length > 0 ? (<img src={data.cruise.photos[0]} alt="Cruise" className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center text-gray-400 bg-slate-100"><FaShip size={64} /></div>))}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4"><h3 className="text-white text-xl font-bold line-clamp-1">{data.cruise?.title}</h3><p className="text-white/80 text-sm">{data.cruise?.cruiseType}</p></div>
                        </div>
                        <div className="p-6">
                            {selectedCabin && (<div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl"><h4 className="text-sm font-bold text-blue-800 uppercase mb-2 flex items-center gap-2"><FaBed /> Selected Cabin</h4><div className="text-gray-900 font-bold text-lg">{selectedCabin.name}</div><div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-2">{selectedCabin.viewType && (<span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded shadow-sm text-xs"><FaWater className="text-blue-400" /> {selectedCabin.viewType}</span>)}</div></div>)}
                            <div className="mb-6"><div className="flex items-center gap-2 text-sm text-gray-500 mb-2"><FaMapMarkerAlt className="text-orange-500" /><span>{data.cruise?.city}</span></div><h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">Trip Overview</h3><p className="text-sm text-gray-500"><FaAnchor className="inline mr-1 text-blue-500" />Duration: {cruiseDuration} Days</p></div>
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-6 relative">
                                <div className="absolute left-[29px] top-8 bottom-8 w-[2px] bg-gray-300 border-l border-dashed border-gray-400"></div>
                                <div className="relative pl-8 mb-6"><div className="absolute left-[21px] top-1.5 w-4 h-4 bg-white border-4 border-indigo-500 rounded-full z-10"></div><div className={"ml-3"}><p className="font-bold text-gray-800 text-lg">{checkInDate.format("DD MMM")}</p><p className="text-xs text-gray-500 font-medium uppercase mb-1">Check In</p><p className="text-sm text-gray-700">{data.cruise?.city} Port</p></div></div>
                                <div className="relative pl-8"><div className="absolute left-[21px] top-1.5 w-4 h-4 bg-indigo-500 rounded-full z-10 border-4 border-indigo-100"></div><div className={"ml-3"}><p className="font-bold text-gray-800 text-lg">{checkOutDate.format("DD MMM")}</p><p className="text-xs text-gray-500 font-medium uppercase mb-1">Check Out</p><p className="text-sm text-gray-700">{data.cruise?.city} Port</p></div></div>
                            </div>
                            <div className="pt-4 border-t border-gray-200"><div className="flex justify-between items-center mb-1"><div className="flex items-center gap-2"><FaUsers className="text-gray-400" /><span className="text-xs text-gray-500 font-bold uppercase">Guests</span></div><div className="text-right"><p className="font-bold text-gray-800 text-lg">{priceData.guests}</p></div></div></div>
                            <div className="mt-6 pt-6 border-t border-gray-200"><h4 className="text-sm font-bold text-gray-900 uppercase mb-3">Cruise Policies</h4><div className="space-y-3"><div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg"><FaInfoCircle className="text-gray-500 mt-1 flex-shrink-0" /><div><p className="text-xs font-bold text-gray-700">Documents</p><p className="text-xs text-gray-500 mt-1">Passport/ID required for all guests.</p></div></div><div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg"><FaClock className="text-blue-500 mt-1 flex-shrink-0" /><div><p className="text-xs font-bold text-gray-700">Check-in</p><p className="text-xs text-gray-500 mt-1">Boarding closes 1 hour before departure.</p></div></div></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingCruise;