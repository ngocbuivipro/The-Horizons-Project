import { Select, InputNumber, Switch, Button, Input, Checkbox, Tabs } from "antd";
import { useState } from "react";
import { IoCloudUploadOutline, IoCarSportOutline, IoTrashOutline, IoLinkOutline } from "react-icons/io5";
import { FaSave, FaWifi, FaSnowflake, FaChair, FaBluetooth, FaWineBottle, FaUsb, FaLanguage, FaChild, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import {uploadByFilesApi, uploadByLinkApi} from "../../../api/client/api.js";
import {createCarApi} from "../../../api/client/car.api.js";


const AdminCreateCarTransfer = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isActive, setIsActive] = useState(true);

    // --- FORM STATES ---
    const [carName, setCarName] = useState("");
    const [type, setType] = useState("Sedan");
    const [category, setCategory] = useState("Standard");
    const [maxPassengers, setMaxPassengers] = useState(4);
    const [maxLuggage, setMaxLuggage] = useState(2);
    const [hourlyRate, setHourlyRate] = useState(0);
    const [minBookingHours, setMinBookingHours] = useState(1);

    // --- DESCRIPTION & FEATURES ---
    const [description, setDescription] = useState("");
    const [features, setFeatures] = useState([]);

    // --- MEDIA STATES ---
    const [photos, setPhotos] = useState([]); // Array of strings (URLs)
    const [uploading, setUploading] = useState(false);
    const [imageLinkInput, setImageLinkInput] = useState("");

    // Feature Options mapping with Icons
    const featureOptions = [
        { label: "Air Conditioning", value: "AC", icon: <FaSnowflake /> },
        { label: "Free Wifi", value: "WIFI", icon: <FaWifi /> },
        { label: "Leather Seats", value: "LEATHER", icon: <FaChair /> },
        { label: "Bluetooth Sound", value: "BLUETOOTH", icon: <FaBluetooth /> },
        { label: "Bottled Water", value: "WATER", icon: <FaWineBottle /> },
        { label: "USB Charging", value: "USB", icon: <FaUsb /> },
        { label: "Child Seat (On Request)", value: "CHILD_SEAT", icon: <FaChild /> },
        { label: "English Speaking Driver", value: "ENGLISH", icon: <FaLanguage /> },
    ];

    const handleFeatureChange = (checkedValues) => {
        setFeatures(checkedValues);
    };

    // --- MEDIA HANDLERS ---

    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("photos", files[i]); // Key 'photos' matches backend expectation usually
        }

        try {
            const res = await uploadByFilesApi(formData);


            if (res.success) {
                // Assuming API returns array of URLs in res.data
                setPhotos(prev => [...prev, ...res.data]);
                toast.success(`Uploaded ${files.length} images successfully`);
            } else {
                toast.error(res.message || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Error uploading files");
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    const handleLinkUpload = async () => {
        if (!imageLinkInput) return;

        setUploading(true);
        try {
            const res = await uploadByLinkApi({ link: imageLinkInput });


            if (res.success) {
                // Assuming API returns the processed URL in res.data array
                setPhotos(prev => [...prev, ...res.data]);
                toast.success("Image added from link");
                setImageLinkInput("");
            } else {
                toast.error(res.message || "Failed to add image link");
            }
        } catch (error) {
            toast.error("Error adding image by link");
        } finally {
            setUploading(false);
        }
    };

    const removePhoto = (indexToRemove) => {
        setPhotos(photos.filter((_, index) => index !== indexToRemove));
    };

    // --- SUBMIT HANDLER ---

    const handlePublish = async () => {
        if (!carName) return toast.error("Please enter Car Name");
        if (photos.length === 0) return toast.error("Please upload at least one car photo");

        setLoading(true);
        try {
            const payload = {
                carName,
                type,
                category,
                maxPassengers,
                maxLuggage,
                hourlyRate,
                minBookingHours,
                description,
                features,
                photos, // Array of URLs
                isActive
            };

            console.log("Submit Payload:", payload);
            await createCarApi(payload);

            toast.success("Car Transfer Created Successfully!");
            // navigate("/dashboard-car-transfer");
        } catch (error) {
            toast.error("Failed to create car");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <div className="rounded-md mx-5 top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 mb-8 sticky">
                <div className="max-w-full mx-auto flex justify-between items-center">
                    <h2 className="font-bold text-gray-800 text-2xl flex items-center">
                        <IoCarSportOutline className="mr-3 text-indigo-600" /> Create Car Transfer
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-500">Active</span>
                        <Switch checked={isActive} onChange={setIsActive} className={isActive ? "bg-indigo-600" : "bg-gray-300"} />
                        <Button type="primary" onClick={handlePublish} loading={loading} icon={<FaSave />} className="bg-indigo-600 h-10 px-6 rounded-lg">
                            Publish
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-full mx-auto px-4 md:px-6 flex flex-col gap-6">

                {/* 1. CAR INFORMATION */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-50">
                        <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                        <h2 className="font-bold text-gray-800 text-lg">Car Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Car Name */}
                        <div className="md:col-span-12">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Car Name</label>
                            <Input
                                size="large"
                                placeholder="e.g. Mercedes-Benz S-Class 2023"
                                value={carName}
                                onChange={(e) => setCarName(e.target.value)}
                                className="!bg-gray-50 !border-gray-200 focus:!bg-white rounded-xl font-medium text-gray-700"
                            />
                        </div>

                        {/* Dropdowns & Numbers */}
                        <div className="md:col-span-6 lg:col-span-3">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Type</label>
                            <Select
                                size="large"
                                value={type}
                                onChange={setType}
                                className="w-full"
                                options={["Sedan", "SUV", "Van", "Minibus", "Limousine"].map(t => ({ label: t, value: t }))}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-3">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Category</label>
                            <Select
                                size="large"
                                value={category}
                                onChange={setCategory}
                                className="w-full"
                                options={["Standard", "Luxury", "Premium", "Economy"].map(t => ({ label: t, value: t }))}
                            />
                        </div>
                        <div className="md:col-span-6 lg:col-span-3">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Max Passengers</label>
                            <InputNumber style={{width: "100%"}} size="large" min={1} value={maxPassengers} onChange={setMaxPassengers} className="w-full !bg-gray-50 !border-gray-200 rounded-xl" />
                        </div>
                        <div className="md:col-span-6 lg:col-span-3">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Max Luggage</label>
                            <InputNumber style={{width: "100%"}} size="large" min={0} value={maxLuggage} onChange={setMaxLuggage} className="w-full !bg-gray-50 !border-gray-200 rounded-xl" prefix={<span className="text-gray-400 mr-1">🎒</span>} />
                        </div>
                        <div className="md:col-span-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Hourly Rate (VND)</label>
                            <InputNumber
                                size="large"
                                min={0}
                                style={{width: "100%"}}
                                value={hourlyRate}
                                onChange={setHourlyRate}
                                className="w-full !bg-gray-50 !border-gray-200 rounded-xl"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                                placeholder="0"
                            />
                            <span className="text-xs text-gray-400 mt-1 block">* Leave 0 if not applicable</span>
                        </div>
                        <div className="md:col-span-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Min Booking Hours</label>
                            <InputNumber style={{width: "100%"}} size="large" min={1} value={minBookingHours} onChange={setMinBookingHours} className="w-full !bg-gray-50 !border-gray-200 rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* 2. DESCRIPTION & FEATURES */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-50">
                        <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                        <h2 className="font-bold text-gray-800 text-lg">Description & Features</h2>
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Description</label>
                        <Input.TextArea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter detailed description of the vehicle..."
                            className="!bg-gray-50 !border-gray-200 rounded-xl focus:!bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Car Features</label>
                        <Checkbox.Group style={{ width: '100%' }} value={features} onChange={handleFeatureChange}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {featureOptions.map(opt => (
                                    <div key={opt.value} className="flex items-center gap-2 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                        <Checkbox value={opt.value}>
                                            <span className="flex items-center gap-2 text-gray-600 font-medium">
                                                {opt.icon} {opt.label}
                                            </span>
                                        </Checkbox>
                                    </div>
                                ))}
                            </div>
                        </Checkbox.Group>
                    </div>
                </div>

                {/* 3. MEDIA UPLOAD SECTION */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-50">
                        <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
                        <h2 className="font-bold text-gray-800 text-lg">Media Gallery</h2>
                    </div>

                    <Tabs defaultActiveKey="1" items={[
                        {
                            key: '1',
                            label: <span className="flex items-center gap-2"><IoCloudUploadOutline /> Upload Files</span>,
                            children: (
                                <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all relative group">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="py-8">
                                        <div className="mx-auto w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-500 mb-3 group-hover:scale-110 transition-transform">
                                            <IoCloudUploadOutline size={24} />
                                        </div>
                                        <h3 className="text-gray-700 font-medium">Click or Drag images here</h3>
                                        <p className="text-xs text-gray-400 mt-1">Supports: JPG, PNG, WEBP</p>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            key: '2',
                            label: <span className="flex items-center gap-2"><IoLinkOutline /> Add by URL</span>,
                            children: (
                                <div className="flex gap-2 items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <Input
                                        placeholder="Paste image URL here..."
                                        value={imageLinkInput}
                                        onChange={(e) => setImageLinkInput(e.target.value)}
                                        className="!bg-white !border-gray-200"
                                        prefix={<IoLinkOutline className="text-gray-400" />}
                                    />
                                    <Button
                                        type="primary"
                                        onClick={handleLinkUpload}
                                        loading={uploading}
                                        disabled={!imageLinkInput}
                                        className="bg-indigo-600"
                                        icon={<FaPlus />}
                                    >
                                        Add
                                    </Button>
                                </div>
                            ),
                        }
                    ]} />

                    {/* Image Preview Grid */}
                    {photos.length > 0 && (
                        <div className="mt-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">
                                Uploaded Images ({photos.length})
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {photos.map((url, idx) => (
                                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                                        <img
                                            src={url}
                                            alt={`car-${idx}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => removePhoto(idx)}
                                                className="p-2 bg-white/20 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors"
                                            >
                                                <IoTrashOutline size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminCreateCarTransfer;