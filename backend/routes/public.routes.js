import express from "express";
import SystemSetting from "../models/settings/SystemSetting.js";
import {getSystemStatus} from "../controller/user/admin.controller.js";

const router = express.Router();

// GET /api/public/status
// This route is always available, even in maintenance mode.
router.get('/status', getSystemStatus);

export default router;