import ExchangeRate from "../../models/payment/ExchangeRate.js";

// get all the rate for client and Admin dashboard
export const getAllExchangeRate = async (req, res) => {
    try {
        // Sử dụng Aggregation để lấy bản ghi MỚI NHẤT của từng cặp tiền
        const rates = await ExchangeRate.aggregate([
            // 1. Chỉ lấy các record đổi sang VND
            { $match: { to: "VND" } },

            // 2. Sắp xếp theo thời gian tạo mới nhất lên đầu
            { $sort: { createdAt: -1 } },

            // 3. Gom nhóm theo tiền tệ gốc (field "from")
            {
                $group: {
                    _id: "$from", // Group by EUR, USD...
                    latestDoc: { $first: "$$ROOT" } // Lấy document đầu tiên (là cái mới nhất nhờ bước sort)
                }
            },

            // 4. format cấu trúc document trả về
            { $replaceRoot: { newRoot: "$latestDoc" } }
        ]);

        // Biến đổi data sang dạng Key-Value cho Frontend dễ dùng
        // { USD: 24500, EUR: 27000 }
        const formattedRates = {};
        rates.forEach(doc => {
            formattedRates[doc.from] = doc.rate;
        });

        res.status(200).json({
            success: true,
            data: formattedRates, // Dùng để tra cứu nhanh: rates['EUR']
            list: rates           // Dùng để map danh sách (nếu cần), giờ nó rất gọn
        });

    } catch (e) {
        console.error(e);
        // Lưu ý: Nên trả về status code lỗi thay vì throw error làm crash app nếu không có global handler
        res.status(500).json({
            success: false,
            message: "Cannot get exchange rates",
            error: e.message
        });
    }
}


export const updateExchangeRate = async (req, res, next) => {
    try {
        // Giả sử request body gửi lên: { currency: "EUR", rate: 30500 }
        const { from, rate } = req.body;
        const toCurrency = "VND"; // Mặc định

        // Tìm tất cả bản ghi của cặp tiền này (VD: EUR -> VND) và xóa hết
        await ExchangeRate.deleteMany({ from: from, to: toCurrency });

        const newExchangeRate = await ExchangeRate.create({
            from: from,
            to: toCurrency,
            rate: rate,
            source: "manual", // Hoặc "api" tùy nguồn
            // updatedBy: req.user._id // Nếu có auth
        });

        res.status(200).json({
            success: true,
            message: `Đã cập nhật tỷ giá ${from}. Các bản ghi cũ đã được xóa.`,
            data: newExchangeRate
        });

    } catch (err) {
        next(err);
    }
};

export const updateBulkExchangeRates = async (req, res, next) =>{
    try{
        const {rates} = req.body;

        if(!rates || !Array.isArray(rates) || rates.length === 0){
            return res.status(400).json({
                success: false,
                message: "Invalid exchange rates data"
            })
        }

        // using promise all to handle parallel improving performance
        await Promise.all(rates.map(async (item) =>{
            if (item.currency && item.rate){
                await ExchangeRate.deleteMany({from: item.currency, to: "VND"})
                await ExchangeRate.create({
                    from: item.currency,
                    to: "VND",
                    rate: item.rate,
                    source: "manual",
                    updateBy: req.user?.id
                })
            }
        }));
        res.status(200).json({
            success: true,
            message: "Exchange rates updated successfully"
        })
    }catch (err){
        next(err);
    }
}