import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
import AmenityGroupSchema from "./schemas/Amenities.schema.js";
import ItinerarySchema from "./schemas/Itinerary.schema.js";
import {CRUISE_TYPE} from "../../constants/cruise.constant.js";

mongoose.plugin(slug);

// --- 1. DEFINITION: EMBEDDED CABIN SCHEMA ---
// (Cấu trúc này sao chép từ Cabin Template để đảm bảo đồng bộ dữ liệu)
const EmbeddedCabinSchema = new mongoose.Schema({
    name: { type: String, required: true },
    viewType: {
        type: String,
        enum: Object.values(CRUISE_TYPE),
        default: CRUISE_TYPE.OCEAN_VIEW
    },
    pricePerNight: { type: Number, required: true },
    description: { type: String },

    specifications: {
        maxOccupancy: { type: Number, default: 2 },
        cabinSize: { type: Number },
        bedType: { type: String },
        hasBalcony: { type: Boolean, default: false }
    },

    amenities: [{ type: String }],
    photos: [{ type: String }]
}, { _id: true }); // _id=true để mỗi phòng thực tế có ID riêng phục vụ Booking

const CruiseSchema = new mongoose.Schema({
    // --- CORE INFO ---
    title: { type: String, required: true, index: "text"},
    cruiseType: { type: String, default: "Luxury cruise", index: true},

    // --- TEMPLATE LOGIC ---
    departureTime: { type: Date, required: true, default: () => new Date().setHours(8,0,0,0) },
    duration: { type: Number, default: 1 },

    // Giá hiển thị Min (Tự động cập nhật từ cabin rẻ nhất)
    price: { type: Number, required: true, index: true },

    thumbnail: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    rating: { type: Number, default: 0, index: true },
    totalReviews: { type: Number, default: 0 },

    // Sửa lỗi index: Ở đây city nằm ở root, không phải trong location
    city: {type: String, required: true},

    // --- SUBDOCUMENTS ---
    amenities: [AmenityGroupSchema], // Tiện ích chung của tàu (Hồ bơi, Gym...)
    itinerary: [ItinerarySchema],

    // [EMBEDDED ARRAY] Danh sách phòng thực tế của chuyến tàu này
    cabins: [EmbeddedCabinSchema],

    // --- HEAVY FIELDS ---
    description: { type: String },
    faq: [{ question: String, answer: String, _id: false }],
    photos: [String],
    additionalServices: [{ name: String, price: Number, _id: false }],

    slug: {
        type: String,
        slug: "title",
        unique: true,
        permanent: false,
        index: true
    },

}, { timestamps: true });


CruiseSchema.index({ isActive: 1, city: 1, price: 1 });

// Index lọc tiện ích tàu
CruiseSchema.index({ "amenities.items": 1 });

// Index để lọc tàu theo giá phòng cụ thể (Filter range price chính xác hơn)
CruiseSchema.index({ "cabins.pricePerNight": 1 });

export default mongoose.model("Cruise", CruiseSchema);
