// models/payment/Coupon.js
import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true, // Tự động viết hoa (ví dụ: ord -> ORD)
        trim: true
    },
    description: String, // Ví dụ: "Giảm giá mùa hè", "Mã khách hàng thân thiết"

    // QUAN TRỌNG: Để xử lý yêu cầu "ORDxxxx" hay "LTTxxxx"
    matchType: {
        type: String,
        enum: ["EXACT"],
        default: "EXACT"
        // "EXACT": Khách phải nhập đúng y chang (ví dụ: SALE50)
        // "PREFIX": Khách nhập bắt đầu bằng code này là được (ví dụ: code="ORD" thì nhập ORD123 vẫn ăn)
    },

    discountType: {
        type: String,
        enum: ["PERCENT", "FIXED"], // Giảm theo % hoặc giảm tiền mặt
        default: "PERCENT",
        required: true
    },

    discountValue: {
        type: Number,
        required: true, // Ví dụ: 10 (là 10% hoặc 10k tùy type)
        min: 0
    },

    maxDiscountAmount: {
        type: Number,
        // Dùng để chặn max giảm giá. Ví dụ giảm 10% nhưng tối đa chỉ giảm 500k.
    },

    minOrderValue: {
        type: Number,
        default: 0 // Đơn hàng tối thiểu để áp dụng mã
    },

    startDate: Date,
    endDate: Date,

    usageLimit: { type: Number, default: 0 }, // 0 là không giới hạn số lần dùng
    usedCount: { type: Number, default: 0 },  // Đếm số lần đã dùng

    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model("Coupon", CouponSchema);