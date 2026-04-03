import mongoose from "mongoose";
import slug from "mongoose-slug-updater";

// 1. Kích hoạt Plugin
mongoose.plugin(slug);

const RoomSchema = new mongoose.Schema(
    {
        RoomType: {
            type: String,
            required: [true, "Room type is required"],
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        photos: {
            type: [String],
        },
        maxPeople: {
            type: Number,
            default: 1,
        },
        services: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "ServicesHotel",
            },
        ],
        hotel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hotel",
            required: true,
            index: true,
        },
        price: {
            type: Number,
            required: true,
            index: true,
        },
        // --- EXISTING: PRICE EXTRA ---
        priceExtra: [
            {
                start: { type: Date },
                end: { type: Date },
                title: { type: Number },
            }
        ],
        facilities: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "FacilitiesHotel",
            },
        ],

        // --- NEW: SCALABLE AVAILABILITY & QUANTITY ---

        // Base Quantity (Future-proofing)
        // Default is 1 (or 0) if you don't care about quantity yet.
        quantity: {
            type: Number,
            default: 1,
            min: 0
        },

        // Availability Rules (Handles "No Rooms" logic)
        availabilityRules: [
            {
                startDate: { type: Date, required: true },
                endDate: { type: Date, required: true },

                isBlocked: { type: Boolean, default: true },

                // Future Requirement: "maybe in the future there will be quantity"
                // This allows you to override the base quantity for specific dates
                // (e.g., normally 5 rooms, but on Christmas only 2 available)
                overrideQuantity: { type: Number, default: null },

                note: { type: String } // Optional: Reason for blocking (e.g., "Maintenance")
            }
        ],

        // --- SLUG CONFIGURATION ---
        slug: {
            type: String,
            slug: "RoomType",
            unique: true,
            slugPaddingSize: 4,
            index: true
        },
    },
    {
        timestamps: true
    }
);

// Indexing
RoomSchema.index({ createdAt: -1 });
RoomSchema.index({ "priceExtra.start": 1, "priceExtra.end": 1 });
RoomSchema.index({ "availabilityRules.startDate": 1, "availabilityRules.endDate": 1 }); // Index for fast availability lookups

export default mongoose.model("Room", RoomSchema);