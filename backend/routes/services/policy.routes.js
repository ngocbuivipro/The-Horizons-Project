import express from "express";
import {
    createPolicy,
    deletePolicy,
    getPolicies,
    updatePolicy
} from "../../controller/services/policy.controller.js";
import {verifyAdmin} from "../../utils/verifyToken.js";

const router = express.Router();

router.get("", getPolicies);
router.post("", verifyAdmin,createPolicy);
router.delete("/policy/:id", verifyAdmin,deletePolicy);
router.patch('/policy/:id', verifyAdmin,updatePolicy);

export default router;
