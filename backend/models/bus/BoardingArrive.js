import mongoose from "mongoose";

const BoardingArriveSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true,
        trim: true, // Xóa khoảng trắng thừa " Ha Noi " -> "Ha Noi"
        index: true // Đánh index để tìm kiếm theo thành phố nhanh hơn
    },
    name: {
        type: String,
        required: true,
        trim: true // VD: "Bến xe Miền Đông"
    },
    address: {
        type: String,
        required: true,
        trim: true // VD: "292 Đinh Bộ Lĩnh..."
    },
    type: {
        type: String,
        enum: ["BOARDING", "DROPPING", "BOTH"],
        default: "BOTH"
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Index kép: Tìm bến xe theo tên trong 1 thành phố phải là duy nhất (tránh trùng lặp)
BoardingArriveSchema.index({ city: 1, name: 1 }, { unique: true });

export default mongoose.model("BoardingArrive", BoardingArriveSchema, "boarding_arrive");