import express from 'express';
import {
    searchCars,
    getVehicleDetail,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getAllVehicles,
    createRoute,
    updateRoute,
    getAllRoutes,
    deleteRoute, getRouteDetail
} from "../../controller/services/car.controller.js";
import {verifyAdmin} from "../../utils/verifyToken.js";
import {calculateBookingCarPrice} from "../../controller/services/booking.controller.js";

const router = express.Router();

// --- PUBLIC ROUTES (Specific paths must come first) ---
router.get('/search', searchCars);
router.post('/calc-price-car', calculateBookingCarPrice);

// --- ADMIN ROUTES (ROUTES) ---
// Defined before /:id to prevent "routes" being treated as an ID
router.post('/route', verifyAdmin, createRoute);
router.get('/route/:id', getRouteDetail);
router.put('/route/:id', verifyAdmin, updateRoute);
router.delete('/route/:id',  verifyAdmin, deleteRoute);
router.get('/routes', getAllRoutes); // Moved up. Verify if this needs verifyAdmin based on your public usage requirements.

// --- ADMIN ROUTES (VEHICLES) ---
router.post('/', verifyAdmin, createVehicle);
router.put('/:id', verifyAdmin, updateVehicle);
router.delete('/:id', verifyAdmin, deleteVehicle);
router.get('/',  verifyAdmin, getAllVehicles);

// --- DYNAMIC PUBLIC ROUTES (Wildcards come last) ---
router.get('/:id', getVehicleDetail);

export default router;