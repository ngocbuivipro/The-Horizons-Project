import mongoose from "mongoose";
import {BUS_TYPES} from "../../constants/bus.constant.js";

// 1. Schema Quy định ngày chặn (Availability)
const AvailabilityRuleSchema = new mongoose.Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isBlocked: { type: Boolean, default: true }, // Mặc định là chặn
    reason: { type: String, default: "Bảo trì xe" }, // Lý do: Xe hư, nghỉ lễ, v.v.
}, { _id: false });

// 2. Schema Quy định giá đặc biệt (Price Extra)
const PriceExtraSchema = new mongoose.Schema({
    title: { type: String, required: true }, // VD: "Phụ thu Tết Âm Lịch"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    price: { type: Number, required: true }, // Giá mới áp dụng trong khoảng này
}, { _id: false });



const BusSchema = new mongoose.Schema({
    operator: { type: String, required: true }, // Nhà xe (VD: Phương Trang)
    busType: {
        type: String,
        enum: Object.values(BUS_TYPES),
        default: BUS_TYPES.LIMOUSINE
    },
    photos: { type: [String] },

    // --- Lộ trình & Thời gian ---
    cityFrom: { type: String, required: true },
    cityTo: { type: String, required: true },

    // Lưu ý: departureTime là thời gian khởi hành CỤ THỂ (Ngày + Giờ)
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    duration: { type: String }, // VD: "5h"

    // --- Giá & Ghế ---
    price: { type: Number, required: true }, // Giá gốc
    totalSeats: { type: Number, required: true },

    // --- ĐIỂM ĐÓN / TRẢ ---
    boardingPoints: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "BoardingArrive"
    }],
    droppingPoints: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "BoardingArrive"
    }],

    // --- TIỆN ÍCH & CHÍNH SÁCH ---
    facilities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "FacilitiesHotel", // Hoặc Facilities chung
    }],
    policy: { type: [String] },
    conditions: { type: String },

    //  Chặn lịch chạy (Xe bảo trì, hủy chuyến)
    availabilityRules: {
        type: [AvailabilityRuleSchema],
        default: [],
    },

    // Tăng giá ngày lễ (Tết, 30/4)
    priceExtra: {
        type: [PriceExtraSchema],
        default: [],
    },

    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
}, { timestamps: true });

BusSchema.index({ cityFrom: 1, cityTo: 1, departureTime: 1 });

export default mongoose.model("Bus", BusSchema);