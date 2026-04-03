import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import {
    createHotelApi,
    getAllServicesApi,
    getPolicyApi,
    uploadByFilesApi,
    uploadByLinkApi,
} from "../../../../api/client/api";
import { getAllHotelsAction } from "../../../../redux/actions/HotelAction";
import { getAllRoomsAction } from "../../../../redux/actions/RoomAction";
import {DEFAULT_CHECK_IN, DEFAULT_CHECK_OUT, DEFAULT_ROOM_TYPES, INITIAL_COORDINATES} from "../constants/constants.js";

export const useAdminHotelForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // --- FORM STATE ---
    // Gom nhóm các state liên quan vào object để dễ quản lý
    const [formState, setFormState] = useState({
        name: "",
        type: "Hotel",
        city: "",
        address: "",
        cheapestPrice: "",
        stars: 0,
        checkIn: dayjs(DEFAULT_CHECK_IN, "HH:mm"),
        checkOut: dayjs(DEFAULT_CHECK_OUT, "HH:mm"),
        description: "",
        isVisible: true,
        coordinates: INITIAL_COORDINATES,
    });

    // Array states
    const [photos, setPhotos] = useState([]);
    const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [policyChecked, setPolicyChecked] = useState([]);

    // Data Source states (Dynamic data)
    const [availableServices, setAvailableServices] = useState([]);
    const [availablePolicies, setAvailablePolicies] = useState([]);
    const [dynamicRoomTypes, setDynamicRoomTypes] = useState(DEFAULT_ROOM_TYPES);

    // --- HELPERS ---
    const updateForm = (key, value) => {
        setFormState((prev) => ({ ...prev, [key]: value }));
    };

    // --- API FETCHING ---
    const fetchServices = useCallback(async () => {
        try {
            const res = await getAllServicesApi();
            setAvailableServices(res.data || []);
        } catch (error) {
            console.error("Fetch services error", error);
        }
    }, []);

    const fetchPolicies = useCallback(async (type) => {
        if (!type) return;
        try {
            const res = await getPolicyApi({ type });
            if (res.success) setAvailablePolicies(res.data);
        } catch (error) {
            console.error("Fetch policies error", error);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    // --- MEDIA HANDLERS ---
    const handleUploadFile = async (files) => {
        const data = new FormData();
        for (let i = 0; i < files.length; i++) data.append("photos", files[i]);

        const res = await uploadByFilesApi(data);
        if (res.success) {
            setPhotos((prev) => [...prev, ...res.data.map((item) => item.url)]);
        } else {
            toast.error("Error uploading files");
        }
    };

    const handleUploadLink = async (url) => {
        if (!url) return toast.error("Please enter a valid image URL");
        const res = await uploadByLinkApi({ imageUrl: url });
        if (res.code === 200) {
            setPhotos((prev) => [...prev, res.data.url]);
            return true; // Success signal
        } else {
            toast.error("Link error");
            return false;
        }
    };

    const removePhoto = (url) => {
        setPhotos((prev) => prev.filter((p) => p !== url));
    };

    // --- LOGIC HANDLERS ---
    const toggleSelection = (id, state, setState) => {
        setState((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleAddCustomRoomType = (newType) => {
        if (newType && !dynamicRoomTypes.includes(newType)) {
            setDynamicRoomTypes([...dynamicRoomTypes, newType]);
        }
    };

    // --- SUBMIT ---
    const validateForm = () => {
        const { name, type, city, address, cheapestPrice, checkIn, checkOut } = formState;
        if (!name?.trim()) return "Name cannot be empty";
        if (!type) return "Type accommodation cannot be empty";
        if (!city) return "Please choose a city";
        if (!cheapestPrice || cheapestPrice < 0) return "Invalid price";
        if (!address?.trim()) return "Address cannot be empty";
        if (!selectedRoomTypes.length) return "At least one room type is required";
        if (!selectedServices.length) return "Please select at least one service";
        if (!checkIn) return "Check in time cannot be empty";
        if (!checkOut) return "Check out time cannot be empty";
        return null;
    };

    const submitHotel = async () => {
        const error = validateForm();
        if (error) return toast.error(error);

        const payload = {
            ...formState,
            roomType: selectedRoomTypes,
            policy: policyChecked,
            services: selectedServices,
            photos: photos.length ? photos : undefined,
        };

        const res = await createHotelApi(payload);
        if (res.success) {
            toast.success(formState.isVisible ? "Home published successfully!" : "Home saved as Draft.");
            dispatch(getAllRoomsAction());
            dispatch(getAllHotelsAction());
            navigate("/dashboard-view-homes");
        } else {
            toast.error(res.message || "Unable to create home.");
        }
    };

    return {
        formState,
        updateForm,
        photos,
        handleUploadFile,
        handleUploadLink,
        removePhoto,
        selectedRoomTypes,
        dynamicRoomTypes,
        toggleRoomType: (name) => toggleSelection(name, selectedRoomTypes, setSelectedRoomTypes),
        handleAddCustomRoomType,
        selectedServices,
        availableServices,
        toggleService: (id) => toggleSelection(id, selectedServices, setSelectedServices),
        fetchServices,
        policyChecked,
        availablePolicies,
        fetchPolicies,
        togglePolicy: (id) => toggleSelection(id, policyChecked, setPolicyChecked),
        submitHotel,
    };
};