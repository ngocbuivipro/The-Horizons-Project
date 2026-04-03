import mongoose from "mongoose";
import {
    BOOKING_TYPES, BOOKING_STATUS,
    PAYMENT_METHODS,
    CURRENCY_TYPES
} from "../../constants/booking.constant.js";

const BookingSchema = new mongoose.Schema({
    bookingType: {
        type: String,
        enum: Object.values(BOOKING_TYPES),
        required: true,
        index: true,
    },

    // --- SERVICE REFERENCES ---

    // 1. HOTEL
    roomType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
    },

    // 2. BUS
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus",
    },

    // 3. TOUR
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tour",
    },

    // 4. CRUISE
    cruise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cruise" // Lưu ý: model name nên viết hoa chữ cái đầu (Convention)
    },
    cabin: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: "Cabin"
    },

    // 5. CAR TRANSFER
    carVehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CarVehicle"
    },
    carRoute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CarRoute" // Có thể null nếu khách thuê theo giờ tự do (Hourly)
    },
    // Thông tin riêng cho Car
    pickupLocation: { type: String }, // Địa chỉ đón cụ thể
    dropoffLocation: { type: String }, // Địa chỉ trả cụ thể
    flightNumber: { type: String },
    trainNumber: { type: String },
    driverNote: { type: String },
    distanceKm: { type: Number },

    // --- USER REFERENCE ---
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    // --- GENERAL PRODUCT INFO ---
    productName: {
        type: String,
        required: true
    },

    // --- GUEST INFO ---
    guests: { type: Number, required: true },


    checkIn: { type: Date, required: true },

    checkOut: { type: Date, required: true },

    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    request: String, // Yêu cầu chung

    // Booking hộ người khác
    isGuest: { type: Boolean, default: false },
    nameGuest: String,

    // --- PAYMENT INFO ---
    paymentMethod: {
        type: String,
        enum: Object.values(PAYMENT_METHODS),
        required: true
    },
    processingFee: {
        type: Number,
        default: 0
    },

    // Giá cuối cùng (Sau khi trừ KM, cộng phí...)
    totalPriceVND: { type: Number, required: true },

    // Currency & Exchange
    selectedCurrency: {
        type: String,
        enum: Object.values(CURRENCY_TYPES),
        default: CURRENCY_TYPES.VND
    },
    exchangeRate: { type: Number, default: 1 },

    // Status
    status: {
        type: String,
        enum: Object.values(BOOKING_STATUS),
        default: BOOKING_STATUS.UNPAID,
        index: true
    },

    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
    },
    stepPayment: { type: Boolean, default: false },

    isPaid: {
        type: Boolean,
        default: false,
        index: true
    },

    // --- COUPON ---
    couponCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    originalPriceVND: { type: Number },

    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },

    payAt: Date,
}, { timestamps: true });

// --- PERFORMANCE INDEXES ---
BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ isPaid: 1, createdAt: -1 });
BookingSchema.index({ status: 1, createdAt: -1 });
BookingSchema.index({ email: 1, createdAt: -1 });
BookingSchema.index({ phoneNumber: 1, createdAt: -1 });
BookingSchema.index({ bookingType: 1, createdAt: -1 });

BookingSchema.virtual('paymentInfo', {
    ref: 'Payment',
    localField: '_id',
    foreignField: 'booking',
});

export default mongoose.model("Booking", BookingSchema);