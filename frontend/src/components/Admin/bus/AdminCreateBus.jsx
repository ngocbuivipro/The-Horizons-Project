import { Form, Select, InputNumber, Switch, Button, Input, DatePicker, Modal, Radio } from "antd";
import { useState, useEffect, useMemo } from "react";
import { IoCloudUploadOutline, IoAddCircleOutline } from "react-icons/io5";
import { FaBus, FaDollarSign, FaBan } from "react-icons/fa";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import moment from "moment";

// API & Components
import {
    createBusApi,
    getAllServicesApi,
    uploadByFilesApi,
    uploadByLinkApi,
    getAllBoardingPointsApi,
    createBoardingPointApi,
} from "../../../api/client/api.js";
import { cities } from "../../../common/common.js";
import Services from "../../Services/Services.jsx";
import EditorTiny from "../../TextEditor/EditorTiny.jsx";
import ModelCreateService from "../hotel/AdminCreateHotel/ModelCreateService.jsx";
import AdminCalendar from "../../Utils/Calendar/AdminCalendar.jsx";



const AdminCreateBus = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // --- FORM STATES ---
    const [showModel, setShowModel] = useState(false);
    const [operator, setOperator] = useState("");
    const [busType, setBusType] = useState("Sleeper");
    const [totalSeats, setTotalSeats] = useState(40);
    const [isActive, setIsActive] = useState(true);
    const [cityFrom, setCityFrom] = useState("");
    const [cityTo, setCityTo] = useState("");
    const [departureTime, setDepartureTime] = useState(null);
    const [arrivalTime, setArrivalTime] = useState(null);
    const [price, setPrice] = useState();

    // --- POINTS & MODAL ---
    const [allPoints, setAllPoints] = useState([]);
    const [boardingPoints, setBoardingPoints] = useState([]);
    const [droppingPoints, setDroppingPoints] = useState([]);
    const [isPointModalOpen, setIsPointModalOpen] = useState(false);
    const [newPointData, setNewPointData] = useState({ city: "", name: "", address: "", type: "BOTH" });
    const [pointLoading, setPointLoading] = useState(false);

    // --- MEDIA & DETAILS ---
    const [linkPhoto, setLinkPhoto] = useState("");
    const [photos, setPhotos] = useState([]);
    const [description, setDescription] = useState("");
    const [facilities, setFacilities] = useState([]);
    const [facilitiesDefault, setFacilitiesDefault] = useState([]);

    // --- CALENDAR STATE ---
    const [calendarMode, setCalendarMode] = useState("PRICE");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [openEndDate, setOpenEndDate] = useState(false);
    const [priceEvents, setPriceEvents] = useState("");
    const [daysChoosed, setDaysChoosed] = useState([
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
    ]);
    const [priceExtra, setPriceExtra] = useState([]);
    const [availabilityRules, setAvailabilityRules] = useState([]);

    // Fetch Data
    useEffect(() => {
        const initData = async () => {
            const [resServices, resPoints] = await Promise.all([
                getAllServicesApi(),
                getAllBoardingPointsApi("isActive=true"),
            ]);
            setFacilitiesDefault(resServices.data || []);
            setAllPoints(resPoints.data || []);
        };
        initData();
    }, []);

    const filteredBoardingOptions = useMemo(
        () => allPoints.filter((p) => !cityFrom || p.city.toLowerCase().includes(cityFrom.toLowerCase())),
        [allPoints, cityFrom]
    );
    const filteredDroppingOptions = useMemo(
        () => allPoints.filter((p) => !cityTo || p.city.toLowerCase().includes(cityTo.toLowerCase())),
        [allPoints, cityTo]
    );

    // --- HANDLERS: MEDIA & FACILITIES ---
    const addPhotoByFile = async (ev) => {
        const files = ev.target.files;
        const data = new FormData();
        for (let i = 0; i < files.length; i++) data.append("photos", files[i]);
        const res = await uploadByFilesApi(data);
        if (res.success) setPhotos([...photos, ...res.data.map((item) => item.url)]);
    };
    const addPhotoByLink = (e) => {
        e.preventDefault();
        if (!linkPhoto) return toast.error("Invalid URL");
        uploadByLinkApi({ imageUrl: linkPhoto }).then((res) => {
            if (res.code === 200) {
                setPhotos([...photos, res.data.url]);
                setLinkPhoto("");
            }
        });
    };
    const removePhoto = (ev, filename) => {
        ev.preventDefault();
        setPhotos(photos.filter((photo) => photo !== filename));
    };
    const handleFacilityChange = (id) => {
        setFacilities((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    // --- CALENDAR LOGIC ---

    // 1. Generate Base Events (FIXED LOGIC)
    const baseEvents = useMemo(() => {
        if (!price) return [];
        const events = [];
        // Sử dụng moment() chuẩn để bắt đầu từ đầu ngày hôm nay
        let current = moment().startOf('day');
        const endRange = moment().add(1, "year");

        while (current.isBefore(endRange)) {
            events.push({
                start: current.toDate(),
                end: current.clone().endOf("day").toDate(),
                title: price,
                type: "BASE_PRICE",
                isBlocked: false,
            });
            current.add(1, "day");
        }
        return events;
    }, [price]);

    // 2. Combine with Overrides & Blocks
    const combinedEvents = useMemo(() => {
        const overrideEvents = priceExtra.map((p) => ({
            start: new Date(p.startDate), // Bus dùng startDate/endDate
            end: new Date(p.endDate),
            title: p.price,
            type: "PRICE_OVERRIDE",
            isBlocked: false,
        }));
        const blockEvents = availabilityRules
            .filter((r) => r.isBlocked)
            .map((r) => ({
                start: new Date(r.startDate),
                end: new Date(r.endDate),
                title: "Closed",
                type: "BLOCK",
                isBlocked: true,
            }));
        const occupiedDates = new Set();
        [...overrideEvents, ...blockEvents].forEach((e) => occupiedDates.add(moment(e.start).startOf("day").valueOf()));
        return [
            ...baseEvents.filter((e) => !occupiedDates.has(moment(e.start).startOf("day").valueOf())),
            ...overrideEvents,
            ...blockEvents,
        ];
    }, [baseEvents, priceExtra, availabilityRules]);

    const handleStartDateChange = (date) => {
        setStartDate(date);
        if (date) setOpenEndDate(true);
    };
    const handleEndDateChange = (date) => {
        setEndDate(date);
        setOpenEndDate(false);
    };
    const handleDayClick = (dayShort) => {
        const mapDay = {
            Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday",
            Thu: "Thursday", Fri: "Friday", Sat: "Saturday",
        };
        const fullDay = mapDay[dayShort];
        setDaysChoosed((prev) => (prev.includes(fullDay) ? prev.filter((d) => d !== fullDay) : [...prev, fullDay]));
    };

    // --- HANDLE APPLY CHANGES (Safe & Styled) ---
    const handleApplyChanges = () => {
        if (!startDate || !endDate) return toast.error("Select dates");
        if (calendarMode === "PRICE" && (!priceEvents || Number(priceEvents) <= 0)) return toast.error("Invalid price");

        // FIX: Chuyển đổi rõ ràng sang Moment object
        const start = moment(startDate.toDate()).startOf('day');
        const end = moment(endDate.toDate()).endOf('day');

        let newPrices = [...priceExtra];
        let newRules = [...availabilityRules];

        while (start.isSameOrBefore(end, "day")) {
            const dayName = start.format("dddd");
            if (daysChoosed.includes(dayName)) {
                const dateStartJS = start.toDate();
                const dateEndJS = start.clone().endOf('day').toDate();

                // Clean conflicts (Bus dùng startDate)
                newPrices = newPrices.filter((p) => !moment(p.startDate).isSame(start, "day"));
                newRules = newRules.filter((r) => !moment(r.startDate).isSame(start, "day"));

                if (calendarMode === "PRICE") {
                    newPrices.push({
                        startDate: dateStartJS,
                        endDate: dateEndJS,
                        price: Number(priceEvents),
                    });
                } else {
                    newRules.push({
                        startDate: dateStartJS,
                        endDate: dateEndJS,
                        isBlocked: true,
                        reason: "Manual Block",
                    });
                }
            }
            start.add(1, "days");
        }
        setPriceExtra(newPrices);
        setAvailabilityRules(newRules);

        toast.success("Calendar updated!");
        setPriceEvents("");
        setStartDate(null);
        setEndDate(null);
    };

    // --- SUBMIT ---
    const handleCreatePoint = async () => {
        if (!newPointData.city || !newPointData.name) return toast.error("Missing fields");
        setPointLoading(true);
        try {
            const res = await createBoardingPointApi(newPointData);
            if (res.success) {
                setAllPoints([...allPoints, res.data]);
                setIsPointModalOpen(false);
                setNewPointData({ city: "", name: "", address: "", type: "BOTH" });
                toast.success("Point Created!");
            } else toast.error(res.message);
        } finally {
            setPointLoading(false);
        }
    };

    const handleCreateBus = async () => {
        if (!operator || !price || !departureTime) return toast.error("Missing required info");
        setLoading(true);
        const dataBus = {
            operator,
            busType,
            totalSeats,
            cityFrom,
            cityTo,
            departureTime: departureTime.toDate(),
            arrivalTime: arrivalTime.toDate(),
            price,
            boardingPoints,
            droppingPoints,
            photos,
            description,
            facilities,
            priceExtra,
            availabilityRules,
            isActive,
        };
        try {
            const res = await createBusApi(dataBus);
            if (res.success) {
                toast.success("Bus Created!");
                navigate("/dashboard-view-bus");
            } else toast.error(res.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50/50 ">
                {/* Header */}
                <div className="rounded-md mx-5 top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 mb-8">
                    <div className="max-w-full mx-auto flex justify-between items-center">
                        <h2 className="font-bold text-gray-800 text-2xl flex items-center">
                            <FaBus className="mr-3 text-indigo-600" /> Create New Trip
                        </h2>
                        <div className="flex items-center gap-4">
                            <Switch
                                checked={isActive}
                                onChange={setIsActive}
                                checkedChildren="Active"
                                unCheckedChildren="Inactive"
                                className={isActive ? "bg-green-500" : "bg-gray-300"}
                            />
                            <Button type="primary" onClick={handleCreateBus} loading={loading} className="bg-gray-900 h-10 px-6">
                                Publish
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="max-w-full mx-auto px-4 md:px-6 flex flex-col gap-6 pb-6">

                    {/* 1. BUS INFORMATION & ROUTE (Gộp lại cho gọn hoặc để riêng tùy thích, ở đây giữ tách biệt nhưng compact hơn) */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                        {/* BUS INFO CARD */}
                        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 h-full">
                            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-50">
                                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                                <h2 className="font-bold text-gray-800 text-lg">Bus Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Operator - Chiếm 2 cột trên mobile, 2 cột trên desktop */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Operator Name</label>
                                    <Input
                                        size="large"
                                        placeholder="e.g. InterBus Lines"
                                        value={operator}
                                        onChange={(e) => setOperator(e.target.value)}
                                        className="!bg-gray-50 !border-gray-200 focus:!bg-white rounded-xl font-medium text-gray-700"
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Bus Type</label>
                                    <Select
                                        size="large"
                                        value={busType}
                                        onChange={setBusType}
                                        className="w-full"
                                        placeholder="Select type"
                                        options={["Sleeper", "Seater", "Limousine", "Cabin"].map((t) => ({ label: t, value: t }))}
                                    />
                                </div>

                                {/* Seats */}
                                <div >
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Total Seats</label>
                                    <InputNumber
                                        size="large"
                                        min={1}
                                        placeholder="40"
                                        value={totalSeats}
                                        onChange={setTotalSeats}
                                        style={{ width: "100%" }}
                                        className="w-full !bg-gray-50 !border-gray-200 rounded-xl"
                                    />
                                </div>

                                {/* Price - Chiếm full hàng dưới */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Base Ticket Price</label>
                                    <div className="relative">
                                        <InputNumber
                                            size="large"
                                            style={{ width: "100%" }}
                                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            parser={(v) => v?.replace(/\$\s?|(,*)/g, "")}
                                            value={price}
                                            onChange={setPrice}
                                            placeholder="0"
                                            className="!bg-gray-50 !border-gray-200 rounded-xl !w-full"
                                            controls={false}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">VND</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ROUTE & SCHEDULE CARD */}
                        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 h-full">
                            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-50">
                                <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                                <h2 className="font-bold text-gray-800 text-lg">Route & Schedule</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* From */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Departure City</label>
                                    <Select
                                        size="large"
                                        showSearch
                                        value={cityFrom}
                                        onChange={setCityFrom}
                                        placeholder="Select City"
                                        options={cities.map((c) => ({ label: c.name, value: c.name }))}
                                        className="w-full"
                                    />
                                </div>

                                {/* To */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Arrival City</label>
                                    <Select
                                        size="large"
                                        showSearch
                                        value={cityTo}
                                        onChange={setCityTo}
                                        placeholder="Select City"
                                        options={cities.map((c) => ({ label: c.name, value: c.name }))}
                                        className="w-full"
                                    />
                                </div>

                                {/* Departure Time */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Departure Time</label>
                                    <DatePicker
                                        showTime
                                        size="large"
                                        className="w-full !bg-gray-50 !border-gray-200 rounded-xl"
                                        value={departureTime}
                                        onChange={setDepartureTime}
                                        format="DD/MM/YYYY HH:mm"
                                        placeholder="Select date & time"
                                    />
                                </div>

                                {/* Arrival Time */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Arrival Time</label>
                                    <DatePicker
                                        showTime
                                        size="large"
                                        className="w-full !bg-gray-50 !border-gray-200 rounded-xl"
                                        value={arrivalTime}
                                        onChange={setArrivalTime}
                                        format="DD/MM/YYYY HH:mm"
                                        placeholder="Select date & time"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. POINTS (Full Width) */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                                <h2 className="font-bold text-gray-800 text-lg">Pick-up & Drop-off Points</h2>
                            </div>
                            <Button type="text" className="bg-purple-50 text-purple-600 font-medium hover:bg-purple-100" icon={<IoAddCircleOutline size={18} />} onClick={() => setIsPointModalOpen(true)}>
                                New Point
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Pick-up Locations</label>
                                <Select
                                    mode="multiple"
                                    size="large"
                                    placeholder="Select pick-up points..."
                                    value={boardingPoints}
                                    onChange={setBoardingPoints}
                                    options={filteredBoardingOptions.map((p) => ({ label: `${p.name} (${p.city})`, value: p._id }))}
                                    className="w-full"
                                    style={{ minHeight: '50px' }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Drop-off Locations</label>
                                <Select
                                    mode="multiple"
                                    size="large"
                                    placeholder="Select drop-off points..."
                                    value={droppingPoints}
                                    onChange={setDroppingPoints}
                                    options={filteredDroppingOptions.map((p) => ({ label: `${p.name} (${p.city})`, value: p._id }))}
                                    className="w-full"
                                    style={{ minHeight: '50px' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 4. CALENDAR: PRICING & AVAILABILITY */}
                    <div className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-shadow hover:shadow-md overflow-hidden">
                        <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                            <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                            <h2 className="font-bold text-gray-800 text-lg">Calendar & Availability</h2>
                        </div>

                        <div className="flex flex-col xl:flex-row gap-8">
                            <div className="flex-1">
                                <AdminCalendar events={combinedEvents} />
                            </div>

                            {/* Control Panel */}
                            <div className="w-full xl:w-1/3 h-fit bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full block"></span> Manage Calendar
                                </h3>

                                {/* Mode Switcher */}
                                <div className="mb-6 p-1 bg-gray-100 rounded-xl flex">
                                    <button
                                        onClick={() => setCalendarMode("PRICE")}
                                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                                            calendarMode === "PRICE" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    >
                                        <FaDollarSign className="inline mb-0.5 mr-1" /> Set Price
                                    </button>
                                    <button
                                        onClick={() => setCalendarMode("BLOCK")}
                                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                                            calendarMode === "BLOCK" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    >
                                        <FaBan className="inline mb-0.5 mr-1" /> Block Dates
                                    </button>
                                </div>

                                {/* Date Range */}
                                <div className="mb-6">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Date Range</label>
                                    <div className="flex flex-col gap-3">
                                        <DatePicker
                                            className="w-full h-11 !bg-gray-50 !border-gray-200 rounded-xl"
                                            disabledDate={(c) => c && c < moment().endOf("day")}
                                            value={startDate}
                                            onChange={handleStartDateChange}
                                            placeholder="Start Date"
                                            format="DD/MM/YYYY"
                                        />
                                        <DatePicker
                                            className="w-full h-11 !bg-gray-50 !border-gray-200 rounded-xl"
                                            disabledDate={(c) => c && c < moment().endOf("day")}
                                            value={endDate}
                                            open={openEndDate}
                                            onChange={handleEndDateChange}
                                            onClick={() => setOpenEndDate(true)}
                                            placeholder="End Date"
                                            format="DD/MM/YYYY"
                                        />
                                    </div>
                                </div>

                                {/* Recurring Days */}
                                <div className="mb-6">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Recur on Days</label>
                                    <div className="flex flex-wrap gap-2">
                                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => {
                                            const fullNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                                            const isSel = daysChoosed.includes(fullNames[idx]);
                                            return (
                                                <div
                                                    key={idx}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        handleDayClick(day);
                                                    }}
                                                    className={`cursor-pointer w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-sm border ${
                                                        isSel
                                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200 scale-105"
                                                            : "bg-white text-gray-500 hover:text-indigo-600 border-gray-200 hover:border-indigo-300"
                                                    }`}
                                                >
                                                    {day.charAt(0)}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Dynamic Action Input */}
                                <div className="mb-8">
                                    {calendarMode === "PRICE" ? (
                                        <div className="relative group">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">
                                                Price per night
                                            </label>
                                            <InputNumber
                                                className="w-full !rounded-xl !bg-gray-50 !border-gray-200 hover:!border-indigo-500 focus-within:!border-indigo-500 focus-within:!ring-2 focus-within:!ring-indigo-500/20 shadow-sm transition-all duration-200"
                                                placeholder="0"
                                                value={priceEvents}
                                                onChange={(val) => setPriceEvents(val)}
                                                min={0}
                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                                                style={{ width: '100%' }}
                                                controls={false}
                                                size="large"
                                            />
                                            <span className="absolute right-4 top-[38px] text-xs font-bold text-gray-400 pointer-events-none">VND</span>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center shadow-sm">
                                            <p className="text-red-600 text-sm font-semibold flex items-center justify-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                Selected dates will be closed
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Apply Button */}
                                <button
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleApplyChanges();
                                    }}
                                    className={`w-full py-3.5 text-white rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] ${
                                        calendarMode === "PRICE"
                                            ? "bg-gray-900 hover:bg-gray-800"
                                            : "bg-red-500 hover:bg-red-600"
                                    }`}
                                >
                                    {calendarMode === "PRICE" ? "Apply Price" : "Block Dates"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 5. Images & Details */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                        <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                            <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
                            <h2 className="font-bold text-gray-800 text-lg">Images & Details</h2>
                        </div>

                        {/* Photos Upload */}
                        <div className="flex flex-col gap-5 mb-8">
                            <div className="flex gap-3">
                                <Input
                                    size="large"
                                    placeholder="Paste image URL..."
                                    value={linkPhoto}
                                    onChange={(e) => setLinkPhoto(e.target.value)}
                                    className="!bg-gray-50 !border-gray-200 focus:!bg-white rounded-xl flex-1"
                                />
                                <Button size="large" onClick={addPhotoByLink} className="rounded-xl bg-gray-900 text-white border-0 hover:!bg-gray-800 font-medium px-6">
                                    Add
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-4">
                                <label className="border-2 border-dashed border-gray-300 rounded-xl h-32 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                                    <input type="file" multiple className="hidden" onChange={addPhotoByFile} />
                                    <IoCloudUploadOutline size={28} />
                                    <span className="text-xs font-bold mt-2 uppercase">Upload</span>
                                </label>
                                {photos.map((item, idx) => (
                                    <div key={idx} className="relative h-32 group rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                        <img src={item} alt="bus" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>
                                        <button
                                            onClick={(ev) => removePhoto(ev, item)}
                                            className="absolute top-2 right-2 bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                            {/* LEFT: OVERVIEW (8/12) */}
                            <div className="xl:col-span-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                                    <h4 className="font-bold text-gray-800 text-lg">Overview</h4>
                                </div>
                                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                    <EditorTiny handleEditorChange={setDescription} description={description} />
                                </div>
                            </div>

                            {/* RIGHT: SERVICES (4/12) */}
                            <div className="xl:col-span-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                                    <h4 className="font-bold text-gray-800 text-lg">Amenities</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        onClick={() => setShowModel(true)}
                                        className="cursor-pointer h-[100px] border-2 border-dashed border-gray-300 rounded-xl p-2
                        flex flex-col items-center justify-center text-gray-400 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-600 transition-all text-center group"
                                    >
                                        <IoCloudUploadOutline size={24} className="group-hover:scale-110 transition-transform"/>
                                        <span className="text-xs font-bold mt-2 uppercase">Add Service</span>
                                    </div>
                                    {/* Component Services cần style tương thích hoặc để grid ở đây */}
                                    <Services
                                        handleServiceChange={handleFacilityChange}
                                        setServicesDefault={setFacilitiesDefault}
                                        servicesDefault={facilitiesDefault}
                                        services={facilities}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Create Point */}
                <Modal title="Create Point" open={isPointModalOpen} onCancel={() => setIsPointModalOpen(false)} footer={null}>
                    <Form layout="vertical" onFinish={handleCreatePoint}>
                        <Form.Item label="City">
                            <Select
                                showSearch
                                value={newPointData.city}
                                onChange={(v) => setNewPointData({ ...newPointData, city: v })}
                                options={cities.map((c) => ({ label: c.name, value: c.name }))}
                            />
                        </Form.Item>
                        <Form.Item label="Name">
                            <Input
                                value={newPointData.name}
                                onChange={(e) => setNewPointData({ ...newPointData, name: e.target.value })}
                            />
                        </Form.Item>
                        <Form.Item label="Address">
                            <Input
                                value={newPointData.address}
                                onChange={(e) => setNewPointData({ ...newPointData, address: e.target.value })}
                            />
                        </Form.Item>
                        <Form.Item label="Type">
                            <Radio.Group
                                value={newPointData.type}
                                onChange={(e) => setNewPointData({ ...newPointData, type: e.target.value })}
                            >
                                <Radio value="BOTH">Both</Radio>
                                <Radio value="BOARDING">Pick-up</Radio>
                                <Radio value="DROPPING">Drop-off</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={pointLoading} block className="bg-indigo-600">
                            Create
                        </Button>
                    </Form>
                </Modal>

                {showModel && (
                    <ModelCreateService
                        services={facilities}
                        setServices={setFacilities}
                        setShowModel={setShowModel}
                    />
                )}
            </div>
        </>
    );
};

export default AdminCreateBus;