

// Lấy tất cả services
import ServiceHotel from "../../models/hotel/ServiceHotel.js";

export const getAllServices = async (req, res) => {
    try {
        const service = await ServiceHotel.find({});
        return res.json({
            success: true,
            data: service
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "Error in getting services"
        });
    }
};

// Tạo service mới
export const createService = async (req, res) => {
    try {
        const { name, icon } = req.body;

        if (!name) return res.json({ success: false, message: "Name must not be empty" });
        // if (!icon) return res.json({ success: false, message: "Icon must not be empty" });

        const serviceName = name.trim();

        // Kiểm tra trùng tên (không phân biệt hoa thường)
        const exist = await ServiceHotel.findOne({
            name: { $regex: `^${serviceName}$`, $options: 'i' }
        });

        if (exist) {
            return res.json({ success: false, message: "Existed service" });
        }

        const ser = new ServiceHotel(req.body);
        await ser.save();

        return res.json({
            success: true,
            data: ser
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "Error in BE"
        });
    }
};

// Xóa service
export const deleteService = async (req, res) => {
    try {
        await ServiceHotel.deleteOne({ _id: req.params.id });
        return res.json({
            success: true,
            message: "Deleted successfully!"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in BE"
        });
    }
};

// Cập nhật service
export const updateService = async (req, res) => {
    try {
        // Nếu có cập nhật tên, cần kiểm tra trùng lặp
        if (req.body.name) {
            const serviceName = req.body.name.trim();

            // Tìm xem có thằng nào KHÁC id hiện tại mà trùng tên không
            const exist = await ServiceHotel.findOne({
                name: { $regex: `^${serviceName}$`, $options: 'i' },
                _id: { $ne: req.params.id } // Loại trừ chính nó ra
            });

            if (exist) {
                return res.json({ success: false, message: "Existed service!" });
            }
        }

        const updatedSer = await ServiceHotel.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!updatedSer) {
            return res.json({ success: false, message: "No service found" });
        }

        return res.json({
            success: true,
            message: "Update service succesfully",
            data: updatedSer
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in BE"
        });
    }
};