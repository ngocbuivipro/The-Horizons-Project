import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { contactUsApi } from "../../api/client/system.api.js";

// Simple SVG Icons components to keep dependencies low
const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ContactUs = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
        email: '',
        message: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            return toast.error("Please fill in all required fields.");
        }

        setLoading(true);
        try {
            const res = await contactUsApi(formData);
            if (res.success) {
                toast.success("Message sent successfully! We will contact you shortly.");
                setFormData({ name: '', whatsapp: '', email: '', message: '' });
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to send message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pt-10 pb-20">
            {/* --- Header Section --- */}
            <div className="text-center max-w-3xl mx-auto px-4 mb-5">
                <h2 className="text-green-600 font-bold tracking-wide uppercase text-sm mb-2">Get in Touch</h2>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">We'd love to hear from you</h1>
                <p className="text-lg text-slate-600">
                    Whether you have a question about our tours, need help with a booking, or just want to say hello, our team is ready to answer all your questions.
                </p>
            </div>

            {/* --- Main Content Card --- */}
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

                    {/* --- Left Column: Contact Info (Dark Theme) --- */}
                    <div className="md:w-5/12 bg-slate-900 text-white p-10 flex flex-col justify-between relative overflow-hidden">
                        {/* Decorative Circle */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                            <p className="text-slate-300 mb-8 leading-relaxed">
                                Plan your next trip with Betel Hospitality. Fill out the form or contact us directly via the channels below.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 bg-white/10 p-3 rounded-lg text-green-400">
                                        <PhoneIcon />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Call Us / WhatsApp</p>
                                        <a href="https://wa.me/84868060269" className="text-lg font-medium hover:text-green-400 transition-colors">+84 868 060 269</a>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 bg-white/10 p-3 rounded-lg text-green-400">
                                        <MailIcon />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Email Us</p>
                                        <a href="mailto:hoian@betelhospitality.com" className="text-lg font-medium hover:text-green-400 transition-colors">hoian@betelhospitality.com</a>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 bg-white/10 p-3 rounded-lg text-green-400">
                                        <MapPinIcon />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Visit Us</p>
                                        <p className="text-lg font-medium">Hoi An, Quang Nam, Vietnam</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 bg-white/10 p-3 rounded-lg text-green-400">
                                        <ClockIcon />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Working Hours</p>
                                        <p className="text-lg font-medium">Mon - Sun: 8:00 AM - 10:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Links placeholder or bottom text */}
                        <div className="relative z-10 mt-12 md:mt-0">
                            <p className="text-sm text-slate-500">
                                © {new Date().getFullYear()} Betel Hospitality.
                            </p>
                        </div>
                    </div>

                    {/* --- Right Column: The Form --- */}
                    <div className="md:w-7/12 p-10 lg:p-12 bg-white">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Your Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your name"
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                        required
                                    />
                                </div>

                                {/* WhatsApp (Optional) */}
                                <div>
                                    <label htmlFor="whatsapp" className="block text-sm font-semibold text-slate-700 mb-2">
                                        WhatsApp Number
                                    </label>
                                    <input
                                        type="text"
                                        id="whatsapp"
                                        name="whatsapp"
                                        value={formData.whatsapp}
                                        onChange={handleChange}
                                        placeholder=""
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder=""
                                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    required
                                />
                            </div>

                            {/* Enquiry */}
                            <div>
                                <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Your Enquiry <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="4"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="I'm interested in booking a tour for my family..."
                                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    required
                                ></textarea>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`
                                        w-full flex justify-center items-center py-4 px-6 rounded-lg text-white font-bold text-lg tracking-wide shadow-lg
                                        ${loading
                                        ? 'bg-green-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:-translate-y-0.5'
                                    }
                                        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                                    `}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending Message...
                                        </>
                                    ) : (
                                        "Send Message"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;