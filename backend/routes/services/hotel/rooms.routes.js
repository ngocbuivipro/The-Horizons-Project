import express from "express";
import { createRoom, deleteRoom, getAllRooms, getRoomDetail, updateRoom, migrateSlugs } from "../../../controller/services/room.controller.js";
import {verifyAdmin} from "../../../utils/verifyToken.js";

const router = express.Router();


router.get("", getAllRooms);

router.get("/:slug", getRoomDetail)

router.post("",verifyAdmin ,createRoom);

router.post("/migrate-slugs", migrateSlugs);

router.patch("/room/:id",verifyAdmin,updateRoom)

router.delete("/room/:id/:hotelId",verifyAdmin ,deleteRoom)

export default router;
