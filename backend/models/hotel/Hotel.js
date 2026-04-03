import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
mongoose.plugin(slug);

const HotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
    },
    city:{
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    photos: {
        type: [String],
    },
    description: {
        type: String,
    },
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServicesHotel",
    }],
    // --- REVIEW RATING (Dynamic from users) ---
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    numberRating: {
        type: Number,
        default: 0
    },
    // --- HOTEL STAR RATING (Static, e.g., 5-star Hotel) ---
    stars: {
        type: Number,
        min: 0,
        max: 5,
        default: 5
    },

    roomType:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    }],

    cheapestPrice: {
        type: Number,
        required: true,
    },

    feature:{
        type: Boolean,
        default: false,
    },

    checkIn: {
        type: Date,
    },
    checkOut: {
        type: Date,
    },
    slug:{
        type:String,
        slug:"name",
        unique:true
    },
    policy:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Policy"
        }
    ],
    isVisible: {
        type: Boolean,
        default: true,
        index: true
    },
    coordinates: {
        lat: { type: Number, default: 21.028511 }, // Mặc định Hanoi
        lng: { type: Number, default: 105.854444 }
    }

},{ timestamps: true });

export default mongoose.model("Hotel", HotelSchema);