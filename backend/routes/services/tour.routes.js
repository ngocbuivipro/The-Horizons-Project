import express from "express";
import {
    createTour,
    updateTour,
    deleteTour,
    getTourDetail,
    getAllTours,
    getAdminTours,
    toggleTourVisibility
} from "../../controller/services/tour.controller.js";
import { verifyAdmin } from "../../utils/verifyToken.js";
import {calculateBookingTourPrice} from "../../controller/services/booking.controller.js";

const router = express.Router();

// CREATE - Tạo Tour mới (Admin only)
router.post("/", verifyAdmin, createTour);

// UPDATE - Cập nhật Tour theo ID (Admin only)
router.put("/:id", verifyAdmin, updateTour);

// TOGGLE VISIBILITY - Ẩn/Hiện Tour (Admin only)
router.patch("/:id/toggle", verifyAdmin, toggleTourVisibility);

// DELETE - Xóa Tour theo ID (Admin only)
router.delete("/:id", verifyAdmin, deleteTour);

// GET ADMIN ALL - Lấy danh sách Tour cho Admin (bao gồm ẩn)
router.get("/admin/all", verifyAdmin, getAdminTours);

// GET ALL - Lấy danh sách Tour (Public, có filter/search qua query params)
router.get("/", getAllTours);

// GET DETAIL - Lấy chi tiết Tour theo Slug (Public)
router.get("/:slug", getTourDetail);

router.post('/calculate-tour', calculateBookingTourPrice);


export default router;