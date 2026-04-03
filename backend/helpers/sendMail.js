import nodemailer from "nodemailer";
import SmtpConfig from "../models/settings/SmtpConfig.js";
import { decrypt } from "../utils/crypto.js";

export const sendMail = async (options) => {
  // Lấy SMTP config từ DB (bản ghi đầu tiên)
  const config = await SmtpConfig.findOne().lean();
  if (!config) {
    throw new Error("SMTP config not found. Please configure SMTP settings in admin panel.");
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure, // false = STARTTLS (587), true = SSL (465)
    auth: {
      user: config.username,
      pass: decrypt(config.password),
    },
  });

  const mailOptions = {
    from: `"${config.fromName}" <${config.email}>`,
    to: options.email,
    subject: options.subject,
    text: options.text || "",
    html: options.html || "",
  };

  await transporter.sendMail(mailOptions);
};
