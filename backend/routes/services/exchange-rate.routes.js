import {Router} from "express";
import {
    getAllExchangeRate,
    updateBulkExchangeRates,
    updateExchangeRate
} from "../../controller/services/exchange-rate.controller.js";


const router = Router()

router.get("/", getAllExchangeRate)
router.put("/", updateBulkExchangeRates)

export default router;