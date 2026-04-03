import mongoose from 'mongoose';

const CarRouteSchema = new mongoose.Schema({
    // Search Indexes
    origin: { type: String, required: true, index: true },      // e.g., "Noi Bai Airport"
    destination: { type: String, required: true, index: true }, // e.g., "Hanoi Old Quarter"

    // Route Info
    distanceKm: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },

    // Pricing Array: Different prices for different vehicles on the SAME route
    prices: [{
        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CarVehicle',
            required: true
        },
        price: { type: Number, required: true } // Fixed price for this route
    }],

    isPopular: { type: Boolean, default: false }, // For displaying on homepage
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Text index for flexible searching
CarRouteSchema.index({ origin: 'text', destination: 'text' });

export default mongoose.model('CarRoute', CarRouteSchema);
