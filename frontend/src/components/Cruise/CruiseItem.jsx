import { useNavigate } from "react-router-dom";
import { AiFillStar, AiOutlineHeart } from "react-icons/ai";
import { LuClock, LuCalendar, LuMapPin } from "react-icons/lu";
import {FaLuggageCart} from "react-icons/fa";

const CruiseItem = ({ data, viewMode }) => {
    const navigate = useNavigate();

    // 1. Helper for Currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // 2. Helper for Date
    const formatDate = (dateString) => {
        if (!dateString) return "TBA";
        return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const handleNavigate = () => {
        if (data?._id) navigate(`/cruises/${data.slug}`);
    };

    // Calculate total amenities count for display
    const totalAmenities = data.amenities?.reduce((acc, group) => acc + group.items.length, 0) || 0;

    const formatDuration = (d) => {
        const dur = Number(d) || 1;
        if (dur === 1) return "Day Cruise";
        return `${dur} Days ${dur - 1} Night${dur - 1 > 1 ? 's' : ''}`;
    };

    // --- GRID VIEW (Mobile & Desktop Grid) ---
    if (viewMode === 'grid') {
        return (
            <div onClick={handleNavigate} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col h-full cursor-pointer">

                {/* Image Section */}
                <div className="relative h-60 overflow-hidden">
                    <img
                        src={data.thumbnail || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b"}
                        alt={data.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Badge: cruiseType */}
                    <div className="absolute top-4 left-4">
                        <span className="bg-[#1A63F8] text-white text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wide shadow-sm">
                            {data.cruiseType || "Cruise"}
                        </span>
                    </div>

                    <div className="absolute top-4 right-4 bg-black/20 hover:bg-white/30 backdrop-blur-md p-2 rounded-full cursor-pointer transition-colors group/heart">
                        <AiOutlineHeart className="text-white group-hover/heart:text-red-500" size={18} />
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                    {/* Rating Row */}
                    {/* <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2"> */}
                            {/* Static Host Tag since no host data exists in JSON */}
                            {/* <span className="text-xs text-gray-500 font-medium px-2 py-1 bg-gray-100 rounded">Verified Partner</span>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded text-xs font-bold text-yellow-600">
                            <AiFillStar className="text-yellow-500" /> */}
                            {/* Handle 0 rating gracefully */}
                            {/* <span>{data.rating > 0 ? data.rating : "New"}</span>
                            <span className="text-gray-400 font-normal">
                                ({data.totalReviews === 0 ? "No reviews" : data.totalReviews})
                            </span>
                        </div>
                    </div> */}

                    {/* Title */}
                    <h3 className="font-bold text-gray-900 text-lg leading-snug mb-1 line-clamp-2 group-hover:text-[#1A63F8] transition-colors">
                        {data.title}
                    </h3>

                    {/* Location */}
                    <p className="text-sm text-gray-500 mb-5 flex items-center gap-1">
                        <LuMapPin className="text-gray-400" size={14} />
                        {data.city || "Halong Bay"}
                    </p>

                    {/* Specs Grid - UPDATED to use REAL fields */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-5 pt-4 border-t border-dashed border-gray-100">
                        {/* 1. Departure Date */}
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <LuCalendar className="text-gray-400 text-sm" />
                            <span className="truncate">{formatDate(data.departureTime)}</span>
                        </div>

                        {/* 2. Duration */}
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <LuClock className="text-gray-400 text-sm" />
                            <span className="truncate">{formatDuration(data.duration)}</span>
                        </div>

                        {/* 3. Amenities Count (Replacing Guests) */}
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="truncate">{totalAmenities} Amenities</span>
                        </div>

                        {/* 4. Type (Replacing Speed) */}
                        {/* <div className="flex items-center gap-2 text-xs text-gray-600">
                            <LuMapPin className="text-gray-400 text-sm" />
                            <span className="truncate">{data.city}</span>
                        </div> */}
                    </div>

                    {/* Footer: Price */}
                    <div className="mt-auto flex items-end justify-between">
                        <div>
                            {/* Optional: Fake original price for visual effect */}
                            <p className="text-xs text-gray-400 line-through mb-0.5">{formatCurrency((data.price || 0) * 1.2)}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-[#D93025]">{formatCurrency(data.price || 0)}</span>
                            </div>
                        </div>
                        {/* <button className="bg-gray-50 hover:bg-[#D93025] hover:text-white text-gray-700 font-bold text-xs px-3 py-2 rounded-lg transition-colors duration-300">
                            Explore
                        </button> */}
                    </div>
                </div>
            </div>
        );
    }

    // --- LIST VIEW (Horizontal Card) ---
    return (
        <div onClick={handleNavigate} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col md:flex-row overflow-hidden cursor-pointer h-full md:h-[240px]">
            {/* Image (Left) */}
            <div className="md:w-[35%] lg:w-[32%] relative h-56 md:h-full shrink-0 overflow-hidden">
                <img
                    src={data.thumbnail}
                    alt={data.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                     <span className="bg-[#1A63F8] text-white text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wide">
                        {data.cruiseType}
                    </span>
                </div>
            </div>

            {/* Content (Right) */}
            <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-[#1A63F8] transition-colors line-clamp-1">
                            {data.title}
                        </h3>
                        <div className="hidden md:flex flex-col items-end">
                            <div className="flex items-center gap-1 text-yellow-500 text-sm">
                                <AiFillStar />
                                <span className="font-bold text-gray-900">{data.rating > 0 ? data.rating : "New"}</span>
                            </div>
                            <span className="text-xs text-gray-400">
                                {data.totalReviews} Reviews
                            </span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                        <LuMapPin className="text-gray-400"/> {data.city}
                    </p>

                    {/* Display first 2 amenities as description preview */}
                    <div className="text-sm text-gray-600 mb-4 leading-relaxed">
                        <p className="line-clamp-2">
                            Experience {data.cruiseType} in {data.city}.
                            Includes: {data.amenities?.[0]?.items.slice(0, 3).join(", ")}...
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                    {/* Updated Specs List */}
                    <div className="hidden sm:flex gap-4 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                            <LuCalendar className="text-gray-400"/> {formatDate(data.departureTime)}
                        </span>
                        <span className="flex items-center gap-1">
                            <LuClock className="text-gray-400"/> {formatDuration(data.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                            <FaLuggageCart className="text-gray-400"/> {totalAmenities} Amenities
                        </span>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="text-right">
                            <span className="block text-lg font-bold text-[#D93025] leading-none">
                                {formatCurrency(data.price)}
                            </span>
                            <span className="text-[10px] text-gray-400">per person</span>
                        </div>
                        <button className="bg-[#D93025] hover:bg-[#b92b22] text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CruiseItem;