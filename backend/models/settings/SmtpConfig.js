import mongoose from 'mongoose';

const smtpConfigSchema = new mongoose.Schema({
    host: { type: String, default: 'smtp.gmail.com' },
    port: { type: Number, default: 587 },

    username: { type: String, required: true }, // VD: mrhieu@lotustrain.vn (Tài khoản login)
    password: { type: String, required: true }, // Mật khẩu ứng dụng (đã mã hóa)

    // Thông tin người gửi (Sender Info)
    email: { type: String, required: true },    // VD: no-reply@lotustrain.vn (Email hiển thị)
    fromName: { type: String, default: 'Booking App' }, // VD: Lotus Train

    // Tùy chọn bảo mật (SSL/TLS)
    secure: { type: Boolean, default: false } // false = StartTLS (587), true = SSL (465)
}, { timestamps: true });

export default mongoose.model('SmtpConfig', smtpConfigSchema);
