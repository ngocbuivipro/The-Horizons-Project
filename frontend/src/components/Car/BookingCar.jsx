import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Toaster, toast } from "react-hot-toast";
import dayjs from "dayjs";

// Icons
import {
    FaUser, FaCheckCircle, FaInfoCircle,
    FaPlus, FaCreditCard, FaUniversity, FaTag,
    FaSpinner, FaExclamationTriangle, FaArrowRight,
    FaCalendarAlt
} from 'react-icons/fa';
import { MdOutlineRadioButtonUnchecked, MdOutlineRadioButtonChecked } from 'react-icons/md';

// API Imports
import {
    getCarDetailApi,
    calculateBookingCarPriceApi
} from "../../api/client/car.api.js";
import {
    createBookingApi,
    createOnePayPayment,
    getSystemStatusApi
} from "../../api/client/api";
import {
    BACKEND_TRANSFER_TYPE,
    URL_SERVICE_TYPE
} from "../../constants/car.constants.js";
import AntdPhoneInput from "../Booking/AntdPhoneInput.jsx";
import { isValidPhoneNumber } from "react-phone-number-input";
import { BOOKING_TYPE } from "../../constants/booking.constants.js";

const BookingCar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    //  GET URL PARAMS ---
    const carId = searchParams.get('carId');
    const serviceType = searchParams.get("serviceType") || URL_SERVICE_TYPE.TRANSFERS;
    const fromLocation = searchParams.get("from");
    const toLocation = searchParams.get("to");
    const dateStr = searchParams.get("date");
    const timeStr = searchParams.get("time");
    const passengers = parseInt(searchParams.get("pax") || searchParams.get("passengers") || 1);
    const duration = parseInt(searchParams.get("duration") || 0); // For hourly service

    const backendTransferType = serviceType === URL_SERVICE_TYPE.HOURLY ? BACKEND_TRANSFER_TYPE.HOURLY : BACKEND_TRANSFER_TYPE.ONE_WAY;

    // REDUX & SYSTEM STATE ---
    const stateUser = useSelector((state) => state.UserReducer);
    const systemStore = useSelector(state => state.SystemReducer) || {};
    const allowCredit = systemStore.credit ?? true;
    const allowTransfer = systemStore.transfer ?? true;

    // OCAL STATE ---
    const [carDetails, setCarDetails] = useState(null);
    const [loadingCar, setLoadingCar] = useState(true);
    const [specialReqOpen, setSpecialReqOpen] = useState(false);

    // Form Data
    const [name, setName] = useState(stateUser?.user?.username || "");
    const [email, setEmail] = useState(stateUser?.user?.email || "");
    const [phoneNumber, setPhoneNumber] = useState(stateUser?.user?.phoneNumber || "");
    const [request, setRequest] = useState("");
    const [couponCode, setCouponCode] = useState("");


    const [priceData, setPriceData] = useState({
        originalPrice: 0,
        finalPrice: 0,
        discountAmount: 0,
        processingFee: 0,
        feePercent: 0,
        couponMessage: "",
        note: "",
        currency: "VND"
    });

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [disableButton, setDisableButton] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isSystemLoading, setIsSystemLoading] = useState(true);

    // -SYSTEM STATUS CHECK ---
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

    // PAYMENT METHOD AUTO-SWITCH ---
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

    const calculatePrice = useCallback(async (currentCarId, coupon, method) => {
        try {
            const payload = {
                carId: currentCarId,
                transferType: backendTransferType,
                origin: fromLocation,
                destination: backendTransferType === BACKEND_TRANSFER_TYPE.ONE_WAY ? toLocation : undefined,
                duration: backendTransferType === BACKEND_TRANSFER_TYPE.HOURLY ? duration : undefined,
                couponCode: coupon,
                paymentMethod: method
            };

            const res = await calculateBookingCarPriceApi(payload);
            const data = res.data; // Axios response wrapper

            if (data && res.success) {
                setPriceData({
                    originalPrice: data.originalPrice,
                    finalPrice: data.finalPrice,
                    discountAmount: data.discountAmount || 0,
                    processingFee: data.processingFee || 0,
                    feePercent: data.feePercent || 0,
                    couponMessage: data.couponMessage || "",
                    note: data.note || "",
                    currency: data.currency || "ND"
                });
            } else {
                if (coupon) {
                    toast.error(res.message || "Invalid coupon");
                }
            }
        } catch (error) {
            console.error("Price Calc Error", error);
        }
    }, [backendTransferType, fromLocation, toLocation, duration]);

    useEffect(() => {
        const initData = async () => {
            if (!carId) {
                toast.error("No vehicle selected");
                navigate("/transfers");
                return;
            }

            setLoadingCar(true);
            try {
                // A. Fetch Car Info
                const carRes = await getCarDetailApi(carId);
                if (carRes.data) {
                    const carData = carRes.data;
                    setCarDetails(carData);

                    await calculatePrice(carData.id || carData._id, "", paymentMethod);
                } else {
                    throw new Error("Vehicle not found");
                }
            } catch (error) {
                console.error("Init Error:", error);
                toast.error("Failed to load booking details");
                navigate("/transfers");
            } finally {
                setLoadingCar(false);
            }
        };

        initData();
    }, [carId]);


    useEffect(() => {
        if (carDetails) {
            calculatePrice(carDetails.id || carDetails._id, couponCode, paymentMethod);
        }
    }, [paymentMethod]);


    const handleApplyCoupon = () => {
        if (!couponCode.trim()) return toast.error("Please enter a coupon code");
        if (!carId) return;

        const toastId = toast.loading("Checking...");
        calculatePrice(carId, couponCode, paymentMethod)
            .then(() => toast.success("Price updated!", { id: toastId }))
            .catch(() => toast.dismiss(toastId));
    };

    const handleSubmitBooking = async () => {
        // 1. Validation cơ bản ở Frontend
        if (!paymentMethod) return toast.error("Please select a payment method");
        if (!name?.trim()) return toast.error("Please enter contact name");
        if (!email?.trim().includes("@")) return toast.error("Invalid email");
        if (!isValidPhoneNumber(phoneNumber)) return toast.error("Invalid phone number"); // Uncomment nếu cần

        setDisableButton(true);
        const toastId = toast.loading("Creating booking...");

        try {
            const bookingPayload = {
                name: name,
                email: email,
                phoneNumber: phoneNumber,
                userId: stateUser?.user?._id || null,
                paymentMethod: paymentMethod,
                request: request, // Ghi chú/Special request
                couponCode: couponCode ? couponCode.toUpperCase() : "",
                bookingType: BOOKING_TYPE.CAR,

                carId: carId,
                transferType: backendTransferType,
                origin: fromLocation,
                destination: toLocation,
                passengers: passengers,
                duration: duration,

                date: dateStr,
                time: timeStr,
                // Mẹo: Nên gửi thêm 1 trường checkIn chuẩn ISO nếu backend cần sort
                checkIn: dayjs(`${dateStr} ${timeStr}`).toISOString()
            };

            const res = await createBookingApi(bookingPayload);

            if (res.success && res.data?._id) {
                const bookingId = res.data._id;

                if (paymentMethod === 'card') {
                    toast.loading("Redirecting to OnePay...", { id: toastId });
                    setIsRedirecting(true);

                    // Gọi API tạo URL thanh toán
                    const paymentRes = await createOnePayPayment(bookingId, 'car');

                    if (paymentRes.success && paymentRes.data?.paymentUrl) {
                        window.location.href = paymentRes.data.paymentUrl;
                    } else {
                        setIsRedirecting(false);
                        setDisableButton(false);
                        throw new Error(paymentRes.message || "Payment initialization failed");
                    }
                } else {
                    // Thanh toán sau (Bank Transfer / Cash)
                    toast.success("Booking Confirmed!", { id: toastId });
                    navigate(`/order-car/${bookingId}`);
                }
            } else {
                throw new Error(res?.message || 'Booking failed');
            }
        } catch (err) {
            setDisableButton(false);
            setIsRedirecting(false);
            console.error("Booking Error:", err);
            toast.error(err.message || 'System error', { id: toastId });

            if (err.bookingId || (err.response?.data?.data?._id)) {
                const failedId = err.bookingId || err.response.data.data._id;
                navigate(`/order-car/${failedId}`);
            }
        }
    };
    const goToStep1 = () => {
        navigate({
            pathname: "/transfers/select",
            search: `?${searchParams.toString()}`
        });
    }

    const formatPrice = (amount) => {
        return `${amount} VND`;
    };

    if (loadingCar || !carDetails) {
        return (
            <div className="flex justify-center items-center h-80 bg-white rounded-2xl border border-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
        );
    }

    const isSystemDown = !allowCredit && !allowTransfer;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
            <Toaster position="top-center" />

            {/* Redirect Overlay */}
            {isRedirecting && (
                <div className="fixed inset-0 bg-white/90 z-[9999] flex flex-col items-center justify-center backdrop-blur-sm">
                    <FaSpinner className="animate-spin text-5xl text-blue-600 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800">Redirecting to Payment Gateway...</h2>
                    <p className="text-slate-500">Please do not close this window.</p>
                </div>
            )}

            {/* --- STEPPER HEADER --- */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-10/12 mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex-1 flex justify-center items-center gap-2 md:gap-8 text-[10px] md:text-xs font-bold tracking-widest uppercase">
                        <div onClick={goToStep1} className="flex flex-col items-center gap-1 text-slate-400 cursor-pointer hover:text-blue-500 transition-colors">
                            <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center font-bold text-xs">1</div>
                            <span className="hidden md:block mt-1">Select ride</span>
                        </div>
                        <div className="w-16 h-[1px] bg-slate-200"></div>
                        <div className="flex flex-col items-center gap-1 text-blue-500 relative group cursor-default">
                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-200">2</div>
                            <span className="hidden md:block mt-1">Payment</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-8/12 mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Details & payment</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* --- LEFT COLUMN: FORMS --- */}
                    <div className="flex-1 space-y-6">

                        {/* Contact Information */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <FaUser className="text-blue-500" /> Contact information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="md:col-span-2">
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. John Doe"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@example.com"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
                                    <AntdPhoneInput value={phoneNumber} onChange={setPhoneNumber} />
                                </div>
                            </div>
                        </div>

                        {/* Special Requirements */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <button
                                onClick={() => setSpecialReqOpen(!specialReqOpen)}
                                className="w-full p-6 flex justify-between items-center text-left hover:bg-slate-50 transition"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-400"><FaInfoCircle /></span>
                                    <span className="font-medium text-slate-700">I have special requirements</span>
                                </div>
                                <FaPlus className={`text-slate-400 transition-transform ${specialReqOpen ? 'rotate-45' : ''}`} />
                            </button>
                            {specialReqOpen && (
                                <div className="p-6 border-t border-slate-100 animate-fadeIn">
                                    <textarea
                                        rows={3}
                                        value={request}
                                        onChange={(e) => setRequest(e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-sky-500 outline-none"
                                        placeholder="Note for driver (e.g. Baby seat needed, Large luggage...)"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Route Details (Read Only) */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Route Details</h2>
                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-900"></div>
                                    <input type="text" value={fromLocation} readOnly className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 font-medium cursor-not-allowed" />
                                </div>
                                {backendTransferType === BACKEND_TRANSFER_TYPE.ONE_WAY && (
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sky-500"></div>
                                        <input type="text" value={toLocation} readOnly className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 font-medium cursor-not-allowed" />
                                    </div>
                                )}
                                {backendTransferType === BACKEND_TRANSFER_TYPE.HOURLY && (
                                    <div className="flex gap-2">
                                        <span className="px-3 py-2 bg-slate-100 rounded text-sm font-bold text-slate-600">Duration: {duration} Hours</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Payment method</h2>

                            {isSystemLoading ? (
                                <div className="p-4 flex items-center justify-center text-slate-500 gap-2 bg-slate-50 rounded-xl">
                                    <FaSpinner className="animate-spin" /> Verifying payment options...
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* System Down Alert */}
                                    {isSystemDown && (
                                        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3 mb-4">
                                            <FaExclamationTriangle />
                                            <span className="font-medium">Online booking is temporarily unavailable.</span>
                                        </div>
                                    )}

                                    {/* Credit Card Option */}
                                    {allowCredit && (
                                        <div
                                            onClick={() => setPaymentMethod('card')}
                                            className={`border rounded-xl transition-all cursor-pointer ${paymentMethod === 'card' ? 'border-sky-500 ring-1 ring-sky-500 bg-sky-50/20' : 'border-slate-200 hover:border-sky-300'}`}
                                        >
                                            <div className="flex items-center p-4">
                                                <div className={`mr-4 ${paymentMethod === 'card' ? 'text-sky-500' : 'text-slate-300'}`}>
                                                    {paymentMethod === 'card' ? <MdOutlineRadioButtonChecked size={24} /> : <MdOutlineRadioButtonUnchecked size={24} />}
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-bold text-slate-900 flex items-center gap-2"><FaCreditCard className="text-sky-500" /> Credit/Debit Card (OnePay)</span>
                                                    <span className="block text-slate-500 text-xs mt-1">Instant confirmation. Visa/Master/JCB/ATM.</span>
                                                </div>
                                                {priceData.feePercent > 0 && paymentMethod === 'card' && (
                                                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">+{priceData.feePercent}% Fee</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Transfer Option */}
                                    {allowTransfer && (
                                        <div
                                            onClick={() => setPaymentMethod('transfer')}
                                            className={`border rounded-xl transition-all cursor-pointer ${paymentMethod === 'transfer' ? 'border-sky-500 ring-1 ring-sky-500 bg-sky-50/20' : 'border-slate-200 hover:border-sky-300'}`}
                                        >
                                            <div className="flex items-center p-4">
                                                <div className={`mr-4 ${paymentMethod === 'transfer' ? 'text-sky-500' : 'text-slate-300'}`}>
                                                    {paymentMethod === 'transfer' ? <MdOutlineRadioButtonChecked size={24} /> : <MdOutlineRadioButtonUnchecked size={24} />}
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-bold text-slate-900 flex items-center gap-2"><FaUniversity className="text-sky-600" /> Bank Transfer</span>
                                                    <span className="block text-slate-500 text-xs mt-1">Pay manually after booking. Confirmation upon receipt.</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Coupon Code Section */}
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <label className="text-sm font-bold text-slate-700 mb-2 block flex items-center gap-2"><FaTag className="text-orange-500" /> Coupon Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="Enter code"
                                        disabled={isSystemDown}
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none uppercase disabled:bg-slate-100"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={isSystemDown}
                                        className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-900 transition-colors disabled:bg-slate-400"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {priceData.couponMessage && <p className="text-emerald-600 text-xs mt-2 font-bold flex items-center gap-1"><FaCheckCircle /> {priceData.couponMessage}</p>}
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: ITINERARY SUMMARY --- */}
                    <div className="lg:w-[380px] shrink-0">
                        <div className="bg-white rounded-xl shadow-lg border border-slate-100 sticky top-24 p-6">

                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Itinerary</h2>
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="text-slate-500"><FaCalendarAlt /></span>
                                <span className="font-bold text-slate-800">
                                    {dateStr ? dayjs(dateStr).format('ddd, MMM D, YYYY') : 'N/A'}
                                </span>
                            </div>

                            {/* Timeline Route */}
                            <div className="mb-6">
                                <div className="relative pl-6 border-l-2 border-dotted border-slate-300 space-y-10 ml-2 py-1">
                                    {/* Pickup */}
                                    <div className="relative">
                                        <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full bg-black ring-4 ring-white"></div>
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-900 text-md leading-tight w-2/3">{fromLocation}</h4>
                                            <span className="text-xs text-slate-500 font-medium">{timeStr}</span>
                                        </div>
                                    </div>
                                    {/* Dropoff or Duration */}
                                    <div className="relative">
                                        <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white"></div>
                                        <div className="flex justify-between items-start">
                                            {backendTransferType === BACKEND_TRANSFER_TYPE.ONE_WAY ? (
                                                <h4 className="font-bold text-slate-900 text-md leading-tight w-2/3">{toLocation}</h4>
                                            ) : (
                                                <h4 className="font-bold text-slate-900 text-md leading-tight w-2/3">Hourly Rental ({duration}h)</h4>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Selection */}
                            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">SELECTED VEHICLE</p>
                                <div className="flex justify-between items-center gap-2">
                                    <div>
                                        <h4 className="font-bold text-slate-900">{carDetails.name}</h4>
                                        <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase font-bold">{carDetails.type}</span>
                                    </div>
                                    <img src={carDetails.image} alt="Car" className="w-16 h-12 object-contain mix-blend-multiply" />
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <span className="text-xs text-slate-500 flex items-center gap-1"><FaUser /> {passengers} Pax</span>
                                </div>
                            </div>

                            {/* Pricing Detail */}
                            <div className="border-t border-slate-100 pt-4 mb-4 space-y-2">
                                <div className="flex justify-between text-slate-500 text-sm">
                                    <span>Original Price</span>
                                    <span>{formatPrice(priceData.originalPrice)}</span>
                                </div>

                                {priceData.discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-600 text-sm font-medium">
                                        <span>Discount</span>
                                        <span>- {formatPrice(priceData.discountAmount)}</span>
                                    </div>
                                )}

                                {priceData.processingFee > 0 && (
                                    <div className="flex justify-between text-slate-500 text-sm">
                                        <span>Processing Fee ({priceData.feePercent}%)</span>
                                        <span>+ {formatPrice(priceData.processingFee)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-end pt-2 border-t border-slate-100 mt-2">
                                    <span className="text-lg font-bold text-slate-900">Total</span>
                                    <span className="text-3xl font-black text-slate-900">{formatPrice(priceData.finalPrice)}</span>
                                </div>
                            </div>

                            {/* Cancellation Info Box */}
                            <div className="border border-green-200 bg-green-50 rounded-lg p-3 flex gap-3 mb-6">
                                <div className="mt-1 shrink-0 bg-white rounded-full border border-green-500 w-4 h-4 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                    Free cancellation up to 24 hours before your pickup time.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                disabled={disableButton || isSystemDown}
                                onClick={handleSubmitBooking}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2
                                    ${(disableButton || isSystemDown) ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}
                                `}
                            >
                                {disableButton ? <><FaSpinner className="animate-spin" /> Processing...</> : <>{paymentMethod === 'card' ? "Pay Now" : "Confirm Booking"} <FaArrowRight /></>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingCar;