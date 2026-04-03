// controllers/globalSearch.controller.js
import Hotel from "../../models/hotel/Hotel.js";
import Tour from "../../models/tour/Tour.js";
import Bus from "../../models/bus/Bus.js";

export const searchGlobal = async (req, res, next) => {
    try {
        const { keyword, startDate, guests } = req.query;

        if (!keyword) {
            return res.status(400).json({ success: false, message: "Keyword is required" });
        }

        const regex = new RegExp(keyword, "i");
        const LIMIT_ITEMS = 7; // Yêu cầu: tối đa 7 items

        // 1. Cấu hình Query cho Bus
        const busQuery = {
            isActive: true,
            $or: [
                { cityFrom: regex },
                { cityTo: regex },
                { operator: regex } // Đổi từ poName -> operator dựa trên JSON bạn gửi
            ]
        };

        // Logic lọc ngày cho Bus (nếu có)
        if (startDate) {
            const start = new Date(startDate);
            const end = new Date(startDate);
            end.setDate(end.getDate() + 1); // +1 ngày để lấy trọn vẹn 24h

            busQuery.departureTime = {
                $gte: start,
                $lt: end
            };
        }

        // 2. Thực hiện Query song song
        const [hotels, tours, buses] = await Promise.all([
            // --- HOTEL ---
            Hotel.find({
                isVisible: true,
                $or: [{ city: regex }, { name: regex }]
            })
                .select("name city address cheapestPrice images stars slug")
                .limit(LIMIT_ITEMS)
                .lean(),

            // --- TOUR ---
            Tour.find({
                isVisible: true,
                $or: [{ city: regex }, { name: regex }]
            })
                .select("name city price duration images slug")
                .limit(LIMIT_ITEMS)
                .lean(),

            // --- BUS ---
            // Chọn các trường khớp với JSON mẫu bạn cung cấp
            Bus.find(busQuery)
                .select("operator cityFrom cityTo departureTime arrivalTime price busType photos")
                .limit(LIMIT_ITEMS)
                .lean()
        ]);

        // 3. Trả về kết quả
        res.status(200).json({
            success: true,
            results: {
                hotels: hotels,
                tours: tours,
                buses: buses
            }
        });

    } catch (err) {
        next(err);
    }
};
