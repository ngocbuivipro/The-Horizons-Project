import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { LuShoppingCart } from "react-icons/lu";
import { IoMenu, IoClose } from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import { FiUser, FiLogOut, FiLogIn, FiUserPlus } from "react-icons/fi";
import WishList from "../WishList/WishList.jsx";
import { logoutUserApi } from "../../../api/client/api.js";
import { logoutUserAction } from "../../../redux/actions/UserAction.js";
import toast from "react-hot-toast";

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // UI Local State
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openWishList, setOpenWishList] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Redux State
    const { modules, loading } = useSelector(state => state.SystemReducer);
    const { isAdmin } = useSelector(state => state.AdminReducer);
    const { isAuthenticated, user } = useSelector(state => state.UserReducer);

    // Scroll Effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Lock body scroll when mobile menu open
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    }, [mobileMenuOpen]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logoutUserApi();
        } catch { /* ignore */ }
        localStorage.removeItem("accessToken");
        dispatch(logoutUserAction());
        toast.success("Đã đăng xuất!");
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
        navigate("/");
    };

    // Nav styles
    const desktopNavStyle = ({ isActive }) =>
        `text-sm font-bold px-4 py-2.5 rounded-full transition-all duration-200 ${isActive
            ? "text-blue-600 bg-gray-100"
            : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
        }`;

    const mobileNavStyle = ({ isActive }) =>
        `flex items-center justify-between w-full py-4 text-[15px] font-medium transition-all border-b border-gray-100 ${isActive ? "text-red-500" : "text-gray-600 hover:text-blue-600"
        }`;

    const NavSkeleton = () => (
        <div className="flex items-center gap-2 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-9 w-24 bg-gray-100 rounded-full" />
            ))}
        </div>
    );

    const isSystemReady = modules && !loading;

    const getInitials = () => {
        if (!user?.username) return "U";
        return user.username.charAt(0).toUpperCase();
    };

    return (
        <>
            {/* ===== HEADER BAR ===== */}
            <header
                className={`fixed top-0 left-0 right-0 z-[100] bg-white transition-all duration-300 ${scrolled ? "shadow-md py-3 border-b border-gray-200" : "py-4 border-b border-gray-100"
                    }`}
            >
                <div className="w-11/12 mx-auto flex items-center justify-between h-12">

                    {/* LOGO */}
                    <NavLink to="/" className="flex items-center gap-2 z-50 shrink-0">
                        <img src="/thehorizons_logo.png" alt="The Horizons" className="w-9 h-9 object-contain" />
                        <span className="font-extrabold text-xl text-green-800 tracking-tight hidden sm:block">THE HORIZONS</span>
                    </NavLink>

                    {/* DESKTOP NAV */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {!isSystemReady ? <NavSkeleton /> : (
                            <>
                                {isAdmin && <NavLink className={desktopNavStyle} to="/dashboard">Dashboard</NavLink>}
                                {(modules?.hotel || isAdmin) && <NavLink className={desktopNavStyle} to="/homes">Accommodations</NavLink>}
                                {(modules?.car || isAdmin) && <NavLink className={desktopNavStyle} to="/transfers">Car Transfer</NavLink>}
                                {(modules?.bus || isAdmin) && <NavLink className={desktopNavStyle} to="/bus">Bus Tickets</NavLink>}
                                {(modules?.cruise || isAdmin) && <NavLink className={desktopNavStyle} to="/cruises">Cruises</NavLink>}
                                {(modules?.tour || isAdmin) && <NavLink className={desktopNavStyle} to="/tours">Tours</NavLink>}
                                {(modules?.about || isAdmin) && <NavLink className={desktopNavStyle} to="/about">About Us</NavLink>}
                            </>
                        )}
                    </nav>

                    {/* RIGHT ACTIONS */}
                    <div className="flex items-center gap-2 shrink-0">

                        {/* Cart */}
                        <button
                            className="relative p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-blue-600"
                            onClick={() => navigate("/order-list")}
                        >
                            <LuShoppingCart className="text-xl" />
                        </button>

                        {/* ── USER AUTH WIDGET (Desktop only) ── */}
                        <div className="relative hidden lg:block" ref={dropdownRef}>
                            {isAuthenticated ? (
                                <>
                                    {/* Avatar + name button */}
                                    <button
                                        onClick={() => setUserDropdownOpen(v => !v)}
                                        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 hover:border-emerald-400 hover:shadow-sm transition-all duration-200 group"
                                    >
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt="avatar"
                                                className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-200"
                                            />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                                                {getInitials()}
                                            </div>
                                        )}
                                        <span className="text-sm font-semibold text-gray-700 max-w-[80px] truncate group-hover:text-emerald-600">
                                            {user?.username || "Tài khoản"}
                                        </span>
                                    </button>

                                    {/* Dropdown menu */}
                                    {userDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Đăng nhập với</p>
                                                <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{user?.email}</p>
                                            </div>
                                            <button
                                                onClick={() => { navigate("/profile"); setUserDropdownOpen(false); }}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                            >
                                                <FiUser className="text-emerald-500 flex-shrink-0" />
                                                Trang cá nhân
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100"
                                            >
                                                <FiLogOut className="flex-shrink-0" />
                                                Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <button
                                    onClick={() => navigate("/login", { state: { from: location.pathname + location.search } })}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-semibold transition-all duration-200 shadow-sm shadow-emerald-200"
                                >
                                    <FiLogIn />
                                    Login
                                </button>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="lg:hidden text-blue-600 p-2 focus:outline-none"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <IoMenu size={26} />
                        </button>
                    </div>
                </div>
            </header>

            {/* ===== MOBILE OVERLAY ===== */}
            <div
                className={`fixed inset-0 bg-black/50 z-[101] transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* ===== MOBILE SIDEBAR ===== */}
            <div
                className={`fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white z-[102] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Sidebar header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <img src="/thehorizons_logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                        <span className="font-bold text-xl text-gray-800">The Horizons</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* ── Mobile User Card ── */}
                    <div className="px-5 pt-4 pb-2">
                        {isAuthenticated ? (
                            <div className="bg-emerald-50 rounded-xl p-3.5 flex items-center justify-between border border-emerald-100">
                                <div className="flex items-center gap-3">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-300" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                                            {getInitials()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">{user?.username}</p>
                                        <p className="text-xs text-gray-400 truncate max-w-[130px]">{user?.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-full hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"
                                    title="Đăng xuất"
                                >
                                    <FiLogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { navigate("/login", { state: { from: location.pathname + location.search } }); setMobileMenuOpen(false); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors shadow-sm"
                                >
                                    <FiLogIn /> Login
                                </button>
                                <button
                                    onClick={() => { navigate("/register"); setMobileMenuOpen(false); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-emerald-400 text-emerald-600 font-semibold text-sm hover:bg-emerald-50 transition-colors"
                                >
                                    <FiUserPlus /> Register
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── Mobile Nav ── */}
                    <nav className="flex flex-col px-5 mt-2">
                        {!isSystemReady ? (
                            <div className="space-y-4 py-4 animate-pulse">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-6 bg-gray-100 rounded w-full" />)}
                            </div>
                        ) : (
                            <>
                                {isAdmin && (
                                    <NavLink className={mobileNavStyle} to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                        <span>Dashboard</span><span className="text-gray-300 text-lg">›</span>
                                    </NavLink>
                                )}
                                {(modules?.hotel || isAdmin) && (
                                    <NavLink className={mobileNavStyle} to="/homes" onClick={() => setMobileMenuOpen(false)}>
                                        <span>Accommodations</span><span className="text-gray-300 text-lg">›</span>
                                    </NavLink>
                                )}
                                {(modules?.car || isAdmin) && (
                                    <NavLink className={mobileNavStyle} to="/transfers" onClick={() => setMobileMenuOpen(false)}>
                                        <span>Car Transfer</span><span className="text-gray-300 text-lg">›</span>
                                    </NavLink>
                                )}
                                {(modules?.bus || isAdmin) && (
                                    <NavLink className={mobileNavStyle} to="/bus" onClick={() => setMobileMenuOpen(false)}>
                                        <span>Bus Tickets</span><span className="text-gray-300 text-lg">›</span>
                                    </NavLink>
                                )}
                                {(modules?.cruise || isAdmin) && (
                                    <NavLink className={mobileNavStyle} to="/cruises" onClick={() => setMobileMenuOpen(false)}>
                                        <span>Cruises</span><span className="text-gray-300 text-lg">›</span>
                                    </NavLink>
                                )}
                                {(modules?.tour || isAdmin) && (
                                    <NavLink className={mobileNavStyle} to="/tours" onClick={() => setMobileMenuOpen(false)}>
                                        <span>Tours</span><span className="text-gray-300 text-lg">›</span>
                                    </NavLink>
                                )}
                                {(modules?.about || isAdmin) && (
                                    <NavLink className={mobileNavStyle} to="/about" onClick={() => setMobileMenuOpen(false)}>
                                        <span>About Us</span><span className="text-gray-300 text-lg">›</span>
                                    </NavLink>
                                )}
                                {isAuthenticated && (
                                    <NavLink className={mobileNavStyle} to="/profile" onClick={() => setMobileMenuOpen(false)}>
                                        <span>Trang cá nhân</span><FiUser className="text-gray-400" />
                                    </NavLink>
                                )}
                            </>
                        )}
                    </nav>
                </div>
            </div>

            {/* ===== WISHLIST DRAWER ===== */}
            {openWishList && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[110]" onClick={() => setOpenWishList(false)}>
                    <div
                        className="absolute right-0 top-0 h-full w-full md:w-[400px] bg-white shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <WishList setOpenWishList={setOpenWishList} />
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;