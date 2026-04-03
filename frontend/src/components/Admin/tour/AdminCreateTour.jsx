import {Form, Select, InputNumber, Switch, Button, Input, DatePicker, Tooltip} from "antd";
import React, {useState, useEffect, useMemo} from "react";
import {IoCloudUploadOutline, IoAddCircleOutline, IoTrashOutline} from "react-icons/io5";
import {FaEye, FaEyeSlash, FaStar, FaDollarSign, FaBan, FaQuestionCircle} from "react-icons/fa";
import {EnvironmentOutlined, ClockCircleOutlined, TeamOutlined, DollarOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router";
import toast from "react-hot-toast";
import moment from "moment";

// API & Components
import {
    createTourApi,
    getAllServicesApi, getPolicyApi,
    uploadByFilesApi,
    uploadByLinkApi,
} from "../../../api/client/api.js";
import {cities} from "../../../common/common.js";
import EditorTiny from "../../TextEditor/EditorTiny.jsx";
import AdminCalendar from "../../Utils/Calendar/AdminCalendar.jsx";
import ModelCreateService from "../hotel/AdminCreateHotel/ModelCreateService.jsx";
import Services from "../../Services/Services.jsx";
import Policy from "../../Utils/Policy/Policy.jsx";
import ModelCreatePolicy from "../../Hotel/ModelCreatePolicy/ModelCreatePolicy.jsx";

const {TextArea} = Input;

const TOUR_TYPES = [
    {value: "Adventure", label: "Adventure"},
    {value: "City Tour", label: "City Tour"},
    {value: "Beach", label: "Beach"},
    {value: "Cultural", label: "Cultural"},
    {value: "Food", label: "Food"},
    {value: "Nature", label: "Nature"},
    {value: "Relaxation", label: "Relaxation"},
    {value: "History", label: "History"},
];

const AdminCreateTour = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [loading, setLoading] = useState(false);

    // Basic Info
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [tourType, setTourType] = useState("");
    const [duration, setDuration] = useState(1);
    const [durationText, setDurationText] = useState("");
    const [maxGroupSize, setMaxGroupSize] = useState(10);
    const [price, setPrice] = useState(); // Base Price
    const [priceChildren, setPriceChildren] = useState();
    const [featured, setFeatured] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Media & Details
    const [linkPhoto, setLinkPhoto] = useState("");
    const [photos, setPhotos] = useState([]);
    const [description, setDescription] = useState("");
    const [services, setServices] = useState([]);
    const [servicesDefault, setServicesDefault] = useState([]);
    const [itinerary, setItinerary] = useState([{day: 1, title: "", description: ""}]);

    // 2. STATE CHO MODAL SERVICE
    const [showModel, setShowModel] = useState(false);

    // --- CALENDAR STATE ---
    const [calendarMode, setCalendarMode] = useState("PRICE");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [openEndDate, setOpenEndDate] = useState(false);
    const [priceEvents, setPriceEvents] = useState(""); // Input value
    const [daysChoosed, setDaysChoosed] = useState([
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
    ]);

    // --- POLICY STATE ---
    const [typePolicyDefault, setTypePolicyDefault] = useState([
        "Cancellation Policy",
        "Tour Regulations",
        "Safety & Health",
        "Booking Conditions",
    ]);
    const [policyChecked, setPolicyChecked] = useState([]); // Lưu ID đã chọn (Global)
    const [typePolicy, setTypePolicy] = useState("Cancellation Policy");
    const [policy, setPolicy] = useState([]); // Lưu options hiển thị (Local theo type)
    const [showModelPolicy, setShowModelPolicy] = useState(false);

    // Handler: Toggle ID vào mảng policyChecked
    const handlePolicyChange = (id) => {
        setPolicyChecked((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // Fetch policies: Load options hiển thị khi đổi type
    const getPolicy = async () => {
        if (typePolicy) {
            const tmp = await getPolicyApi({ type: typePolicy });
            if (tmp.success) setPolicy(tmp.data);
        }
    };
    useEffect(() => {
        getPolicy();
    }, [typePolicy, showModelPolicy]);

    // Data to Save
    const [priceExtra, setPriceExtra] = useState([]);
    const [availabilityRules, setAvailabilityRules] = useState([]);

    // Fetch Services
    useEffect(() => {
        const fetchServices = async () => {
            const res = await getAllServicesApi();
            setServicesDefault(res.data || []);
        };
        fetchServices();
    }, [showModel]);

    // Handlers Media/Services/Itinerary
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
        const res = await uploadByLinkApi({imageUrl: linkPhoto});
        if (res.code === 200) {
            setPhotos([...photos, res.data.url]);
            setLinkPhoto("");
        }
    };
    const removePhoto = (ev, filename) => {
        ev.preventDefault();
        setPhotos(photos.filter((photo) => photo !== filename));
    };
    const handleServiceChange = (serviceId) => {
        setServices((prev) => (prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]));
    };
    const handleAddDay = () =>
        setItinerary([...itinerary, {day: itinerary.length + 1, title: "", description: ""}]);
    const handleRemoveDay = (index) => {
        const newItinerary = itinerary.filter((_, idx) => idx !== index);
        setItinerary(newItinerary.map((item, idx) => ({...item, day: idx + 1})));
    };
    const handleItineraryChange = (index, field, value) => {
        const newArr = [...itinerary];
        newArr[index][field] = value;
        setItinerary(newArr);
    };

    // --- CALENDAR LOGIC ---

    // 1. Generate Base Events (FIXED LOGIC)
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

    // 2. Combine with Overrides & Blocks
    const combinedEvents = useMemo(() => {
        const overrideEvents = priceExtra.map((p) => ({
            start: new Date(p.start),
            end: new Date(p.end),
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
        [...overrideEvents, ...blockEvents].forEach((e) => {
            occupiedDates.add(moment(e.start).startOf("day").valueOf());
        });

        const filteredBase = baseEvents.filter(
            (e) => !occupiedDates.has(moment(e.start).startOf("day").valueOf())
        );

        return [...filteredBase, ...overrideEvents, ...blockEvents];
    }, [baseEvents, priceExtra, availabilityRules]);

    // Handlers Calendar UI
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
        setDaysChoosed((prev) =>
            prev.includes(fullDay) ? prev.filter((d) => d !== fullDay) : [...prev, fullDay]
        );
    };

    // --- CRITICAL FIX: HANDLE APPLY CHANGES ---
    const handleApplyChanges = () => {
        if (!startDate || !endDate) return toast.error("Please select date range");
        if (calendarMode === "PRICE" && (!priceEvents || Number(priceEvents) <= 0)) return toast.error("Invalid price");

        const start = moment(startDate.toDate()).startOf('day');
        const end = moment(endDate.toDate()).endOf('day');

        let newPrices = [...priceExtra];
        let newRules = [...availabilityRules];

        while (start.isSameOrBefore(end, "day")) {
            const dayName = start.format("dddd");

            if (daysChoosed.includes(dayName)) {
                const dateStartJS = start.toDate();
                const dateEndJS = start.clone().endOf('day').toDate();

                newPrices = newPrices.filter((p) => !moment(p.start).isSame(start, 'day'));
                newRules = newRules.filter((r) => !moment(r.startDate).isSame(start, 'day'));

                if (calendarMode === "PRICE") {
                    newPrices.push({
                        start: dateStartJS,
                        end: dateEndJS,
                        price: Number(priceEvents),
                    });
                } else {
                    newRules.push({
                        startDate: dateStartJS,
                        endDate: dateEndJS,
                        isBlocked: true,
                        note: "Closed",
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
    const handleCreateTour = async (e) => {
        e.preventDefault();
        if (!name?.trim()) return toast.error("Name required");
        if (!city) return toast.error("City required");
        if (!tourType) return toast.error("Tour type required");
        if (!price || price < 0) return toast.error("Price invalid");
        if (!photos.length) return toast.error("Photo required");

        setLoading(true);
        const dataTour = {
            name, city, tourType, duration, durationText, maxGroupSize,
            price, priceChildren: priceChildren || 0,
            featured, isVisible, photos, description, services, itinerary,
            priceExtra, availabilityRules,
            policy: policyChecked, // Gửi danh sách ID policies đã chọn
        };

        try {
            const res = await createTourApi(dataTour);
            if (res.success) {
                toast.success(isVisible ? "Published!" : "Saved Draft!");
                navigate("/dashboard-view-tours");
            } else {
                toast.error(res.message || "Failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50/50 pb-20">
                {/* Header */}
                <div className="rounded-md mx-2 md:mx-5 top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 md:px-6 md:py-4 mb-8 transition-all">
                    <div className="max-w-full mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                        {/* Phần Title */}
                        <div className="w-full md:w-auto flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 text-xl md:text-3xl tracking-tight flex items-center">
                                Create New Tour
                                <Tooltip title="Set up tour details and pricing">
                                    {/* Giảm size icon trên mobile một chút */}
                                    <FaQuestionCircle className="mx-2 md:mx-3 text-gray-400 cursor-help" size={16} style={{ fontSize: '18px' }}/>
                                </Tooltip>
                            </h2>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">

                            <div className="flex items-center justify-between sm:justify-start gap-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm w-full sm:w-auto">
                                {/* Featured Switch */}
                                <div className="flex items-center gap-2 px-2 md:px-3 border-r border-gray-200 w-1/2 sm:w-auto justify-center sm:justify-start">
                    <span className={`text-xs md:text-sm font-semibold flex items-center gap-1 ${featured ? "text-yellow-500" : "text-gray-400"}`}>
                        <FaStar className="text-xs md:text-sm"/> {featured ? "Featured" : "Standard"}
                    </span>
                                    <Switch checked={featured} onChange={setFeatured} size="small" className={featured ? "bg-yellow-400" : "bg-gray-300"}/>
                                </div>

                                {/* Public Switch */}
                                <div className="flex items-center gap-2 px-2 md:px-3 w-1/2 sm:w-auto justify-center sm:justify-start">
                    <span className={`text-xs md:text-sm font-semibold flex items-center gap-2 ${isVisible ? "text-green-600" : "text-gray-500"}`}>
                        {isVisible ? <FaEye className="text-xs md:text-sm"/> : <FaEyeSlash className="text-xs md:text-sm"/>}
                        <span className="truncate">{isVisible ? "Public" : "Draft"}</span>
                    </span>
                                    <Switch checked={isVisible} onChange={setIsVisible} size="small" className={isVisible ? "bg-green-500" : "bg-gray-300"}/>
                                </div>
                            </div>

                            <Button
                                type="primary"
                                onClick={handleCreateTour}
                                loading={loading}
                                className={`h-10 px-6 rounded-lg font-medium shadow-md border-0 w-full md:w-auto ${
                                    isVisible ? "bg-gray-900 hover:!bg-gray-800" : "bg-gray-500 hover:!bg-gray-600"
                                }`}
                            >
                                {isVisible ? "Publish Tour" : "Save Draft"}
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="max-w-full mx-auto px-4 md:px-6 flex flex-col gap-6">
                    {/* General Info */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                            <h2 className="font-semibold text-gray-700 text-lg">General Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Tour Name</label>
                                <Input size="large" placeholder="e.g. Amazing Ha Long Bay Cruise" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl"/>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700">Destination</label>
                                <Select size="large" value={city || undefined} onChange={setCity} placeholder={<div className="flex items-center gap-2"><EnvironmentOutlined/> Select City</div>} showSearch options={cities.map((c) => ({value: c.name, label: c.name}))}/>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700">Tour Type</label>
                                <Select size="large" value={tourType || undefined} onChange={setTourType} placeholder="Select Type" options={TOUR_TYPES}/>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700">Duration Text</label>
                                <Input size="large" placeholder="e.g. 3 Days 2 Nights" value={durationText} onChange={(e) => setDurationText(e.target.value)} prefix={<ClockCircleOutlined className="text-gray-400"/>} className="rounded-xl"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-gray-700">Days</label><InputNumber style={{ width: "100%", height: "100%" }} min={1} value={duration} onChange={setDuration} className="w-full rounded-xl py-1"/></div>
                                <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-gray-700">Max Group</label><InputNumber style={{ width: "100%", height: "100%" }} min={1} value={maxGroupSize} onChange={setMaxGroupSize} prefix={<TeamOutlined className="text-gray-400 mr-2"/>} className="w-full rounded-xl py-1"/></div>
                            </div>
                        </div>
                    </div>

                    {/* Base Price */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                            <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                            <h2 className="font-semibold text-gray-700 text-lg">Base Pricing</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Adult Base Price (VND)</label>
                                <InputNumber style={{width: "100%"}} size="large" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(value) => value?.replace(/\$\s?|(,*)/g, "")} value={price} onChange={setPrice} prefix={<DollarOutlined className="text-gray-400"/>} className="rounded-xl" placeholder="0"/>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Children Price (VND)</label>
                                <InputNumber style={{width: "100%"}} size="large" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(value) => value?.replace(/\$\s?|(,*)/g, "")} value={priceChildren} onChange={setPriceChildren} className="rounded-xl" placeholder="0"/>
                            </div>
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="hidden w-full bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-shadow hover:shadow-md overflow-hidden">
                        <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                            <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                            <h2 className="font-semibold text-gray-700 text-lg">Calendar & Availability</h2>
                        </div>
                        <div className="flex flex-col xl:flex-row gap-8">
                            <div className="flex-1">
                                <AdminCalendar events={combinedEvents}/>
                            </div>
                            <div className="w-full xl:w-1/3 h-fit bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full block"></span> Manage Calendar
                                </h3>
                                <div className="mb-6 p-1 bg-gray-100 rounded-xl flex">
                                    <button onClick={() => setCalendarMode("PRICE")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${calendarMode === "PRICE" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                        <FaDollarSign className="inline mb-0.5 mr-1"/> Set Price
                                    </button>
                                    <button onClick={() => setCalendarMode("BLOCK")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${calendarMode === "BLOCK" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                        <FaBan className="inline mb-0.5 mr-1"/> Block Dates
                                    </button>
                                </div>
                                <div className="mb-6">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Date Range</label>
                                    <div className="flex flex-col gap-3">
                                        <DatePicker className="w-full h-11 rounded-xl border-gray-200" disabledDate={(c) => c && c < moment().endOf("day")} value={startDate} onChange={handleStartDateChange} placeholder="Start Date" format="DD/MM/YYYY"/>
                                        <DatePicker className="w-full h-11 rounded-xl border-gray-200" disabledDate={(c) => c && c < moment().endOf("day")} value={endDate} open={openEndDate} onChange={handleEndDateChange} onClick={() => setOpenEndDate(true)} placeholder="End Date" format="DD/MM/YYYY"/>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Recur on Days</label>
                                    <div className="flex flex-wrap gap-2">
                                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => {
                                            const fullNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                                            const isSel = daysChoosed.includes(fullNames[idx]);
                                            return (
                                                <div key={idx} onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    handleDayClick(day);
                                                }}
                                                     className={`cursor-pointer w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all shadow-sm border ${isSel ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200 scale-105" : "bg-white text-gray-500 hover:text-indigo-600 border-gray-200"}`}>{day.charAt(0)}</div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="mb-8">
                                    {calendarMode === "PRICE" ? (
                                        <div className="relative group">
                                            <input type="number" className="w-full pl-4 pr-16 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="0" value={priceEvents} onChange={(e) => setPriceEvents(e.target.value)} min={0}/>
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs pointer-events-none">VND</span>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center"><p className="text-red-600 text-sm font-semibold">Selected dates will be closed.</p></div>
                                    )}
                                </div>
                                <button onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleApplyChanges();
                                }}
                                        className={`w-full py-4 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] ${calendarMode === "PRICE" ? "bg-gradient-to-r from-gray-900 to-gray-800" : "bg-gradient-to-r from-red-600 to-red-500"}`}>{calendarMode === "PRICE" ? "Apply Price" : "Block Selected Dates"}</button>
                            </div>
                        </div>
                    </div>

                    {/* Media */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                            <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
                            <h2 className="font-semibold text-gray-700 text-lg">Gallery</h2></div>
                        <div className="flex flex-col gap-6">
                            <div className="flex gap-3"><Input placeholder="Paste image URL here..." value={linkPhoto} onChange={(e) => setLinkPhoto(e.target.value)} className="rounded-xl"/><Button onClick={addPhotoByLink} className="h-full rounded-xl">Add</Button></div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <label className="border-2 border-dashed border-gray-300 rounded-2xl h-32 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-rose-400 hover:text-rose-500 transition-all"><input type="file" multiple className="hidden" onChange={addPhotoByFile}/><IoCloudUploadOutline size={24}/><span className="text-xs font-medium mt-1">Upload</span></label>
                                {photos.map((item, idx) => (<div key={idx} className="relative h-32 group rounded-2xl overflow-hidden border border-gray-200"><img src={item} alt="tour" className="w-full h-full object-cover"/><button onClick={(ev) => removePhoto(ev, item)} className="absolute top-1 right-1 bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all">✕</button></div>))}
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Services */}
                        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow">
                            <div className="flex mb-4 items-center gap-3">
                                <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                                <h2 className="font-semibold text-gray-700 text-lg">Services</h2></div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div onClick={() => setShowModel(true)} className="cursor-pointer min-h-[80px] border-2 border-dashed border-gray-300 rounded-xl p-2 flex flex-col items-center justify-center text-gray-500 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-600 transition-all text-center">
                                    <IoCloudUploadOutline size={20}/>
                                    <span className="text-xs font-medium mt-1">New</span>
                                </div>
                                {servicesDefault.length > 0 && (
                                    <Services
                                        handleServiceChange={handleServiceChange}
                                        setServicesDefault={setServicesDefault}
                                        servicesDefault={servicesDefault}
                                        services={services}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Policies - Fixed Logic */}
                        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                                    <h2 className="font-semibold text-gray-700 text-lg">Policies</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tooltip title="Choose the type of policy before adding">
                                        <FaQuestionCircle className="text-gray-400 hover:text-gray-600" size={18}/>
                                    </Tooltip>
                                </div>
                            </div>

                            <div className="mb-4">
                                <Select
                                    value={typePolicy}
                                    onChange={(value) => setTypePolicy(value)}
                                    className="w-full"
                                    size="large"
                                    placeholder="Select policy category..."
                                    options={typePolicyDefault.map((i) => ({value: i, label: i}))}
                                />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div onClick={() => setShowModelPolicy(true)} className="cursor-pointer h-20 border-2 border-dashed border-gray-300 rounded-xl p-2 flex flex-col items-center justify-center text-gray-500 hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-600 transition-all text-center">
                                    <IoCloudUploadOutline size={20}/>
                                    <span className="text-xs font-medium mt-1">Add Rule</span>
                                </div>

                                {policy.length > 0 && (
                                    <Policy
                                        typePolicyDefault={typePolicyDefault}
                                        handlePolicyChange={handlePolicyChange}
                                        policy={policy} // Chỉ truyền options hiển thị
                                        setPolicy={setPolicy}
                                        policyChecked={policyChecked} // Truyền toàn bộ ID đã chọn
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Details & Itinerary */}
                    <div className="grid grid-cols-1 gap-8">
                        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow">
                            <div className="flex mb-4 items-center gap-3">
                                <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                                <h2 className="font-semibold text-gray-700 text-lg">Overview</h2></div>
                            <div className="rounded-xl overflow-hidden border border-gray-200"><EditorTiny handleEditorChange={setDescription} description={description}/></div>
                        </div>
                    </div>

                    {/* Itinerary */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                            <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                            <h2 className="font-semibold text-gray-700 text-lg">Tour Itinerary</h2></div>
                        <div className="space-y-6">
                            {itinerary.map((item, index) => (
                                <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white transition-all">
                                    <div className="flex flex-col items-center gap-2 pt-2">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">{item.day}</div>
                                        <div className="w-[1px] h-full bg-purple-200"></div>
                                    </div>
                                    <div className="flex-1 space-y-3"><Input placeholder="Day Title" value={item.title} onChange={(e) => handleItineraryChange(index, "title", e.target.value)} className="font-semibold"/><TextArea placeholder="Description" rows={3} value={item.description} onChange={(e) => handleItineraryChange(index, "description", e.target.value)}/></div>
                                    {itinerary.length > 1 && (<button onClick={() => handleRemoveDay(index)} className="text-gray-400 hover:text-red-500 self-start pt-2" type="button"><IoTrashOutline size={20}/></button>)}
                                </div>
                            ))}
                            <Button type="dashed" onClick={handleAddDay} block icon={<IoAddCircleOutline/>} className="h-12 border-purple-300 text-purple-600 hover:text-purple-700 hover:border-purple-500">Add Day {itinerary.length + 1}</Button>
                        </div>
                    </div>

                    {/* Mobile Submit */}
                    <button onClick={handleCreateTour} className={`md:hidden w-full py-4 text-white rounded-xl text-lg font-semibold shadow-xl ${isVisible ? "bg-gray-900" : "bg-gray-500"}`}>
                        {isVisible ? "Publish Tour" : "Save as Draft"}
                    </button>
                </div>

                {/* MODALS */}
                {showModel && (
                    <ModelCreateService
                        services={services}
                        setServices={setServices}
                        setShowModel={setShowModel}
                    />
                )}

                {showModelPolicy && (
                    <ModelCreatePolicy
                        typePolicyDefault={typePolicyDefault}
                        setTypePolicy={setTypePolicy}
                        typePolicy={typePolicy}
                        policyChecked={policyChecked}
                        setPolicyChecked={setPolicyChecked}
                        policy={policy}
                        setPolicy={setPolicy}
                        setShowModel={setShowModelPolicy}
                    />
                )}
            </div>
        </>
    );
};

export default AdminCreateTour;
