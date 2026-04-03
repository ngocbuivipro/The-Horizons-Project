// import express from "express";
// import { verifyAdmin } from "../../Utils/verifyToken.js";
// import { getAllBoardingPoint, createPoint, updatePoint, deletePoint,getAllArrivalPoint, createBus, getAllBus, deleteBus, updateBus } from "../../controller/services/bus.controller.js";
// import { create } from "../../constants/bus.routes.js";
// const router = express.Router();
// router.get("/Admin/boarding-points",getAllBoardingPoint);
// router.get("/Admin/arrival-points", getAllArrivalPoint);
// router.get("/Admin/buses", getAllBus);
// router.post("/Admin/create-point", verifyAdmin, createPoint);
// router.post("/Admin/createBus", verifyAdmin, create, createBus);
// router.patch("/Admin/point/:id", verifyAdmin, updatePoint);
// router.delete("/Admin/point/:id", verifyAdmin, deletePoint);
// router.delete("/Admin/buses/:id", verifyAdmin, deleteBus);
// router.patch("/Admin/update-bus/:id", verifyAdmin, create, updateBus)
//
//
// export default router;

import express from "express";
import {
    createBus,
    updateBus,
    deleteBus,
    getBusDetail,
    searchBus,
    getAdminBuses, toggleBusStatus, getBusTypes
} from "../../controller/services/bus.controller.js";
import {verifyAdmin} from "../../utils/verifyToken.js";
import {calculateBookingBusPrice} from "../../controller/services/booking.controller.js";

const router = express.Router();

// --- PUBLIC ROUTES (User) ---
router.get("/search", searchBus);          // Tìm kiếm xe (có filter ngày, nơi đi/đến)
router.get("/types", getBusTypes);
router.get("/detail/:id", getBusDetail);   // Xem chi tiết xe
router.post("/calc-price-bus", calculateBookingBusPrice);

// router.get("/seats/:id", getBusSeatLayout); // Lấy sơ đồ ghế để đặt vé

// --- ADMIN ROUTES (Protected) ---
router.get("/admin", verifyAdmin, getAdminBuses); // Lấy danh sách cho bảng Admin
router.post("/", verifyAdmin, createBus);
router.put("/:id", verifyAdmin, updateBus);
router.delete("/:id", verifyAdmin, deleteBus);
router.patch("/:id/toggle", verifyAdmin, toggleBusStatus);

export default router;
