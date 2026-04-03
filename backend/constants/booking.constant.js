
export const BOOKING_TYPES = {
    HOTEL: "HOTEL",
    BUS: "BUS",
    TOUR: "TOUR",
    CRUISE: "CRUISE",
    CAR: "CAR"
};

export const BOOKING_STATUS = {
    REQUEST: "REQUEST",
    PENDING: "PENDING",     // Đang chờ xử lý (ví dụ chờ confirm chỗ)
    CONFIRMED: "CONFIRMED", // Đã xác nhận (thường sau khi thanh toán hoặc admin duyệt)
    CANCELLED: "CANCELLED",
    UNPAID: "UNPAID",       // Tạo booking nhưng chưa thanh toán
    COMPLETED: "COMPLETED", // Đã sử dụng dịch vụ xong
    REFUNDED: "REFUNDED"    // Đã hoàn tiền
};

export const PAYMENT_METHODS = {
    CARD: "card",
    TRANSFER: "transfer",
    CASH: "cash"
};

export const CURRENCY_TYPES = {
    VND: "VND",
    USD: "USD",
    EUR: "EUR"
};

export const PAYMENT_GATEWAYS = {
    ONEPAY: "onepay",
    PAYPAL: "paypal",
    STRIPE: "stripe"
};

export const PAYMENT_STATUS = {
    PENDING: "PENDING",
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
    REFUNDED: "REFUNDED",
    UNPAID: "UNPAID",
    PAID: "PAID"
};
