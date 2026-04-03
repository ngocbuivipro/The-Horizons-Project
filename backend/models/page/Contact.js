import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    whatsapp: { type: String }, // Optional
    email: { type: String, required: true },
    message: { type: String, required: true }, // Enquiry
    status: { type: String, default: 'Pending' }, // Trạng thái xử lý
}, { timestamps: true });

export default mongoose.model('Contact', contactSchema);