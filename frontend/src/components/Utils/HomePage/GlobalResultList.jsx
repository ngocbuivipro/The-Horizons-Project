import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Empty, Modal, Button, Tag, Tabs } from 'antd';
import {
    EnvironmentOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    ArrowRightOutlined,
    LeftOutlined,
    RightOutlined
} from '@ant-design/icons';
import { FaHotel, FaBus, FaUmbrellaBeach, FaMapMarkerAlt } from "react-icons/fa";
import dayjs from 'dayjs';

// --- SLIDER IMPORTS ---
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// 1. Custom Arrows
const NextArrow = ({ onClick }) => (
    <div className="absolute top-1/2 -right-5 z-10 -translate-y-1/2 cursor-pointer bg-white text-gray-500 shadow-md border border-gray-100 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50 hover:text-gray-900 transition-all duration-300" onClick={onClick}>
        <RightOutlined className="text-sm" />
    </div>
);

const PrevArrow = ({ onClick }) => (
    <div className="absolute top-1/2 -left-5 z-10 -translate-y-1/2 cursor-pointer bg-white text-gray-500 shadow-md border border-gray-100 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50 hover:text-gray-900 transition-all duration-300" onClick={onClick}>
        <LeftOutlined className="text-sm" />
    </div>
);

// 2. Section Divider
const SectionDivider = () => (
    <div className="w-full flex items-center justify-center py-10">
        <div className="w-full border-t border-dashed border-gray-300"></div>
    </div>
);

// 3. View All Button
const ViewAllButton = ({ to }) => (
    <Link to={to} className="group flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all duration-300 text-xs font-semibold uppercase tracking-wide border border-transparent hover:border-gray-200">
        <span>View All</span>
        <ArrowRightOutlined className="text-[10px] group-hover:translate-x-1 transition-transform duration-300" />
    </Link>
);

const GlobalResultList = ({ data, loading, searchParams }) => {
    const navigate = useNavigate();
    const { hotels = [], tours = [], buses = [] } = data || {};

    // --- STATE CHO BUS MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBus, setSelectedBus] = useState(null);

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    const hasResults = hotels.length > 0 || tours.length > 0 || buses.length > 0;

    // Logic tạo query string cho các link "View All"
    const createQueryString = (type) => {
        const params = new URLSearchParams();
        if (searchParams?.guests) params.append('guests', searchParams.guests);
        if (searchParams?.startDate) {
            const startStr = dayjs(searchParams.startDate).format('YYYY-MM-DD');
            params.append('startDate', startStr);
            if (type === 'bus') params.append('date', startStr);
        }
        if (type !== 'bus' && searchParams?.endDate) {
            params.append('endDate', dayjs(searchParams.endDate).format('YYYY-MM-DD'));
        }
        return params.toString();
    };
    const commonQuery = createQueryString('common');

    // --- XỬ LÝ CHUYỂN HƯỚNG SANG BOOKING BUS ---
    const handleSelectBus = (busItem) => {
        // Đóng modal nếu đang mở
        setIsModalOpen(false);

        // Xác định ngày đi: Nếu user search theo ngày thì lấy ngày search, nếu không lấy ngày mặc định của chuyến xe
        const travelDate = searchParams?.startDate
            ? dayjs(searchParams.startDate).format('YYYY-MM-DD')
            : busItem.departureTime;

        navigate('/booking/bus', {
            state: {
                // Các trường này khớp với BookingBus: const { bus, seats, ... } = location.state
                bus: busItem,           // Toàn bộ thông tin xe (để lấy _id, price, operator...)
                seats: 1,               // Mặc định đặt 1 vé khi từ trang Search sang
                date: travelDate,       // Ngày đi
                selectedSeatNumbers: [] // Chưa chọn ghế cụ thể
            }
        });
    };

    // Mở Modal chi tiết
    const handleOpenBusDetails = (busItem) => {
        setSelectedBus(busItem);
        setIsModalOpen(true);
    };

    // Render Timeline trong Modal
    const renderTimeline = (points, type) => {
        if (!points || points.length === 0) return <div className="text-gray-400 italic text-sm">No specific points listed.</div>;

        return points.map((point, index) => (
            <div key={point._id || index} className="relative pl-6 pb-6 border-l border-indigo-100 last:border-l-0 last:pb-0">
                <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 ${type === 'pickup' ? 'border-indigo-500 bg-white' : 'border-orange-500 bg-white'}`}></div>
                <div>
                    <div className="font-bold text-slate-700 text-sm">{point.time ? dayjs(point.time).format("HH:mm") : "---"}</div>
                    <div className="font-semibold text-slate-800">{point.name || point.city}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{point.address}</div>
                </div>
            </div>
        ));
    };

    // Cấu hình Modal Tabs
    const getModalItems = (data) => [
        {
            key: '1',
            label: 'Schedule & Route',
            children: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
                    {/* Pick-up Section */}
                    <div>
                        <h4 className="font-semibold text-lg text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-200 pb-3">
                            <div className="p-2 bg-indigo-50 rounded-full">
                                <FaMapMarkerAlt className="text-indigo-600 text-lg" />
                            </div>
                            <span>Pick-up Points</span>
                        </h4>
                        <div className="max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                            <div className="flex flex-col gap-2 pl-1 py-2 text-slate-600 leading-relaxed">
                                {renderTimeline(data.boardingPoints, 'pickup')}
                            </div>
                        </div>
                    </div>

                    {/* Drop-off Section */}
                    <div>
                        <h4 className="font-semibold text-lg text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-200 pb-3">
                            <div className="p-2 bg-slate-100 rounded-full">
                                <FaMapMarkerAlt className="text-slate-500 text-lg" />
                            </div>
                            <span>Drop-off Points</span>
                        </h4>
                        <div className="max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                            <div className="flex flex-col gap-2 pl-1 py-2 text-slate-600 leading-relaxed">
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
            label: 'Amenities',
            children: (
                <div className="pt-4">
                    {data.facilities && data.facilities.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {data.facilities.map((fac, idx) => (
                                <span key={idx} className="px-3 py-1.5 text-sm font-medium rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm">
                                    {fac}
                                </span>
                            ))}
                        </div>
                    ) : <Empty description="No amenities listed" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                </div>
            )
        }
    ];

    if (!loading && !hasResults && data !== null) {
        return <div className="mt-10"><Empty description="No services found matching your keyword." /></div>;
    }

    if (!hasResults) return null;

    // Slider Settings
    const sliderSettings = {
        dots: false, infinite: false, speed: 500, slidesToShow: 4, slidesToScroll: 1,
        nextArrow: <NextArrow />, prevArrow: <PrevArrow />,
        responsive: [
            { breakpoint: 1280, settings: { slidesToShow: 3 } },
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 640, settings: { slidesToShow: 1 } }
        ]
    };

    const busSliderSettings = {
        ...sliderSettings, slidesToShow: 3,
        responsive: [
            { breakpoint: 1280, settings: { slidesToShow: 3 } },
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 640, settings: { slidesToShow: 1 } }
        ]
    };

    return (
        <div className="w-11/12 max-w-[1200px] mx-auto mt-2 pb-16 px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-10 text-center tracking-tight border-b border-gray-100 pb-4 inline-block w-full">
                Search Results
            </h2>

            <div className="flex flex-col">
                {/* --- 1. HOTELS SECTION --- */}
                {hotels.length > 0 && (
                    <section className="relative px-2">
                        <div className="flex items-end justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600"><FaHotel size={20} /></div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 leading-none">Accommodations</h3>
                                    <p className="text-xs text-gray-500 mt-1 font-medium">{hotels.length} places found</p>
                                </div>
                            </div>
                            <ViewAllButton to={`/hotels?${commonQuery}`} />
                        </div>
                        <Slider {...sliderSettings}>
                            {hotels.map(hotel => (
                                <div key={hotel._id} className="p-3">
                                    <Link to={`/homes/${hotel.slug || hotel._id}?${commonQuery}`} className="block group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-indigo-100 transition-all duration-300 h-full flex flex-col">
                                        <div className="h-44 relative overflow-hidden shrink-0">
                                            <img src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945"} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            {hotel.stars && <span className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-gray-700 shadow-sm flex items-center gap-1">★ {hotel.stars}</span>}
                                        </div>
                                        <div className="p-4 flex flex-col flex-1 justify-between">
                                            <div>
                                                <h4 className="font-bold text-base text-gray-800 truncate mb-1 group-hover:text-indigo-600 transition-colors">{hotel.name}</h4>
                                                <p className="text-xs text-gray-500 truncate flex items-center gap-1 mb-3"><EnvironmentOutlined /> {hotel.address || hotel.city}</p>
                                            </div>
                                            <div className="flex justify-between items-end border-t border-gray-50 pt-3 mt-auto">
                                                <span className="text-[10px] text-gray-400 font-medium uppercase">From</span>
                                                <span className="text-base font-bold text-indigo-600">{formatCurrency(hotel.cheapestPrice)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </Slider>
                    </section>
                )}

                {/* SEPARATOR */}
                {hotels.length > 0 && (tours.length > 0 || buses.length > 0) && <SectionDivider />}

                {/* --- 2. TOURS SECTION --- */}
                {tours.length > 0 && (
                    <section className="relative px-2">
                        <div className="flex items-end justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-orange-50 rounded-xl text-orange-600"><FaUmbrellaBeach size={20} /></div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 leading-none">Package Tours</h3>
                                    <p className="text-xs text-gray-500 mt-1 font-medium">{tours.length} tours found</p>
                                </div>
                            </div>
                            <ViewAllButton to={`/tours?${commonQuery}`} />
                        </div>
                        <Slider {...sliderSettings}>
                            {tours.map(tour => (
                                <div key={tour._id} className="p-3">
                                    <Link to={`/tours/${tour.slug || tour._id}?${commonQuery}`} className="block group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-orange-100 transition-all duration-300 h-full flex flex-col">
                                        <div className="h-44 relative overflow-hidden shrink-0">
                                            <img src={tour.images?.[0] || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"} alt={tour.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute top-2 left-2 bg-gray-900/70 text-white px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 backdrop-blur-sm">
                                                <ClockCircleOutlined /> {tour.duration} Days
                                            </div>
                                        </div>
                                        <div className="p-4 flex flex-col flex-1 justify-between">
                                            <div>
                                                <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wide mb-1">{tour.city}</div>
                                                <h4 className="font-bold text-base text-gray-800 line-clamp-2 leading-snug mb-2 h-10 group-hover:text-orange-600 transition-colors">{tour.name}</h4>
                                            </div>
                                            <div className="flex justify-between items-center mt-3 border-t border-gray-50 pt-3">
                                                <span className="text-[10px] text-gray-400 font-medium uppercase">Price</span>
                                                <span className="text-lg font-bold text-orange-600">{formatCurrency(tour.price)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </Slider>
                    </section>
                )}

                {/* SEPARATOR */}
                {(hotels.length > 0 || tours.length > 0) && buses.length > 0 && <SectionDivider />}

                {/* --- 3. BUSES SECTION --- */}
                {buses.length > 0 && (
                    <section className="relative px-2">
                        <div className="flex items-end justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600"><FaBus size={20} /></div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 leading-none">Bus Tickets</h3>
                                    <p className="text-xs text-gray-500 mt-1 font-medium">{buses.length} trips found</p>
                                </div>
                            </div>
                            <ViewAllButton to="/bus" />
                        </div>

                        <Slider {...busSliderSettings}>
                            {buses.map(bus => (
                                <div key={bus._id} className="p-3 h-full">
                                    <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row h-full">

                                        {/* Image: Dùng photos từ Backend */}
                                        <div
                                            className="w-full sm:w-[130px] h-[140px] sm:h-auto shrink-0 relative bg-gray-50 cursor-pointer"
                                            onClick={() => handleOpenBusDetails(bus)}
                                        >
                                            <img
                                                src={bus.photos?.[0] || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop"}
                                                alt={bus.operator}
                                                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 p-3 flex flex-col justify-between relative z-10 border-l border-dashed border-gray-200">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-gray-700 font-bold text-xs uppercase truncate max-w-[90px]" title={bus.operator}>{bus.operator}</span>
                                                    <div className="text-base font-bold text-blue-600">{formatCurrency(bus.price)}</div>
                                                </div>

                                                <div className="flex items-center justify-between mb-1 gap-1 text-gray-600">
                                                    <span className="text-sm font-semibold truncate max-w-[70px]">{bus.cityFrom}</span>
                                                    <div className="flex-1 border-t border-gray-300 relative top-0.5 mx-2"></div>
                                                    <span className="text-sm font-semibold truncate max-w-[70px]">{bus.cityTo}</span>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
                                                    <CalendarOutlined />
                                                    <span>{dayjs(bus.departureTime).format("DD/MM")}</span>
                                                    <span>•</span>
                                                    <span className="font-semibold text-gray-600">{dayjs(bus.departureTime).format("HH:mm")}</span>
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-2 border-t border-gray-50 flex gap-2">
                                                <button
                                                    onClick={() => handleOpenBusDetails(bus)}
                                                    className="flex-1 py-1.5 bg-gray-50 hover:bg-gray-200 text-gray-600 text-[10px] font-bold rounded transition-all uppercase tracking-wide"
                                                >
                                                    Details
                                                </button>
                                                {/* Nút Select gọi hàm handleSelectBus để chuyển hướng kèm State */}
                                                <button
                                                    onClick={(e) => { e.preventDefault(); handleSelectBus(bus); }}
                                                    className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-[10px] font-bold rounded transition-all uppercase tracking-wide"
                                                >
                                                    Select
                                                </button>
                                            </div>
                                        </div>

                                        {/* Deco Circles */}
                                        <div className="hidden sm:block absolute top-[-6px] left-[124px] w-3 h-3 bg-white rounded-full border border-gray-200 z-20"></div>
                                        <div className="hidden sm:block absolute bottom-[-6px] left-[124px] w-3 h-3 bg-white rounded-full border border-gray-200 z-20"></div>
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    </section>
                )}
            </div>

            {/* --- MODAL CHI TIẾT BUS --- */}
            {selectedBus && (
                <Modal
                    title={
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                            <span className="text-xl font-bold text-slate-800">{selectedBus.operator}</span>
                            <Tag color="geekblue" className="rounded-md px-2 border-transparent bg-indigo-50 text-indigo-700 font-semibold">
                                { selectedBus.busType}
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
                            onClick={() => handleSelectBus(selectedBus)}
                            className="bg-indigo-600 hover:bg-indigo-700 border-none shadow-sm h-9 px-6"
                        >
                            Book Now
                        </Button>
                    ]}
                    width={850}
                    centered
                    className="professional-modal"
                >
                    <Tabs defaultActiveKey="1" items={getModalItems(selectedBus)} className="mt-2" />
                </Modal>
            )}
        </div>
    );
};

export default GlobalResultList;