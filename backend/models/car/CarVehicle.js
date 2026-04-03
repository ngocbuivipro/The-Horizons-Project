import mongoose from 'mongoose';
import {CAR_CATEGORY, CAR_STATUS, CAR_TYPES} from "../../constants/car.constant.js";

const CarVehicleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }, // e.g., "Sedan", "Compact MPV", "Van"

    type: {
        type: String,
        enum: Object.values(CAR_TYPES),
        default: CAR_TYPES.SEDAN,
        required: true
    }, // Technical type: 'sedan', 'suv', 'van'

    // Display Badge
    category: {
        type: String,
        enum: Object.values(CAR_CATEGORY),
        default: CAR_CATEGORY.STANDARD
    }, // e.g., "Standard", "Spacious", "Large Group"

    // Capacity (Matches frontend nesting logic in Controller)
    maxPassengers: { type: Number, required: true },
    maxLuggage: { type: Number, required: true },

    // Media
    image: { type: String, required: true }, // e.g., Unsplash URL

    // Pricing for "By the Hour" service
    hourlyRate: { type: Number, default: 0 },
    minHours: { type: Number, default: 3 },

    // Metadata
    description: { type: String }, // e.g. "Comfortable sedan for small groups..."
    features: [{ type: String }],  // ["Door-to-door", "English Speaking Driver"]

    status: {
        type: String,
        enum: Object.values(CAR_STATUS),
        default: CAR_STATUS.ACTIVE
    }
}, { timestamps: true });

export default mongoose.model('CarVehicle', CarVehicleSchema);