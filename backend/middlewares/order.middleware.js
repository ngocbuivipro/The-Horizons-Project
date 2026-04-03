import mongoose from 'mongoose';

export const validateBookingBody = (req, res, next) => {
    const { guests, checkIn, checkOut, roomType, totalPriceVND } = req.body;
    const errors = [];

    // 1. Check required
    if (!guests || !checkIn || !checkOut || !roomType) {
        errors.push("Lack of necessary information. Check guests, checkIn, checkOut, roomType,");
    }

    // 2. Check ObjectId
    if (roomType && !mongoose.Types.ObjectId.isValid(roomType)) {
        errors.push("ID is not correct.");
    }

    // 3. Check Date Logic
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (ci < today) errors.push("Check-in day not valid, must be not in the past.");
    if (co <= ci) errors.push("Checkout day not valid, must be after check-in.");

    // 4. Check Number
    if (typeof guests !== 'number' || guests < 1) errors.push("The number of guests is not valid.");

    // Nếu có lỗi thì return luôn
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Data is not valid",
            errors: errors
        });
    }

    next();
};