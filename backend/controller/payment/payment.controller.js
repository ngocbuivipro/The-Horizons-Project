import mongoose from "mongoose";
import axios from "axios";
import Booking from "../../models/payment/Booking.js";
import Payment from "../../models/payment/Payment.js";
import { buildRawData, genSecureHash } from "../../utils/onepayHelper.js";
import { ONEPAY_CONFIG, ONEPAY_ROUTES, CLIENT_URL } from "../../utils/configOnepay.js";

const getClientIp = (req) => {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return req.socket.remoteAddress || "127.0.0.1";
};

export const createPaymentUrl = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const bookingId = req.params.id;
        const booking = await Booking.findById(bookingId).session(session);

        if (!booking) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.isPaid || booking.status === 'CONFIRMED') {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Booking has already been paid." });
        }

        let amountToPayVND = booking.totalPriceVND;

        /* Ensure the processing fee is strictly aggregated into the final gateway amount.
           This handles cases where the fee is persisted in a separate schema field
           or the payment method was switched post-booking. */
        if (booking.processingFee && booking.processingFee > 0) {
            const expectedBasePrice = (booking.originalPriceVND || amountToPayVND) - (booking.discountAmount || 0);
            if (amountToPayVND === expectedBasePrice) {
                amountToPayVND += booking.processingFee;
            }
        }

        if (!amountToPayVND || amountToPayVND <= 0) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Invalid booking amount." });
        }

        let payment = await Payment.findOne({ booking: booking._id }).session(session);
        let merchTxnRef;

        if (payment) {
            if (payment.status === "SUCCESS") {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: "Payment already success." });
            }
            merchTxnRef = payment.merchTxnRef;
            payment.amount = amountToPayVND;
            await payment.save({ session });
        } else {
            merchTxnRef = `BK_${bookingId}_${Date.now()}`;
            payment = new Payment({
                booking: booking._id,
                gateway: "onepay",
                merchTxnRef,
                amount: amountToPayVND,
                status: "PENDING",
            });
            await payment.save({ session });
        }

        booking.payment = payment._id;
        booking.stepPayment = true;

        /* Sync the aggregated amount back to the booking record for data integrity */
        if (booking.totalPriceVND !== amountToPayVND) {
            booking.totalPriceVND = amountToPayVND;
        }
        await booking.save({ session });

        const vpcAmount = Math.round(amountToPayVND * 100).toString();

        const params = {
            vpc_Version: "2",
            vpc_Command: "pay",
            vpc_AccessCode: ONEPAY_CONFIG.ACCESS_CODE,
            vpc_Merchant: ONEPAY_CONFIG.MERCHANT_ID,
            vpc_ReturnURL: ONEPAY_ROUTES.RETURN_URL,
            vpc_MerchTxnRef: merchTxnRef,
            vpc_CallbackURL: ONEPAY_ROUTES.CALLBACK_URL,
            vpc_OrderInfo: `Booking ${booking.bookingType || 'Order'} - ${bookingId}`,
            vpc_Amount: vpcAmount,
            vpc_Currency: "VND",
            vpc_Locale: "vn",
            vpc_TicketNo: getClientIp(req),
        };

        const rawData = buildRawData(params);
        params.vpc_SecureHash = genSecureHash(rawData, ONEPAY_CONFIG.HASH_CODE);

        const paymentUrl = `${ONEPAY_CONFIG.PAYGATE_URL}?${new URLSearchParams(params).toString()}`;

        await session.commitTransaction();

        return res.json({
            success: true,
            data: {
                bookingId: booking._id,
                paymentId: payment._id,
                amount: amountToPayVND,
                paymentUrl
            },
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Create Payment URL Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal payment initialization error" });
    } finally {
        session.endSession();
    }
};


export const onepayReturn = async (req, res) => {
    try {
        const params = req.query;
        const merchTxnRef = params.vpc_MerchTxnRef;

        // 1. Validate Hash (Bảo mật)
        const rawData = buildRawData(params);
        const expectedHash = genSecureHash(rawData, ONEPAY_CONFIG.HASH_CODE);

        if (expectedHash !== (params.vpc_SecureHash || "").toUpperCase()) {
            // Hash sai => Redirect về trang lỗi (Code 99: Lỗi không xác định/Bảo mật)
            return res.redirect(`${CLIENT_URL}/payment/result?status=failed&code=99`);
        }

        // 2. Tìm Payment trong DB
        // Lưu ý: Đảm bảo field trong DB của bạn tên là 'code' hay 'merchTxnRef'
        const payment = await Payment.findOne({ code: merchTxnRef });

        if (!payment) {
            // Không tìm thấy giao dịch => Lỗi
            return res.redirect(`${CLIENT_URL}/payment/result?status=failed&code=99`);
        }

        // 3. Xử lý kết quả
        const bookingId = payment.booking.toString();
        const responseCode = params.vpc_TxnResponseCode;

        // OnePay quy định: "0" là thành công
        const isSuccess = responseCode === "0";

        // 4. Redirect về Frontend
        // Frontend sẽ nhận bookingId để check loại service (Bus/Tour/Hotel) và hiển thị UI tương ứng
        return res.redirect(
            `${CLIENT_URL}/payment/result?bookingId=${bookingId}&status=${isSuccess ? "success" : "failed"}&code=${responseCode}`
        );

    } catch (err) {
        console.error("Return URL Error:", err);
        // Lỗi Server => Redirect về trang lỗi
        return res.redirect(`${CLIENT_URL}/payment/result?status=failed&code=99`);
    }
};

export const onepayIPN = async (req, res) => {
    try {
        const params = req.method === "GET" ? req.query : req.body;
        console.log("IPN Received:", JSON.stringify(params));

        const merchTxnRef = params.vpc_MerchTxnRef;

        // 1. Kiểm tra tham số cơ bản
        if (!merchTxnRef) {
            return res.status(200).send("responsecode=0&desc=missing-merchTxnRef");
        }

        // 2. Validate Secure Hash
        const raw = buildRawData(params);
        const expectedSecureHash = genSecureHash(raw, ONEPAY_CONFIG.HASH_CODE);

        if (expectedSecureHash !== (params.vpc_SecureHash || "").toUpperCase()) {
            console.error("IPN Invalid Hash");
            return res.status(200).send("responsecode=0&desc=invalid-secure-hash");
        }

        // 3. Tìm Payment trong DB
        const payment = await Payment.findOne({ merchTxnRef });
        if (!payment) {
            return res.status(200).send("responsecode=0&desc=payment-not-found");
        }

        // 4. Validate Amount (Chống hack sửa giá)
        const responseAmount = parseInt(params.vpc_Amount);
        const dbAmount = Math.round(payment.amount * 100);

        if (responseAmount !== dbAmount) {
            console.error(`[SECURITY ALERT] Amount mismatch! OnePay: ${responseAmount}, DB: ${dbAmount}`);
            return res.status(200).send("responsecode=0&desc=amount-mismatch");
        }

        const booking = await Booking.findById(payment.booking);
        if (!booking) return res.status(200).send("responsecode=0&desc=booking-not-found");

        // 5. Cập nhật trạng thái
        if (params.vpc_TxnResponseCode === "0") {
            // Thanh toán thành công
            payment.status = "SUCCESS";
            payment.transactionNo = params.vpc_TransactionNo;
            payment.cardType = params.vpc_Card;
            payment.bankCode = params.vpc_PayChannel;
            payment.paidAt = new Date();

            booking.isPaid = true;
            booking.status = "CONFIRMED";
            booking.payAt = new Date();
        } else {
            // Thanh toán thất bại
            payment.status = "FAILED";
        }

        payment.rawResponse = params; // Lưu log để debug
        await payment.save();
        await booking.save();

        // 6. Phản hồi chuẩn cho OnePay (responsecode=1 là đã nhận ok)
        return res.status(200).send("responsecode=1&desc=confirm-success");

    } catch (error) {
        console.error("IPN Error:", error);
        // Trả về status 500 để OnePay biết server lỗi và retry
        return res.status(500).send("responsecode=0&desc=server-error");
    }
};


export const queryOnePayDR = async (req, res) => {
    try {
        const { merchTxnRef } = req.body;
        if (!merchTxnRef) return res.status(400).json({ success: false, message: "Missing merchTxnRef" });

        const queryUrl = ONEPAY_CONFIG.QUERY_DR_URL;

        const params = {
            vpc_Command: "queryDR",
            vpc_Version: "2",
            vpc_MerchTxnRef: merchTxnRef,
            vpc_Merchant: ONEPAY_CONFIG.MERCHANT_ID,
            vpc_AccessCode: ONEPAY_CONFIG.ACCESS_CODE,
            vpc_User: ONEPAY_CONFIG.QUERY_USER,
            vpc_Password: ONEPAY_CONFIG.QUERY_PASSWORD,
        };

        const raw = buildRawData(params);
        params.vpc_SecureHash = genSecureHash(raw, ONEPAY_CONFIG.HASH_CODE);

        const response = await axios.post(queryUrl, new URLSearchParams(params).toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const resData = response.data;
        const resParams = Object.fromEntries(new URLSearchParams(resData));

        // Validate Hash trả về
        const rawRes = buildRawData(resParams);
        const expectedHash = genSecureHash(rawRes, ONEPAY_CONFIG.HASH_CODE);

        if (expectedHash !== (resParams.vpc_SecureHash || "").toUpperCase()) {
            return res.status(400).json({ success: false, message: "Invalid SecureHash from QueryDR" });
        }

        if (resParams.vpc_DRExists === "N") {
            return res.json({ success: true, message: "Transaction not found at OnePay", data: resParams });
        }

        const payment = await Payment.findOne({ merchTxnRef });

        if (payment && parseInt(resParams.vpc_Amount) === Math.round(payment.amount * 100)) {
            if (resParams.vpc_TxnResponseCode === "0" && payment.status !== "SUCCESS") {
                payment.status = "SUCCESS";
                payment.transactionNo = resParams.vpc_TransactionNo;
                payment.paidAt = new Date();
                await payment.save();

                const booking = await Booking.findById(payment.booking);
                if (booking) {
                    booking.isPaid = true;
                    booking.status = "CONFIRMED";
                    booking.payAt = new Date();
                    await booking.save();
                }
            } else if (resParams.vpc_TxnResponseCode !== "0" && payment.status === "PENDING") {
                payment.status = "FAILED";
                await payment.save();
            }
        }

        return res.status(200).json({ success: true, data: resParams });

    } catch (error) {
        console.error("QueryDR Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getPaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id).populate('payment');
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const status = {
            isPaid: booking.isPaid,
            bookingStatus: booking.status,
            paymentStatus: booking.payment?.status || "PENDING",
            amount: booking.payment?.amount,
            method: booking.paymentMethod
        };
        return res.status(200).json({ success: true, data: status });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching status", error: error.message });
    }
};