    import { useState, useEffect, useMemo, useCallback } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { Select, Input, Collapse, Steps, Spin, DatePicker } from 'antd';
    import {
        FaMapMarkerAlt, FaRegHeart, FaShareAlt, FaCheckCircle,
        FaShip, FaChevronDown, FaChevronUp, FaImages, FaWater, FaUser,
        FaExpandArrowsAlt
    } from "react-icons/fa";
    import { BsShieldCheck } from "react-icons/bs";
    import dayjs from 'dayjs';
    import { useSelector } from 'react-redux';
    import { getCruiseDetailApi } from "../../api/client/service.api.js";
    import toast from "react-hot-toast";
    import { useApi } from "../../contexts/ApiContext.jsx";
    import Gallery from "./Gallery.jsx";


    const SectionHeader = ({ title, isOpen, toggle }) => (
        <div
            className="flex justify-between items-center cursor-pointer py-4 border-b border-gray-100 mb-4 select-none"
            onClick={toggle}
        >
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <span className="text-gray-400 text-sm">
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
            </span>
        </div>
    );

    // --- MAIN PAGE COMPONENT ---
    const CruiseDetail = () => {
        const { slug } = useParams();
        const api = useApi();
        const navigate = useNavigate();
        const { isAuthenticated } = useSelector(state => state.UserReducer);

        const [cruise, setCruise] = useState(null);
        const [loading, setLoading] = useState(true);

        const [startDate, setStartDate] = useState(null);
        const [guests, setGuests] = useState(1);
        const [selectedCabinId, setSelectedCabinId] = useState(null);

        const [totalPriceVND, setTotalPriceVND] = useState(0);
        const [priceBreakdown, setPriceBreakdown] = useState(null);

        const [selectedCurrency, setSelectedCurrency] = useState("VND");
        const [exchangeRates, setExchangeRates] = useState({});
        const [isLoadingRates, setIsLoadingRates] = useState(false);

        const [sections, setSections] = useState({
            description: true,
            itinerary: true,
            cabins: true,
            reviews: true,
            faq: true
        });

        const toggleSection = (key) => {
            setSections(prev => ({ ...prev, [key]: !prev[key] }));
        };

        useEffect(() => {
            const fetchData = async () => {
                setLoading(true);
                try {
                    if (!slug) return;
                    const res = await getCruiseDetailApi(slug);
                    if (res && res.data) {
                        setCruise(res.data);
                        if (res.data.departureTime) {
                            setStartDate(dayjs(res.data.departureTime));
                        }
                        if (res.data.cabins && res.data.cabins.length > 0) {
                            setSelectedCabinId(res.data.cabins[0]._id);
                        }
                    } else {
                        toast.error("Cruise not found");
                    }
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to fetch details");
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }, [slug]);

        useEffect(() => {
            const fetchRates = async () => {
                setIsLoadingRates(true);
                try {
                    const res = await api.getExchangeRate();
                    if (res.success) {
                        setExchangeRates(res.data || {});
                    }
                } catch (err) {
                    console.error("Error fetching rates:", err);
                    setExchangeRates({ USD: 25400, EUR: 27000 });
                } finally {
                    setIsLoadingRates(false);
                }
            };
            fetchRates();
        }, []);

        const { priceExtraMap, blockedSet } = useMemo(() => {
            const pMap = {};
            const bSet = new Set();
            if (!cruise) return { priceExtraMap: pMap, blockedSet: bSet };

            cruise.availabilityRules?.forEach(rule => {
                if (rule.isBlocked) {
                    let curr = dayjs(rule.startDate);
                    const end = dayjs(rule.endDate);
                    while (curr.isBefore(end) || curr.isSame(end, 'day')) {
                        bSet.add(curr.format("YYYY-MM-DD"));
                        curr = curr.add(1, 'day');
                    }
                }
            });

            cruise.priceExtra?.forEach(item => {
                let curr = dayjs(item.start);
                const end = dayjs(item.end);
                while (curr.isBefore(end) || curr.isSame(end, 'day')) {
                    pMap[curr.format("YYYY-MM-DD")] = item.price;
                    curr = curr.add(1, 'day');
                }
            });

            return { priceExtraMap: pMap, blockedSet: bSet };
        }, [cruise]);

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

        useEffect(() => {
            if (!cruise || !startDate) {
                setTotalPriceVND(0);
                setPriceBreakdown(null);
                return;
            }

            let unitPrice = 0;
            let isSpecialPrice = false;

            if (selectedCabinId) {
                const selectedCabin = cruise.cabins.find(c => c._id === selectedCabinId);
                if (selectedCabin) {
                    unitPrice = selectedCabin.pricePerNight;
                }
            }

            if (unitPrice === 0) {
                const dateKey = startDate.format("YYYY-MM-DD");
                unitPrice = priceExtraMap[dateKey] || cruise.price;
                isSpecialPrice = !!priceExtraMap[dateKey];
            }

            const nights = (cruise.duration && cruise.duration > 1) ? (cruise.duration - 1) : 1;
            const total = unitPrice * guests * nights;

            setTotalPriceVND(total);
            setPriceBreakdown({
                unitPrice: unitPrice,
                nights: nights,
                isSpecial: isSpecialPrice
            });

        }, [startDate, guests, cruise, priceExtraMap, selectedCabinId]);

        const disabledDate = (current) => {
            return current && (current < dayjs().endOf('day') || blockedSet.has(current.format("YYYY-MM-DD")));
        };

        const handleBooking = () => {
            if (!isAuthenticated) {
                toast.error("Please log in to continue booking.");
                return navigate("/login", { state: { from: window.location.pathname + window.location.search } });
            }

            if (!startDate) return toast.error("Please select start date");
            if (guests < 1) return toast.error("Number of guests must be at least 1.");
            if (!selectedCabinId) return toast.error("Please select a cabin.");

            const duration = cruise.duration || 1;
            const endDate = startDate.add(duration - 1, 'day');

            const selectedCabin = cruise.cabins.find(c => c._id === selectedCabinId);

            const payload = {
                checkIn: startDate.format("YYYY-MM-DD"),
                checkOut: endDate.format("YYYY-MM-DD"),
                bookingType: "CRUISE",
                guests: guests,
                totalPriceVND,
                selectedCurrency,
                exchangeRateApplied: exchangeRates[selectedCurrency] || 1,
                cruise: {
                    ...cruise,
                    selectedCabin: selectedCabin
                },
            };
            navigate("/booking/cruise", { state: payload });
        };

        const availableCurrencies = ["VND", ...Object.keys(exchangeRates)];

        const formatDuration = (d) => {
            const dur = d || 1;
            if (dur === 1) return "1 Day";
            return `${dur} Days ${dur - 1} Night${dur - 1 > 1 ? 's' : ''}`;
        };

        if (loading) return <div className="flex justify-center items-center h-80 bg-white rounded-2xl border border-gray-100">

            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>

        </div>
        if (!cruise) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cruise data not available.</div>;

        const faqItems = cruise.faq?.map((item, index) => ({
            key: index,
            label: <span className="font-semibold">{item.question}</span>,
            children: <p className="text-gray-600">{item.answer}</p>,
        })) || [];

        const itineraryItems = cruise.itinerary?.map(item => ({
            title: <span className="font-bold text-gray-800">Day {item.day}: {item.title}</span>,
            description: <div className="text-gray-600 text-sm mt-2 mb-4 bg-white p-3 rounded border border-gray-100">{item.description}</div>,
            status: 'process'
        })) || [];

        const cabinOptions = cruise.cabins?.map(c => ({
            value: c._id,
            label: (
                <div className="flex justify-between items-center w-full gap-2">
                    <span className="truncate">{c.name}</span>
                    <span className="text-gray-500 text-xs whitespace-nowrap">{convertAndFormat(c.pricePerNight)}/night</span>
                </div>
            )
        })) || [];

        return (
            <div className="min-h-screen font-sans text-gray-800">
                <div className="container max-w-full">

                    {/* --- HEADER --- */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{cruise.title}</h1>
                                {cruise.isActive && (
                                    <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 whitespace-nowrap">
                                        <BsShieldCheck /> Verified
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                                <span className="flex items-center gap-1 text-orange-400"><FaShip /> {cruise.cruiseType}</span>
                                <span className="flex items-center gap-1"><FaMapMarkerAlt /> {cruise.city}</span>
                                <span className="flex items-center gap-1">
                                    <span className="bg-yellow-400 text-white text-xs px-1.5 py-0.5 rounded font-bold">{cruise.rating > 0 ? cruise.rating : "New"}</span>
                                    ({cruise.totalReviews} Reviews)
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4 md:mt-0">
                            <button className="h-9 w-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-500 transition shadow-sm"><FaShareAlt /></button>
                            <button className="px-4 h-9 rounded-full bg-white border border-gray-200 flex items-center gap-2 text-gray-500 hover:text-red-500 hover:border-red-500 transition shadow-sm font-medium text-sm"><FaRegHeart /> Save</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* --- LEFT CONTENT --- */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Updated Gallery Component */}
                            <Gallery images={cruise.thumbnail ? [cruise.thumbnail, ...(cruise.photos || [])] : (cruise.photos || [])} />

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <SectionHeader title="Description" isOpen={sections.description} toggle={() => toggleSection('description')} />
                                {sections.description && (
                                    <div className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: cruise.description }} />
                                        {cruise.amenities && cruise.amenities.length > 0 && (
                                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {cruise.amenities.map((group, idx) => (
                                                    <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                                                        <h4 className="font-bold text-gray-800 mb-2">{group.group}</h4>
                                                        <ul className="space-y-2">
                                                            {group.items.map((item, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                                                    <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />{item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <SectionHeader title="Itinerary" isOpen={sections.itinerary} toggle={() => toggleSection('itinerary')} />
                                {sections.itinerary && (
                                    <div className="mt-4">
                                        {itineraryItems.length > 0 ? (
                                            <Steps direction="vertical" current={-1} items={itineraryItems} />
                                        ) : (<p className="text-gray-500 text-sm">No itinerary details available.</p>)}
                                    </div>
                                )}
                            </div>

                            {/* Available Cabins List */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <SectionHeader title="Cabin Types" isOpen={sections.cabins} toggle={() => toggleSection('cabins')} />
                                {sections.cabins && (
                                    <div className="space-y-6">
                                        {cruise.cabins && cruise.cabins.length > 0 ? (
                                            cruise.cabins.map((cabin) => (
                                                <div key={cabin._id} className="group border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-all duration-300 bg-white">
                                                    <div className="w-full md:w-64 h-48 flex-shrink-0 rounded-xl overflow-hidden relative bg-gray-100">
                                                        {cabin.photos && cabin.photos.length > 0 ? (
                                                            <img src={cabin.photos[0]} alt={cabin.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400"><FaImages size={32} /><span className="text-xs">No Image</span></div>
                                                        )}
                                                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase flex items-center gap-1"><FaWater /> {cabin.viewType}</div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-xl font-bold text-gray-900 mb-2">{cabin.name}</h4>
                                                        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                                                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-100"><FaUser className="text-indigo-500" size={12} /> Max {cabin.specifications?.maxOccupancy}</span>
                                                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-100"><FaExpandArrowsAlt className="text-indigo-500" size={12} /> {cabin.specifications?.cabinSize} m²</span>
                                                        </div>
                                                        <p className="text-gray-500 text-sm line-clamp-2">{cabin.description}</p>
                                                    </div>
                                                    <div className="w-full md:w-48 flex flex-col justify-end items-end md:border-l md:border-dashed md:pl-6">
                                                        <div className="text-right">
                                                            <span className="block text-xs text-gray-400">Price per night</span>
                                                            <span className="text-2xl font-bold text-red-500">{convertAndFormat(cabin.pricePerNight)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12"><p className="text-gray-500">No cabins available.</p></div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <SectionHeader title="Frequently Asked Questions" isOpen={sections.faq} toggle={() => toggleSection('faq')} />
                                {sections.faq && <Collapse ghost expandIconPosition="end" items={faqItems} />}
                            </div> */}
                        </div>

                        {/* --- RIGHT SIDEBAR --- */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="sticky top-28 space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="font-bold text-lg mb-4">Start Booking</h3>
{/* 
                                    <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg">
                                        <span className="text-gray-600 text-sm font-medium">
                                            {startDate ? "Total Price" : "Starts From"}
                                        </span>
                                        <div className="text-right">
                                            <span className="text-red-500 font-bold text-lg">
                                                {isLoadingRates ? <Spin size="small" /> : convertAndFormat(startDate ? totalPriceVND : cruise.price)}
                                            </span>
                                            {!startDate && <span className="text-sm font-normal text-gray-500"> / Trip</span>}
                                        </div>
                                    </div> */}

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Select Cabin Type</label>
                                            <Select
                                                className="w-full h-10"
                                                placeholder="Choose a cabin"
                                                value={selectedCabinId}
                                                onChange={setSelectedCabinId}
                                                options={cabinOptions}
                                                optionLabelProp="label"
                                                dropdownStyle={{ minWidth: '300px' }}
                                            />
                                            {!selectedCabinId && <div className="text-red-500 text-[10px] mt-1">Please select a cabin to see price.</div>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Departure</label>
                                            <DatePicker
                                                className="w-full h-10"
                                                value={startDate}
                                                format="DD/MM/YYYY"
                                                inputReadOnly={true}
                                                open={false}
                                                style={{ pointerEvents: 'none', backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                                                placeholder="Fixed Departure Date"
                                            />
                                            {startDate && (
                                                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                                    <span>Duration: {formatDuration(cruise.duration)}</span>
                                                    <span>End: {startDate.add((cruise.duration || 1) - 1, 'day').format("DD/MM/YYYY")}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="w-full">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Guests</label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={guests}
                                                    onChange={(e) => setGuests(Number(e.target.value))}
                                                    className="h-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-1 flex-wrap mt-2">
                                            {availableCurrencies.map(cur => (
                                                <button
                                                    key={cur}
                                                    onClick={() => setSelectedCurrency(cur)}
                                                    className={`px-4 py-1.5 rounded-md text-sm font-bold border transition-colors ${selectedCurrency === cur ? 'bg-red-500 text-white border-red-500 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                                                >
                                                    {cur}
                                                </button>
                                            ))}
                                        </div>

                                        {startDate && priceBreakdown && guests > 0 && selectedCabinId && (
                                            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2 mt-2">
                                                <div className="flex justify-between items-center text-xs text-gray-500">
                                                    <span>{priceBreakdown.nights > 1 || cruise.duration > 1 ? "Price per Night" : "Price per Day Trip"}</span>
                                                    <span>{convertAndFormat(priceBreakdown.unitPrice)}</span>
                                                </div>
                                                {(priceBreakdown.nights > 1 || cruise.duration > 1) && (
                                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                                        <span>Nights</span>
                                                        <span>x {priceBreakdown.nights}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center text-xs text-gray-500 border-b border-gray-200 pb-2">
                                                    <span>Guests</span>
                                                    <span>x {guests}</span>
                                                </div>
                                                <div className="flex justify-between items-center font-bold text-gray-900 pt-1">
                                                    <span>Total ({selectedCurrency})</span>
                                                    <span className="text-red-600 text-lg">{convertAndFormat(totalPriceVND)}</span>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleBooking}
                                            disabled={!selectedCabinId || !startDate}
                                            className={`w-full font-bold py-3 rounded-md transition text-sm mt-2 shadow-sm ${(!selectedCabinId || !startDate) ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <span className="bg-red-50 text-red-500 rounded-full p-2 w-8 h-8 flex items-center justify-center"><FaShip /></span>
                                        Cruise Info
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                            <span className="text-gray-600">Duration</span>
                                            <span className="font-semibold text-gray-800">{formatDuration(cruise.duration)}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                            <span className="text-gray-600">Location</span>
                                            <span className="font-semibold text-gray-800">{cruise.city}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                            <span className="text-gray-600">Type</span>
                                            <span className="font-semibold text-gray-800">{cruise.cruiseType}</span>
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

    export default CruiseDetail;