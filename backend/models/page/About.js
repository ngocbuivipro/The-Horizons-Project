import mongoose from "mongoose";

const AboutSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    photos: [{ type: String }], // Array of image URLs
    lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // --- NEW: Features (Why Choose Us) ---
    features: [
        {
            icon: { type: String }, // e.g., 'money', 'mountain'
            title: { type: String },
            description: { type: String }
        }
    ],
    highlights: [
        {
            icon: { type: String }, // Tên icon
            text: { type: String }, // Nội dung text
            color: { type: String } // Màu sắc (red, green, blue...) để chỉnh CSS
        }
    ],

    // --- NEW: Stats (The counter numbers) ---
    stats: [
        {
            label: { type: String }, // e.g., "Destinations Worldwide"
            value: { type: String }, // e.g., "49+"
            icon: { type: String }   // e.g., "map"
        }
    ]
}, { timestamps: true });

export default mongoose.model("About", AboutSchema);
