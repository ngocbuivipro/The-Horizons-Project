import {getAdminNotificationHtml, getAutoReplyHtml} from "../../utils/template/emailTemplate.js";
import sendEmail from "../../utils/template/sendMail.js";
import SmtpConfig from "../../models/settings/SmtpConfig.js";
import Contact from "../../models/page/Contact.js";

export const createContact = async (req, res) => {
    try {
        const { name, whatsapp, email, message } = req.body;

        // 1. Validation
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "Please fill in all required fields." });
        }

        // 2. Save to Database
        const newContact = new Contact({
            name,
            whatsapp,
            email,
            message
        });
        await newContact.save();

        // 3. Get Admin Configuration
        const config = await SmtpConfig.findOne();

        if (config) {
            // --- A. Gửi cho Admin ---
            await sendEmail({
                email: config.email,
                subject: `New Enquiry: ${name}`,
                html: getAdminNotificationHtml(newContact) // Gọi hàm tạo HTML
            });

            // --- B. Gửi Auto-reply cho Khách ---
            await sendEmail({
                email: email,
                subject: "We have received your message - Betel Hospitality",
                html: getAutoReplyHtml(newContact) // Gọi hàm tạo HTML
            });
        }

        res.status(201).json({ success: true, message: "Message sent successfully!" });

    } catch (error) {
        console.error("Contact Error:", error);
        res.status(500).json({ success: false, message: "Server error, please try again later." });
    }
};