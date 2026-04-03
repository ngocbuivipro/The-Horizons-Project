import express from "express";
import {createContact} from "../../controller/page/contact.controller.js";

const router = express.Router();



// @route   PUT /api/page/about
// @desc    Update "About Us" content
// @access  Admin
router.post("/",  createContact);

export default router;