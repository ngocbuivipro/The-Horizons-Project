import nodemailer from "nodemailer";
import SmtpConfig from "../../models/settings/SmtpConfig.js";
import {decrypt} from "../crypto.js";

const sendEmail = async (options) => {
    // 1. Lấy cấu hình từ DB
    const config = await SmtpConfig.findOne();

    // qbjy bfaj qdpz ayuc
    if (!config) {
        throw new Error("Chưa cấu hình SMTP trong Admin Dashboard.");
    }

    // 2. Giải mã password
    const decryptedPassword = decrypt(config.password);

    // 3. Tạo Transporter
    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure, // true cho 465, false cho các port khác
        auth: {
            user: config.username, // QUAN TRỌNG: Dùng username để đăng nhập server mail
            pass: decryptedPassword,
        },
        tls: {
            rejectUnauthorized: false // Bỏ qua lỗi chứng chỉ nếu server mail tự ký
        }
    });

    // 4. Gửi Mail
    const mailOptions = {
        // Hiển thị: "Tên Shop <email-shop@domain.com>"
        from: `"${config.fromName}" <${config.email}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;
