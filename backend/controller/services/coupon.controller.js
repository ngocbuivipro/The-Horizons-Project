import Coupon from "../../models/settings/Coupon.js";


export const applyCouponLogic = async (inputCode, totalOrderValue) => {
    if (!inputCode) return { discountAmount: 0, finalPrice: totalOrderValue };

    const upperCode = inputCode.toUpperCase();
    const coupons = await Coupon.find({ isActive: true });

    let matchedCoupon = null;

    for (const coupon of coupons) {
        const now = new Date();
        if (coupon.startDate && now < new Date(coupon.startDate)) continue;
        if (coupon.endDate && now > new Date(coupon.endDate)) continue;

        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) continue;

        // Match coupon code based on type
        if (coupon.matchType === 'EXACT' && coupon.code === upperCode) {
            matchedCoupon = coupon;
            break;
        }
        if (coupon.matchType === 'PREFIX' && upperCode.startsWith(coupon.code)) {
            matchedCoupon = coupon;
            break;
        }
    }

    if (!matchedCoupon) {
        throw new Error("Invalid or expired coupon code");
    }

    if (totalOrderValue < matchedCoupon.minOrderValue) {
        throw new Error(`Order value must be at least ${matchedCoupon.minOrderValue}`);
    }

    // Calculate discount
    let discount = 0;
    if (matchedCoupon.discountType === "PERCENT") {
        discount = (totalOrderValue * matchedCoupon.discountValue) / 100;

        if (matchedCoupon.maxDiscountAmount && discount > matchedCoupon.maxDiscountAmount) {
            discount = matchedCoupon.maxDiscountAmount;
        }
    } else if (matchedCoupon.discountType === "FIXED") {
        discount = matchedCoupon.discountValue;
    }

    if (discount > totalOrderValue) {
        discount = totalOrderValue;
    }

    return {
        couponId: matchedCoupon._id,
        discountAmount: Math.round(discount),
        finalPrice: totalOrderValue - Math.round(discount)
    };
};