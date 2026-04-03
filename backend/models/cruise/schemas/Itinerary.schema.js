import mongoose from "mongoose";

const ItinerarySchema = new mongoose.Schema({
    day: { type: Number, required: true },
    title: { type: String, required: true },
    description: String,
    meals: [String] // Optional: Breakfast, Lunch...
}, { _id: true });
// Nếu frontend cần key cho list, có thể dùng 'day' làm key hoặc để _id: true

export default ItinerarySchema;
