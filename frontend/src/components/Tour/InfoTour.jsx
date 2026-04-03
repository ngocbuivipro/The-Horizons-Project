import React, {useEffect, useState, useMemo, useCallback} from "react";
import {
    FaRegFlag,
    FaCircleQuestion,
    FaCircleInfo,
} from "react-icons/fa6";
import {DatePicker, Spin, Tooltip} from "antd";
import {toast} from "react-hot-toast";
import {useNavigate} from "react-router";
import dayjs from "dayjs";
import {useApi} from "../../contexts/ApiContext.jsx";
import ItinerarySection from "./ItinerarySection.jsx";
import iconMap from "../../common/data/iconMap.js";

const InfoTour = ({data}) => {
    const navigate = useNavigate();
    const api = useApi();

    // --- STATE BOOKING ---
    const [startDate, setStartDate] = useState(null);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

    // --- STATE CALCULATION ---
    const [totalPriceVND, setTotalPriceVND] = useState(0);
    const [priceBreakdown, setPriceBreakdown] = useState(null); // { unitAdult, unitChild, isSpecial }

    // --- CURRENCY ---
    const [selectedCurrency, setSelectedCurrency] = useState("VND");
    const [exchangeRates, setExchangeRates] = useState({});
    const [isLoadingRates, setIsLoadingRates] = useState(false);

    // Fetch Rates
    useEffect(() => {
        const fetchRates = async () => {
            setIsLoadingRates(true);
            try {
                const res = await api.getExchangeRate();
                if (res.success) setExchangeRates(res.data || {});
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingRates(false);
            }
        };
        fetchRates();
    }, []);

    // --- 1. CORE LOGIC: PRICE & BLOCKED DATES ---
    const {priceExtraMap, blockedSet} = useMemo(() => {
        const pMap = {};
        const bSet = new Set();

        // Blocked Dates
        data.availabilityRules?.forEach(rule => {
            if (rule.isBlocked) {
                let curr = dayjs(rule.startDate);
                const end = dayjs(rule.endDate);
                while (curr.isBefore(end) || curr.isSame(end, 'day')) {
                    bSet.add(curr.format("YYYY-MM-DD"));
                    curr = curr.add(1, 'day');
                }
            }
        });

        // Price Extra (Override base price)
        data.priceExtra?.forEach(item => {
            let curr = dayjs(item.start);
            const end = dayjs(item.end);
            while (curr.isBefore(end) || curr.isSame(end, 'day')) {
                pMap[curr.format("YYYY-MM-DD")] = item.price; // Giá mới
                curr = curr.add(1, 'day');
            }
        });

        return {priceExtraMap: pMap, blockedSet: bSet};
    }, [data]);

    // --- 2. CALCULATE TOTAL ---
    useEffect(() => {
        if (!startDate) {
            setTotalPriceVND(0);
            return;
        }

        const dateKey = startDate.format("YYYY-MM-DD");
        // Check base price vs override price
        const effectiveAdultPrice = priceExtraMap[dateKey] || data.price;

        const totalAdult = effectiveAdultPrice * adults;
        const totalChild = (data.priceChildren || 0) * children;

        setTotalPriceVND(totalAdult + totalChild);
        setPriceBreakdown({
            unitAdult: effectiveAdultPrice,
            unitChild: data.priceChildren || 0,
            isSpecial: !!priceExtraMap[dateKey]
        });

    }, [startDate, adults, children, data, priceExtraMap]);

    // --- HELPER FORMATTER ---
    const convertAndFormat = useCallback((amount) => {
        if (!amount && amount !== 0) return "0";
        if (selectedCurrency === "VND") return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(amount);

        const rate = exchangeRates[selectedCurrency];
        if (!rate) return "...";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: selectedCurrency,
            minimumFractionDigits: 2
        }).format(amount / rate);
    }, [selectedCurrency, exchangeRates]);

    const disabledDate = (current) => {
        return current && (current < dayjs().endOf('day') || blockedSet.has(current.format("YYYY-MM-DD")));
    };

    const handleBooking = () => {
        if (!startDate) return toast.error("Please select start date");
        const endDate = startDate.add(data.duration - 1, 'day');

        const payload = {
            checkIn: startDate.format("YYYY-MM-DD"),
            checkOut: endDate.format("YYYY-MM-DD"),
            bookingType: "TOUR",
            guests: adults + children,
            adults,
            children,
            totalPriceVND,
            selectedCurrency,
            exchangeRateApplied: exchangeRates[selectedCurrency] || 1,
            tour: data,
        };
        navigate("/booking/Tour", {state: payload});
    };

    const availableCurrencies = ["VND", ...Object.keys(exchangeRates)];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative items-start">

            {/* --- RIGHT COLUMN: STICKY BOOKING CARD --- */}
            <div className="lg:col-span-1 order-1 lg:order-2">
                <div className="sticky top-28">
                    <div className="border border-gray-200 rounded-2xl p-6 shadow-md bg-white">

                        {/* PRICE HEADER */}
                        <div className="flex flex-col items-start gap-1 mb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-gray-900">
                                    {isLoadingRates ? <Spin size="small"/> : convertAndFormat(data.price)}
                                </span>
                                <span className="text-gray-500 font-normal">/adult</span>
                            </div>
                        </div>

                        {/* INPUTS */}
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-4">
                            {/* Date Picker Row */}
                            <div
                                className="px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors relative">
                                <label className="block text-[10px] font-extrabold text-gray-500 uppercase">Start
                                    Date</label>
                                <DatePicker
                                    className="w-full p-0 border-none bg-transparent text-sm text-gray-700 font-medium hover:bg-transparent focus:shadow-none !shadow-none"
                                    disabledDate={disabledDate}
                                    onChange={setStartDate}
                                    format="DD/MM/YYYY"
                                    suffixIcon={null}
                                    placeholder="Add date"
                                    inputReadOnly
                                />
                                {startDate && (
                                    <span className="absolute right-7 top-8 text-xs font-bold text-gray-700">
                                        End: {startDate.add(data.duration - 1, 'day').format("DD/MM")}
                                    </span>
                                )}
                            </div>

                            {/* Guests Row */}
                            <div className="flex border-gray-200">
                                <div
                                    className="w-1/2 px-4 py-3 border-r border-gray-200 hover:bg-gray-50 transition-colors">
                                    <label
                                        className="block text-[10px] font-extrabold text-gray-500 uppercase">Adults</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={adults}
                                        onChange={e => setAdults(Number(e.target.value))}
                                        className="w-full bg-transparent p-0 text-sm text-gray-700 font-medium outline-none"
                                    />
                                </div>
                                <div className="w-1/2 px-3 py-3 hover:bg-gray-50 transition-colors">
                                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase">
                                        Children <span className="font-bold text-gray-500 normal-case">(1-11 years old)</span>
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={children}
                                        onChange={e => setChildren(Number(e.target.value))}
                                        className="w-full bg-transparent p-0 text-sm text-gray-700 font-medium outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* BOOKING BUTTON & VALIDATION */}
                        {adults + children > data.maxGroupSize && (
                            <div className="text-red-500 text-sm font-bold mb-3 text-center bg-red-50 p-2.5 rounded-lg border border-red-100">
                                Exceeded maximum limit of {data.maxGroupSize} guests.
                            </div>
                        )}
                        <button
                            onClick={handleBooking}
                            disabled={adults + children > data.maxGroupSize}
                            className={`w-full py-3.5 rounded-lg text-white font-bold text-lg transition-all duration-200 mb-3 ${
                                adults + children > data.maxGroupSize 
                                ? "bg-gray-400 cursor-not-allowed shadow-none" 
                                : "bg-[#DE3151] hover:bg-[#C11136] shadow-md hover:shadow-lg active:scale-[0.98]"
                            }`}
                        >
                            Book Now
                        </button>
                        <p className="text-center text-sm text-gray-500 mb-4">You won't be charged yet</p>

                        {/* CURRENCY SELECTOR */}
                        <div className="flex justify-center mb-4">
                            <div className="bg-gray-100 p-1 rounded-lg flex flex-wrap justify-center gap-1">
                                {availableCurrencies.map(cur => (
                                    <button
                                        key={cur}
                                        onClick={() => setSelectedCurrency(cur)}
                                        className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                                            selectedCurrency === cur ? "bg-white shadow text-gray-900" : "text-gray-500 hover:bg-gray-200"
                                        }`}
                                    >
                                        {cur}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PRICE BREAKDOWN */}
                        {startDate && (
                            <div className="pt-4 space-y-3 border-t border-gray-100">
                                <div
                                    className={`flex justify-between text-sm ${priceBreakdown?.isSpecial ? "font-semibold text-gray-900 bg-orange-50 p-2 rounded-lg -mx-2" : "text-gray-600"}`}>
                                    <div className="flex items-center gap-2">
                                        <span className="underline decoration-gray-300">
                                            {convertAndFormat(priceBreakdown?.unitAdult)} x {adults} adults
                                        </span>
                                        {priceBreakdown?.isSpecial && (
                                            <Tooltip title="Special seasonal price applied">
                                                <span className="text-orange-500 cursor-help"><FaCircleInfo size={14}/></span>
                                            </Tooltip>
                                        )}
                                    </div>
                                    <span>{convertAndFormat(priceBreakdown?.unitAdult * adults)}</span>
                                </div>

                                {children > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span className="underline decoration-gray-300">
                                            {convertAndFormat(priceBreakdown?.unitChild)} x {children} children
                                        </span>
                                        <span>{convertAndFormat(priceBreakdown?.unitChild * children)}</span>
                                    </div>
                                )}

                                <hr className="border-gray-200 my-4"/>
                                <div className="flex justify-between text-xl font-bold text-gray-900">
                                    <span>Total ({selectedCurrency})</span>
                                    <span>{convertAndFormat(totalPriceVND)}</span>
                                </div>
                            </div>
                        )}

                        {/* <div className="mt-6 flex justify-center opacity-70 hover:opacity-100 transition-opacity">
                            <span
                                className="text-gray-500 text-xs font-semibold flex items-center gap-2 cursor-pointer hover:underline">
                                <FaRegFlag/> Report this listing
                            </span>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* --- LEFT COLUMN: CONTENT --- */}
            <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">

                {/* Host Info */}
                <div className="flex justify-between items-center border-b border-gray-200 pb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            {data.name}
                        </h2>
                        <p className="text-gray-500 font-medium">
                            {data.durationText || `${data.duration} days`} · Max {data.maxGroupSize} guests
                        </p>
                    </div>
                </div>

                {/* Highlights / Services */}
                <div>
                    <h3 className="text-xl font-bold mb-6 text-gray-900">Tour Highlights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                        {data?.services?.map((s, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div
                                    className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-purple-100 text-purple-600 group-hover:scale-110 transition">
                                    {React.createElement(iconMap[s.icon] || FaCircleQuestion, {size: 24})}
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="font-semibold text-gray-900 text-[15px]">{s.name}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <hr className="border-gray-200"/>

                {/* Description */}
                <div className="bg-white rounded-2xl">
                    <div className="mb-6 border-b border-gray-100 pb-4">
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Introduction</h3>
                        <div className="mt-2 h-1 w-12 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="prose prose-slate prose-lg max-w-none text-gray-600 leading-loose"
                         dangerouslySetInnerHTML={{__html: data.description}}/>
                </div>
                <hr className="border-gray-200"/>

                {/* Itinerary */}
                <ItinerarySection data={data}/>
                <hr className="border-gray-200 mb-10"/>

                <div>
                    <h3 className="text-xl font-bold mb-6 text-gray-900">Things to know</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Map qua các loại Policy của Tour */}
                        {["Tour Regulations", "Safety & Health", "Cancellation Policy","Booking Conditions"].map((type) => {
                            const currentPolicies = data?.policy?.filter((i) => i.type === type) || [];

                            return (
                                <div key={type} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 h-full">
                                    <h4 className="font-bold text-gray-900 mb-4 text-center text-[16px]">{type}</h4>
                                    <ul className="space-y-3">
                                        {currentPolicies.length > 0 ? (
                                            currentPolicies.map((i) => (
                                                <li key={i._id} className="flex items-start gap-3">
                                                    {/* Render Icon động */}
                                                    <div className="mt-0.5 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white border text-gray-500">
                                                        {React.createElement(iconMap[i.icon] || FaCircleQuestion, {size: 12})}
                                                    </div>
                                                    <span className="text-sm text-gray-600 flex-1 line-clamp-3" title={i?.name}>
                                                        {i?.name}
                                                    </span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-sm text-gray-400 italic">No information available.</li>
                                        )}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* --- END UPDATED SECTION --- */}

            </div>
        </div>
    );
};

export default InfoTour;