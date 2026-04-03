// src/data/iconList.jsx

// --- FontAwesome Imports ---
import {
    FaSpa, FaSwimmingPool, FaBed, FaWifi, FaConciergeBell, FaMountain, FaDollarSign, FaPlane, FaHotel,
    FaTrain, FaShip, FaUtensils, FaCoffee, FaCameraRetro,
    FaBus, FaMapMarkedAlt, FaPassport, FaUmbrellaBeach,
    FaStar, FaCheck, FaUser, FaBriefcase, FaMapMarkerAlt,
    FaCalendarAlt, FaClock, FaPhoneAlt, FaEnvelope,
    FaCreditCard, FaCocktail, FaDumbbell, FaParking, FaPaw
} from 'react-icons/fa';

// --- Material Design Imports ---
import {
    MdRestaurant, MdDirectionsCar,
    MdLocalTaxi, MdOutlineSupportAgent,
    MdSecurity, MdFamilyRestroom
} from 'react-icons/md';


export const ICON_MAP = {
    // Essentials (Used in Stats/Defaults)
    check: <FaCheck size={40}/>,
    user: <FaUser size={40}/>,
    briefcase: <FaBriefcase size={40}/>,
    star: <FaStar size={40}/>,

    // Travel & Transport
    mountain: <FaMountain size={40}/>,
    plane: <FaPlane size={40}/>,
    bus: <FaBus size={40}/>,
    train: <FaTrain size={40}/>,
    ship: <FaShip size={40}/>,
    car: <MdDirectionsCar size={40}/>,
    taxi: <MdLocalTaxi size={40}/>,
    passport: <FaPassport size={40}/>,
    map: <FaMapMarkedAlt size={40}/>,
    location: <FaMapMarkerAlt size={40}/>,
    camera: <FaCameraRetro size={40}/>,
    beach: <FaUmbrellaBeach size={40}/>,

    // Hotel & Amenities
    hotel: <FaHotel size={40}/>,
    bed: <FaBed size={40}/>,
    wifi: <FaWifi size={40}/>,
    pool: <FaSwimmingPool size={40}/>,
    spa: <FaSpa size={40}/>,
    gym: <FaDumbbell size={40}/>,
    parking: <FaParking size={40}/>,
    pet: <FaPaw size={40}/>,
    family: <MdFamilyRestroom size={40}/>,
    bell: <FaConciergeBell size={40}/>,

    // Food & Dining
    food: <FaUtensils size={40}/>,
    coffee: <FaCoffee size={40}/>,
    bar: <FaCocktail size={40}/>,
    restaurant: <MdRestaurant size={40}/>,

    // Business & Info
    money: <FaDollarSign size={40}/>,
    card: <FaCreditCard size={40}/>,
    support: <MdOutlineSupportAgent size={40}/>,
    security: <MdSecurity size={40}/>,
    calendar: <FaCalendarAlt size={40}/>,
    clock: <FaClock size={40}/>,
    phone: <FaPhoneAlt size={40}/>,
    email: <FaEnvelope size={40}/>,
};

/* 2. ICON_OPTIONS: For the Admin Dropdown Select
*/
export const ICON_OPTIONS = [
    // Top Priorities
    {value: "check", label: "Check Mark (Tích V)"},
    {value: "user", label: "User/Client (Người dùng)"},
    {value: "briefcase", label: "Briefcase (Công việc)"},
    {value: "star", label: "Star (Ngôi sao)"},

    // Travel
    {value: "mountain", label: "Mountain (Núi)"},
    {value: "beach", label: "Beach (Biển)"},
    {value: "plane", label: "Plane (Máy bay)"},
    {value: "bus", label: "Bus (Xe buýt)"},
    {value: "train", label: "Train (Tàu hỏa)"},
    {value: "ship", label: "Cruise (Du thuyền)"},
    {value: "car", label: "Car (Ô tô)"},
    {value: "passport", label: "Visa/Passport"},
    {value: "map", label: "Map (Bản đồ)"},
    {value: "camera", label: "Photography (Chụp ảnh)"},

    // Hotel
    {value: "hotel", label: "Hotel (Khách sạn)"},
    {value: "bed", label: "Luxury Room (Phòng ngủ)"},
    {value: "wifi", label: "Free Wifi"},
    {value: "pool", label: "Swimming Pool (Bể bơi)"},
    {value: "spa", label: "Spa & Wellness"},
    {value: "gym", label: "Gym/Fitness"},
    {value: "bar", label: "Bar/Cocktail"},
    {value: "food", label: "Restaurant (Nhà hàng)"},
    {value: "coffee", label: "Coffee (Cà phê)"},
    {value: "parking", label: "Parking (Đỗ xe)"},

    // Services
    {value: "money", label: "Best Price (Giá tốt)"},
    {value: "support", label: "24/7 Support"},
    {value: "security", label: "Safe & Secure"},
    {value: "calendar", label: "Calendar (Lịch)"},
    {value: "phone", label: "Phone (Điện thoại)"},
];

// Optional: Legacy array (Keep only if you use it elsewhere, otherwise safe to delete)
export const iconList = Object.values(ICON_MAP);