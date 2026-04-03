import express from "express";
import {
    createBooking,
    getBooking,
    updateBooking,
    getByEmail,
    getAllBooking,
    updateStatus,
    calculateBookingAccommodationPrice, createOrder,
    cleanupInvalidBookings, softDeleteBooking, hardDeleteBooking
} from "../controller/services/booking.controller.js"
import { validateBookingBody } from "../middlewares/order.middleware.js";
import { verifyAdmin, verifyToken } from "../utils/verifyToken.js";

const router = express.Router();
// Yêu cầu đăng nhập mới được tạo booking
router.post("", verifyToken, createBooking);
router.post("/order", validateBookingBody, createOrder);
router.post("/calculate", calculateBookingAccommodationPrice);
router.patch("/soft-delete/:id", verifyAdmin, softDeleteBooking);

// Route Hard Delete
router.delete("/hard-delete/:id", verifyAdmin, hardDeleteBooking);
router.get("/:id", getBooking);
router.get("/by-email/:email", getByEmail);
router.get("", verifyAdmin, getAllBooking);

router.patch("/:id", updateBooking);
router.patch("/update-status/:id", updateStatus);
// Route Soft Delete

router.delete("/cleanup-invalid", cleanupInvalidBookings); // <-- ROUTE MỚI ĐỂ DỌN DẸP


export default router;