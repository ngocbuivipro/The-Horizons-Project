import {Select, InputNumber, Switch, Button, Input, Spin, Tooltip} from "antd";
import React, {useState, useEffect} from "react";
import {IoCloudUploadOutline, IoAddCircleOutline, IoTrashOutline} from "react-icons/io5";
import {useNavigate, useParams} from "react-router-dom";
import toast from "react-hot-toast";
import {FaEye, FaEyeSlash, FaSave, FaQuestionCircle} from "react-icons/fa";
import {ClockCircleOutlined, TeamOutlined, DollarOutlined, ArrowLeftOutlined} from "@ant-design/icons";

import Services from "../../Services/Services.jsx";
import EditorTiny from "../../TextEditor/EditorTiny.jsx";
import ModelCreateService from "../hotel/AdminCreateHotel/ModelCreateService.jsx";

// API
import {
    getTourDetailApi,
    updateTourApi,
    getAllServicesApi,
    uploadByFilesApi,
    uploadByLinkApi, getPolicyApi,
} from "../../../api/client/api.js";
import {cities} from "../../../common/common.js";

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
    {value: "History", label: "History"}
];

const AdminUpdateTour = () => {
    const navigate = useNavigate();
    const {slug} = useParams();

    // --- STATE ---
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);

    const [tourId, setTourId] = useState(null);

    // Basic Info
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [tourType, setTourType] = useState("");
    const [duration, setDuration] = useState(1);
    const [durationText, setDurationText] = useState("");
    const [maxGroupSize, setMaxGroupSize] = useState(10);
    const [price, setPrice] = useState();
    const [priceChildren, setPriceChildren] = useState();
    const [isVisible, setIsVisible] = useState(true);

    // Media
    const [linkPhoto, setLinkPhoto] = useState("");
    const [photos, setPhotos] = useState([]);

    // Details
    const [description, setDescription] = useState("");
    const [services, setServices] = useState([]);
    const [servicesDefault, setServicesDefault] = useState([]);

    // Itinerary
    const [itinerary, setItinerary] = useState([]);

    // Auto-compute durationText whenever duration changes
    useEffect(() => {
        if (duration && duration >= 1) {
            const nights = duration - 1;
            setDurationText(nights > 0 ? `${duration} Days ${nights} Night${nights > 1 ? 's' : ''}` : `${duration} Day`);
        }
    }, [duration]);

    // MODAL STATE
    const [showModel, setShowModel] = useState(false);



    // --- POLICY STATE ---
    const [typePolicyDefault, setTypePolicyDefault] = useState([
        "Cancellation Policy",
        "Tour Regulations",
        "Safety & Health",
        "Booking Conditions",
    ]);
    const [policyChecked, setPolicyChecked] = useState([]);
    const [typePolicy, setTypePolicy] = useState("Cancellation Policy");
    const [policy, setPolicy] = useState([]);
    const [showModelPolicy, setShowModelPolicy] = useState(false);

    // Handler toggle check policy
    const handlePolicyChange = (id) => {
        setPolicyChecked((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // fetch policies
    const getPolicy = async () => {
        if (typePolicy) {
            const tmp = await getPolicyApi({ type: typePolicy });
            if (tmp.success) setPolicy(tmp.data);
        }
    };
    useEffect(() => {
        getPolicy();
    }, [typePolicy, showModelPolicy]);

    // --- 1. FETCH DATA INIT ---
    useEffect(() => {
        const initData = async () => {
            setFetching(true);
            try {
                // Fetch Services
                const resServices = await getAllServicesApi();
                setServicesDefault(resServices.data || []);

                if (slug) {
                    const resTour = await getTourDetailApi(slug);
                    if (resTour && resTour.success) {
                        const t = resTour.data;

                        setTourId(t._id);
                        setName(t.name);
                        setCity(t.city);
                        setTourType(t.tourType);
                        setDuration(t.duration);
                        setDurationText(t.durationText);
                        setMaxGroupSize(t.maxGroupSize);
                        setPrice(t.price);
                        setPriceChildren(t.priceChildren);
                        setIsVisible(t.isVisible);
                        setPhotos(t.images || t.photos || []);
                        setDescription(t.description || "");
                        setServices(t.services || []);

                        const existingPolicyIds = t.policy?.map(p => p._id) || [];
                        setPolicyChecked(existingPolicyIds);

                        setItinerary(t.itinerary || []);

                    } else {
                        toast.error("Tour not found");
                        navigate("/dashboard-view-tours");
                    }
                }
            } catch (error) {
                console.error(error);
                toast.error("Error loading data");
            } finally {
                setFetching(false);
            }
        };

        initData();
    }, [slug, navigate, showModel]);

    // --- HANDLERS ---
    const addPhotoByFile = async (ev) => {
        const files = ev.target.files;
        const data = new FormData();
        for (let i = 0; i < files.length; i++) data.append("photos", files[i]);
        const res = await uploadByFilesApi(data);
        if (res.success) setPhotos([...photos, ...res.data.map((item) => item.url)]);
        else toast.error("Error uploading files");
    };

    const addPhotoByLink = async (e) => {
        e.preventDefault();
        if (!linkPhoto) return toast.error("Invalid URL");
        const res = await uploadByLinkApi({imageUrl: linkPhoto});
        if (res.code === 200) {
            setPhotos([...photos, res.data.url]);
            setLinkPhoto("");
            toast.success("Photo added");
        } else toast.error("Link error");
    };

    const removePhoto = (ev, filename) => {
        ev.preventDefault();
        setPhotos(photos.filter((photo) => photo !== filename));
    };

    const handleServiceChange = (serviceId) => {
        setServices((prev) =>
            prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
        );
    };

    const handleAddDay = () => {
        setItinerary([...itinerary, {day: itinerary.length + 1, title: "", description: ""}]);
    };

    const handleRemoveDay = (index) => {
        const newItinerary = itinerary.filter((_, idx) => idx !== index);
        const reIndexed = newItinerary.map((item, idx) => ({...item, day: idx + 1}));
        setItinerary(reIndexed);
    };

    const handleItineraryChange = (index, field, value) => {
        const newItinerary = [...itinerary];
        newItinerary[index][field] = value;
        setItinerary(newItinerary);
    };



    // --- SUBMIT UPDATE ---
    const handleUpdateTour = async (e) => {
        e.preventDefault();

        if (!tourId) return toast.error("Tour ID missing");
        if (!name?.trim()) return toast.error("Tour name is required");
        if (!tourType) return toast.error("Tour type required");
        if (!price || price < 0) return toast.error("Invalid Price");
        if (!duration || duration < 1) return toast.error("Invalid Duration");

        setLoading(true);

        const dataUpdate = {
            name,
            city,
            tourType,
            duration,
            durationText,
            maxGroupSize,
            price,
            priceChildren: priceChildren || 0,
            isVisible,
            images: photos,
            description,
            services,
            policy: policyChecked,
            itinerary,

        };

        try {
            const res = await updateTourApi(tourId, dataUpdate);
            if (res.success) {
                toast.success("Tour updated successfully!");
            } else {
                toast.error(res.message || "Update failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Server Error");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Spin size="large" tip="Loading Tour Data..."/>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* --- HEADER --- */}
            <div className="rounded-md mx-2 md:mx-5 top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 md:px-6 md:py-4 mb-8 transition-all">
                <div className="max-w-full mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                    {/* Phần 1: Back Button & Title */}
                    <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                        <Button
                            icon={<ArrowLeftOutlined/>}
                            shape="circle"
                            onClick={() => navigate("/dashboard-view-tours")}
                            className="bg-white shadow-sm border-gray-200 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                            <h2 className="font-bold text-gray-800 text-xl md:text-2xl tracking-tight truncate">
                                Update Tour
                            </h2>
                            {/* Xử lý tên tour dài trên mobile: thêm truncate */}
                            <p className="text-gray-500 text-xs md:text-sm mt-0.5 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                                Editing: <span className="font-semibold text-indigo-600">{name}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">

                        {/* Box chứa Switches: Mobile giãn full width */}
                        <div className="flex items-center justify-between sm:justify-start bg-white p-1.5 md:p-2 rounded-xl border border-gray-100 shadow-sm w-full sm:w-auto">


                            <div className="flex items-center justify-center sm:justify-start gap-2 px-2 md:px-3 w-1/2 sm:w-auto">
                    <span className={`text-xs md:text-sm font-semibold flex items-center gap-2 ${isVisible ? "text-green-600" : "text-gray-500"}`}>
                        {isVisible ? <FaEye size={14}/> : <FaEyeSlash size={14}/>}
                        <span>{isVisible ? "Public" : "Hidden"}</span>
                    </span>
                                <Switch checked={isVisible} onChange={setIsVisible} size="small" className={isVisible ? "bg-green-500" : "bg-gray-300"}/>
                            </div>
                        </div>

                        <Button
                            type="primary"
                            onClick={handleUpdateTour}
                            loading={loading}
                            icon={<FaSave className="mr-2"/>}
                            // Xóa 'hidden', thêm 'w-full md:w-auto flex justify-center'
                            className="h-10 px-6 rounded-lg font-medium shadow-md border-0 bg-indigo-600 hover:!bg-indigo-700 w-full md:w-auto flex justify-center items-center"
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
            <div className="max-w-full mx-auto px-4 md:px-6">
                <form className="w-full space-y-8" onSubmit={(e) => e.preventDefault()}>

                    {/* SECTION 1: Basic Info */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8">
                        <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                            <h2 className="font-semibold text-gray-700 text-lg">General Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Tour Name</label>
                                <Input
                                    size="large"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700">Destination (City)</label>
                                <Select
                                    size="large"
                                    value={city}
                                    onChange={setCity}
                                    showSearch
                                    options={cities.map((c) => ({value: c.name, label: c.name}))}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700">Tour Type</label>
                                <Select
                                    size="large"
                                    value={tourType || undefined}
                                    onChange={setTourType}
                                    placeholder="Select Type"
                                    options={TOUR_TYPES}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700">Duration Text <span className="text-xs text-gray-400 font-normal">(auto)</span></label>
                                <Input
                                    size="large"
                                    value={durationText}
                                    readOnly
                                    prefix={<ClockCircleOutlined className="text-gray-400"/>}
                                    className="rounded-xl bg-gray-50 cursor-not-allowed"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-gray-700">Days</label><InputNumber style={{ width: "100%", height: "100%" }} min={1} value={duration} onChange={setDuration} className="w-full rounded-xl py-1"/></div>
                                <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-gray-700">Max Group</label><InputNumber style={{ width: "100%", height: "100%" }} min={1} value={maxGroupSize} onChange={setMaxGroupSize} prefix={<TeamOutlined className="text-gray-400 mr-2"/>} className="w-full rounded-xl py-1"/></div>
                            </div>                        </div>
                    </div>

                    {/* SECTION 2: Pricing */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8">
                        <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                            <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                            <h2 className="font-semibold text-gray-700 text-lg">Pricing</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Adult Price (VND)</label>
                                <InputNumber
                                    style={{width: '100%'}}
                                    size="large"
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                                    value={price}
                                    onChange={setPrice}
                                    prefix={<DollarOutlined className="text-gray-400"/>}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Children Price (VND)</label>
                                <InputNumber
                                    style={{width: '100%'}}
                                    size="large"
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                                    value={priceChildren}
                                    onChange={setPriceChildren}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Itinerary (formerly SECTION 4) */}


                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8">
                        <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                            <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                            <h2 className="font-semibold text-gray-700 text-lg">Tour Itinerary</h2>
                        </div>

                        <div className="space-y-6">
                            {itinerary.map((item, index) => (
                                <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white transition-all">
                                    <div className="flex flex-col items-center gap-2 pt-2">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm mb-2">
                                            {item.day}
                                        </div>
                                        <div className="w-[1px] h-full mb-2 bg-purple-200"></div>
                                    </div>
                                    <div className="flex-1 space-y-6">
                                        <Input
                                            placeholder="Title"
                                            value={item.title}
                                            onChange={(e) => handleItineraryChange(index, "title", e.target.value)}
                                            className="font-semibold"
                                        />
                                        <TextArea
                                            placeholder="Description"
                                            rows={3}
                                            value={item.description}
                                            onChange={(e) => handleItineraryChange(index, "description", e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleRemoveDay(index)}
                                        className="text-gray-400 hover:text-red-500 self-start pt-2"
                                        type="button"
                                    >
                                        <IoTrashOutline size={20}/>
                                    </button>
                                </div>
                            ))}

                            <Button
                                type="dashed"
                                onClick={handleAddDay}
                                block
                                icon={<IoAddCircleOutline/>}
                                className="h-12 border-purple-300 text-purple-600 hover:text-purple-700 hover:border-purple-500"
                            >
                                Add Day {itinerary.length + 1}
                            </Button>
                        </div>
                    </div>

                    {/* SECTION 5: Media */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8">
                        <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                            <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
                            <h2 className="font-semibold text-gray-700 text-lg">Gallery</h2>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Image URL"
                                    value={linkPhoto}
                                    onChange={(e) => setLinkPhoto(e.target.value)}
                                    className="rounded-xl"
                                />
                                <Button onClick={addPhotoByLink} className="h-full rounded-xl">Add</Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <label className="border-2 border-dashed border-gray-300 rounded-2xl h-32 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-rose-400 hover:text-rose-500 transition-all">
                                    <input type="file" multiple className="hidden" onChange={addPhotoByFile}/>
                                    <IoCloudUploadOutline size={24}/>
                                    <span className="text-xs font-medium mt-1">Upload</span>
                                </label>
                                {photos.map((item, idx) => (
                                    <div key={idx} className="relative h-32 group rounded-2xl overflow-hidden border border-gray-200">
                                        <img src={item} alt="tour" className="w-full h-full object-cover"/>
                                        <button onClick={(ev) => removePhoto(ev, item)} className="absolute top-1 right-1 bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all">✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow">
                            <div className="flex mb-4 items-center gap-3">
                                <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                                <h2 className="font-semibold text-gray-700 text-lg">Services</h2></div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div
                                    onClick={() => setShowModel(true)}
                                    className="cursor-pointer min-h-[80px] border-2 border-dashed border-gray-300 rounded-xl p-2 flex flex-col items-center justify-center text-gray-500 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-600 transition-all text-center"
                                >
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


                        {/* Policies */}
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
                                <div
                                    onClick={() => setShowModelPolicy(true)}
                                    className="cursor-pointer h-20 border-2 border-dashed border-gray-300 rounded-xl p-2
                            flex flex-col items-center justify-center text-gray-500 hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-600 transition-all text-center"
                                >
                                    <IoCloudUploadOutline size={20}/>
                                    <span className="text-xs font-medium mt-1">Add Rule</span>
                                </div>

                                {policy.length > 0 && (
                                    <Policy
                                        typePolicyDefault={typePolicyDefault}
                                        handlePolicyChange={handlePolicyChange}
                                        policy={policy}
                                        setPolicy={setPolicy}
                                        policyChecked={policyChecked}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 6: Overview */}
                    <div className="grid grid-cols-1 gap-8">
                        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8">
                            <div className="flex mb-4 items-center gap-3">
                                <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                                <h2 className="font-semibold text-gray-700 text-lg">Overview</h2>
                            </div>
                            <div className="rounded-xl overflow-hidden border border-gray-200">
                                <EditorTiny handleEditorChange={setDescription} description={description}/>
                            </div>
                        </div>
                    </div>

                    {/* MOBILE BUTTON */}
                    <button
                        onClick={handleUpdateTour}
                        className="md:hidden w-full py-4 text-white rounded-xl text-lg font-semibold shadow-xl bg-indigo-600 hover:bg-indigo-700"
                    >
                        Save Changes
                    </button>
                </form>

                {/* MODAL SERVICES */}
                {showModel && (
                    <ModelCreateService
                        services={services}
                        setServices={setServices}
                        setShowModel={setShowModel}
                    />
                )}

                {/* MODAL POLICY */}
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
        </div>
    );
};

export default AdminUpdateTour;
