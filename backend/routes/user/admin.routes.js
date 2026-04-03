import express from "express";
import {
    createAdmin,
    loginAdmin,
    getAdmin,
    getAllAdmin,
    deleteAdmin,
    updateAdmin,
    logoutAdmin,
    toggleMaintenance,
    getSmtpConfig,
    saveSmtpConfig,
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon, toggleCouponStatus, updateModules, updateProcessingFee, togglePaymentOptionsStatus
} from "../../controller/user/admin.controller.js";
import { verifyAdmin } from "../../utils/verifyToken.js";
const router = express.Router();

router.put('/maintenance', verifyAdmin, toggleMaintenance);
router.get("/smtp-config", verifyAdmin, getSmtpConfig);
router.put("/smtp-config", verifyAdmin, saveSmtpConfig);
router.put("/modules-header", verifyAdmin, updateModules);
router.put("/setting/payment", verifyAdmin, togglePaymentOptionsStatus);
router.put("/settings/fee", verifyAdmin, updateProcessingFee);


router.post("",createAdmin );
router.post("/login",loginAdmin);
router.post("/logout", logoutAdmin);
router.get("",verifyAdmin,getAdmin)
router.get("/all",verifyAdmin,getAllAdmin)
router.delete("/:id",verifyAdmin,deleteAdmin)
router.put("/:id",verifyAdmin,updateAdmin)

router.post("/coupons", verifyAdmin, createCoupon);           // Tạo mới
router.get("/coupons", verifyAdmin, getAllCoupons);           // Lấy danh sách
router.get("/coupons/:id", verifyAdmin, getCouponById);       // Lấy chi tiết 1 cái
router.put("/coupons/:id", verifyAdmin, updateCoupon);        // Cập nhật thông tin
router.delete("/coupons/:id", verifyAdmin, deleteCoupon);     // Xóa
router.patch("/coupons/:id/toggle", verifyAdmin, toggleCouponStatus); // Bật/Tắt nhanh
export default router;