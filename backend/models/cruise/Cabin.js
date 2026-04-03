import mongoose from "mongoose";

const CabinTemplateSchema = new mongoose.Schema(
    {
        // Trong mô hình Template, cruiseId thường là null.
        // Tuy nhiên vẫn giữ field này nếu sau này bạn muốn attach cứng 1 mẫu vào 1 tàu cụ thể (tùy chọn).
        cruiseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "cruise",
            default: null,
        },

        // --- BASIC INFO ---
        name: {
            type: String,
            required: true, // vd: "Deluxe Ocean Suite"
            index: true
        },
        viewType: {
            type: String,
            enum: ["Ocean View", "City View", "Internal", "Balcony", "Suite"],
            default: "Ocean View"
        },

        // --- PRICING ---
        pricePerNight: {
            type: Number,
            required: true,
        },

        // --- SPECIFICATIONS ---
        specifications: {
            maxOccupancy: { type: Number, default: 2 },
            cabinSize: { type: Number },     // Lưu số cho dễ tính toán (m2)
            bedType: { type: String },       // vd: "King Size"
            hasBalcony: { type: Boolean, default: false }
        },

        // --- AMENITIES ---
        amenities: [{ type: String }], // Mảng string đơn giản: ["Wifi", "TV"]

        // --- DETAILS ---
        description: { type: String },

        // --- GALLERY ---
        photos: [{ type: String }],
    },
    { timestamps: true }
);

// Index để tìm nhanh các template (cruiseId: null)
CabinTemplateSchema.index({ cruiseId: 1 });
CabinTemplateSchema.index({ name: 1 });

export default mongoose.model("Cabin", CabinTemplateSchema);