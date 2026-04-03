import  { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FaMapMarkerAlt,
    FaRegCircle,
    FaRulerHorizontal,
    FaClock,
    FaStar,
    FaPlus,
    FaCarSide,
    FaShuttleVan,
    FaBus,
    FaCheck,
    FaRegSave,
    FaSpinner,
    FaChevronDown
} from "react-icons/fa";
import { TbSteeringWheel } from "react-icons/tb";
import { Select } from "antd";
import toast from "react-hot-toast";

// Import API and Constants
import { cities } from "../../../common/common.js";
import {
    updateCarRouteApi,
    getAllCarsApi, getAllCarRoutesApi, getCarRouteDetailApi,
} from "../../../api/client/car.api.js";

const { Option } = Select;

const AdminUpdateRouteTransfer = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID from URL

    // --- State Management ---
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);

    const [formData, setFormData] = useState({
        isActive: true,
        origin: "",
        destination: "",
        distance: "",
        duration: "",
        isPopular: false,
    });

    // Store fetched vehicles from API (Library)
    const [libraryVehicles, setLibraryVehicles] = useState([]);

    // Store selected vehicles with their configured price
    const [configuredVehicles, setConfiguredVehicles] = useState([]);

    // --- Fetch Data (Library + Existing Route Info) ---
    useEffect(() => {
        const fetchData = async () => {
            setIsFetchingData(true);
            try {
                // 1. Fetch Vehicle Library
                const carsRes = await getAllCarsApi({ status: 'ACTIVE' });
                if (carsRes && carsRes.success) {
                    setLibraryVehicles(carsRes.data);
                }

                // 2. Fetch Route Details
                // Note: Ensure your backend populates the 'prices.vehicle' field!
                const routeRes = await getCarRouteDetailApi(id);

                if (routeRes && routeRes.success) {
                    const data = routeRes.data;

                    // Populate Form Data
                    setFormData({
                        isActive: data.isActive,
                        origin: data.origin,
                        destination: data.destination,
                        distance: data.distance,
                        duration: data.duration,
                        isPopular: data.isPopular,
                    });

                    if (data.prices && Array.isArray(data.prices)) {
                        const mappedVehicles = data.prices.map(item => {
                            // Handle case where vehicle might be null (deleted)
                            if (!item.vehicle) return null;

                            return {
                                ...item.vehicle, // Spread vehicle details
                                configPrice: item.price // Map price to the key used in state
                            };
                        }).filter(v => v !== null);

                        setConfiguredVehicles(mappedVehicles);
                    }
                } else {
                    toast.error("Failed to load route details.");
                    navigate("/dashboard-view-car"); // Redirect if not found
                }

            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Network error loading data.");
            } finally {
                setIsFetchingData(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, navigate]);

    // --- Helpers ---
    const getVehicleIcon = (type) => {
        const lowerType = type ? type.toLowerCase() : "";
        if (lowerType.includes("van") || lowerType.includes("limousine")) return <FaShuttleVan size={24} />;
        if (lowerType.includes("bus") || lowerType.includes("minibus")) return <FaBus size={24} />;
        return <FaCarSide size={24} />;
    };

    // --- Handlers ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleStatus = () => {
        setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
    };

    const handleAddVehicle = (vehicle) => {
        if (!configuredVehicles.find(v => v._id === vehicle._id)) {
            setConfiguredVehicles([...configuredVehicles, { ...vehicle, configPrice: 0 }]);
        }
    };

    const handleRemoveVehicle = (id) => {
        setConfiguredVehicles(configuredVehicles.filter(v => v._id !== id));
    };

    const handlePriceChange = (id, newPrice) => {
        setConfiguredVehicles(prev => prev.map(v =>
            v._id === id ? { ...v, configPrice: newPrice } : v
        ));
    };

    const handleSubmit = async () => {
        // 1. Validation
        if (!formData.origin || !formData.destination) {
            toast.warning("Please specify Origin and Destination.");
            return;
        }
        if (formData.origin === formData.destination) {
            toast.warning("Origin and Destination cannot be the same.");
            return;
        }
        if (configuredVehicles.length === 0) {
            toast.warning("Please configure at least one vehicle price.");
            return;
        }

        setIsLoading(true);

        try {
            // 2. Payload Construction
            const payload = {
                origin: formData.origin,
                destination: formData.destination,
                distance: parseFloat(formData.distance) || 0,
                duration: parseFloat(formData.duration) || 0,
                isPopular: formData.isPopular,
                isActive: formData.isActive,
                prices: configuredVehicles.map(v => ({
                    vehicle: v._id,
                    price: parseFloat(v.configPrice) || 0
                }))
            };

            // 3. API Call (UPDATE)
            const res = await updateCarRouteApi(id, payload);

            if (res && res.success) {
                toast.success("Route updated successfully!");
                navigate("/dashboard-view-car");
            } else {
                toast.error(res.message || "Failed to update route.");
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetchingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-2 text-indigo-600">
                    <FaSpinner className="animate-spin text-3xl" />
                    <span className="font-medium">Loading Route Data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">

            {/* --- Header Section --- */}
            <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="text-indigo-600">
                        <TbSteeringWheel size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Update Transfer Route</h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* Status Toggle */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">Status:</span>
                        <div
                            className={`flex items-center gap-2 cursor-pointer px-3 py-1 rounded-full transition-colors ${formData.isActive ? 'bg-blue-50' : 'bg-gray-100'}`}
                            onClick={toggleStatus}
                        >
                            <div className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 duration-300 ease-in-out ${formData.isActive ? 'bg-blue-600' : ''}`}>
                                <div className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ease-in-out ${formData.isActive ? 'translate-x-5' : ''}`}></div>
                            </div>
                            <span className={`text-xs font-bold ${formData.isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                                {formData.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                        </div>
                    </div>

                    {/* Publish Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <FaSpinner className="animate-spin" /> : <FaRegSave />}
                        <span>Save Changes</span>
                    </button>
                </div>
            </header>

            {/* --- Route Information Card --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-2 mb-6 text-gray-800 border-b border-gray-50 pb-4">
                    <FaMapMarkerAlt className="text-gray-400" />
                    <h2 className="text-lg font-bold">Route Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Origin Select */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Origin</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FaRegCircle size={14} />
                            </div>
                            <Select
                                showSearch
                                placeholder="Select Origin City"
                                style={{ width: '100%' }}
                                size="large"
                                value={formData.origin}
                                onChange={(val) => handleSelectChange('origin', val)}
                                suffixIcon={<FaChevronDown className="text-gray-400 text-xs" />}
                            >
                                {cities.map((city, index) => (
                                    <Option key={index} value={city.name}>{city.name}</Option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    {/* Destination Select */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Destination</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FaMapMarkerAlt size={14} />
                            </div>
                            <Select
                                showSearch
                                placeholder="Select Destination City"
                                style={{ width: '100%' }}
                                size="large"
                                value={formData.destination}
                                onChange={(val) => handleSelectChange('destination', val)}
                                suffixIcon={<FaChevronDown className="text-gray-400 text-xs" />}
                            >
                                {cities.map((city, index) => (
                                    <Option key={index} value={city.name}>{city.name}</Option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    {/* Distance */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Distance (km)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FaRulerHorizontal size={14} />
                            </div>
                            <input
                                type="number"
                                name="distance"
                                value={formData.distance}
                                onChange={handleInputChange}
                                placeholder="0"
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Estimated Duration (hours)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FaClock size={14} />
                            </div>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                placeholder="0.0"
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Popular Route Toggle */}
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-start gap-3">
                        <div className="text-orange-400 mt-1"><FaStar /></div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">Mark as Popular Route</h3>
                            <p className="text-xs text-gray-500 mt-1">This route will be featured on the homepage.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="isPopular"
                            checked={formData.isPopular}
                            onChange={handleInputChange}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-400"></div>
                    </label>
                </div>
            </div>

            {/* --- Price Configuration Section --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-2">
                        <div className="transform rotate-45 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Price Configuration</h2>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-md border border-red-200">
                        {configuredVehicles.length} Configured
                    </span>
                    <span className="text-sm text-gray-500">Define pricing for each vehicle type available on this route.</span>
                </div>

                {/* Table or Empty State */}
                <div className="border rounded-lg bg-gray-50/50 min-h-[200px]">
                    {configuredVehicles.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-500">
                                <tr>
                                    <th className="px-6 py-3">Vehicle Type</th>
                                    <th className="px-6 py-3">Base Price (VND)</th>
                                    <th className="px-6 py-3">Capacity</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                {configuredVehicles.map((v) => (
                                    <tr key={v._id}>
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                            <span className="text-gray-400">{getVehicleIcon(v.type)}</span>
                                            <div className="flex flex-col">
                                                <span>{v.name}</span>
                                                <span className="text-xs text-gray-400 font-normal">{v.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                value={v.configPrice}
                                                onChange={(e) => handlePriceChange(v._id, e.target.value)}
                                                className="border border-gray-300 rounded px-2 py-1 w-32 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter price"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            {v.maxPassengers} passengers
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRemoveVehicle(v._id)}
                                                className="text-red-500 hover:text-red-700 font-medium text-xs underline"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
                            <FaCarSide size={40} className="mb-3 opacity-20" />
                            <p className="text-sm font-medium">No vehicles configured for this route yet.</p>
                            <p className="text-xs mt-1 text-blue-500 flex items-center gap-1 cursor-pointer hover:underline">
                                Select from library below <span className="transform rotate-90">→</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Available Vehicles (Library) --- */}
            <div className="mb-10">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FaPlus className="border border-blue-600 rounded p-[1px]" />
                    Available Vehicles (Library)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {libraryVehicles.map((vehicle) => {
                        const isSelected = configuredVehicles.some(v => v._id === vehicle._id);
                        return (
                            <div
                                key={vehicle._id}
                                onClick={() => !isSelected && handleAddVehicle(vehicle)}
                                className={`
                                    relative flex items-start gap-4 p-5 rounded-xl border transition-all cursor-pointer group
                                    ${isSelected
                                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300 opacity-60 cursor-default'
                                    : 'bg-white border-gray-200 hover:shadow-md hover:border-blue-300'
                                }
                                `}
                            >
                                <div className={`p-3 rounded-lg ${isSelected ? 'bg-blue-200 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {getVehicleIcon(vehicle.type)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800">{vehicle.name}</h4>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                        <span>{vehicle.maxPassengers} Pax</span>
                                        <span>•</span>
                                        <span className="capitalize">{vehicle.type}</span>
                                    </div>
                                </div>
                                <div className="mt-1">
                                    {isSelected ? (
                                        <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                            <FaCheck size={10} />
                                        </div>
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-blue-400"></div>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {libraryVehicles.length === 0 && (
                        <div className="col-span-full text-center py-6 text-gray-400 border border-dashed rounded-lg">
                            No vehicles found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminUpdateRouteTransfer;