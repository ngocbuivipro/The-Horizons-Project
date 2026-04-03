import mongoose from "mongoose";

import {
    PAYMENT_GATEWAYS, PAYMENT_STATUS,
    CURRENCY_TYPES
} from "../../constants/booking.constant.js";

const PaymentSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
        unique: true,
    },
    gateway: {
        type: String,
        enum: Object.values(PAYMENT_GATEWAYS),
        required: true,
    },

    // OnePay / Gateway specific fields
    merchTxnRef: {type: String, unique: true, sparse: true}, // sparse: true để tránh lỗi duplicate null
    transactionNo: String,

    amount: {type: Number, required: true}, // Số tiền thực tế thanh toán (VND)
    currency: {
        type: String,
        default: CURRENCY_TYPES.VND
    },

    status: {
        type: String,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.UNPAID,
    },

    rawResponse: {type: mongoose.Schema.Types.Mixed},
    paidAt: Date,
    refundedAt: Date,
}, {timestamps: true});

export default mongoose.model("Payment", PaymentSchema);
