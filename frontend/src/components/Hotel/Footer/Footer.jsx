import { useState, useEffect } from 'react';
import { FaFacebookF, FaYoutube, FaInstagram } from "react-icons/fa";
import { useSelector } from "react-redux";

// Static data for other sections
const STATIC_LINKS = [
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "#" },
      { name: "Contact Us", href: "/contact" },
      { name: "Blog", href: "#" }
    ]
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Use", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "Site Map", href: "#" }
    ]
  }
];

const SOCIAL_LINKS = [
  { icon: <FaFacebookF />, href: "https://www.facebook.com/wavyyy.1705" },
  { icon: <FaYoutube />, href: "https://www.youtube.com/@NgocChaMuc" },
  { icon: <FaInstagram />, href: "https://www.instagram.com/bngoc.adrw._/" },
];

const Footer = () => {
  // 1. Lấy thêm state isAdmin
  const { modules } = useSelector(state => state.SystemReducer);
  const { isAdmin } = useSelector(state => state.AdminReducer);

  const [footerLinks, setFooterLinks] = useState([]);

  useEffect(() => {
    let servicesLinks = [
      { name: "Accommodations", href: "/homes", key: "hotel" },
      { name: "Tours", href: "/tours", key: "tour" },
      { name: "Bus", href: "/bus", key: "bus" },
      { name: "Cruise", href: "/cruises", key: "cruise" }
    ];

    // 2. Logic lọc module:
    // Nếu KHÔNG PHẢI Admin -> Filter dựa trên config modules
    // Nếu LÀ Admin -> Bỏ qua đoạn này (giữ nguyên danh sách đầy đủ)
    if (!isAdmin) {
      // Dùng Optional Chaining (?.) để tránh lỗi nếu modules chưa load xong
      servicesLinks = servicesLinks.filter(link => modules?.[link.key] === true);
    }

    const servicesSection = {
      title: "Services",
      links: servicesLinks
    };

    const newLinks = [
      STATIC_LINKS[0], // Company info
      servicesSection, // Services (Dynamic)
      STATIC_LINKS[1]  // Legal info
    ];

    setFooterLinks(newLinks);

  }, [modules, isAdmin]); // 3. Thêm isAdmin vào dependency array

  if (footerLinks.length === 0) return null;

  return (
      <footer className="bg-white border-t border-gray-100 font-sans pt-10 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* --- MAIN GRID --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">

            {/* COL 1: BRAND & CONTACT */}
            <div className="lg:col-span-5 space-y-6 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Logo area */}
              <div className="flex items-center gap-3">
                <img
                    src="/thehorizons_logo.png"
                    alt="The Horizons"
                    className="h-14 w-auto object-contain"
                    onError={(e) => { e.target.style.display = 'none' }}
                />
                <div className="flex flex-col leading-none">
                  <span className="text-2xl font-bold text-[#165027] tracking-tight uppercase">The Horizons</span>
                  <span className="text-xs font-bold text-[#D99D28] tracking-[0.3em] uppercase">Travel Platform</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 w-full">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-2 lg:gap-3 text-sm text-gray-600">
                  <span className="leading-relaxed max-w-xs lg:max-w-none mx-auto lg:mx-0">
                                    Group 4, Area 4B, Quang Hanh Ward,<br className="hidden lg:block"/> Cam Pha City, Quang Ninh Province, Vietnam.
                                </span>
                </div>

                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-2 lg:gap-3 text-sm text-gray-600">
                  <a href="mailto:ngocthuhai175@gmail.com" className="hover:text-[#D99D28] transition-colors">
                    ngocthuhai175@gmail.com
                  </a>
                </div>

                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-2 lg:gap-3 text-sm text-gray-600">
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                    <a href="tel:+84867892207" className="hover:text-[#D99D28] font-medium">+84 867 892 207</a>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <a href="tel:+84868060269" className="hover:text-[#D99D28] font-medium">+84 868 060 269</a>
                  </div>
                </div>

                <div className="text-xs text-gray-400 pt-2">
                  Tax ID: 4001311277
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex gap-4 pt-2">
                {SOCIAL_LINKS.map((item, idx) => (
                    <a
                        key={idx}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-[#165027] hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-sm border border-gray-100"
                    >
                      {item.icon}
                    </a>
                ))}
              </div>
            </div>

            {/* COL 2: LINKS - Căn giữa trên mobile, Grid 2 cột */}
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 text-center lg:text-left pt-6 lg:pt-0 border-t lg:border-t-0 border-gray-100 lg:border-none">
              {footerLinks.map((section, idx) => (
                  <div key={idx}>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 lg:border-l-4 lg:border-[#D99D28] lg:pl-3 inline-block lg:block border-b-2 border-[#D99D28] lg:border-b-0 pb-1 lg:pb-0">
                      {section.title}
                    </h3>
                    <ul className="space-y-3">
                      {section.links.map((link, linkIdx) => (
                          <li key={linkIdx}>
                            <a
                                href={link.href}
                                className="text-sm text-gray-500 hover:text-[#D99D28] lg:hover:translate-x-1 transition-all duration-200 block py-1 lg:py-0"
                            >
                              {link.name}
                            </a>
                          </li>
                      ))}
                    </ul>
                  </div>
              ))}
            </div>
          </div>

          {/* COPYRIGHT SECTION */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center justify-center gap-2">
            <p className="text-xs text-gray-400 text-center">
              © {new Date().getFullYear()} <span className="font-bold text-[#165027]">The Horizons</span>. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
  );
};

export default Footer;