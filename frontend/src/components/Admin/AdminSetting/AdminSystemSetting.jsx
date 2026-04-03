import { useState, useEffect } from "react";
import {
    FaSave, FaServer, FaEnvelope, FaGlobe, FaLock, FaUser, FaKey,
    FaBus, FaHome, FaMapMarkedAlt, FaInfoCircle, FaToggleOn, FaToggleOff,
    FaCreditCard, FaPercentage, FaShip, FaUniversity, FaMoneyBillWave
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";

// [QUAN TRỌNG] Import API lấy dữ liệu
import { getSystemStatusApi } from "../../../api/client/api.js";

import {
    getSmtpConfigApi,
    updateMaintenanceStatusApi,
    updateModulesVisibilityApi,
    updateSmtpConfigApi,
    updateProcessingFeeApi,
    updatePaymentOptionApi
} from "../../../api/client/system.api.js";

const AdminSystemSetting = () => {
    const dispatch = useDispatch();
    const systemStore = useSelector((state) => state.SystemReducer);

    const [maintenanceLoading, setMaintenanceLoading] = useState(false);
    const [modulesLoading, setModulesLoading] = useState(false);
    const [smtpLoading, setSmtpLoading] = useState(false);
    const [feeLoading, setFeeLoading] = useState(false);
    const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // ... (Giữ nguyên các state local config) ...
    const [systemConfig, setSystemConfig] = useState({
        isLive: true,
        maintenanceMessage: "",
        modules: { bus: true, hotel: true, tour: true, about: true, cruise: true }
    });
    const [paymentStatus, setPaymentStatus] = useState({ credit: true, transfer: true });
    const [feeConfig, setFeeConfig] = useState({ creditCardFeePercent: 0, enableCreditCardFee: true });
    const [smtpConfig, setSmtpConfig] = useState({
        host: "smtp.gmail.com", port: 587, username: "", email: "", password: "", fromName: "Booking App"
    });

    // --- 1. FETCH DATA TỪ SERVER KHI VÀO TRANG ---
    // [FIX] Phải gọi API ở đây để cập nhật Redux, nếu không nó sẽ luôn lấy giá trị mặc định (false)
    useEffect(() => {
        const fetchAllSettings = async () => {
            setInitialLoading(true);
            try {
                // 1. Lấy System Status (Payment, Modules, Maintain)
                const resStatus = await getSystemStatusApi();
                if (resStatus && resStatus.success) {
                    // Cập nhật vào Redux Store
                    dispatch({
                        type: "SET_SYSTEM_STATUS",
                        payload: resStatus
                    });
                }

                // 2. Lấy SMTP Config (Dữ liệu nhạy cảm, thường gọi riêng)
                const resSmtp = await getSmtpConfigApi();
                if (resSmtp && (resSmtp.success || resSmtp.data)) {
                    const data = resSmtp.data || resSmtp;
                    setSmtpConfig(prev => ({
                        ...prev,
                        host: data.host || "smtp.gmail.com",
                        port: data.port || 587,
                        username: data.username || "",
                        email: data.email || "",
                        fromName: data.fromName || "",
                        password: "" // Không hiển thị password cũ
                    }));
                }
            } catch (error) {
                console.error("Failed to load settings:", error);
                toast.error("Failed to load settings from server.");
            } finally {
                setInitialLoading(false);
            }
        };

        fetchAllSettings();
    }, [dispatch]);

    // --- 2. SYNC REDUX -> LOCAL STATE (Để hiển thị lên UI) ---
    useEffect(() => {
        if (systemStore) {
            setSystemConfig({
                isLive: systemStore.isLive ?? true,
                maintenanceMessage: systemStore.message || "",
                modules: systemStore.modules || { bus: true, hotel: true, tour: true, about: true, cruise: true }
            });

            // [FIX] Logic cập nhật toggle Payment Methods
            setPaymentStatus({
                credit: systemStore.credit ?? true,   // Dùng ?? để không bỏ qua giá trị false
                transfer: systemStore.transfer ?? true
            });

            // [FIX] Logic cập nhật Fee
            if (systemStore.payment) {
                setFeeConfig({
                    creditCardFeePercent: systemStore.payment.creditCardFeePercent || 0,
                    enableCreditCardFee: systemStore.payment.enableCreditCardFee ?? true
                });
            }
        }
    }, [systemStore]);

    // ... (Phần Handlers và JSX giữ nguyên như cũ của bạn) ...
    // Code handle change, toggle, save functions không cần sửa nếu logic API call đã đúng.
    // ...

    // [Gợi ý] Để ngắn gọn câu trả lời, tôi ẩn phần JSX và Handlers vì chúng không đổi.
    // Logic quan trọng nhất là useEffect gọi API ở trên.

    const handleSmtpChange = (field, value) => setSmtpConfig({ ...smtpConfig, [field]: value });
    const handleSystemChange = (field, value) => setSystemConfig({ ...systemConfig, [field]: value });
    const handleFeeChange = (field, value) => setFeeConfig({ ...feeConfig, [field]: value });

    const toggleModule = (moduleName) => {
        setSystemConfig(prev => ({
            ...prev,
            modules: { ...prev.modules, [moduleName]: !prev.modules[moduleName] }
        }));
    };
    const toggleMaintenanceLocal = () => setSystemConfig(prev => ({ ...prev, isLive: !prev.isLive }));
    const toggleFeeEnabled = () => setFeeConfig(prev => ({ ...prev, enableCreditCardFee: !prev.enableCreditCardFee }));
    const togglePaymentMethodLocal = (method) => setPaymentStatus(prev => ({ ...prev, [method]: !prev[method] }));

    const handleSaveMaintenance = async () => {
        setMaintenanceLoading(true);
        try {
            const res = await updateMaintenanceStatusApi({
                isLive: systemConfig.isLive,
                message: systemConfig.maintenanceMessage
            });
            if (res && (res.success || res.message)) {
                toast.success(systemConfig.isLive ? "Website is now Live" : "Switched to Maintenance Mode");
                dispatch({
                    type: "SET_SYSTEM_STATUS",
                    payload: { ...systemStore, isLive: systemConfig.isLive, message: systemConfig.maintenanceMessage }
                });
            } else {
                toast.error(res?.message || "Save failed");
            }
        } catch (error) {
            toast.error("Error saving system status!");
        } finally {
            setMaintenanceLoading(false);
        }
    };

    const handleSaveModules = async () => {
        setModulesLoading(true);
        try {
            const res = await updateModulesVisibilityApi({ modules: systemConfig.modules });
            if (res && (res.success || res.message)) {
                toast.success("Module visibility settings updated!");
                dispatch({
                    type: "SET_SYSTEM_STATUS",
                    payload: { ...systemStore, modules: systemConfig.modules }
                });
            } else {
                toast.error(res?.message || "Save failed");
            }
        } catch (error) {
            toast.error("Error saving module settings!");
        } finally {
            setModulesLoading(false);
        }
    };

    const handleSavePaymentStatus = async () => {
        setPaymentStatusLoading(true);
        try {
            const res = await updatePaymentOptionApi({
                credit: paymentStatus.credit,
                transfer: paymentStatus.transfer
            });

            if (res && res.success) {
                toast.success("Payment availability updated!");
                dispatch({
                    type: "SET_SYSTEM_STATUS",
                    // Quan trọng: Payload phải match với SystemReducer
                    payload: { ...systemStore, credit: paymentStatus.credit, transfer: paymentStatus.transfer }
                });
            } else {
                toast.error(res?.message || "Save failed");
            }
        } catch (error) {
            toast.error("Error saving payment options!");
        } finally {
            setPaymentStatusLoading(false);
        }
    };

    const handleSaveFee = async () => {
        setFeeLoading(true);
        try {
            const res = await updateProcessingFeeApi({
                creditCardFeePercent: feeConfig.creditCardFeePercent,
                enableCreditCardFee: feeConfig.enableCreditCardFee
            });
            if (res && (res.success || res.message)) {
                toast.success("Processing fee settings updated!");
                dispatch({
                    type: "SET_SYSTEM_STATUS",
                    payload: {
                        ...systemStore,
                        payment: {
                            creditCardFeePercent: feeConfig.creditCardFeePercent,
                            enableCreditCardFee: feeConfig.enableCreditCardFee
                        }
                    }
                });
            } else {
                toast.error(res?.message || "Save failed");
            }
        } catch (error) {
            toast.error("Error saving fee settings!");
        } finally {
            setFeeLoading(false);
        }
    };

    const handleSaveSmtp = async () => {
        setSmtpLoading(true);
        try {
            const res = await updateSmtpConfigApi(smtpConfig);
            if (res && (res.success || res.message)) {
                toast.success("SMTP configuration updated successfully!");
            } else {
                toast.error(res?.message || "Save failed");
            }
        } catch (error) {
            toast.error("Error saving Email configuration!");
        } finally {
            setSmtpLoading(false);
        }
    };

    return (
        <div className="max-w-full w-full max-h-screen mx-auto mt-2 p-6 mx-4 lg:p-10 bg-white shadow-2xl shadow-indigo-100 rounded-3xl border border-slate-100 min-h-[calc(100vh-3rem)] flex flex-col">
            <div className="mb-8 border-b border-slate-100 pb-6">
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                    <span className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                        <FaServer />
                    </span>
                    System Settings
                </h2>
                <p className="text-slate-500 text-base mt-2 font-medium">
                    Manage Website status, Menu visibility, Payment Options, and Email Server.
                </p>
            </div>

            <div className="flex-1 space-y-8 pr-2 overflow-y-auto custom-scrollbar">
                {/* Phần loading khi chưa có dữ liệu quan trọng */}
                {initialLoading ? (
                    <div className="text-center py-10 text-slate-400">Loading configuration...</div>
                ) : (
                    <>
                        {/* 1. Website Status */}
                        <div className="p-6 border border-slate-200 rounded-2xl bg-slate-50/30 hover:border-indigo-200 transition-all flex flex-col">
                            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <FaGlobe className="text-indigo-500" /> Website Status
                            </h3>
                            <div className="flex flex-col md:flex-row gap-6 mb-6">
                                <div className="md:w-1/3 flex flex-col justify-center">
                                    <div className="flex items-center gap-4 mb-2">
                                        <button onClick={toggleMaintenanceLocal} className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${systemConfig.isLive ? 'bg-green-500' : 'bg-red-500'}`}>
                                            <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 transform ${systemConfig.isLive ? 'translate-x-8' : 'translate-x-0'}`}></span>
                                        </button>
                                        <span className={`font-bold text-lg ${systemConfig.isLive ? 'text-green-600' : 'text-red-500'}`}>{systemConfig.isLive ? "WEBSITE LIVE" : "MAINTENANCE"}</span>
                                    </div>
                                    <p className="text-xs text-slate-400">Click "Save Status" to apply this change.</p>
                                </div>
                                <div className="md:w-2/3">
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Maintenance Message</label>
                                    <textarea rows={3} value={systemConfig.maintenanceMessage} onChange={(e) => handleSystemChange("maintenanceMessage", e.target.value)} placeholder="Enter the notification content..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-700" />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button onClick={handleSaveMaintenance} disabled={maintenanceLoading} className={`flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95 ${maintenanceLoading ? "opacity-70 cursor-not-allowed" : ""}`}>
                                    {maintenanceLoading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <FaSave />} Save Status
                                </button>
                            </div>
                        </div>

                        {/* 2. Modules */}
                        <div className="p-6 border border-slate-200 rounded-2xl bg-white hover:border-indigo-200 transition-all">
                            <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2"><FaToggleOn className="text-indigo-500" /> Module Visibility (Menu Control)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                                {Object.keys(systemConfig.modules).map((key) => (
                                    <div key={key} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between hover:shadow-sm transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
                                                {key === 'bus' && <FaBus />} {key === 'hotel' && <FaHome />} {key === 'tour' && <FaMapMarkedAlt />} {key === 'about' && <FaInfoCircle />} {key === 'cruise' && <FaShip />}
                                            </div>
                                            <span className="font-semibold text-slate-700 capitalize">{key === 'hotel' ? 'Accommodations' : key === 'bus' ? 'Bus Tickets' : key === 'tour' ? 'Tours' : key === 'about' ? 'About Us' : key === 'cruise' ? 'Cruises' : key}</span>
                                        </div>
                                        <button onClick={() => toggleModule(key)} className={`text-2xl transition-colors ${systemConfig.modules[key] ? 'text-green-500' : 'text-slate-300'}`}>{systemConfig.modules[key] ? <FaToggleOn /> : <FaToggleOff />}</button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button onClick={handleSaveModules} disabled={modulesLoading} className={`flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95 ${modulesLoading ? "opacity-70 cursor-not-allowed" : ""}`}>
                                    {modulesLoading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <FaSave />} Save Display Header
                                </button>
                            </div>
                        </div>

                        {/* 3. Payment */}
                        <div className="p-6 border border-slate-200 rounded-2xl bg-white hover:border-indigo-200 transition-all">
                            <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2"><FaMoneyBillWave className="text-indigo-500" /> Payment System Settings</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-4 border-b border-slate-200 pb-2">Available Payment Methods</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3"><div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><FaCreditCard /></div><span className="font-bold text-slate-700">Credit Card (Online)</span></div>
                                            <button onClick={() => togglePaymentMethodLocal('credit')} className={`text-3xl transition-colors ${paymentStatus.credit ? 'text-green-500' : 'text-slate-300'}`}>{paymentStatus.credit ? <FaToggleOn /> : <FaToggleOff />}</button>
                                        </div>
                                        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FaUniversity /></div><span className="font-bold text-slate-700">Bank Transfer</span></div>
                                            <button onClick={() => togglePaymentMethodLocal('transfer')} className={`text-3xl transition-colors ${paymentStatus.transfer ? 'text-green-500' : 'text-slate-300'}`}>{paymentStatus.transfer ? <FaToggleOn /> : <FaToggleOff />}</button>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-right">
                                        <button onClick={handleSavePaymentStatus} disabled={paymentStatusLoading} className="text-sm bg-slate-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-900 transition-all">{paymentStatusLoading ? "Saving..." : "Save Availability"}</button>
                                    </div>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-4 border-b border-slate-200 pb-2">Extra Processing Fees</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-700">Enable Credit Card Fee</span><button onClick={toggleFeeEnabled} className={`text-2xl transition-colors ${feeConfig.enableCreditCardFee ? 'text-green-500' : 'text-slate-300'}`}>{feeConfig.enableCreditCardFee ? <FaToggleOn /> : <FaToggleOff />}</button></div>
                                        <div className={!feeConfig.enableCreditCardFee ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5">FEE PERCENTAGE (%)</label>
                                            <div className="relative group/fee">
                                                <FaPercentage className="absolute top-3.5 left-4 text-slate-400" />
                                                <input type="number" min="0" max="100" value={feeConfig.creditCardFeePercent} onChange={(e) => handleFeeChange("creditCardFeePercent", e.target.value)} placeholder="Example: 3" className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-10 text-right">
                                        <button onClick={handleSaveFee} disabled={feeLoading} className="text-sm bg-slate-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-900 transition-all">{feeLoading ? "Saving..." : "Save Fee Settings"}</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. SMTP */}
                        <div className="p-6 border border-slate-200 rounded-2xl bg-white hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                            {/* ... SMTP Section (Giữ nguyên) ... */}
                            <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2"><FaEnvelope className="text-indigo-500" /> Email Configuration (SMTP Gmail)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">SMTP Host</label><input type="text" value={smtpConfig.host} onChange={(e) => handleSmtpChange("host", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Port</label><input type="number" value={smtpConfig.port} onChange={(e) => handleSmtpChange("port", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" /></div>
                                <div className="md:col-span-2 mt-2"><h4 className="text-sm font-bold text-indigo-600 uppercase border-b border-indigo-100 pb-2 mb-4">Authentication Info</h4></div>
                                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">SMTP Username</label><div className="relative group/user"><FaKey className="absolute top-4 left-4 text-slate-400" /><input type="text" value={smtpConfig.username} onChange={(e) => handleSmtpChange("username", e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" /></div></div>
                                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">App Password</label><div className="relative group/pass"><FaLock className="absolute top-4 left-4 text-slate-400" /><input type="password" value={smtpConfig.password} onChange={(e) => handleSmtpChange("password", e.target.value)} placeholder="Leave blank to keep current password" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 placeholder-slate-400" /></div></div>
                                <div className="md:col-span-2 mt-2"><h4 className="text-sm font-bold text-indigo-600 uppercase border-b border-indigo-100 pb-2 mb-4">Sender Info</h4></div>
                                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Sender Email</label><div className="relative"><FaEnvelope className="absolute top-4 left-4 text-slate-400" /><input type="email" value={smtpConfig.email} onChange={(e) => handleSmtpChange("email", e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" /></div></div>
                                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Display Name</label><div className="relative"><FaUser className="absolute top-4 left-4 text-slate-400" /><input type="text" value={smtpConfig.fromName} onChange={(e) => handleSmtpChange("fromName", e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" /></div></div>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button onClick={handleSaveSmtp} disabled={smtpLoading} className={`flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all active:scale-95 ${smtpLoading ? "opacity-70 cursor-not-allowed" : ""}`}>
                                    {smtpLoading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <FaSave />} Save Email Configuration
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminSystemSetting;