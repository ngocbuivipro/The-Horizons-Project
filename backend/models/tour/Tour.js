import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
import {TOUR_TYPE} from "../../constants/tour.constant.js";

mongoose.plugin(slug);

const TourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Tour name is required"],
        trim: true
    },
    city: {
        type: String,
        required: [true, "City is required"]
    },
    // [NEW] TOUR TYPE (Category)
    // Examples: "Adventure", "City Tour", "Beach", "Cultural", "Food", "cruise"
    tourType: {
        type: String,
        required: [true, "Tour type is required"],
        enum: Object.values(TOUR_TYPE),
        default: TOUR_TYPE.ADVENTURE,
        index: true
    },
    // Thời lượng (ví dụ: 3 ngày)
    duration: {
        type: Number,
        required: [true, "Duration is required"]
    },
    durationText: {
        type: String, // Text hiển thị, ví dụ: "3N2Đ"
    },
    images: {
        type: [String],
    },
    description: {
        type: String,
    },
    itinerary: [{
        day: Number,
        title: String,
        description: String,
    }],

    price: {
        type: Number,
        required: [true, "Price is required"],
    },
    priceChildren: {
        type: Number,
        default: 0
    },

    priceExtra: [
        {
            start: { type: Date },
            end: { type: Date },
            price: { type: Number }, // Giá áp dụng trong khoảng này
        }
    ],

    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServicesHotel",
    }],
    policy:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Policy"
        }
    ],

    maxGroupSize: {
        type: Number,
        required: [true, "Max group size is required"],
        default: 10
    },

    availabilityRules: [
        {
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true },
            isBlocked: { type: Boolean, default: true }, // True = Không nhận khách
            note: { type: String }
        }
    ],

    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false,
    },
    slug: {
        type: String,
        slug: "name",
        unique: true,
        slugPaddingSize: 4,
        index: true
    },
    isVisible: {
        type: Boolean,
        default: true,
        index: true
    },
}, { timestamps: true });

// Indexing cho performance
TourSchema.index({ city: 1, price: 1, duration: 1 });
TourSchema.index({ "priceExtra.start": 1, "priceExtra.end": 1 });
TourSchema.index({ "availabilityRules.startDate": 1, "availabilityRules.endDate": 1 });

export default mongoose.model("Tour", TourSchema);