import Coupon from "../models/settings/Coupon.js";

/**
 * Tính toán giảm giá dựa trên mã coupon và tổng giá trị đơn hàng
 * @param {string} couponCode - Mã khách nhập
 * @param {number} totalOrderValue - Tổng tiền đơn hàng (VND)
 * @returns {Promise<object>} - { discountAmount, finalPrice, couponId, code }
 */
export const applyCouponLogic = async (couponCode, totalOrderValue) => {
    // 1. Nếu không có mã, trả về nguyên giá
    if (!couponCode) {
        return {
            discountAmount: 0,
            finalPrice: totalOrderValue,
            couponId: null,
            code: null
        };
    }

    const upperCode = couponCode.toUpperCase().trim();
    const now = new Date();

    // 2. Tìm tất cả coupon đang active để check logic (bao gồm Prefix)
    const activeCoupons = await Coupon.find({ isActive: true });

    let matchedCoupon = null;

    for (const coupon of activeCoupons) {
        // Check ngày hiệu lực
        if (coupon.startDate && now < new Date(coupon.startDate)) continue;
        if (coupon.endDate && now > new Date(coupon.endDate)) continue;

        // Check số lượng giới hạn
        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) continue;

        // CHECK KHỚP MÃ
        if (coupon.matchType === 'EXACT') {
            if (coupon.code === upperCode) {
                matchedCoupon = coupon; break;
            }
        } else if (coupon.matchType === 'PREFIX') {
            if (upperCode.startsWith(coupon.code)) {
                matchedCoupon = coupon; break;
            }
        }
    }

    if (!matchedCoupon) {
        throw new Error(`Mã giảm giá '${couponCode}' không hợp lệ hoặc đã hết hạn.`);
    }

    // 3. Check giá trị tối thiểu
    if (totalOrderValue < matchedCoupon.minOrderValue) {
        throw new Error(`Đơn hàng chưa đạt giá trị tối thiểu ${matchedCoupon.minOrderValue.toLocaleString()}đ để dùng mã này.`);
    }

    // 4. Tính toán tiền giảm
    let discount = 0;
    if (matchedCoupon.discountType === "PERCENT") {
        discount = (totalOrderValue * matchedCoupon.discountValue) / 100;
        // Check trần (Max Discount)
        if (matchedCoupon.maxDiscountAmount && discount > matchedCoupon.maxDiscountAmount) {
            discount = matchedCoupon.maxDiscountAmount;
        }
    } else if (matchedCoupon.discountType === "FIXED") {
        discount = matchedCoupon.discountValue;
    }

    // Không giảm quá giá trị đơn hàng
    if (discount > totalOrderValue) discount = totalOrderValue;

    const finalDiscount = Math.round(discount);

    return {
        couponId: matchedCoupon._id,
        code: upperCode, // Trả về mã khách nhập (để lưu vào booking)
        matchType: matchedCoupon.matchType,
        discountAmount: finalDiscount,
        finalPrice: totalOrderValue - finalDiscount
    };
};
