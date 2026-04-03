import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, createSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { Toaster, toast } from "react-hot-toast";
import {
    FaCheckCircle,
    FaTripadvisor,
    FaUserShield,
    FaCar, FaCamera, FaArrowRight, FaLandmark, FaGlobeEurope, FaMapMarkedAlt,
    FaTimes // Import icon đóng modal
} from "react-icons/fa";
import CarSearchWidget from "./CarSearchWidget.jsx";
import Img_Hero from "../../assets/hero_car.webp";
// Import searchCarApi để pre-check kết quả
import { getAllCarRoutesApi, searchCarApi } from "../../api/client/car.api.js";

const CarTransfer = () => {
    const [urlParams] = useSearchParams();
    const navigate = useNavigate();

    // --- STATE ---
    const [locationOptions, setLocationOptions] = useState([]);

    // State cho Modal "No Result"
    const [showNoRouteModal, setShowNoRouteModal] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [searchParams, setSearchParams] = useState({
        serviceType: urlParams.get("serviceType") || "transfers",
        tripType: "one_way",
        from: urlParams.get("from") || "",
        to: urlParams.get("to") || "",
        duration: urlParams.get("duration") ? parseInt(urlParams.get("duration")) : 3,
        date: urlParams.get("date") ? dayjs(urlParams.get("date")) : dayjs().add(1, "day"),
        time: urlParams.get("time") ? dayjs(urlParams.get("time")) : dayjs().set("hour", 9).set("minute", 0),
        passengers: urlParams.get("pax") ? parseInt(urlParams.get("pax")) : 2,
        luggage: 2,
    });

    // --- EFFECT: FETCH LOCATIONS ---
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                // Fetch all routes to get available origins/destinations
                const response = await getAllCarRoutesApi();
                const routes = response?.data || [];

                if (Array.isArray(routes) && routes.length > 0) {
                    const uniqueLocations = new Set();
                    routes.forEach(route => {
                        if (route.origin) uniqueLocations.add(route.origin);
                        if (route.destination) uniqueLocations.add(route.destination);
                    });
                    const options = Array.from(uniqueLocations).map(loc => ({ value: loc }));
                    setLocationOptions(options);
                }
            } catch (error) {
                console.error("Failed to fetch location options:", error);
            }
        };

        fetchLocations();
    }, []);
    // --- HANDLERS ---
    const handleSearch = async () => {
        // 1. Bật trạng thái loading
        setIsSearching(true);

        // Chuẩn bị params để gọi API
        const queryParams = {
            type: searchParams.tripType === 'one_way' ? 'One-way' : 'Return',
            from: searchParams.from,
            to: searchParams.to,
            date: searchParams.date ? dayjs(searchParams.date).format('YYYY-MM-DD') : '',
            time: searchParams.time ? dayjs(searchParams.time).format('HH:mm') : '',
            passengers: searchParams.passengers,
            // duration: searchParams.duration // API searchCarApi có thể không cần duration nếu là transfer
        };

        try {
            // 2. Gọi API để kiểm tra xem có xe không
            const response = await searchCarApi(queryParams);
            const payload = response.data;

            // 3. Kiểm tra kết quả
            if (payload && payload.length > 0) {

                // Format params cho URL navigation
                const navParams = {
                    tripType: searchParams.tripType,
                    from: searchParams.from,
                    to: searchParams.to,
                    date: searchParams.date ? dayjs(searchParams.date).format('YYYY-MM-DD') : '',
                    time: searchParams.time ? dayjs(searchParams.time).format('HH:mm') : '',
                    pax: searchParams.passengers,
                    serviceType: searchParams.serviceType,
                    duration: searchParams.duration
                };

                navigate({
                    pathname: "/transfers/select",
                    search: `?${createSearchParams(navParams)}`,
                });

            } else {
                // 4. Nếu không có kết quả hoặc lỗi logic -> Hiện Modal
                setShowNoRouteModal(true);
            }

        } catch (error) {
            console.error("Check route error:", error);
            // Nếu API lỗi (ví dụ 404 Not Found), cũng hiện Modal
            setShowNoRouteModal(true);
        } finally {
            // Tắt loading
            setIsSearching(false);
        }
    };

    return (
        <div className="font-sans relative bg-white text-slate-800">
            <Toaster position="top-center" />

            {showNoRouteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-scaleUp">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowNoRouteModal(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                        >
                            <FaTimes />
                        </button>

                        {/* Content */}
                        <div className="text-center mt-2">
                            <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight">
                                We need to know more about your trip
                            </h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8">
                                We don't run this route often, but we're working hard to create it for you. Please fill in some more details about your plans so we can find the best driver and vehicle.
                            </p>

                            <button
                                onClick={() => {
                                    setShowNoRouteModal(false);
                                    // Logic mở form "Add trip details" hoặc chuyển trang custom quote ở đây
                                    toast.success("Feature coming soon: Custom Quote Request");
                                }}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                            >
                                Add trip details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HERO SECTION --- */}
            <div className="relative w-full min-h-[600px] lg:min-h-[750px] flex flex-col rounded-3xl overflow-hidden shadow-2xl shadow-slate-200">
                <div className="absolute inset-0 z-0">
                    <img src={Img_Hero} alt="Scenic Road Transfer" className="w-full h-full object-cover object-center" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/10 to-slate-900/60 lg:to-slate-50/10"></div>
                </div>

                <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 lg:py-0">
                    <div className="mb-6 bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                        ● 24/7 Support Available
                    </div>

                    <div className="text-center mb-10 max-w-4xl">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-6 tracking-tight text-white drop-shadow-lg">
                            Comfortable transfers, <br />
                            professional drivers
                        </h1>
                        <p className="text-lg md:text-xl text-slate-100 font-medium max-w-2xl mx-auto drop-shadow-md">
                            Door-to-door private service. No hidden fees. Enjoy the journey.
                        </p>
                    </div>

                    <div className="w-full max-w-7xl">
                        <div className="flex justify-center mb-6">
                            <div className="bg-slate-900/60 backdrop-blur-md p-1.5 rounded-full inline-flex border border-white/10">
                                <button
                                    onClick={() => setSearchParams(prev => ({ ...prev, serviceType: 'transfers' }))}
                                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${searchParams.serviceType === 'transfers' ? 'bg-white shadow-md text-slate-900' : 'text-slate-200 hover:bg-white/10'}`}
                                >
                                    Transfers
                                </button>
                                <button
                                    onClick={() => setSearchParams(prev => ({ ...prev, serviceType: 'hourly' }))}
                                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${searchParams.serviceType === 'hourly' ? 'bg-white shadow-md text-slate-900' : 'text-slate-200 hover:bg-white/10'}`}
                                >
                                    By the hour
                                </button>
                            </div>
                        </div>

                        {/* Search Component with Location Options */}
                        <div className={isSearching ? "opacity-80 pointer-events-none transition-opacity" : ""}>
                            <CarSearchWidget
                                params={searchParams}
                                setParams={setSearchParams}
                                onSearch={handleSearch}
                                locationOptions={locationOptions}
                            />
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-8 px-4">
                            <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-full shadow-lg hover:bg-slate-900/70 transition-colors cursor-default">
                                <FaCheckCircle className="text-emerald-400 text-lg" />
                                <span className="text-slate-100 font-bold text-sm tracking-wide">Free cancellation 24h prior</span>
                            </div>
                            <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-full shadow-lg hover:bg-slate-900/70 transition-colors cursor-default">
                                <FaTripadvisor className="text-emerald-400 text-xl" />
                                <span className="text-slate-100 font-bold text-sm tracking-wide">Tripadvisor Travelers' Choice</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white py-20 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-16 text-center">Dedication to safety</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                        <div className="p-8 bg-slate-50 rounded-[2rem] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-slate-100">
                            <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center text-sky-500 text-3xl mb-6 group-hover:scale-110 transition-transform"><FaUserShield /></div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Carefully vetted drivers</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">We individually interview every driver, ensuring they meet world-class standards for safety and service.</p>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-[2rem] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-slate-100">
                            <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center text-sky-500 text-3xl mb-6 group-hover:scale-110 transition-transform"><FaCar /></div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Clean, comfortable cars</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">Strict vehicle standards mean you'll always get a modern vehicle that's safe, clean, and comfortable.</p>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-[2rem] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-slate-100">
                            <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center text-sky-500 text-3xl mb-6 group-hover:scale-110 transition-transform"><FaMapMarkedAlt /></div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Local expertise</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">Our drivers know the rules of the road intimately, getting you from A to B safely with local insider tips.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-8 lg:pb-15 shadow-md bg-gray-100 rounded-2xl">
                <div className="max-w-7xl pt-5 mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        <div className="flex-1 space-y-10">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-6">Explore the best <br /> <span className="text-sky-500">sights on the way</span></h2>
                                <p className="text-slate-600 text-lg leading-relaxed">Don't just drive past the history. We hand-pick the best stops along your route.</p>
                            </div>
                            <div className="space-y-6">
                                <div className="flex gap-5 items-start">
                                    <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 text-xl shrink-0"><FaLandmark /></div>
                                    <div><h4 className="text-lg font-bold text-slate-900 mb-1">Optional sightseeing</h4><p className="text-slate-500 text-sm leading-relaxed">Turn a simple transfer into an unforgettable trip by visiting ancient ruins or natural wonders.</p></div>
                                </div>
                                <div className="flex gap-5 items-start">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 text-xl shrink-0"><FaGlobeEurope /></div>
                                    <div><h4 className="text-lg font-bold text-slate-900 mb-1">Local tips and information</h4><p className="text-slate-500 text-sm leading-relaxed">Friendly local drivers happy to share insights or give tips on what to do at your destination.</p></div>
                                </div>
                            </div>
                            <button className="group inline-flex items-center gap-2 text-sky-600 font-bold hover:text-sky-700 transition-colors text-lg mt-4">See popular routes <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" /></button>
                        </div>
                        <div className="flex-1 w-full relative">
                            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-sky-900/10">
                                <img src={"https://vcdn1-english.vnecdn.net/2023/02/24/hanoi2165233875536321652338809-5791-3494-1677201276.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=n3RZYjRQljTpOQlB1qREyw"} alt="Sightseeing stop" className="w-full h-[450px] lg:h-[600px] object-cover hover:scale-105 transition-transform duration-700" />
                                <div className="absolute bottom-8 right-8 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg flex items-center gap-4 max-w-[240px] animate-bounce-slow border border-white/50">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0"><FaCamera /></div>
                                    <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Spot</p><p className="text-sm font-bold text-slate-900 leading-tight">Hoan Kiem Lake, Hanoi</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarTransfer;