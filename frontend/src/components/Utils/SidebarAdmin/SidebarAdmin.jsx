import {useState, useEffect, useRef, useCallback} from "react"; // Nên thêm useCallback
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";

// Import các Icons
import {FaBars, FaList, FaMapMarkedAlt, FaChevronDown, FaShip} from "react-icons/fa";
import {MdDashboard, MdExitToApp} from "react-icons/md";
import {IoIosSettings, IoIosArrowDown, IoIosArrowUp} from "react-icons/io";
import {LuHotel} from "react-icons/lu";

// Import action logout
import {logoutAdminAction} from "../../../redux/actions/AdminAction.js";
import {handleLogout} from "../../../api/client/api.js";

const SidebarAdmin = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const sidebarRef = useRef(null);

    // State cho sidebar mobile
    const [isOpen, setIsOpen] = useState(false);

    // --- STATE QUẢN LÝ DROPDOWN ---
    // LOGIC ISSUE: State khởi tạo mặc định là false. Nếu user refresh trang hoặc truy cập trực tiếp link con (ví dụ: /dashboard-view-homes),
    // menu cha sẽ bị đóng trong khi item con đang active. Cần logic khởi tạo state dựa trên location.pathname hoặc useEffect để sync.
    const [isAccommodationOpen, setIsAccommodationOpen] = useState(false);
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [isCruiseOpen, setIsCruiseOpen] = useState(false);
    const [isSettingOpen, setIsSettingOpen] = useState(false);

    // PERFORMANCE: Hàm này được tạo lại mỗi lần component render. Nên bọc trong useCallback hoặc tách ra ngoài component để tránh re-declare không cần thiết.
    const navStyle = useCallback((path) =>
        `flex items-center space-x-3 cursor-pointer px-2 py-2 rounded-md transition-colors duration-200 hover:bg-indigo-50 ${
            location.pathname === path ? "bg-indigo-100 text-indigo-700" : "text-gray-600"
        }`, [location.pathname]);

    const childNavStyle = useCallback((path) =>
        `block pl-10 pr-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            location.pathname === path
                ? "text-indigo-700 bg-indigo-50"
                : "text-gray-500 hover:text-indigo-600 hover:bg-gray-50"
        }`, [location.pathname]);

    // LOGIC CHECK: Cách kiểm tra active state này ổn, nhưng cần đảm bảo đồng bộ với logic mở dropdown ở trên.
    const isSettingsActive = location.pathname.includes("/dashboard-settings");

    const isAccommodationActive = [
        "/dashboard-view-homes",
        "/dashboard-view-room",
        "/dashboard-create-home",
        "/dashboard-create-room"
    ].includes(location.pathname);

    const isCruiseActive = [
        "/dashboard-view-cruise",
        "/dashboard-add-cruise",
    ].includes(location.pathname) || location.pathname.startsWith('/dashboard-update-cruise/');



    const isTourActive = [
        "/dashboard-view-tours",
        "/dashboard-create-tour"
    ].includes(location.pathname);

    // UX IMPROVEMENT: Auto open dropdown nếu đang ở trang con tương ứng
    useEffect(() => {
        if (isAccommodationActive) setIsAccommodationOpen(true);
        if (isTourActive) setIsTourOpen(true);
        if (isCruiseActive) setIsCruiseOpen(true);
        if (isSettingsActive) setIsSettingOpen(true);
    }, [location.pathname]); // Chỉ chạy khi pathname thay đổi

    // Logic Logout
    const onLogoutClick = async () => {
        try {
            await handleLogout();
            dispatch(logoutAdminAction());
        } catch (e) {
            console.error("Logout API failed:", e);
        } finally {
            // BEST PRACTICE: Luôn clear storage và navigate dù API call fail hay success để tránh kẹt user.
            localStorage.removeItem("accessToken");
            sessionStorage.clear();
            navigate("/");
        }
    };

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleMenuClick = () => {
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Icon Toggle Mobile */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="md:hidden fixed top-2 left-4 z-30 bg-indigo-600 text-white p-2 rounded-md shadow-md hover:bg-indigo-700 transition"
                >
                    <FaBars/>
                </button>
            )}

            {/* Overlay */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/50 z-10 md:hidden backdrop-blur-sm transition-opacity"
                ></div>
            )}

            {/* Sidebar Container */}
            <div
                ref={sidebarRef}
                className={`fixed top-0 left-0 h-screen bg-white z-20 w-[200px] overflow-y-auto transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 border-r border-gray-100`}
            >
                <div className="flex flex-col h-full">

                    {/* Logo */}
                    <div className="h-16 flex items-center justify-center bg-white sticky top-0 z-10">
                        <Link to="/">
                            <span className="text-1xl font-bold text-indigo-600 tracking-wide">
                                HORIZONS ADMIN
                            </span>
                        </Link>
                    </div>
                    <hr className="border-t border-gray-100"/>

                    {/* Menu Items */}
                    <div className="px-3 flex-1 py-4">
                        <ul className="flex flex-col gap-1">

                            {/* --- MAIN --- */}
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Main</p>
                            <Link to="/dashboard" onClick={handleMenuClick}>
                                <li className={navStyle("/dashboard")}>
                                    <MdDashboard size={22}
                                                 className={location.pathname === "/dashboard" ? "text-indigo-600" : "text-gray-400"}/>
                                    <span className="text-sm font-semibold">Dashboard</span>
                                </li>
                            </Link>

                            {/* --- MANAGEMENT --- */}
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-2 px-2">Management</p>

                            {/* 1. Orders */}
                            <Link to="/dashboard-view-orders" onClick={handleMenuClick}>
                                <li className={navStyle("/dashboard-view-orders")}>
                                    <FaList size={18}
                                            className={location.pathname === "/dashboard-view-orders" ? "text-indigo-600" : "text-gray-400"}/>
                                    <span className="text-sm font-semibold">Orders</span>
                                </li>
                            </Link>

                            {/* 2. Accommodation */}
                            <li className="flex flex-col gap-1">
                                <div
                                    onClick={() => setIsAccommodationOpen(!isAccommodationOpen)}
                                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all duration-300 px-2
                                      ${(isAccommodationOpen || isAccommodationActive) ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <LuHotel size={20} className={isAccommodationActive ? "text-indigo-600" : "text-gray-400"}/>
                                        <span className="text-sm font-semibold">Accommodation</span>
                                    </div>
                                    <FaChevronDown
                                        className={`text-xs transition-transform duration-300 ${isAccommodationOpen ? "rotate-180" : "rotate-0"}`}
                                    />
                                </div>

                                {/* Dropdown Items */}
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out
                                    ${isAccommodationOpen ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0"}`
                                    }
                                >
                                    <ul className="flex flex-col gap-1">
                                        <Link to="/dashboard-view-homes" onClick={handleMenuClick}>
                                            <li className={childNavStyle("/dashboard-view-homes")}>All Homes</li>
                                        </Link>
                                        <Link to="/dashboard-view-room" onClick={handleMenuClick}>
                                            <li className={childNavStyle("/dashboard-view-room")}>All Rooms</li>
                                        </Link>
                                        <Link to="/dashboard-create-home" onClick={handleMenuClick}>
                                            <li className={childNavStyle("/dashboard-create-home")}>Create Home</li>
                                        </Link>
                                        <Link to="/dashboard-create-room" onClick={handleMenuClick}>
                                            <li className={childNavStyle("/dashboard-create-room")}>Create Room</li>
                                        </Link>
                                    </ul>
                                </div>
                            </li>

                            {/* 3. Tour */}
                            <li className="flex flex-col gap-1">
                                <div
                                    onClick={() => setIsTourOpen(!isTourOpen)}
                                    // LOGIC FIX: Thêm isTourActive vào điều kiện highlight để icon cha sáng khi con active
                                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all duration-300 px-2
                                      ${(isTourOpen || isTourActive) ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <FaMapMarkedAlt size={18} className={isTourActive ? "text-indigo-600" : "text-gray-400"}/>
                                        <span className="text-sm font-semibold">Tour</span>
                                    </div>
                                    <FaChevronDown
                                        className={`text-xs transition-transform duration-300 ${isTourOpen ? "rotate-180" : "rotate-0"}`}
                                    />
                                </div>

                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out
                                    ${isTourOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"}`
                                    }
                                >
                                    <ul className="flex flex-col gap-1">
                                        <Link to="/dashboard-view-tours" onClick={handleMenuClick}>
                                            <li className={childNavStyle("/dashboard-view-tours")}>All Tours</li>
                                        </Link>
                                        <Link to="/dashboard-create-tour" onClick={handleMenuClick}>
                                            {/* CRITICAL BUG: Sai tham số childNavStyle. "Tour" viết hoa chữ T sẽ không khớp với location.pathname (thường là lowercase).
                                                Sửa thành: childNavStyle("/dashboard-create-tour") */}
                                            <li className={childNavStyle("/dashboard-create-tour")}>Add New Tour</li>
                                        </Link>
                                    </ul>
                                </div>
                            </li>



                            {/* 5. cruise */}
                            <li className="flex flex-col gap-1">
                                <div
                                    onClick={() => setIsCruiseOpen(!isCruiseOpen)}
                                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all duration-300 px-2
                                      ${(isCruiseOpen || isCruiseActive) ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <FaShip size={18} className={isCruiseActive ? "text-indigo-600" : "text-gray-400"}/>
                                        <span className="text-sm font-semibold">Cruise</span>
                                    </div>
                                    <FaChevronDown
                                        className={`text-xs transition-transform duration-300 ${isCruiseOpen ? "rotate-180" : "rotate-0"}`}
                                    />
                                </div>

                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out
                                    ${isCruiseOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"}`
                                    }
                                >
                                    <ul className="flex flex-col gap-1">
                                        <Link to="/dashboard-view-cruise" onClick={handleMenuClick}>
                                            <li className={childNavStyle("/dashboard-view-cruise")}>All Cruises</li>
                                        </Link>
                                        <Link to="/dashboard-add-cruise" onClick={handleMenuClick}>
                                            <li className={childNavStyle("/dashboard-add-cruise")}>Add New Cruise</li>
                                        </Link>
                                    </ul>
                                </div>
                            </li>




                            {/* --- SYSTEM --- */}
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-2 px-2">System</p>



                            <li
                                onClick={() => setIsSettingOpen(!isSettingOpen)}
                                className={`flex items-center justify-between px-2 py-2 rounded-md cursor-pointer transition-colors duration-200 ${
                                    (isSettingsActive || isSettingOpen) ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-indigo-50"
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <IoIosSettings size={22}
                                                   className={isSettingsActive ? "text-indigo-600" : "text-gray-400"}/>
                                    <span className="text-sm font-semibold">Setting</span>
                                </div>
                                <div className="text-gray-400">
                                    {isSettingOpen ? <IoIosArrowUp size={14}/> : <IoIosArrowDown size={14}/>}
                                </div>
                            </li>

                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${isSettingOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                                <ul className="flex flex-col gap-1">
                                    <Link to="/dashboard-settings-rate" onClick={handleMenuClick}>
                                        <li className={childNavStyle("/dashboard-settings-rate")}>Exchange Rate</li>
                                    </Link>
                                    <Link to="/dashboard-settings-user" onClick={handleMenuClick}>
                                        <li className={childNavStyle("/dashboard-settings-user")}>User Settings</li>
                                    </Link>
                                    <Link to="/dashboard-settings-system" onClick={handleMenuClick}>
                                        <li className={childNavStyle("/dashboard-settings-system")}>System Config</li>
                                    </Link>
                                    <Link to="/dashboard-settings-coupon" onClick={handleMenuClick}>
                                        <li className={childNavStyle("/dashboard-settings-coupon")}>Coupon Codes</li>
                                    </Link>
                                </ul>
                            </div>

                            {/* --- LOGOUT --- */}
                            <div className="mt-6 border-t border-gray-100 pt-4">
                                <button
                                    onClick={onLogoutClick}
                                    className="w-full text-left flex items-center space-x-3 cursor-pointer px-2 py-2 rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                    <MdExitToApp size={22} className="text-gray-400 group-hover:text-red-500"/>
                                    <span className="text-sm font-semibold">Logout</span>
                                </button>
                            </div>

                        </ul>
                    </div>

                    {/* Footer Decor */}
                    <div className="flex items-center space-x-2 px-5 pb-6">
                        <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default SidebarAdmin;