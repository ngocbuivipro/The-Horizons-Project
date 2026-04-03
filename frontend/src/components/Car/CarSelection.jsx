import  { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, createSearchParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import dayjs from "dayjs";
import {
    FaUser,
    FaSuitcase,
    FaCheckCircle,
    FaArrowLeft,
    FaCalendarAlt
} from 'react-icons/fa';
import { searchCarApi } from "../../api/client/car.api.js";
import CarItem from "./CarItem.jsx";
import {
    BACKEND_TRANSFER_TYPE,
    URL_TRIP_TYPE
} from "../../constants/car.constants.js";

const CarSelection = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // --- STATE ---
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCarId, setSelectedCarId] = useState(null);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchCars = async () => {
            setLoading(true);
            try {
                // Construct params from URL Search Params
                const queryParams = {
                    type: searchParams.get("tripType") === URL_TRIP_TYPE.ONE_WAY ? BACKEND_TRANSFER_TYPE.ONE_WAY : BACKEND_TRANSFER_TYPE.RETURN,
                    from: searchParams.get("from"),
                    to: searchParams.get("to"),
                    date: searchParams.get("date"),
                    time: searchParams.get("time"),
                    passengers: searchParams.get("pax") || searchParams.get("passengers"), // Handle key variation
                };

                const response = await searchCarApi(queryParams);
                const payload = response.data;

                if (payload ) {
                    setCars(payload || []);
                    // Default select the first car if available
                    if (payload) {
                        setSelectedCarId(response?.data[0]?._id);
                    }
                } else {
                    toast.error(payload?.message || "Failed to load vehicle options");
                }
            } catch (error) {
                console.error("Error fetching cars:", error);
                toast.error("An error occurred while loading vehicles.");
            } finally {
                setLoading(false);
            }
        };

        fetchCars();
    }, [searchParams]);

    // Derived state for summary
    const selectedCar = cars.find(c => c.id === selectedCarId);

    const handleSelectCar = (id) => {
        setSelectedCarId(prevId => {
            // Nếu ID click vào trùng với ID đang chọn -> Bỏ chọn (return null)
            if (prevId === id) return null;
            // Ngược lại -> Chọn xe mới
            return id;
        });
    };

    // --- HANDLERS ---
    const handleNext = () => {
        if (!selectedCarId) {
            toast.error("Please select a vehicle");
            return;
        }

        // Append selected car ID to params
        const nextParams = createSearchParams(searchParams);
        nextParams.set('carId', selectedCarId);

        // Pass price details if needed by backend, though ID should suffice usually
        // nextParams.set('price', selectedCar.price);

        navigate({
            pathname: "/booking/transfers",
            search: `?${nextParams.toString()}`
        });
    };

    const handleBack = () => {
        navigate({
            pathname: "/transfers",
            search: `?${searchParams.toString()}`
        });
    };

    // Format display date
    const displayDate = searchParams.get("date")
        ? dayjs(searchParams.get("date")).format('ddd, MMM D')
        : 'Date not selected';

    const pickupLocation = searchParams.get("from") || "Origin";
    const dropoffLocation = searchParams.get("to") || "Destination";
    const pickupTime = searchParams.get("time") || "--:--";

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 relative">
            <Toaster position="top-center" />

            {/* --- TOP NAVIGATION BAR --- */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Stepper */}
                    <div className="flex-1 flex justify-center items-center gap-2 md:gap-8 text-[10px] md:text-xs font-bold tracking-widest uppercase">
                        {/* Step 1: Active */}
                        <div className="flex flex-col items-center gap-1 text-blue-500 relative group cursor-default">
                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-200">
                                1
                            </div>
                            <span className="hidden md:block mt-1">Select ride</span>
                        </div>
                        {/* Connector */}
                        <div className="w-16 h-[1px] bg-slate-200"></div>
                        {/* Step 2: Inactive */}
                        <div className="flex flex-col items-center gap-1 text-slate-300">
                            <div className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center font-bold text-xs">
                                2
                            </div>
                            <span className="hidden md:block mt-1">Payment</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- MAIN LAYOUT --- */}
            <div className="max-w-10/12 mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Page Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 tracking-tight">Select your ride</h1>

                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* --- LEFT COLUMN: LIST --- */}
                    <div className="flex-1 w-full space-y-6">

                        {/* Info Card */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900 mb-3">Private Transfer</h2>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge color="bg-blue-100 text-blue-700">Door-to-door</Badge>
                                <Badge color="bg-green-100 text-green-700">Driver speaks English</Badge>
                                <Badge color="bg-purple-100 text-purple-700">Sightseeing available</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                <FaCheckCircle className="text-green-500" />
                                <span>Free cancellations up to 24 hours before departure</span>
                            </div>
                        </div>

                        {/* Car Options List */}
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center items-center h-80 bg-white rounded-2xl border border-gray-100">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                                </div>
                            ) : cars.length === 0 ? (
                                <div className="bg-white rounded-xl p-12 text-center text-slate-500">
                                    <p>No vehicles found for the selected criteria.</p>
                                    <button onClick={handleBack} className="mt-4 text-blue-500 font-bold underline">Modify Search</button>
                                </div>
                            ) : (
                                cars.map((car) => (
                                    <CarItem
                                        key={car.id}
                                        car={car}
                                        isSelected={selectedCarId === car.id}
                                        onSelect={handleSelectCar}                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: SUMMARY WIDGET --- */}
                    <div className="lg:w-[360px] shrink-0 space-y-4">
                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sticky top-24">

                            {/* Summary Header */}
                            <div className="flex justify-between items-start mb-6">
                                <span className="bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    {searchParams.get("tripType") === URL_TRIP_TYPE.RETURN ? 'Round Trip' : 'One Way'}
                                </span>
                                <div className="flex items-center gap-3 text-slate-400 text-xs font-bold">
                                    <span className="flex items-center gap-1"><FaUser className="text-slate-300"/> {searchParams.get("pax") || searchParams.get("passengers") || 1}</span>
                                    {selectedCar && (
                                        <span className="flex items-center gap-1"><FaSuitcase className="text-slate-300"/> {selectedCar.capacity.luggage}</span>
                                    )}
                                </div>
                            </div>

                            {/* Date Line */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3 font-bold text-slate-800 text-sm">
                                    <FaCalendarAlt className="text-slate-900" />
                                    <span>{displayDate}</span>
                                </div>
                                <button onClick={handleBack} className="text-blue-500 text-xs font-bold hover:underline">Edit</button>
                            </div>

                            {/* Visual Timeline */}
                            <div className="relative pl-3 border-l-[2px] border-dotted border-slate-300 space-y-8 mb-8 ml-2 py-1">
                                {/* Pickup */}
                                <div className="relative">
                                    {/* Dot */}
                                    <div className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-black ring-4 ring-white"></div>
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-bold text-slate-900 text-sm w-3/4 truncate" title={pickupLocation}>{pickupLocation}</h4>
                                        <span className="text-xs text-slate-400 font-medium">{pickupTime}</span>
                                    </div>
                                </div>
                                {/* Dropoff */}
                                <div className="relative">
                                    {/* Dot (Blue for destination) */}
                                    <div className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white"></div>
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-bold text-slate-900 text-sm w-3/4 truncate" title={dropoffLocation}>{dropoffLocation}</h4>
                                        {/* You might calculate arrival time here if duration is known, otherwise hidden */}
                                    </div>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="border-t border-slate-100 pt-5 space-y-2 mb-6">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Price details</p>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Transport</span>
                                    <span className="font-medium text-slate-900">
                                        {selectedCar ? `${selectedCar.price} VND` : '--'}
                                    </span>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-lg font-bold text-slate-900">Total</span>
                                <span className="text-3xl font-black text-slate-900">
                                    {selectedCar ? `${selectedCar.price}VND` : '--'}
                                </span>
                            </div>

                            {/* Green Info Box */}
                            <div className="bg-green-50 rounded-lg p-3 flex gap-3 mb-6">
                                <FaCheckCircle className="text-green-500 text-lg shrink-0 mt-0.5" />
                                <p className="text-xs text-green-800 font-medium leading-relaxed">
                                    Free cancellation up to 24 hours before your pickup time.
                                </p>
                            </div>

                            {/* Action Button Group */}
                            <div className="mt-6 space-y-4">
                                {/* Main Button - Primary CTA */}
                                <button
                                    onClick={handleNext}
                                    disabled={!selectedCar || loading}
                                    className={`w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center ${(!selectedCar || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    Next
                                </button>

                                {/* Back Button - Secondary Action */}
                                <button
                                    onClick={handleBack}
                                    className="w-full py-2 flex items-center justify-center gap-2 text-slate-500 font-medium text-sm hover:text-slate-800 transition-colors">
                                    <FaArrowLeft className="text-xs" /> Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Badge = ({ children, color }) => (
    <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-wide ${color}`}>
        {children}
    </span>
);

export default CarSelection;