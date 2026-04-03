import {CAR_STATUS, TRANSFER_TYPE} from "../../constants/car.constant.js";
import CarVehicle from "../../models/car/CarVehicle.js";
import CarRoute from "../../models/car/CarRoute.js";

/**
 * Search logic matching Daytrip style.
 * Query Params:
 * - type: 'One-way' | 'By the hour'
 * - from: string (Origin)
 * - to: string (Destination - required if One-way)
 * - duration: number (Hours - required if By the hour)
 * - date: string (Optional, for availability check in future)
 */
export const searchCars = async (req, res) => {
    try {
        const { type, from, to, duration } = req.query;

        // 1. Validate inputs
        if (!type || !from) {
            return res.status(400).json({ success: false, message: "Missing required search parameters" });
        }

        let rawResults = [];

        // Fetch all active vehicles (needed for mapping)
        const activeVehicles = await CarVehicle.find({ status: CAR_STATUS.ACTIVE });

        // --- CASE A: HOURLY RENTAL ---
        if (type === TRANSFER_TYPE.HOURLY) {
            const hours = parseInt(duration) || 4;

            rawResults = activeVehicles.map(vehicle => ({
                vehicle: vehicle,
                price: vehicle.hourlyRate * hours,
            }));
        }

        // --- CASE B: ONE WAY / FIXED ROUTE TRANSFER ---
        else {
            if (!to) return res.status(400).json({ success: false, message: "Destination is required for transfer" });

            // Fuzzy Search for Route
            const route = await CarRoute.findOne({
                origin: { $regex: new RegExp(from, 'i') },
                destination: { $regex: new RegExp(to, 'i') },
                isActive: true
            }).populate('prices.vehicle');

            if (!route) {
                return res.status(404).json({
                    success: false,
                    message: `No route found from ${from} to ${to}. Please contact us for a custom quote.`
                });
            }

            // Map Route Prices to Results
            rawResults = route.prices.map(priceItem => {
                if (!priceItem.vehicle || priceItem.vehicle.status !== CAR_STATUS.ACTIVE) return null;
                return {
                    vehicle: priceItem.vehicle,
                    price: priceItem.price
                };
            }).filter(item => item !== null);
        }

        // 2. TRANSFORM DATA TO MATCH FRONTEND "CAR_OPTIONS" STRUCTURE
        const formattedResults = rawResults.map(item => {
            const v = item.vehicle;
            return {
                id: v._id,
                name: v.name,               // e.g. "Sedan"
                type: v.category || v.type, // e.g. "Standard", "Spacious" (See Model Update)
                capacity: {
                    passengers: v.maxPassengers,
                    luggage: v.maxLuggage
                },
                image: v.image,
                description: v.description,
                price: item.price,
                ppPrice: Math.round(item.price / v.maxPassengers), // Calculate Price Per Person
                currency: '$' // Default currency
            };
        });

        return res.status(200).json({ success: true, count: formattedResults.length, data: formattedResults });

    } catch (error) {
        console.error("Search Car Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
/**
 * Get details of a specific vehicle (Optional, for modal/popup)
 */
export const getVehicleDetail = async (req, res) => {
    try {
        const vehicle = await CarVehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });
        return res.status(200).json({ success: true, data: vehicle });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


// ==========================================
// ADMIN APIs (VEHICLES)
// ==========================================

export const createVehicle = async (req, res) => {
    try {
        const newVehicle = new CarVehicle(req.body);
        await newVehicle.save();
        res.status(201).json({ success: true, message: "Vehicle created", data: newVehicle });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateVehicle = async (req, res) => {
    try {
        const updatedVehicle = await CarVehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, message: "Vehicle updated", data: updatedVehicle });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteVehicle = async (req, res) => {
    try {
        // Soft delete (set status to Inactive) or Hard delete
        await CarVehicle.findByIdAndUpdate(req.params.id, { status: CAR_STATUS.INACTIVE });
        res.status(200).json({ success: true, message: "Vehicle deactivated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await CarVehicle.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: vehicles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// ADMIN APIs (ROUTES)
// ==========================================

export const createRoute = async (req, res) => {
    try {
        const { origin, destination, prices } = req.body;

        // Check duplicate
        const exists = await CarRoute.findOne({ origin, destination });
        if(exists) return res.status(400).json({ success: false, message: "Route already exists" });

        const newRoute = new CarRoute(req.body);
        await newRoute.save();
        res.status(201).json({ success: true, message: "Route created", data: newRoute });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateRoute = async (req, res) => {
    try {
        const updatedRoute = await CarRoute.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, message: "Route updated", data: updatedRoute });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllRoutes = async (req, res) => {
    try {
        const routes = await CarRoute.find()
            .populate('prices.vehicle', 'name type') // Populate vehicle name for display
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: routes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * [ADMIN] Get details of a specific route by ID
 */
export const getRouteDetail = async (req, res) => {
    try {
        const route = await CarRoute.findById(req.params.id)
            .populate('prices.vehicle'); // Important: Populate vehicle details to show in the config table

        if (!route) {
            return res.status(404).json({ success: false, message: "Route not found" });
        }

        res.status(200).json({ success: true, data: route });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const deleteRoute = async (req, res) => {
    try {
        await CarRoute.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Route deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};