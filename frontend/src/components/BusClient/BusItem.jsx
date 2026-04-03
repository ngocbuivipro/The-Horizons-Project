import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdBus, IoMdInformationCircleOutline } from "react-icons/io";
import {FaArrowRightLong, FaMinus, FaPlus, FaLocationDot, FaChair, FaCircleQuestion} from "react-icons/fa6";
import dayjs from "dayjs";
import { Tag, Button, Modal, Tabs, Timeline, Empty } from "antd";
import iconMap from "../../common/data/iconMap.js";

const BusItem = ({ data, selectedDate }) => {
    const navigate = useNavigate();

    const [seatCount, setSeatCount] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Formatters
    const currencyFormatter = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    });

    const dep = dayjs(data.departureTime);
    let arr = dayjs(data.arrivalTime);

    // If arrival is before departure -> add 1 day
    if (arr.isBefore(dep)) {
        arr = arr.add(1, "day");
    }
    const diffMinutes = arr.diff(dep, "minute");

    const duration = `${Math.floor(diffMinutes / 60)}h${
        diffMinutes % 60 ? ` ${diffMinutes % 60}m` : ""
    }`;

    // Seat Calculation
    const availableSeats = data.availableSeatsCount ?? data.totalSeats;
    const isSoldOut = availableSeats === 0;

    // --- HANDLERS ---
    const increaseSeats = (e) => {
        e.stopPropagation();
        if (seatCount < availableSeats) setSeatCount(prev => prev + 1);
    };

    const decreaseSeats = (e) => {
        e.stopPropagation();
        if (seatCount > 1) setSeatCount(prev => prev - 1);
    };

    const handleBuyNow = (e) => {
        e.stopPropagation();
        navigate("/booking/bus", {
            state: {
                bus: data,
                date: selectedDate ? dayjs(selectedDate).toISOString() : data.departureTime,
                seats: seatCount
            }
        });
    };

    const showDetails = (e) => {
        e.stopPropagation();
        setIsModalOpen(true);
    };

    const renderTimeline = (points, type) => {
        if (!points || points.length === 0) return <Empty description="No info available" />;

        return (
            <Timeline
                mode="left"
                items={points.map((p) => ({
                    color: type === 'pickup' ? '#4f46e5' : '#64748b', // indigo-600 vs slate-500
                    children: (
                        <div className="mb-4 pl-1">
                            <div className="font-semibold text-slate-800 text-base">
                                {dayjs(p.time || data.departureTime).format("HH:mm")} • {p.name || p.city}
                            </div>
                            <div className="text-slate-500 text-sm mt-1">{p.address}</div>
                        </div>
                    ),
                }))}
            />
        );
    };

    const modalItems = [
        {
            key: '1',
            label: 'Schedule & Route',
            children: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
                    {/* Pick-up Section */}
                    <div>
                        <h4 className="font-semibold text-lg text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-200 pb-3">
                            <div className="p-2 bg-indigo-50 rounded-full">
                                <FaLocationDot className="text-indigo-600 text-lg" />
                            </div>
                            <span>Pick-up Points</span>
                            <span className="ml-auto text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                {data.boardingPoints?.length || 0}
                            </span>
                        </h4>
                        <div className="max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                            <div className="flex flex-col gap-6 pl-1 py-2 text-slate-600 leading-relaxed">
                                {renderTimeline(data.boardingPoints, 'pickup')}
                            </div>
                        </div>
                    </div>

                    {/* Drop-off Section */}
                    <div>
                        <h4 className="font-semibold text-lg text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-200 pb-3">
                            <div className="p-2 bg-slate-100 rounded-full">
                                <FaLocationDot className="text-slate-500 text-lg" />
                            </div>
                            <span>Drop-off Points</span>
                            <span className="ml-auto text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                {data.droppingPoints?.length || 0}
                            </span>
                        </h4>
                        <div className="max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                            <div className="flex flex-col gap-6 pl-1 py-2 text-slate-600 leading-relaxed">
                                {renderTimeline(data.droppingPoints, 'drop')}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: '2',
            label: 'Policies & Terms',
            children: (
                <div className="pt-4 space-y-6">
                    <div>
                        <h4 className="font-semibold text-slate-800 mb-2">Operator Terms</h4>
                        {data.conditions ? (
                            <div className="prose prose-sm max-w-none text-slate-600 bg-slate-50 p-5 rounded-lg border border-slate-100">
                                <div dangerouslySetInnerHTML={{ __html: data.conditions }} />
                            </div>
                        ) : (
                            <div className="text-slate-400 italic text-sm">No detailed description available.</div>
                        )}
                    </div>

                    {data.policy && data.policy.length > 0 && (
                        <div className="border-t border-slate-100 pt-4">
                            <h4 className="font-semibold text-slate-800 mb-2">Cancellation Policy & Others</h4>
                            <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                                {data.policy.map((p, idx) => (
                                    <li key={idx}>{p}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: '3',
            label: 'Amenities & Photos', // Updated Label
            children: (
                <div className="pt-4 space-y-8">
                    {/* Amenities Section */}
                    <div>
                        <h4 className="font-semibold text-slate-800 mb-3">Amenities</h4>
                        {data.facilities && data.facilities.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                                {data.facilities.map((fac, idx) => {
                                    const name = typeof fac === 'object' ? fac.name : fac;
                                    const iconString = typeof fac === 'object' ? fac.icon : "";

                                    return (
                                        <div key={idx} className="flex items-center gap-4 group p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                            {/* Icon Box */}
                                            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform shadow-sm">
                                                {/* Render Icon động dựa trên string, fallback là dấu ? */}
                                                {React.createElement(iconMap[iconString] || FaCircleQuestion, { size: 20 })}
                                            </div>

                                            {/* Text Info */}
                                            <div className="flex flex-col">
                                                <h4 className="font-bold text-gray-800 text-[15px] capitalize">{name}</h4>
                                                <p className="text-xs text-gray-400 mt-0.5 font-medium">Included in ticket</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : <Empty description="No amenities listed" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                    </div>

                    {/* Photos Section - NEW ADDITION */}
                    {data.photos && data.photos.length > 0 && (
                        <div className="border-t border-slate-100 pt-6">
                            <h4 className="font-semibold text-slate-800 mb-4">Bus Photos</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {data.photos.map((photo, index) => (
                                    <div key={index} className="aspect-video rounded-lg overflow-hidden border border-slate-200 shadow-sm group">
                                        <img
                                            src={photo}
                                            alt={`Bus photo ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                                            // Optional: Add an onClick here to open a larger lightbox if you want
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )
        }
    ];

    return (
        <>
            <div className={`group bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row gap-4 cursor-pointer mb-4 ${isSoldOut ? 'opacity-75 grayscale' : ''}`}>

                {/* --- IMAGE SECTION --- */}
                <div className="relative w-full md:w-[260px] h-[200px] md:h-auto flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                    {data.photos?.[0] ? (
                        <img
                            src={data.photos[0]}
                            alt={data.poName || data.operator}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <IoMdBus size={48} />
                        </div>
                    )}

                    {/* Badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-gray-700 text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide">
                        {data.busType || "Standard"}
                    </div>

                    {/* Seats Left Badge */}
                    {!isSoldOut && (
                        <div className="absolute bottom-3 left-3 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                            <FaChair size={10} /> {availableSeats} Seats Left
                        </div>
                    )}
                </div>

                {/* --- CONTENT SECTION --- */}
                <div className="flex flex-1 flex-col justify-between py-1">

                    {/* Top: Operator & Route */}
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">
                                {data.poName || data.operator}
                            </h3>
                            {/* Rating (Mock or Real if you have it) */}
                            <div className="flex items-center gap-1 bg-yellow-400 text-gray-900 px-1.5 py-0.5 rounded text-xs font-bold shadow-sm">
                                <span>{data.rating}</span>
                                <span className="font-bold text-[10px] text-gray-800">Rating</span>
                            </div>
                        </div>

                        {/* Route Timeline */}
                        <div className="flex items-center gap-4 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="text-center min-w-[50px]">
                                <div className="text-lg font-bold text-gray-800">{dep.format("HH:mm")}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold">{data.cityFrom}</div>
                            </div>

                            <div className="flex-1 flex flex-col items-center px-2">
                                <span className="text-[10px] text-gray-400 mb-1">{duration}</span>
                                <div className="flex items-center w-full gap-1">
                                    <div className="h-[2px] bg-gray-300 flex-1 rounded-full relative">
                                        <div className="absolute -left-1 -top-[3px] w-2 h-2 bg-gray-400 rounded-full"></div>
                                    </div>
                                    <FaArrowRightLong className="text-gray-300 text-xs" />
                                    <div className="h-[2px] bg-gray-300 flex-1 rounded-full relative">
                                        <div className="absolute -right-1 -top-[3px] w-2 h-2 bg-gray-400 rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center min-w-[50px]">
                                <div className="text-lg font-bold text-gray-800">{arr.format("HH:mm")}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold">{data.cityTo}</div>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-[1px] bg-gray-100 w-full my-3"></div>

                    {/* Bottom: Price & Action */}
                    <div className="flex flex-col md:flex-row justify-between items-end gap-3">
                        {/* Facilities */}
                        <div className="hidden md:flex gap-2">
                            {data.facilities?.slice(0, 3).map((fac, idx) => (
                                <span key={idx} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-1 rounded border border-gray-100">
                                    {fac?.name}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                                <span className="text-xs text-gray-400 block mb-0.5">Per Seat</span>
                                <span className="text-xl font-bold text-red-500">
                                    {currencyFormatter.format(data.price || data.currentPrice || 0)}
                                </span>
                            </div>

                            {/* Seat Selector & Button */}
                            <div className="flex flex-col items-end gap-2">
                                {!isSoldOut && (
                                    <div className="flex items-center border border-gray-200 rounded bg-white h-7 overflow-hidden w-fit">
                                        <button onClick={decreaseSeats} disabled={seatCount <= 1} className="px-2 hover:bg-gray-50 disabled:opacity-50 text-gray-600"><FaMinus size={8} /></button>
                                        <span className="w-6 text-xs font-bold text-center border-x border-gray-100 flex items-center justify-center h-full">{seatCount}</span>
                                        <button onClick={increaseSeats} disabled={seatCount >= availableSeats} className="px-2 hover:bg-gray-50 disabled:opacity-50 text-gray-600"><FaPlus size={8} /></button>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        size="middle"
                                        type="text"
                                        onClick={showDetails} // USE OLD HANDLER FOR MODAL
                                        className="text-xs text-blue-600 font-medium hover:bg-blue-50"
                                    >
                                        <IoMdInformationCircleOutline size={16} className="mr-1"/>
                                        Details
                                    </Button>
                                    <Button
                                        type="primary"
                                        danger // Red button
                                        disabled={isSoldOut}
                                        onClick={handleBuyNow}
                                        className="font-bold shadow-none"
                                    >
                                        {isSoldOut ? "Full" : "Book"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODAL (KEPT EXACTLY AS REQUESTED) --- */}
            <Modal
                title={
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                        <span className="text-xl font-bold text-slate-800">{data.operator}</span>
                        <Tag color="geekblue" className="rounded-md px-2 border-transparent bg-indigo-50 text-indigo-700 font-semibold">
                            { data.busType}
                        </Tag>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalOpen(false)} className="text-slate-600 border-slate-300 hover:border-slate-400 hover:text-slate-800">
                        Close
                    </Button>,
                    <Button
                        key="buy"
                        type="primary"
                        disabled={isSoldOut}
                        onClick={handleBuyNow}
                        className={`${isSoldOut ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700'} border-none shadow-sm h-9 px-6`}
                    >
                        {isSoldOut ? "Sold Out" : "Book Now"}
                    </Button>
                ]}
                width={850}
                centered
                className="professional-modal"
            >
                <Tabs defaultActiveKey="1" items={modalItems} className="mt-2" />
            </Modal>
        </>
    );
};

export default BusItem;
