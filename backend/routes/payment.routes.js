import express from "express";
import {
    createPaymentUrl,   // Hàm generic đã refactor ở bước trước
    getPaymentStatus,
    onepayReturn,
    onepayIPN,
    queryOnePayDR
} from "../controller/payment/payment.controller.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

// Tạo URL thanh toán (Generic cho Hotel, Bus, Tour) — yêu cầu đăng nhập
// URL: /api/payment/create-url/:id
router.post("/create-url/:id", verifyToken, createPaymentUrl);

// Lấy trạng thái thanh toán
// URL: /api/payment/status/:id
router.get("/status/:id", getPaymentStatus);

router.get("/onepay/return", onepayReturn);

// OnePay gọi ngầm (IPN)
router.get("/onepay/ipn", onepayIPN);

// --- ADMIN/SYSTEM APIS ---
// Truy vấn giao dịch chủ động
router.post("/onepay/query-dr", queryOnePayDR);

export default router;
