import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaRegClock, FaMapLocationDot } from "react-icons/fa6";

const ItinerarySection = ({ data }) => {
    // State để quản lý việc mở/đóng (mặc định đóng tất cả hoặc mở ngày đầu)
    const [activeDay, setActiveDay] = useState(0);

    const toggleDay = (index) => {
        setActiveDay(activeDay === index ? -1 : index);
    };

    return (
        <section className="mb-16 font-sans">
            {/* Header Title */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                    Tour Itinerary
                </h3>
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {data.itinerary?.length} Days Adventure
                </span>
            </div>

            {/* List Items */}
            <div className="flex flex-col gap-4">
                {data.itinerary?.map((item, index) => {
                    const isOpen = activeDay === index;

                    return (
                        <div
                            key={index}
                            className={`bg-white shadow-sm border rounded-2xl transition-all duration-300 overflow-hidden ${
                                isOpen
                                    ? "border-blue-200 shadow-md ring-1 ring-blue-100" // Active style
                                    : "border-gray-100 hover:border-gray-300 hover:shadow-sm" // Inactive style
                            }`}
                        >
                            {/* --- HEADER (Clickable) --- */}
                            <button
                                onClick={() => toggleDay(index)}
                                className="w-full flex items-center justify-between p-4 md:p-5 text-left focus:outline-none bg-white z-10 relative"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Day Badge: Pill shape giống hình ảnh */}
                                    <span className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors duration-300 ${
                                        isOpen
                                            ? "bg-gray-200 text-black"
                                            : "bg-gray-100 text-gray-700 group-hover:bg-gray-200"
                                    }`}>
                                        Day {item.day}
                                    </span>

                                    {/* Title */}
                                    <span className={`text-[16px] font-semibold transition-colors duration-300 ${
                                        isOpen ? "text-blue-900" : "text-gray-800"
                                    }`}>
                                        {item.title}
                                    </span>
                                </div>

                                {/* Icon Toggle */}
                                <div className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-500" : ""}`}>
                                    <FaChevronDown size={14} />
                                </div>
                            </button>

                            {/* --- COLLAPSIBLE CONTENT --- */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-5 pb-6 pt-0 ml-0 md:ml-[calc(3rem+16px)] border-t border-transparent">
                                            {/* Padding-left để thẳng hàng với text tiêu đề (Badge width ~3rem + gap) */}

                                            {/* Tags giống hình ảnh image_a2cd09.png */}
                                            <div className="flex flex-wrap gap-3 mb-3 mt-2">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    <FaRegClock /> Approx. Schedule
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                                                    <FaMapLocationDot /> Main Activity
                                                </span>
                                            </div>

                                            {/* Description */}
                                            <p className="text-gray-600 text-[15px] leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default ItinerarySection;