import express from "express";
import {
    createService,
    deleteService,
    getAllServices,
    updateService
} from "../../../controller/services/service-hotel.controller.js";

const router = express.Router();

router.get("/", getAllServices);
router.post("/", createService);
router.delete("/:id", deleteService);
router.patch("/:id", updateService);

export default router;