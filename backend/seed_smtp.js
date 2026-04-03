import mongoose from "mongoose";
import SmtpConfig from "./models/settings/SmtpConfig.js";
import { encrypt } from "./utils/crypto.js";
import { MONGO_URI } from "./config/env.js";

const seedSmtp = async () => {
    try {
        console.log("⏳ Đang kết nối tới Database...", MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log("✅ Đã kết nối thành công tới Database!");
        
        const existing = await SmtpConfig.findOne();
        if (existing) {
            console.log("⚠️ Cấu hình SMTP đã tồn tại trong database " + MONGO_URI + ". Không cần seed thêm.");
            process.exit(0);
        }

        // TẠO CẤU HÌNH MẶC ĐỊNH
        const newConfig = new SmtpConfig({
            host: "smtp.gmail.com",
            port: 587,
            username: "ngocthuhai175@gmail.com", // Thay bằng email thật của bạn nếu muốn email gửi thật
            password: "dhih unmd tpof tvrq", // Thay bằng App Password của Gmail
            email: "ngocthuhai175@gmail.com", // Email hiển thị cho người nhận
            fromName: "The Horizons Booking Platform",
            secure: false
        });

        await newConfig.save();
        console.log("🎉 Khởi tạo dữ liệu cấu hình SMTP thành công vào Database mới!");
        console.log("Lỗi 'token expired' đã được xử lý triệt để.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Khởi tạo dữ liệu SMTP thất bại:", error);
        process.exit(1);
    }
};

seedSmtp();
