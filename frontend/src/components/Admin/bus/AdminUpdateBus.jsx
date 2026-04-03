import { Form, Select, InputNumber, Switch, Button, Input, DatePicker, Modal, Radio } from "antd";
import { useState, useEffect, useMemo } from "react";
import { IoCloudUploadOutline, IoAddCircleOutline } from "react-icons/io5";
// Added FaUnlock here
import { FaEye, FaEyeSlash, FaDollarSign, FaBan, FaUnlock } from "react-icons/fa";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import moment from "moment";

// API & Components
import {
    createBoardingPointApi,
    getAllBoardingPointsApi,
    getAllServicesApi,
    getBusDetailApi,
    updateBusApi,
    uploadByFilesApi,
    uploadByLinkApi
} from "../../../api/client/api.js";
import { cities } from "../../../common/common.js";
import EditorTiny from "../../TextEditor/EditorTiny.jsx";
import Services from "../../Services/Services.jsx";
import ModelCreateService from "../hotel/AdminCreateHotel/ModelCreateService.jsx";
import AdminCalendar from "../../Utils/Calendar/AdminCalendar.jsx";


const AdminUpdateBus = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [showModel, setShowModel] = useState(false);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // 1. Basic Info
    const [operator, setOperator] = useState("");
    const [busType, setBusType] = useState("Sleeper");
    const [totalSeats, setTotalSeats] = useState(40);
    const [isActive, setIsActive] = useState(true);

    // 2. Route & Schedule
    const [cityFrom, setCityFrom] = useState("");
    const [cityTo, setCityTo] = useState("");
    const [departureTime, setDepartureTime] = useState(null);
    const [arrivalTime, setArrivalTime] = useState(null);
    const [price, setPrice] = useState();

    // 3. Boarding / Dropping Points
    const [allPoints, setAllPoints] = useState([]);
    const [boardingPoints, setBoardingPoints] = useState([]);
    const [droppingPoints, setDroppingPoints] = useState([]);

    // 4. Modal Create Point
    const [isPointModalOpen, setIsPointModalOpen] = useState(false);
    const [newPointData, setNewPointData] = useState({ city: "", name: "", address: "", type: "BOTH" });
    const [pointLoading, setPointLoading] = useState(false);

    // 5. Media & Details
    const [linkPhoto, setLinkPhoto] = useState("");
    const [photos, setPhotos] = useState([]);
    const [description, setDescription] = useState("");
    const [facilities, setFacilities] = useState([]);
    const [facilitiesDefault, setFacilitiesDefault] = useState([]);

    // 6. Calendar
    const [calendarMode, setCalendarMode] = useState("PRICE"); // "PRICE" | "BLOCK" | "OPEN"
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [openEndDate, setOpenEndDate] = useState(false);
    const [priceEvents, setPriceEvents] = useState("");
    const [daysChoosed, setDaysChoosed] = useState(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
    const [priceExtra, setPriceExtra] = useState([]);
    const [availabilityRules, setAvailabilityRules] = useState([]);

    // --- INITIAL FETCH ---
    useEffect(() => {
        const initData = async () => {
            setFetching(true);
            try {
                const [resServices, resPoints] = await Promise.all([
                    getAllServicesApi(),
                    getAllBoardingPointsApi("isActive=true")
                ]);
                setFacilitiesDefault(resServices.data || []);
                setAllPoints(resPoints.data || []);

                if (id) {
                    const resBus = await getBusDetailApi(id);
                    if (resBus.success) {
                        const data = resBus.data;
                        setOperator(data.operator);
                        setBusType(data.busType);
                        setTotalSeats(data.totalSeats);
                        setIsActive(data.isActive);
                        setCityFrom(data.cityFrom);
                        setCityTo(data.cityTo);
                        setPrice(data.price);
                        setDepartureTime(moment(data.departureTime));
                        setArrivalTime(moment(data.arrivalTime));
                        setPhotos(data.photos || []);
                        setDescription(data.conditions || "");
                        setFacilities(data.facilities ? data.facilities.map(f => f._id || f) : []);
                        setBoardingPoints(data.boardingPoints ? data.boardingPoints.map(p => p._id || p) : []);
                        setDroppingPoints(data.droppingPoints ? data.droppingPoints.map(p => p._id || p) : []);
                        setPriceExtra(data.priceExtra || []);
                        setAvailabilityRules(data.availabilityRules || []);
                    } else {
                        toast.error("Bus not found");
                        navigate("/dashboard-view-bus");
                    }
                }
            } catch (error) {
                console.error(error);
                toast.error("Error fetching bus data");
            } finally {
                setFetching(false);
            }
        };
        initData();
    }, [id, navigate]);

    const filteredBoardingOptions = useMemo(() => allPoints.filter(p => !cityFrom || p.city.toLowerCase().includes(cityFrom.toLowerCase())), [allPoints, cityFrom]);
    const filteredDroppingOptions = useMemo(() => allPoints.filter(p => !cityTo || p.city.toLowerCase().includes(cityTo.toLowerCase())), [allPoints, cityTo]);

    // --- HANDLERS ---
    const addPhotoByFile = async (ev) => {
        const files = ev.target.files;
        const data = new FormData();
        for (let i = 0; i < files.length; i++) data.append("photos", files[i]);
        const res = await uploadByFilesApi(data);
        if (res.success) setPhotos([...photos, ...res.data.map((item) => item.url)]);
    };
    const addPhotoByLink = async (e) => {
        e.preventDefault();
        if (!linkPhoto) return toast.error("Invalid URL");
        const res = await uploadByLinkApi({ imageUrl: linkPhoto });
        if (res.code === 200) {
            setPhotos([...photos, res.data.url]);
            setLinkPhoto("");
        }
    };
    const removePhoto = (ev, filename) => {
        ev.preventDefault();
        setPhotos(photos.filter((photo) => photo !== filename));
    };
    const handleFacilityChange = (id) => {
        setFacilities((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
    };

    // Calendar Logic
    const baseEvents = useMemo(() => {
        if (!price) return [];
        const events = [];
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

    const combinedEvents = useMemo(() => {
        const overrideEvents = priceExtra.map((p) => ({
            start: new Date(p.startDate),
            end: new Date(p.endDate),
            title: p.price,
            type: "PRICE_OVERRIDE",
            isBlocked: false,
        }));
        const blockEvents = availabilityRules.filter((r) => r.isBlocked).map((r) => ({
            start: new Date(r.startDate),
            end: new Date(r.endDate),
            title: "Closed",
            type: "BLOCK",
            isBlocked: true,
        }));
        const occupiedDates = new Set();
        [...overrideEvents, ...blockEvents].forEach((e) => {
            occupiedDates.add(moment(e.start).startOf("day").valueOf());
        });
        const filteredBase = baseEvents.filter((e) => !occupiedDates.has(moment(e.start).startOf("day").valueOf()));
        return [...filteredBase, ...overrideEvents, ...blockEvents];
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
        const mapDay = { "Sun": "Sunday", "Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday", "Thu": "Thursday", "Fri": "Friday", "Sat": "Saturday" };
        const fullDay = mapDay[dayShort];
        setDaysChoosed(prev => prev.includes(fullDay) ? prev.filter(d => d !== fullDay) : [...prev, fullDay]);
    };

    // --- UPDATED APPLY CALENDAR WITH OPEN LOGIC ---
    const handleApplyCalendar = () => {
        if (!startDate || !endDate) return toast.error("Please select date range");

        // Validate Price only if mode is PRICE
        if (calendarMode === "PRICE" && (!priceEvents || Number(priceEvents) <= 0)) return toast.error("Invalid price");

        const start = moment(startDate.toDate()).startOf('day');
        const end = moment(endDate.toDate()).endOf('day');
        let newPrices = [...priceExtra];
        let newRules = [...availabilityRules];

        while (start.isSameOrBefore(end, 'day')) {
            const dayName = start.format('dddd');
            if (daysChoosed.includes(dayName)) {
                const dateStartJS = start.toDate();
                const dateEndJS = start.clone().endOf('day').toDate();

                // 1. CLEAN UP: Always remove existing data for this day first
                newPrices = newPrices.filter(p => !moment(p.startDate).isSame(start, 'day'));
                newRules = newRules.filter(r => !moment(r.startDate).isSame(start, 'day'));

                // 2. ADD NEW: Only add if not in OPEN mode
                if (calendarMode === "PRICE") {
                    newPrices.push({ startDate: dateStartJS, endDate: dateEndJS, price: Number(priceEvents), title: "Holiday Price" });
                } else if (calendarMode === "BLOCK") {
                    newRules.push({ startDate: dateStartJS, endDate: dateEndJS, isBlocked: true, reason: "Maintenance" });
                }
                // If OPEN mode, we do nothing (leaving it cleaned/unblocked)
            }
            start.add(1, 'days');
        }
        setPriceExtra(newPrices);
        setAvailabilityRules(newRules);

        toast.success(calendarMode === "OPEN" ? "Dates unblocked!" : "Calendar updated!");
        setPriceEvents("");
        setStartDate(null);
        setEndDate(null);
    };

    const handleCreatePoint = async () => {
        if (!newPointData.city || !newPointData.name || !newPointData.address) return toast.error("Fill all fields");
        setPointLoading(true);
        try {
            const res = await createBoardingPointApi(newPointData);
            if (res.success) {
                toast.success("Point created!");
                setAllPoints([...allPoints, res.data]);
                setIsPointModalOpen(false);
                setNewPointData({ city: "", name: "", address: "", type: "BOTH" });
            } else toast.error(res.message);
        } catch (error) {
            toast.error("Failed to create point, ",error);
        } finally {
            setPointLoading(false);
        }
    };

    const handleUpdateBus = async (e) => {
        e.preventDefault();
        if (!operator || !price || !cityFrom || !cityTo || !departureTime || !arrivalTime) return toast.error("Missing required fields");
        if (departureTime >= arrivalTime) return toast.error("Arrival must be after Departure");

        setLoading(true);
        const dataBus = {
            operator, busType, totalSeats,
            cityFrom, cityTo,
            departureTime: departureTime.toDate(),
            arrivalTime: arrivalTime.toDate(),
            price,
            boardingPoints, droppingPoints,
            photos,
            conditions: description,
            facilities,
            priceExtra, availabilityRules,
            isActive
        };

        try {
            const res = await updateBusApi(id, dataBus);
            if (res.success) {
                toast.success("Bus Updated Successfully!");
                navigate("/dashboard-view-bus");
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Internal Server Error");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            Loading...
        </div>
    );

    return (
        <>
            <div className="min-h-screen bg-gray-50/50 pb-20">
                {/* Header */}
                <div className="rounded-md mx-5 top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 mb-8 sticky">
                    <div className="max-w-full mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="font-bold text-gray-800 text-2xl tracking-tight">Update Bus</h2>
                            <p className="text-gray-500 text-sm mt-1">Operator: <span className="font-semibold text-indigo-600">{operator}</span></p>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 px-3">
                                <span className={`text-sm font-semibold flex items-center gap-2 ${isActive ? "text-green-600" : "text-gray-500"}`}>
                                    {isActive ? <FaEye /> : <FaEyeSlash />} {isActive ? "Active" : "Inactive"}
                                </span>
                                <Switch checked={isActive} onChange={setIsActive} className={isActive ? "bg-green-500" : "bg-gray-300"} />
                            </div>
                            <Button
                                type="primary"
                                onClick={handleUpdateBus}
                                loading={loading}
                                className="h-10 px-6 rounded-lg font-medium shadow-md border-0 bg-gray-900 hover:!bg-gray-800"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="max-w-full mx-auto px-4 md:px-6 flex flex-col gap-6">

                    {/* 1. BUS INFO & ROUTE (SIDE BY SIDE) */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Bus Info */}
                        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 h-full">
                            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-50">
                                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                                <h2 className="font-bold text-gray-800 text-lg">Bus Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Operator Name</label>
                                    <Input size="large" value={operator} onChange={(e) => setOperator(e.target.value)} className="!bg-gray-50 !border-gray-200 focus:!bg-white rounded-xl font-medium text-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Bus Type</label>
                                    <Select size="large" value={busType} onChange={setBusType} className="w-full" options={["Sleeper", "Seater", "Limousine", "Cabin"].map(t => ({ label: t, value: t }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Total Seats</label>
                                    <InputNumber style={{ width: "100%" }} size="large" min={1} value={totalSeats} onChange={setTotalSeats} className="w-full !bg-gray-50 !border-gray-200 rounded-xl" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Base Price</label>
                                    <div className="relative">
                                        <InputNumber
                                            size="large" style={{ width: "100%" }}
                                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            parser={(v) => v?.replace(/\$\s?|(,*)/g, "")}
                                            value={price} onChange={setPrice}
                                            className="!bg-gray-50 !border-gray-200 rounded-xl !w-full"
                                            controls={false}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">VND</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Route Schedule */}
                        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 h-full">
                            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-50">
                                <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                                <h2 className="font-bold text-gray-800 text-lg">Route & Schedule</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Departure City</label>
                                    <Select size="large" showSearch value={cityFrom} onChange={setCityFrom} options={cities.map(c => ({ label: c.name, value: c.name }))} className="w-full" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Arrival City</label>
                                    <Select size="large" showSearch value={cityTo} onChange={setCityTo} options={cities.map(c => ({ label: c.name, value: c.name }))} className="w-full" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Departure Time</label>
                                    <DatePicker showTime size="large" className="w-full !bg-gray-50 !border-gray-200 rounded-xl" value={departureTime} onChange={setDepartureTime} format="DD/MM/YYYY HH:mm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Arrival Time</label>
                                    <DatePicker showTime size="large" className="w-full !bg-gray-50 !border-gray-200 rounded-xl" value={arrivalTime} onChange={setArrivalTime} format="DD/MM/YYYY HH:mm" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. POINTS */}
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
                                    mode="multiple" size="large"
                                    value={boardingPoints} onChange={setBoardingPoints}
                                    options={filteredBoardingOptions.map(p => ({ label: `${p.name} (${p.city})`, value: p._id }))}
                                    className="w-full" style={{ minHeight: '50px' }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Drop-off Locations</label>
                                <Select
                                    mode="multiple" size="large"
                                    value={droppingPoints} onChange={setDroppingPoints}
                                    options={filteredDroppingOptions.map(p => ({ label: `${p.name} (${p.city})`, value: p._id }))}
                                    className="w-full" style={{ minHeight: '50px' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. CALENDAR */}
                    <div className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-shadow hover:shadow-md overflow-hidden">
                        <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                            <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                            <h2 className="font-bold text-gray-800 text-lg">Calendar & Availability</h2>
                        </div>
                        <div className="flex flex-col xl:flex-row gap-8">
                            <div className="flex-1">
                                <AdminCalendar events={combinedEvents} />
                            </div>
                            <div className="w-full xl:w-1/3 h-fit bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full block"></span> Manage Calendar
                                </h3>

                                {/* UPDATED MODE SWITCHER */}
                                <div className="mb-6 p-1 bg-gray-100 rounded-xl flex">
                                    <button onClick={() => setCalendarMode("PRICE")} className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${calendarMode === "PRICE" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                        <FaDollarSign className="inline mb-0.5 mr-1" /> Price
                                    </button>
                                    <button onClick={() => setCalendarMode("BLOCK")} className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${calendarMode === "BLOCK" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                        <FaBan className="inline mb-0.5 mr-1" /> Block
                                    </button>
                                    <button onClick={() => setCalendarMode("OPEN")} className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${calendarMode === "OPEN" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                        <FaUnlock className="inline mb-0.5 mr-1" /> Open
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Date Range</label>
                                    <div className="flex flex-col gap-3">
                                        <DatePicker className="w-full h-11 !bg-gray-50 !border-gray-200 rounded-xl" disabledDate={(c) => c && c < moment().endOf('day')} value={startDate} onChange={handleStartDateChange} placeholder="Start Date" format="DD/MM/YYYY" />
                                        <DatePicker className="w-full h-11 !bg-gray-50 !border-gray-200 rounded-xl" disabledDate={(c) => c && c < moment().endOf('day')} value={endDate} open={openEndDate} onChange={handleEndDateChange} onClick={() => setOpenEndDate(true)} placeholder="End Date" format="DD/MM/YYYY" />
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Recur on Days</label>
                                    <div className="flex flex-wrap gap-2">
                                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => {
                                            const isSel = daysChoosed.includes(day === "Sun" ? "Sunday" : day === "Mon" ? "Monday" : day === "Tue" ? "Tuesday" : day === "Wed" ? "Wednesday" : day === "Thu" ? "Thursday" : day === "Fri" ? "Friday" : "Saturday");
                                            return (
                                                <div key={idx} onMouseDown={(e) => { e.preventDefault(); handleDayClick(day); }} className={`cursor-pointer w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-sm border ${isSel ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200 scale-105" : "bg-white text-gray-500 hover:text-indigo-600 border-gray-200 hover:border-indigo-300"}`}>{day.charAt(0)}</div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* UPDATED DYNAMIC INPUTS */}
                                <div className="mb-8">
                                    {calendarMode === "PRICE" && (
                                        <div className="relative group">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Price per night</label>
                                            <InputNumber
                                                className="w-full !rounded-xl !bg-gray-50 !border-gray-200 hover:!border-indigo-500 focus-within:!border-indigo-500 focus-within:!ring-2 focus-within:!ring-indigo-500/20 shadow-sm transition-all duration-200"
                                                placeholder="0" value={priceEvents} onChange={(val) => setPriceEvents(val)} min={0}
                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                                                style={{ width: '100%' }} controls={false} size="large"
                                            />
                                            <span className="absolute right-4 top-[38px] text-xs font-bold text-gray-400 pointer-events-none">VND</span>
                                        </div>
                                    )}

                                    {calendarMode === "BLOCK" && (
                                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center shadow-sm">
                                            <p className="text-red-600 text-sm font-semibold flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Selected dates will be closed</p>
                                        </div>
                                    )}

                                    {calendarMode === "OPEN" && (
                                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center shadow-sm">
                                            <p className="text-emerald-600 text-sm font-semibold flex items-center justify-center gap-2">
                                                <FaUnlock />
                                                Selected dates will be available
                                            </p>
                                            <p className="text-xs text-emerald-500 mt-1">
                                                Removes custom blocks & prices
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onMouseDown={(e) => { e.preventDefault(); handleApplyCalendar(); }}
                                    className={`w-full py-3.5 text-white rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] 
                                    ${calendarMode === "PRICE"
                                        ? "bg-gray-900 hover:bg-gray-800"
                                        : calendarMode === "BLOCK"
                                            ? "bg-red-500 hover:bg-red-600"
                                            : "bg-emerald-500 hover:bg-emerald-600" // Green for Open
                                    }`}
                                >
                                    {calendarMode === "PRICE" ? "Apply Price" : calendarMode === "BLOCK" ? "Block Dates" : "Unblock / Open"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 4. IMAGES, OVERVIEW & SERVICES */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                        <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                            <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
                            <h2 className="font-bold text-gray-800 text-lg">Images & Details</h2>
                        </div>
                        <div className="flex flex-col gap-5 mb-8">
                            <div className="flex gap-3">
                                <Input size="large" placeholder="Paste image URL..." value={linkPhoto} onChange={(e) => setLinkPhoto(e.target.value)} className="!bg-gray-50 !border-gray-200 focus:!bg-white rounded-xl flex-1" />
                                <Button size="large" onClick={addPhotoByLink} className="rounded-xl bg-gray-900 text-white border-0 hover:!bg-gray-800 font-medium px-6">Add</Button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-4">
                                <label className="border-2 border-dashed border-gray-300 rounded-xl h-32 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                                    <input type="file" multiple className="hidden" onChange={addPhotoByFile} />
                                    <IoCloudUploadOutline size={28} /><span className="text-xs font-bold mt-2 uppercase">Upload</span>
                                </label>
                                {photos.map((item, idx) => (
                                    <div key={idx} className="relative h-32 group rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                        <img src={item} alt="bus" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>
                                        <button onClick={(ev) => removePhoto(ev, item)} className="absolute top-2 right-2 bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white">✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                            <div className="xl:col-span-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                                    <h4 className="font-bold text-gray-800 text-lg">Overview</h4>
                                </div>
                                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                    <EditorTiny handleEditorChange={setDescription} description={description} />
                                </div>
                            </div>
                            <div className="xl:col-span-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                                    <h4 className="font-bold text-gray-800 text-lg">Amenities</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div onClick={() => setShowModel(true)} className="cursor-pointer h-[100px] border-2 border-dashed border-gray-300 rounded-xl p-2 flex flex-col items-center justify-center text-gray-400 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-600 transition-all text-center group">
                                        <IoCloudUploadOutline size={24} className="group-hover:scale-110 transition-transform"/>
                                        <span className="text-xs font-bold mt-2 uppercase">Add Service</span>
                                    </div>
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

                    {/* Modal Create Point */}
                    <Modal title="Create Point" open={isPointModalOpen} onCancel={() => setIsPointModalOpen(false)} footer={null}>
                        <Form layout="vertical" onFinish={handleCreatePoint}>
                            <Form.Item label="City" required><Select showSearch value={newPointData.city} onChange={v => setNewPointData({ ...newPointData, city: v })} options={cities.map(c => ({ label: c.name, value: c.name }))} /></Form.Item>
                            <Form.Item label="Name" required><Input value={newPointData.name} onChange={e => setNewPointData({ ...newPointData, name: e.target.value })} /></Form.Item>
                            <Form.Item label="Address" required><Input value={newPointData.address} onChange={e => setNewPointData({ ...newPointData, address: e.target.value })} /></Form.Item>
                            <Form.Item label="Type"><Radio.Group value={newPointData.type} onChange={e => setNewPointData({ ...newPointData, type: e.target.value })}><Radio value="BOTH">Both</Radio><Radio value="BOARDING">Pick-up</Radio><Radio value="DROPPING">Drop-off</Radio></Radio.Group></Form.Item>
                            <Button type="primary" htmlType="submit" loading={pointLoading} block className="bg-indigo-600">Create</Button>
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
            </div>
        </>
    );
};

export default AdminUpdateBus;