import Policy from "../../models/Policy.js";

// Lấy danh sách Policy
export const getPolicies = async (req, res) => {
    try {
        // Lấy tham số type từ URL (?type=...)
        const { type } = req.query;

        const filter = type ? { type: type } : {};

        const data = await Policy.find(filter);

        return res.status(200).json({
            success: true,
            data: data // Trả về mảng danh sách policy
        });
    } catch (e) {
        console.error("Get Policy Error:", e);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Tạo mới Policy
export const createPolicy = async (req, res) => {
    try {
        const { name, type, icon } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }
        if (!type) {
            return res.status(400).json({ success: false, message: "Type is required" });
        }

        const policyName = name.trim();

        // Kiểm tra trùng lặp (Case insensitive)
        const exist = await Policy.findOne({
            name: { $regex: new RegExp(`^${policyName}$`, "i") },
            type: type,
        });

        if (exist) {
            return res.status(400).json({ success: false, message: "Policy already exists!" });
        }

        // Tạo mới
        const newPolicy = new Policy({
            name: policyName,
            type,
            icon: icon || "",
        });

        await newPolicy.save();

        return res.status(200).json({
            success: true,
            data: newPolicy,
        });

    } catch (e) {
        console.error("Create Policy Error:", e);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// Xóa Policy
export const deletePolicy = async (req, res) => {
    try {
        await Policy.deleteOne({ _id: req.params.id });
        res.json({
            success: true,
            message: "Deleted successfully!"
        });
    } catch (error) {
        console.error("Delete Policy Error:", error);
        return res.json({
            success: false,
            message: "Internal Server Error in Policy"
        });
    }
};

// Cập nhật Policy
export const updatePolicy = async (req, res) => {
    try {
        // Nếu có đổi tên, kiểm tra trùng lặp
        if (req.body.name) {
            const serviceName = req.body.name.trim();
            const exist = await Policy.findOne({
                name: { $regex: `^${serviceName}$`, $options: 'i' },
                type: req.body.typePolicy || req.body.type // Fallback nếu FE gửi thiếu typePolicy
            });

            // Nếu tìm thấy policy trùng tên VÀ không phải chính nó
            if (exist && exist._id.toString() !== req.params.id) {
                return res.json({ success: false, message: "Existed policy!" });
            }
        }

        const updatedPolicy = await Policy.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });

        if (!updatedPolicy) {
            return res.json({ success: false, message: "No policy found" });
        }

        return res.json({ success: true, message: "Update policy successfully", data: updatedPolicy });
    } catch (error) {
        console.error("Update Policy Error:", error);
        return res.json({ success: false, message: "Internal Server Error in Policy" });
    }
};