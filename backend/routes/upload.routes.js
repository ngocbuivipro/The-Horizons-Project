import express from "express";
import cloudinary from "cloudinary";
import {uploadByFiles, uploadByLink} from "../controller/services/upload.controller.js";
import upload from "../middlewares/multer.middleware.js";


const router = express.Router();
router.post("/upload-by-link", uploadByLink);

// Route 2: Upload by Files (Multer needed)
router.post(
    "/upload-by-files",
    upload.array('photos', 10),
    uploadByFiles
);
export default router;