import express from "express";
import {
    createBoardingPoint,
    updateBoardingPoint,
    deleteBoardingPoint,
    getAllBoardingPoints
} from "../../controller/services/boarding.controller.js";
import { verifyAdmin } from "../../utils/verifyToken.js";

const router = express.Router();

router.get("/", getAllBoardingPoints); // Public hoặc Admin tùy nhu cầu
router.post("/", verifyAdmin, createBoardingPoint);
router.put("/:id", verifyAdmin, updateBoardingPoint);
router.delete("/:id", verifyAdmin, deleteBoardingPoint);

export default router;
