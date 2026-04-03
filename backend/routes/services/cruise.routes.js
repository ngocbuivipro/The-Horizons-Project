import express from "express";
import {
    createCruise,
    updateCruise,
    deleteCruise,
    getCruiseDetail,
    searchCruise,
    createCabin,
    updateCabin,
    deleteCabin,
    getAdminCruises, getCruiseTypes, getCabinTemplates
} from "../../controller/services/cruise.controller.js";
import {verifyAdmin} from "../../utils/verifyToken.js";
import {calculateBookingCruisePrice} from "../../controller/services/booking.controller.js";

const router = express.Router();


router.get("/search", searchCruise);
router.get("/types", getCruiseTypes);

// --- ADMIN ROUTES ---
router.get("/admin", verifyAdmin, getAdminCruises);
router.get("/cabin/admin", verifyAdmin, getCabinTemplates);

router.post("/", verifyAdmin, createCruise);
router.put("/:id", verifyAdmin, updateCruise);
router.delete("/:id", verifyAdmin, deleteCruise);

router.post("/cabin", verifyAdmin, createCabin);
router.put("/cabin/:id", verifyAdmin, updateCabin);
router.delete("/cabin/:id", verifyAdmin, deleteCabin);

// ❗ LUÔN ĐỂ ROUTE DYNAMIC CUỐI CÙNG
router.get("/detail/:slug", getCruiseDetail);

router.post("/calc-price-cruise", calculateBookingCruisePrice);


export default router;
