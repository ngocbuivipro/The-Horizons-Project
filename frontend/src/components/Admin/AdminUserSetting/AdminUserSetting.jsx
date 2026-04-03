import React, { useState, useEffect } from "react";
import { FaUserPlus, FaTrash, FaUserShield, FaPhone, FaEnvelope, FaEdit } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import { toast } from "react-hot-toast";
import axios from "axios";
import {getUserSettingApi} from "../../../api/client/system.api.js";

const AdminUserSetting = () => {
    // --- STATE ---
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const BASE_URL = import.meta.env.VITE_BASE_URI;

    // State form thêm mới
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        phoneNumber: ""
    });

    // --- 1. FETCH ALL ADMINS ---
    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const res = await getUserSettingApi();
            console.log("res: ", res)
            if (res.success) {
                setAdmins(res.data);
            } else {
                toast.error("Không thể tải danh sách Admin");
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi kết nối Server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    // --- 2. HANDLE CREATE ---
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.email || !formData.password) {
            return toast.error("Vui lòng điền đủ thông tin bắt buộc");
        }
        try {
            const res = await axios.post(`${BASE_URL}/admin`, formData, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                setIsModalOpen(false);
                setFormData({ username: "", email: "", password: "", phoneNumber: "" });
                fetchAdmins();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Lỗi khi tạo Admin");
        }
    };

    // --- 3. HANDLE DELETE ---
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa Admin này?")) return;
        try {
            const res = await axios.delete(`${BASE_URL}/admin/${id}`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                setAdmins(prev => prev.filter(admin => admin._id !== id));
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Không thể xóa Admin này");
        }
    };

    // --- 4. HANDLE EDIT ---
    const handleEdit = (admin) => {
        setEditingAdmin(admin);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingAdmin) return;
        try {
            const res = await axios.put(`${BASE_URL}/admin/${editingAdmin._id}`, editingAdmin, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                setIsEditModalOpen(false);
                setAdmins(prev => prev.map(admin => admin._id === editingAdmin._id ? res.data.data : admin));
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Lỗi khi cập nhật Admin");
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleEditChange = (e) => setEditingAdmin({ ...editingAdmin, [e.target.name]: e.target.value });

    return (
        // Container: Giảm padding trên mobile (p-4) tăng dần lên (lg:p-10)
        <div className="w-full mx-auto p-4 md:p-6 lg:p-10 bg-white shadow-xl md:shadow-2xl shadow-indigo-100 rounded-2xl md:rounded-3xl border border-slate-100 min-h-[calc(100vh-3rem)] flex flex-col relative">

            {/* --- HEADER --- */}
            <div className="mb-6 md:mb-8 border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <span className="p-2 md:p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <FaUserShield size={20} className="md:w-6 md:h-6" />
                        </span>
                        Quản lý Admin
                    </h2>
                    <p className="text-slate-500 text-sm md:text-base mt-2 font-medium">
                        Danh sách tài khoản quản trị viên hệ thống.
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-[1.02] transition-all active:scale-95"
                >
                    <FaUserPlus /> Thêm Admin mới
                </button>
            </div>

            {/* --- RESPONSIVE TABLE (TABLE TO CARD) --- */}
            <div className="flex-1">
                <table className="w-full text-left border-collapse">
                    {/* Ẩn Header trên mobile */}
                    <thead className="hidden md:table-header-group">
                    <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="py-4 pl-2">Admin Info</th>
                        <th className="py-4">Liên hệ</th>
                        <th className="py-4">Vai trò</th>
                        <th className="py-4 text-center">Hành động</th>
                    </tr>
                    </thead>

                    <tbody className="block md:table-row-group space-y-4 md:space-y-0">
                    {loading ? (
                        <tr className="block md:table-row"><td colSpan="4" className="text-center py-8 text-slate-400 block md:table-cell">Đang tải dữ liệu...</td></tr>
                    ) : admins.length === 0 ? (
                        <tr className="block md:table-row"><td colSpan="4" className="text-center py-8 text-slate-400 block md:table-cell">Chưa có admin nào.</td></tr>
                    ) : (
                        admins.map((admin) => (
                            <tr
                                key={admin._id}
                                // Mobile: Border, Shadow, Rounded để tạo thành Card. Desktop: Table Row bình thường
                                className="block md:table-row bg-white md:bg-transparent border border-slate-200 md:border-0 rounded-xl md:rounded-none shadow-sm md:shadow-none hover:bg-slate-50 transition-colors group relative overflow-hidden md:overflow-visible"
                            >
                                {/* Info */}
                                <td className="block md:table-cell p-4 md:py-4 md:pl-2 border-b md:border-b-0 border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
                                            {admin.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <span className="md:hidden text-xs font-bold text-slate-400 uppercase block mb-1">Tài khoản</span>
                                            <p className="font-bold text-slate-700 break-all">{admin.username}</p>
                                        </div>
                                    </div>
                                </td>

                                {/* Contact */}
                                <td className="block md:table-cell p-4 md:py-4 border-b md:border-b-0 border-slate-50">
                                    <span className="md:hidden text-xs font-bold text-slate-400 uppercase block mb-2">Liên hệ</span>
                                    <div className="flex flex-col gap-2 md:gap-1 text-sm text-slate-600">
                                        <span className="flex items-center gap-2"><FaEnvelope className="text-slate-400 shrink-0"/> <span className="break-all">{admin.email}</span></span>
                                        {admin.phoneNumber && (
                                            <span className="flex items-center gap-2"><FaPhone className="text-slate-400 shrink-0"/> {admin.phoneNumber}</span>
                                        )}
                                    </div>
                                </td>

                                {/* Role */}
                                <td className="block md:table-cell p-4 md:py-4 border-b md:border-b-0 border-slate-50">
                                    <div className="flex justify-between md:justify-start items-center">
                                        <span className="md:hidden text-xs font-bold text-slate-400 uppercase">Vai trò</span>
                                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                                                Admin
                                            </span>
                                    </div>
                                </td>

                                {/* Action */}
                                <td className="block md:table-cell p-4 md:py-4 text-right md:text-center bg-slate-50 md:bg-transparent">
                                    <div className="flex justify-end md:justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(admin)}
                                            className="p-2 bg-white md:bg-transparent border md:border-0 border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all shadow-sm md:shadow-none"
                                            title="Chỉnh sửa"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(admin._id)}
                                            className="p-2 bg-white md:bg-transparent border md:border-0 border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shadow-sm md:shadow-none"
                                            title="Xóa"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL CREATE --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">Tạo Admin mới</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition"><RxCross1 /></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Username <span className="text-red-500">*</span></label>
                                <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Số điện thoại</label>
                                <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all">Xác nhận tạo mới</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL EDIT --- */}
            {isEditModalOpen && editingAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">Chỉnh sửa Admin</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition"><RxCross1 /></button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
                                <input type="text" name="username" value={editingAdmin.username} onChange={handleEditChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                                <input type="email" name="email" value={editingAdmin.email} onChange={handleEditChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Số điện thoại</label>
                                <input type="text" name="phoneNumber" value={editingAdmin.phoneNumber} onChange={handleEditChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all">Lưu thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserSetting;