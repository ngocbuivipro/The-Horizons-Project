import express from "express";
import { getAbout, updateAbout } from "../../controller/page/about.controller.js";
import { verifyAdmin } from "../../utils/verifyToken.js";

const router = express.Router();

// @route   GET /api/page/about
// @desc    Get "About Us" content
// @access  Public
router.get("/about", getAbout);

// @route   PUT /api/page/about
// @desc    Update "About Us" content
// @access  Admin
router.put("/about", verifyAdmin, updateAbout);

export default router;