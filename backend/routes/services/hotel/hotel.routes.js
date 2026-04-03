import express from "express";
import {
    createHotel,
    deleteHotel,
    deleteAllHotels,
    getAllHotels,
    getHotel,
    getHotelDetail,
    updateHotel,
    toggleVisibilityHotel,
    getAdminHotels,
    getAllHotelNames, getRecommendedHotels
} from "../../../controller/services/hotel.controller.js";
import {verifyAdmin} from "../../../utils/verifyToken.js";

const router = express.Router();


router.patch("/:id/visibility", verifyAdmin, toggleVisibilityHotel);

router.get("/admin/all", verifyAdmin, getAdminHotels); // API riêng cho Dashboard

router.get("/names", getAllHotelNames)

router.post("",verifyAdmin, createHotel);

router.get("", getAllHotels);

router.delete("/hotel/:id",verifyAdmin, deleteHotel);

router.delete("/all", verifyAdmin,deleteAllHotels);

router.patch("/hotel",verifyAdmin, updateHotel);

router.get("/recommended", getRecommendedHotels);

/**
 * @swagger
 * /backend/hotels/find/{id}:
 *   get:
 *     summary: Get a Hotel by ID
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID to retrieve
 *     responses:
 *       200:
 *         description: Hotel details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Grand Hotel"
 *                 type:
 *                   type: string
 *                   example: "Luxury"
 *                 address:
 *                   type: string
 *                   example: "123 Luxury Lane, Paradise City"
 *                 distance:
 *                   type: string
 *                   example: "5 km"
 *                 photos:
 *                   type: string
 *                   example: "https://example.com/photo.jpg"
 *                 title:
 *                   type: string
 *                   example: "Ha Giang Hotel"
 *                 description:
 *                   type: string
 *                   example: "A luxurious Hotel with all amenities."
 *                 rating:
 *                   type: number
 *                   format: float
 *                   example: 4.5
 *                 rooms:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Deluxe Room", "Suite", "Standard Room"]
 *                 cheapestPrice:
 *                   type: number
 *                   example: 150
 *                 feature:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Hotel not found
 */
router.get("/find/:id", getHotel);

router.get("/:slug", getHotelDetail);


/**
 * @swagger
 * /backend/hotels/countByCity:
 *   get:
 *     summary: Get the count of hotels by city
 *     tags: [Hotels]
 *     responses:
 *       200:
 *         description: Hotel count by city
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: integer
 *                 example: 5
 */
// router.get("/count-by-city", countByCity);

/**
 * @swagger
 * /backend/hotels/countByType:
 *   get:
 *     summary: Get the count of hotels by type
 *     tags: [Hotels]
 *     responses:
 *       200:
 *         description: Hotel count by type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: integer
 *                 example: 3
 */
// router.get("/count-by-type", countByType);

export default router;
