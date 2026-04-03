import { useState } from "react";
// Import Icons hiện đại
import { RiChatSmile3Fill, RiCloseFill } from "react-icons/ri";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
// Import thư viện thông báo (Toast)
import toast from "react-hot-toast";

// --- Sub-component: Menu Item ---
const ContactItem = ({ icon, label, href, onClick, colorClass, delay }) => {
    return (
        <a
            href={href}
            onClick={onClick}
            target="_blank"
            rel="noopener noreferrer"
            className={`
                flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all duration-300 cursor-pointer group
                animate-fade-in-up
            `}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className={`text-xl ${colorClass} transition-transform duration-300 group-hover:scale-110`}>
                {icon}
            </div>
            <span className="text-gray-700 font-medium text-sm group-hover:text-gray-900">
                {label}
            </span>
        </a>
    );
};

// --- Main Component ---
const FloatingWhatsApp = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    // --- XỬ LÝ CLICK EMAIL: COPY & OPEN ---
    const handleEmailClick = (e, email) => {
        // 1. Copy email vào Clipboard
        navigator.clipboard.writeText(email)
            .then(() => {
                // 2. Hiện thông báo thành công
                toast.success("Email copied to clipboard!");
            })
            .catch(() => {
                console.error("Failed to copy email");
            });

    };

    // Dữ liệu cấu hình
    const actions = [
        {
            id: 'email',
            label: 'Email Support',
            icon: <MdOutlineEmail size={22} />,
            href: "mailto:hoian@betelhospitality.com",
            color: "text-blue-900",
            onClick: (e) => handleEmailClick(e, "hoian@betelhospitality.com") // Gán hàm xử lý
        },
        {
            id: 'whatsapp',
            label: 'WhatsApp',
            icon: <FaWhatsapp size={22} />,
            href: "https://wa.me/84868060269",
            color: "text-green-500",
        },
    ];

    return (
        <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-4 font-sans">

            {/* --- 1. MENU OPTIONS (Hiện ra khi isOpen = true) --- */}
            <div
                className={`
                    flex flex-col bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-2 min-w-[200px]
                    origin-bottom-right transition-all duration-300 ease-out
                    ${isOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 translate-y-10 invisible'}
                `}
            >
                {actions.map((action, index) => (
                    <ContactItem
                        key={action.id}
                        {...action}
                        colorClass={action.color}
                        delay={index * 50}
                    />
                ))}
            </div>

            {/* --- 2. MAIN BUTTON CONTAINER --- */}
            <div className="group relative flex items-center justify-end">

                {/* --- TOOLTIP HOVER EFFECT (Chỉ hiện khi đóng menu) --- */}
                <div
                    className={`
                        absolute right-[76px] top-1/2 -translate-y-1/2
                        bg-white text-gray-800 px-4 py-2 rounded-xl shadow-lg border border-gray-50
                        whitespace-nowrap font-medium text-sm
                        transition-all duration-500 ease-in-out
                        ${!isOpen
                        ? 'opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 visible'
                        : 'opacity-0 translate-x-4 invisible'}
                    `}
                >
                    Chat with us 👋
                    {/* Mũi tên nhỏ trỏ vào nút */}
                    <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-t border-r border-gray-50"></div>
                </div>

                {/* --- TOGGLE BUTTON --- */}
                <button
                    onClick={toggleMenu}
                    className={`
                        relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl 
                        transition-all duration-500 ease-in-out hover:scale-110 active:scale-95 outline-none
                        ${isOpen ? 'bg-[#D4A23A] rotate-90' : 'bg-[#165027]'}
                    `}
                    aria-label="Toggle contact menu"
                >
                    {/* Icon khi đóng: Hình mặt cười + Dot thông báo */}
                    <div className={`absolute transition-all duration-300 ${isOpen ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
                        <RiChatSmile3Fill className="text-white text-3xl" />

                        {/* Notification Dot (Hiệu ứng Ping) */}
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#D4A23A] border-2 border-[#165027]"></span>
                        </span>
                    </div>

                    {/* Icon khi mở: Dấu X */}
                    <div className={`absolute transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}>
                        <RiCloseFill className="text-white text-3xl" />
                    </div>
                </button>
            </div>

            {/* Overlay đóng menu khi click ra ngoài */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default FloatingWhatsApp;