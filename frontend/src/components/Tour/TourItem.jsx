import React from "react";
import { Link, useNavigate } from "react-router-dom";

// Icons
import { FaMapMarkerAlt, FaRegClock, FaUserFriends, FaStar } from "react-icons/fa";
import { BsFire } from "react-icons/bs";

// 1. ACCEPT VIEWMODE PROP
const TourItem = ({ item, viewMode = "list" }) => {
    const navigate = useNavigate();

    // 2. HELPER VARIABLE
    const isGrid = viewMode === "grid";

    const handleNavigate = (e) => {
        e.stopPropagation();
        navigate(`/tours/${item.slug}`);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
    };

    return (
        <div
            onClick={() => navigate(`/tours/${item.slug}`)}
            className={`
                group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 cursor-pointer overflow-hidden
                ${isGrid ? 'flex flex-col h-full' : 'flex flex-col md:flex-row gap-5 p-4'}
            `}
        >
            {/* IMAGE: Thêm hover effect mềm mại hơn */}
            <div className={`
                relative flex-shrink-0 rounded-xl overflow-hidden
                ${isGrid ? 'w-full aspect-[4/3]' : 'w-full md:w-[280px] h-[200px] md:h-auto'}
            `}>
                <img
                    src={item.images?.[0]}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={item.name}
                />

                {/* Featured Badge: Đổi sang màu cam cháy cho sang hơn */}
                {item.featured && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-orange-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1 shadow-sm">
                        <BsFire /> Featured
                    </div>
                )}

            </div>

            {/* CONTENT */}
            <div className={`flex flex-1 flex-col justify-between ${isGrid ? 'p-5 pt-3' : 'py-1'}`}>

                {/* Title & Location */}
                <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                        {/* Location: Đổi icon sang Teal */}
                        <div className="flex items-center gap-1.5 text-teal-600 bg-teal-50 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide w-fit">
                            <FaMapMarkerAlt />
                            <span>{item.city}</span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                            <FaStar className="text-yellow-400 mb-0.5" />
                            <span>{item.rating || 4.8}</span>
                            <span className="text-gray-400 font-normal">({item.reviews || 10})</span>
                        </div>
                    </div>

                    <h3 className={`font-bold text-slate-800 leading-snug group-hover:text-teal-700 transition-colors ${isGrid ? 'text-lg line-clamp-2 mb-3' : 'text-xl line-clamp-1 mb-2'}`}>
                        {item.name}
                    </h3>

                    {/* Meta info: Nhẹ nhàng hơn */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
                        <div className="flex items-center gap-1.5">
                            <FaRegClock className="text-teal-500" size={14} /> {/* Icon Teal */}
                            <span>{item.durationText || `${item.duration} Days`}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <FaUserFriends className="text-teal-500" size={14} /> {/* Icon Teal */}
                            <span>Max {item.maxGroupSize || 20} guests</span>
                        </div>
                    </div>

                    {!isGrid && (
                        <p className="text-sm text-gray-500 line-clamp-2 mt-4 leading-relaxed border-t border-dashed border-gray-100 pt-3">
                            {item.desc || `Experience the best of ${item.city} with our exclusive guided tours. Enjoy comfort, style and unforgettable memories.`}
                        </p>
                    )}
                </div>

                {/* Footer Section */}
                <div className={`flex items-end w-full mt-4 ${isGrid ? 'justify-between border-t border-gray-50 pt-3' : 'justify-between'}`}>

                    <div>
                        <span className="text-[11px] text-gray-400 font-medium block uppercase tracking-wider mb-0.5">Start from</span>
                        <div className="flex items-center gap-2">
                            {!isGrid && <span className="text-sm text-gray-400 line-through decoration-gray-300">{formatPrice(item.price * 1.15)}</span>}
                            {/* Price: Giữ màu Cam đậm để nổi bật tiền */}
                            <span className="text-lg md:text-xl font-bold text-orange-600">
                                {formatPrice(item.price)}
                            </span>
                        </div>
                    </div>

                    {/* {!isGrid && (
                        <button
                            onClick={handleNavigate}
                            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-orange-500 transition-colors shadow-lg shadow-gray-200 hover:shadow-orange-200"
                        >
                            View Details
                        </button>
                    )} */}

                </div>
            </div>
        </div>
    );
};

export default TourItem;