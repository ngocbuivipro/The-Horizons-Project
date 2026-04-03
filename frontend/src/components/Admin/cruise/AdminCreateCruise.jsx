import { InputNumber, Switch, Button, Input, DatePicker, Card } from "antd";
import { useState, useMemo, useEffect } from "react";
import { FaShip, FaDollarSign, FaBan, FaUnlock } from "react-icons/fa";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import moment from "moment";

import {
    uploadByFilesApi,
    uploadByLinkApi,
} from "../../../api/client/api.js";
import EditorTiny from "../../TextEditor/EditorTiny.jsx";
import AdminCalendar from "../../Utils/Calendar/AdminCalendar.jsx";
import {
    createCruiseApi,
    getCabinTemplatesApi,
    createCabinApi
} from "../../../api/client/service.api.js";
import CruiseBasicInfo from "./CruiseBasicInfo.jsx";
import CruiseCabinConfig from "./CruiseCabinConfig.jsx";
import CruiseDynamicSections from "./CruiseDynamicSections.jsx";

const AdminCreateCruise = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // --- 1. BASIC INFO ---
    const [title, setTitle] = useState("");
    const [cruiseType, setCruiseType] = useState("Luxury cruise");
    const [duration, setDuration] = useState(2);
    const [isActive, setIsActive] = useState(true);
    const [price, setPrice] = useState(0);

    // --- 2. LOCATION & TIME ---
    const [city, setCity] = useState("");
    const [departureTime, setDepartureTime] = useState(null);
    const [launchedOn, setLaunchedOn] = useState(null);

    // --- 3. CABINS STATE ---
    const [cabins, setCabins] = useState([]); // Selected cabins
    const [templates, setTemplates] = useState([]); // Cabin templates

    // --- 4. EXTRAS ---
    const [itinerary, setItinerary] = useState([{ day: 1, title: "", description: "", meals: [] }]);
    const [amenities, setAmenities] = useState([{ group: "General", items: [] }]);
    const [additionalServices, setAdditionalServices] = useState([]);
    const [faq, setFaq] = useState([]);

    // --- 5. MEDIA ---
    const [linkPhoto, setLinkPhoto] = useState("");
    const [photos, setPhotos] = useState([]);
    const [description, setDescription] = useState("");

    // --- 6. CALENDAR STATE ---
    const [calendarMode, setCalendarMode] = useState("PRICE");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [openEndDate, setOpenEndDate] = useState(false);
    const [priceEvents, setPriceEvents] = useState("");
    const [daysChoosed, setDaysChoosed] = useState(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
    const [priceExtra, setPriceExtra] = useState([]);
    const [availabilityRules, setAvailabilityRules] = useState([]);

    // --- INITIAL FETCH ---
    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        const res = await getCabinTemplatesApi();
        if (res.success) {
            setTemplates(res.data);
        }
    };

    // --- HANDLERS: CABIN LOGIC ---
    const handleCabinsChange = (updatedCabins) => {
        setCabins(updatedCabins);
        if (updatedCabins.length > 0) {
            setPrice(Math.min(...updatedCabins.map(c => Number(c.pricePerNight))));
        } else {
            setPrice(0);
        }
    };

    const handleCreateTemplateRequest = async (cabinData) => {
        try {
            const res = await createCabinApi(cabinData);
            if (res.success) {
                return true;
            } else {
                toast.error(res.message);
                return false;
            }
        } catch (error) {
            toast.error("Failed to create template, " + error);
            return false;
        }
    };

    // --- HANDLERS: MEDIA ---
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

    // FIX: Correctly closed this function before starting hooks
    const removePhoto = (ev, filename) => {
        ev.preventDefault();
        setPhotos(photos.filter((photo) => photo !== filename));
    };

    // --- CALENDAR LOGIC (Now correctly at top level) ---
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
                isBlocked: false
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
            isBlocked: false
        }));
        const blockEvents = availabilityRules.filter((r) => r.isBlocked).map((r) => ({
            start: new Date(r.startDate),
            end: new Date(r.endDate),
            title: "Closed",
            type: "BLOCK",
            isBlocked: true
        }));
        const occupiedDates = new Set();
        [...overrideEvents, ...blockEvents].forEach((e) => occupiedDates.add(moment(e.start).startOf("day").valueOf()));
        return [...baseEvents.filter((e) => !occupiedDates.has(moment(e.start).startOf("day").valueOf())), ...overrideEvents, ...blockEvents];
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
            "Sun": "Sunday", "Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday", "Thu": "Thursday", "Fri": "Friday", "Sat": "Saturday"
        };
        const fullDay = mapDay[dayShort];
        setDaysChoosed(prev => prev.includes(fullDay) ? prev.filter(d => d !== fullDay) : [...prev, fullDay]);
    };

    const handleApplyCalendar = () => {
        if (!startDate || !endDate) return toast.error("Select dates");
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
                newPrices = newPrices.filter(p => !moment(p.startDate).isSame(start, 'day'));
                newRules = newRules.filter(r => !moment(r.startDate).isSame(start, 'day'));
                if (calendarMode === "PRICE") {
                    newPrices.push({ startDate: dateStartJS, endDate: dateEndJS, price: Number(priceEvents) });
                } else if (calendarMode === "BLOCK") {
                    newRules.push({
                        startDate: dateStartJS,
                        endDate: dateEndJS,
                        isBlocked: true,
                        reason: "Manual Block"
                    });
                }
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

    // --- SUBMIT ---
    const handleCreateCruise = async () => {
        if (!title || !city) return toast.error("Title and City are required");
        if (cabins.length === 0) return toast.error("Please add at least one cabin type");
        setLoading(true);

        const finalCabins = cabins.map((cabin) => {
            const cabinCopy = { ...cabin };
            delete cabinCopy.tempId;
            return cabinCopy;
        });

        const dataCruise = {
            title, cruiseType, duration,
            price: Number(price),
            city,
            cabins: finalCabins,
            amenities: amenities.filter(a => a.group && a.items.length > 0),
            itinerary,
            additionalServices,
            faq,
            photos,
            description,
            departureTime: departureTime ? departureTime.toDate() : new Date(),
            launchedOn: launchedOn ? launchedOn.toDate() : null,
            priceExtra,
            availabilityRules,
            isActive,
        };

        try {
            const res = await createCruiseApi(dataCruise);
            if (res.success) {
                toast.success("cruise Created Successfully!");
                navigate("/dashboard-view-cruise");
            } else toast.error(res.message);
        } catch (error) {
            console.error("Create cruise Error:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-10">
            {/* Header */}
            <div className="rounded-md mx-5 top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 mb-8">
                <div className="max-w-full mx-auto flex justify-between items-center">
                    <h2 className="font-bold text-gray-800 text-2xl flex items-center">
                        <FaShip className="mr-3 text-indigo-600" /> Create New Cruise
                    </h2>
                    <div className="flex items-center gap-4">
                        <Switch checked={isActive} onChange={setIsActive} checkedChildren="Active"
                                unCheckedChildren="Inactive" className={isActive ? "bg-green-500" : "bg-gray-300"} />
                        <Button type="primary" onClick={handleCreateCruise} loading={loading}
                                className="bg-gray-900 h-10 px-6">Publish</Button>
                    </div>
                </div>
            </div>

            <div className="max-w-full mx-auto px-4 md:px-6 flex flex-col gap-6">

                {/* 1. BASIC INFO */}
                <CruiseBasicInfo
                    data={{ title, cruiseType, city, duration, price, departureTime, launchedOn }}
                    setData={(updater) => {
                        const newState = updater({
                            title, cruiseType, city, duration, price, departureTime, launchedOn
                        });
                        setTitle(newState.title);
                        setCruiseType(newState.cruiseType);
                        setCity(newState.city);
                        setDuration(newState.duration);
                        setPrice(newState.price);
                        setDepartureTime(newState.departureTime);
                        setLaunchedOn(newState.launchedOn);
                    }}
                />

                {/* 2. CABIN CONFIGURATION */}
                <CruiseCabinConfig
                    cabins={cabins}
                    templates={templates}
                    onCabinsChange={handleCabinsChange}
                    onTemplateCreateRequest={handleCreateTemplateRequest}
                    onTemplateCreated={fetchTemplates}
                />

                {/* 3. DYNAMIC SECTIONS */}
                <CruiseDynamicSections
                    amenities={amenities} setAmenities={setAmenities}
                    itinerary={itinerary} setItinerary={setItinerary}
                    faq={faq} setFaq={setFaq}
                    additionalServices={additionalServices}
                    setAdditionalServices={setAdditionalServices}
                />

                {/* 4. CALENDAR & PRICING */}
                <div className="hidden w-full bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-shadow hover:shadow-md overflow-hidden">
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
                                <button onClick={() => setCalendarMode("PRICE")}
                                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${calendarMode === "PRICE" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                    <FaDollarSign className="inline mb-0.5 mr-1" /> Price
                                </button>
                                <button onClick={() => setCalendarMode("BLOCK")}
                                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${calendarMode === "BLOCK" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                    <FaBan className="inline mb-0.5 mr-1" /> Block
                                </button>
                                <button onClick={() => setCalendarMode("OPEN")}
                                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${calendarMode === "OPEN" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                    <FaUnlock className="inline mb-0.5 mr-1" /> Open
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Date Range</label>
                                <div className="flex flex-col gap-3">
                                    <DatePicker className="w-full h-11 !bg-gray-50 !border-gray-200 rounded-xl"
                                                disabledDate={(c) => c && c < moment().endOf('day')}
                                                value={startDate} onChange={handleStartDateChange}
                                                placeholder="Start Date" format="DD/MM/YYYY" />
                                    <DatePicker className="w-full h-11 !bg-gray-50 !border-gray-200 rounded-xl"
                                                disabledDate={(c) => c && c < moment().endOf('day')} value={endDate}
                                                open={openEndDate} onChange={handleEndDateChange}
                                                onClick={() => setOpenEndDate(true)} placeholder="End Date"
                                                format="DD/MM/YYYY" />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Recur on Days</label>
                                <div className="flex flex-wrap gap-2">
                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => {
                                        const isSel = daysChoosed.includes(day === "Sun" ? "Sunday" : day === "Mon" ? "Monday" : day === "Tue" ? "Tuesday" : day === "Wed" ? "Wednesday" : day === "Thu" ? "Thursday" : day === "Fri" ? "Friday" : "Saturday");
                                        return (
                                            <div key={idx} onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleDayClick(day);
                                            }}
                                                 className={`cursor-pointer w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-sm border ${isSel ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200 scale-105" : "bg-white text-gray-500 hover:text-indigo-600 border-gray-200 hover:border-indigo-300"}`}>{day.charAt(0)}</div>
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
                                            placeholder="0" value={priceEvents}
                                            onChange={(val) => setPriceEvents(val)} min={0}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                                            style={{ width: '100%' }} controls={false} size="large"
                                        />
                                        <span className="absolute right-4 top-[38px] text-xs font-bold text-gray-400 pointer-events-none">VND</span>
                                    </div>
                                )}

                                {calendarMode === "BLOCK" && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center shadow-sm">
                                        <p className="text-red-600 text-sm font-semibold flex items-center justify-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Selected dates will be closed
                                        </p>
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
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleApplyCalendar();
                                }}
                                className={`w-full py-3.5 text-white rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] 
                                ${calendarMode === "PRICE"
                                    ? "bg-gray-900 hover:bg-gray-800"
                                    : calendarMode === "BLOCK"
                                        ? "bg-red-500 hover:bg-red-600"
                                        : "bg-emerald-500 hover:bg-emerald-600"
                                }`}
                            >
                                {calendarMode === "PRICE" ? "Apply Price" : calendarMode === "BLOCK" ? "Block Dates" : "Unblock / Open"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 5. MEDIA */}
                <Card title="Images & Description">
                    <div className="flex gap-2 mb-4">
                        <Input value={linkPhoto}
                               onChange={e => setLinkPhoto(e.target.value)}
                               placeholder="Image URL" />
                        <Button onClick={addPhotoByLink}>Add</Button>
                        <label className="cursor-pointer bg-gray-100 px-4 py-1 rounded border hover:bg-gray-200 flex items-center">
                            <input type="file" hidden multiple onChange={addPhotoByFile} />Upload
                        </label>
                    </div>
                    <div className="grid grid-cols-6 gap-2 mb-6">
                        {photos.map((p, idx) => (
                            <div key={idx} className="relative h-20 border rounded overflow-hidden group">
                                <img src={p} className="w-full h-full object-cover" alt="" />
                                <button onClick={e => removePhoto(e, p)}
                                        className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100">×
                                </button>
                            </div>
                        ))}
                    </div>
                    <EditorTiny handleEditorChange={setDescription} description={description} />
                </Card>
            </div>
        </div>
    );
};

export default AdminCreateCruise;