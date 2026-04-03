import { InputNumber, Switch, Button, Input, DatePicker, Card, Row, Col } from "antd";
import { useState, useEffect, useMemo } from "react";
import { IoAddCircleOutline, IoTrashOutline } from "react-icons/io5";
import { FaShip, FaDollarSign, FaBan, FaUnlock } from "react-icons/fa";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import moment from "moment";

import {
    uploadByFilesApi,
    uploadByLinkApi
} from "../../../api/client/api.js";
import EditorTiny from "../../TextEditor/EditorTiny.jsx";
import AdminCalendar from "../../Utils/Calendar/AdminCalendar.jsx";
import {
    getCruiseDetailApi,
    updateCruiseApi,
    getCabinTemplatesApi,
    createCabinApi
} from "../../../api/client/service.api.js";
import CruiseBasicInfo from "./CruiseBasicInfo.jsx";
import CruiseCabinConfig from "./CruiseCabinConfig.jsx";
import CruiseDynamicSections from "./CruiseDynamicSections.jsx";


const AdminUpdateCruise = () => {
    const navigate = useNavigate();
    const { slug } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [cruiseId, setCruiseId] = useState(null);

    // --- STATES MATCHING MODEL ---
    const [title, setTitle] = useState("");
    const [cruiseType, setCruiseType] = useState("Luxury cruise");
    const [duration, setDuration] = useState(2);
    const [isActive, setIsActive] = useState(true);
    const [price, setPrice] = useState(0);
    const [city, setCity] = useState("");
    const [departureTime, setDepartureTime] = useState(null);
    const [launchedOn, setLaunchedOn] = useState(null);

    // --- CABINS STATE ---
    const [cabins, setCabins] = useState([]); // Danh sách cabin ĐÃ CHỌN
    const [templates, setTemplates] = useState([]); // Danh sách cabin MẪU

    const [itinerary, setItinerary] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [additionalServices, setAdditionalServices] = useState([]);
    const [faq, setFaq] = useState([]);
    const [linkPhoto, setLinkPhoto] = useState("");
    const [photos, setPhotos] = useState([]);
    const [description, setDescription] = useState("");

    // Calendar
    const [calendarMode, setCalendarMode] = useState("PRICE");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [openEndDate, setOpenEndDate] = useState(false);
    const [priceEvents, setPriceEvents] = useState("");
    const [daysChoosed, setDaysChoosed] = useState(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
    const [priceExtra, setPriceExtra] = useState([]);
    const [availabilityRules, setAvailabilityRules] = useState([]);

    const fetchTemplates = async () => {
        const res = await getCabinTemplatesApi();
        if (res.success) {
            setTemplates(res.data);
        }
    };

    // --- FETCH DATA ---
    useEffect(() => {
        const initData = async () => {
            setFetching(true);
            try {
                await fetchTemplates();

                // 2. Fetch cruise Detail
                if (slug) {
                    const resCruise = await getCruiseDetailApi(slug);
                    if (resCruise.success) {
                        const data = resCruise.data;
                        setCruiseId(data._id);
                        setTitle(data.title);
                        setCruiseType(data.cruiseType);
                        setDuration(data.duration);
                        setPrice(data.price);
                        setIsActive(data.isActive);
                        setCity(data.city || "");
                        if(data.departureTime) setDepartureTime(moment(data.departureTime));
                        if(data.launchedOn) setLaunchedOn(moment(data.launchedOn));

                        // Map Existing Cabins with tempId for table handling
                        const mappedCabins = (data.cabins || []).map(c => ({
                            ...c,
                            tempId: c._id || Date.now() + Math.random() // Use existing ID or generate temp
                        }));
                        setCabins(mappedCabins);

                        setItinerary(data.itinerary || []);
                        setAmenities(data.amenities || []);
                        setAdditionalServices(data.additionalServices || []);
                        setFaq(data.faq || []);
                        setPhotos(data.photos || []);
                        setDescription(data.description || "");
                        setPriceExtra(data.priceExtra || []);
                        setAvailabilityRules(data.availabilityRules || []);
                    } else {
                        toast.error("cruise not found");
                        navigate("/dashboard-view-cruise");
                    }
                }
            } catch (error) {
                toast.error("Error fetching data");
                console.error(error);
            } finally {
                setFetching(false);
            }
        };
        initData();
    }, [slug, navigate]);

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
            toast.error("Failed to create template, ",error);
            return false;
        }
    };

    // --- HANDLERS: MEDIA ---
    const addPhotoByFile = async (ev) => {
        const files = ev.target.files; const data = new FormData();
        for (let i = 0; i < files.length; i++) data.append("photos", files[i]);
        const res = await uploadByFilesApi(data);
        if (res.success) setPhotos([...photos, ...res.data.map((item) => item.url)]);
    };
    const addPhotoByLink = (e) => { e.preventDefault(); uploadByLinkApi({ imageUrl: linkPhoto }).then((res) => { if (res.code === 200) { setPhotos([...photos, res.data.url]); setLinkPhoto(""); } }); };
    const removePhoto = (ev, filename) => { ev.preventDefault(); setPhotos(photos.filter((photo) => photo !== filename)); };

    // Calendar
    const baseEvents = useMemo(() => { if (!price) return []; const events = []; let current = moment().startOf('day'); const endRange = moment().add(1, "year"); while (current.isBefore(endRange)) { events.push({ start: current.toDate(), end: current.clone().endOf("day").toDate(), title: price, type: "BASE_PRICE", isBlocked: false }); current.add(1, "day"); } return events; }, [price]);
    const combinedEvents = useMemo(() => { const overrideEvents = priceExtra.map((p) => ({ start: new Date(p.startDate), end: new Date(p.endDate), title: p.price, type: "PRICE_OVERRIDE", isBlocked: false })); const blockEvents = availabilityRules.filter((r) => r.isBlocked).map((r) => ({ start: new Date(r.startDate), end: new Date(r.endDate), title: "Closed", type: "BLOCK", isBlocked: true })); const occupiedDates = new Set(); [...overrideEvents, ...blockEvents].forEach((e) => occupiedDates.add(moment(e.start).startOf("day").valueOf())); return [...baseEvents.filter((e) => !occupiedDates.has(moment(e.start).startOf("day").valueOf())), ...overrideEvents, ...blockEvents]; }, [baseEvents, priceExtra, availabilityRules]);

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
                    newRules.push({ startDate: dateStartJS, endDate: dateEndJS, isBlocked: true, reason: "Manual Block" });
                }
            }
            start.add(1, 'days');
        }
        setPriceExtra(newPrices);
        setAvailabilityRules(newRules);
        toast.success(calendarMode === "OPEN" ? "Dates unblocked!" : "Calendar updated!");
        setPriceEvents(""); setStartDate(null); setEndDate(null);
    };

    const handleUpdateCruise = async () => {
        if (!title || !price || !city) return toast.error("Title, Price and City are required");
        if (!cruiseId) return toast.error("ID missing");
        if (cabins.length === 0) return toast.error("Please add at least one cabin");

        setLoading(true);

        // Clean cabins data before sending
        const finalCabins = cabins.map((cabin) => {
            const cabinCopy = { ...cabin };
            delete cabinCopy.tempId;
            return cabinCopy;
        });

        const dataCruise = {
            title, cruiseType, duration, price: Number(price),
            city,
            cabins: finalCabins,
            amenities: amenities.filter(a => a.group && a.items.length > 0),
            itinerary, additionalServices, faq, photos, description,
            departureTime: departureTime ? departureTime.toDate() : null,
            launchedOn: launchedOn ? launchedOn.toDate() : null,
            priceExtra, availabilityRules, isActive
        };

        try {
            const res = await updateCruiseApi(cruiseId, dataCruise);
            if (res.success) {
                toast.success("cruise Updated!");
                navigate("/dashboard-view-cruise");
            } else toast.error(res.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <div className="rounded-md mx-5 top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 mb-8">
                <div className="max-w-full mx-auto flex justify-between items-center">
                    <h2 className="font-bold text-gray-800 text-2xl flex items-center gap-2"><FaShip className="text-indigo-600"/> Update Cruise</h2>
                    <div className="flex items-center gap-4">
                        <Switch checked={isActive} onChange={setIsActive} checkedChildren="Active" unCheckedChildren="Inactive" className={isActive ? "bg-green-500" : "bg-gray-300"} />
                        <Button type="primary" onClick={handleUpdateCruise} loading={loading} className="bg-gray-900 h-10 px-6">Save Changes</Button>
                    </div>
                </div>
            </div>

            <div className="max-w-full mx-auto px-4 md:px-6 flex flex-col gap-6">

                {/* 1. BASIC INFO */}
                <CruiseBasicInfo
                    data={{ title, cruiseType, city, duration, price, departureTime, launchedOn }}
                    setData={(updater) => {
                        const newState = updater({ title, cruiseType, city, duration, price, departureTime, launchedOn });
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
                    amenities={amenities}
                    setAmenities={setAmenities}
                    itinerary={itinerary}
                    setItinerary={setItinerary}
                    faq={faq}
                    setFaq={setFaq}
                    // Ensure both lines below are PLURAL (with an 's')
                    additionalServices={additionalServices}
                    setAdditionalServices={setAdditionalServices}
                />



                {/* 7. MEDIA */}
                <Card title="Images & Description" className="shadow-sm rounded-2xl">
                    <div className="flex gap-2 mb-4">
                        <Input value={linkPhoto} onChange={e => setLinkPhoto(e.target.value)} placeholder="Image URL" />
                        <Button onClick={addPhotoByLink}>Add</Button>
                        <label className="cursor-pointer bg-gray-100 px-4 py-1 rounded border flex items-center hover:bg-gray-200"><input type="file" hidden multiple onChange={addPhotoByFile} />Upload</label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6">
                        {photos.map((p, idx) => (
                            <div key={idx} className="relative group h-24 border rounded overflow-hidden">
                                <img src={p} className="w-full h-full object-cover" alt="cruise" />
                                <button onClick={e => removePhoto(e, p)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">×</button>
                            </div>
                        ))}
                    </div>
                    <EditorTiny handleEditorChange={setDescription} description={description} />
                </Card>
            </div>
        </div>
    );
};

export default AdminUpdateCruise;
