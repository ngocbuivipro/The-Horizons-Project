import React, { useState, useEffect } from "react";
import {
    FaTag, FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaInfoCircle,
    FaPercentage, FaMoneyBillWave, FaCalendarAlt, FaHashtag, FaLayerGroup, FaClipboardList, FaBan, FaAlignLeft
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { getAllCouponsApi, createCouponApi, updateCouponApi, deleteCouponApi, toggleCouponStatusApi } from "../../../api/client/api.js";
import dayjs from "dayjs";
import { Select, DatePicker, Input, InputNumber, Tooltip } from "antd";

const { Option } = Select;
const { TextArea } = Input;

const AdminCouponSetting = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Initial Form State
    const initialForm = {
        code: "",
        matchType: "EXACT",
        discountType: "PERCENT",
        discountValue: 0,
        minOrderValue: 0,
        maxDiscountAmount: 0,
        usageLimit: 0,
        startDate: null,
        endDate: null,
        description: "",
        isActive: true
    };

    const [formData, setFormData] = useState(initialForm);

    // --- HELPER: Label UI ---
    const Label = ({ icon: Icon, text, tooltip, required, color = "text-indigo-600" }) => (
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                {Icon && <Icon className={color} size={13} />}
                <span>{text} {required && <span className="text-red-500">*</span>}</span>
            </div>
            {tooltip && (
                <Tooltip title={tooltip} placement="top">
                    <span className="cursor-help text-slate-300 hover:text-indigo-500 transition-colors">
                        <FaInfoCircle size={13} />
                    </span>
                </Tooltip>
            )}
        </div>
    );

    // --- API FUNCTIONS ---
    const fetchCoupons = async () => {
        try {
            const res = await getAllCouponsApi();
            if (res.data && res.success) {
                setCoupons(res.data);
            } else {
                toast.error(res.message || "Error loading coupons");
            }
        } catch (error) {
            toast.error("Error loading coupons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleValueChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openModal = (coupon = null) => {
        if (coupon) {
            setEditingId(coupon._id);
            setFormData({
                ...coupon,
                startDate: coupon.startDate ? dayjs(coupon.startDate) : null,
                endDate: coupon.endDate ? dayjs(coupon.endDate) : null,
            });
        } else {
            setEditingId(null);
            setFormData(initialForm);
        }
        setShowModal(true);
    };

    const handleSubmit = async () => {
        setSubmitLoading(true);
        if (!formData.code || formData.discountValue <= 0) {
            toast.error("Please enter Code and Discount Value");
            setSubmitLoading(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                startDate: formData.startDate ? formData.startDate.toISOString() : null,
                endDate: formData.endDate ? formData.endDate.toISOString() : null,
            };

            let res;
            if (editingId) {
                res = await updateCouponApi(editingId, payload);
            } else {
                res = await createCouponApi(payload);
            }

            if (res.data && res.success) {
                toast.success(editingId ? "Updated successfully!" : "Created successfully!");
                setShowModal(false);
                fetchCoupons();
            } else {
                toast.error(res.message || res.data?.message || "Error saving coupon");
            }
        } catch (error) {
            toast.error("Error saving coupon");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                const res = await deleteCouponApi(id);
                if (res.data && res.success) {
                    toast.success("Deleted successfully");
                    fetchCoupons();
                } else {
                    toast.error(res.message || "Error deleting");
                }
            } catch (error) { toast.error("Error deleting"); }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await toggleCouponStatusApi(id);
            if (res.data && res.success) {
                toast.success("Status updated");
                fetchCoupons();
            } else {
                toast.error(res.message || "Error updating status");
            }
        } catch (error) { toast.error("Error updating status"); }
    };

    return (
        // Responsive Container: Padding nhỏ trên mobile (p-4), lớn trên desktop (lg:p-10)
        <div className="max-w-full w-full mx-auto mt-2 p-4 lg:p-10 bg-white shadow-2xl shadow-indigo-100 rounded-3xl border border-slate-100 min-h-[calc(100vh-3rem)] flex flex-col">

            {/* HEADER: Chuyển sang cột (flex-col) trên mobile để không bị vỡ layout */}
            <div className="mb-6 lg:mb-8 border-b border-slate-100 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-800 flex items-center gap-3">
                        <span className="p-2 lg:p-3 bg-indigo-100 text-indigo-600 rounded-xl"><FaTag /></span>
                        Coupon Management
                    </h2>
                </div>
                {/* Button full width trên mobile */}
                <button onClick={() => openModal()} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all">
                    <FaPlus /> Add Coupon
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="text-center py-10 text-slate-400">Loading...</div>
                ) : (
                    <>
                        {/* === MOBILE VIEW: CARD LIST (< 768px) === */}
                        <div className="md:hidden space-y-4 pb-20"> {/* pb-20 để tránh bị nút ở góc che nếu có */}
                            {coupons.map((coupon) => (
                                <div key={coupon._id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">

                                    {/* Decorative background circle */}
                                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full opacity-50 pointer-events-none"></div>

                                    {/* Card Header: Code & Status */}
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div>
                                            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                                {coupon.code}
                                                {coupon.matchType === 'PREFIX' && (
                                                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                            Prefix
                                        </span>
                                                )}
                                            </h3>
                                            <div className="text-indigo-600 font-bold text-xl mt-1">
                                                {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}% OFF` : `-${coupon.discountValue.toLocaleString()} đ`}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggleStatus(coupon._id)}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-full border ${coupon.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                                        >
                                            {coupon.isActive ? "Active" : "Inactive"}
                                        </button>
                                    </div>

                                    {/* Card Body: Info Grid */}
                                    <div className="grid grid-cols-2 gap-y-3 text-sm text-slate-500 mb-4 bg-slate-50/50 p-3 rounded-xl border border-slate-50">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400 uppercase font-bold">Usage</span>
                                            <span className="font-semibold text-slate-700">
                                    {coupon.usageLimit > 0 ? `${coupon.usedCount} / ${coupon.usageLimit}` : `${coupon.usedCount} (∞)`}
                                </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400 uppercase font-bold">Min Order</span>
                                            <span className="font-semibold text-slate-700">
                                    {coupon.minOrderValue ? `${coupon.minOrderValue.toLocaleString()} đ` : '0 đ'}
                                </span>
                                        </div>
                                    </div>

                                    {/* Card Footer: Actions */}
                                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-3">
                                        <button
                                            onClick={() => handleDelete(coupon._id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-500 bg-red-50 rounded-lg font-semibold text-sm hover:bg-red-100 transition-colors"
                                        >
                                            <FaTrash size={14} /> Delete
                                        </button>
                                        <button
                                            onClick={() => openModal(coupon)}
                                            className="flex-[2] flex items-center justify-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-lg font-bold text-sm shadow-indigo-200 shadow-md hover:bg-indigo-700 active:scale-95 transition-all"
                                        >
                                            <FaEdit size={14} /> Edit Coupon
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* === DESKTOP VIEW: TABLE (>= 768px) === */}
                        <div className="hidden md:block bg-white rounded-xl border border-slate-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="text-xs font-bold text-slate-500 uppercase border-b border-slate-200 bg-slate-50/50">
                                    <th className="px-6 py-4">Code</th>
                                    <th className="px-6 py-4">Value</th>
                                    <th className="px-6 py-4">Usage</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {coupons.map((coupon) => (
                                    <tr key={coupon._id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">{coupon.code}</div>
                                            {coupon.matchType === 'PREFIX' && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">PREFIX</span>}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-indigo-600">
                                            {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}%` : `${coupon.discountValue.toLocaleString()} đ`}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {coupon.usageLimit > 0 ? `${coupon.usedCount} / ${coupon.usageLimit}` : `${coupon.usedCount} (∞)`}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleToggleStatus(coupon._id)} className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${coupon.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                                {coupon.isActive ? "Active" : "Inactive"}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openModal(coupon)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><FaEdit /></button>
                                                <button onClick={() => handleDelete(coupon._id)} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"><FaTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
            {/* === RESPONSIVE MODAL === */}
            {/* === RESPONSIVE MODAL FIX === */}
            {showModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
                    {/* FIX:
           1. max-h-[85vh]: Giới hạn chiều cao để không bị che bởi thanh địa chỉ trình duyệt mobile
           2. flex flex-col: Để chia bố cục dọc
        */}
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[65vh] sm:max-h-[80vh] flex flex-col overflow-hidden relative">

                        {/* --- HEADER (Cố định) --- */}
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 z-10">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    {editingId ? <FaEdit className="text-indigo-600" /> : <FaPlus className="text-indigo-600" />}
                                    {editingId ? "Update Coupon" : "Create Coupon"}
                                </h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all">
                                <FaTimes />
                            </button>
                        </div>

                        {/* --- BODY (Cuộn độc lập) --- */}
                        {/* FIX:
               1. overflow-y-auto: Chỉ cuộn vùng này
               2. flex-1: Chiếm toàn bộ không gian còn lại giữa Header và Footer
               3. p-5: Padding nhỏ hơn chút cho mobile đỡ tốn diện tích
            */}
                        <div className="p-5 overflow-y-auto custom-scrollbar bg-white flex-1 min-h-0">

                            {/* 1. Code & Match Type */}
                            {/* Giảm gap và mb để tiết kiệm diện tích dọc */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <Label icon={FaHashtag} text="Code" required />
                                    <Input
                                        name="code" value={formData.code} onChange={handleInputChange}
                                        placeholder="e.g. SUMMER25" size="large"
                                        className="font-semibold text-slate-700 placeholder-slate-300 uppercase"
                                    />
                                </div>
                                <div>
                                    <Label icon={FaLayerGroup} text="Match Type" />
                                    <Select
                                        value={formData.matchType} onChange={(val) => handleValueChange("matchType", val)}
                                        size="large" className="w-full"
                                    >
                                        <Option value="EXACT">Exact Match</Option>
                                        <Option value="PREFIX">First 3 Characters</Option>
                                    </Select>
                                </div>
                            </div>

                            {/* 2. VALUE STRATEGY BOX */}
                            <div className="relative border border-indigo-100 bg-indigo-50/50 rounded-xl p-4 mb-6">
                                <div className="absolute top-0 left-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg rounded-tl-lg shadow-sm tracking-wide">
                                    STRATEGY
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"> {/* mt-4 để tránh badge */}
                                    <div className="md:col-span-1">
                                        <Label icon={FaTag} text="Type" color="text-indigo-500" />
                                        <Select
                                            value={formData.discountType} onChange={(val) => handleValueChange("discountType", val)}
                                            size="large" className="w-full"
                                        >
                                            <Option value="PERCENT">Percent (%)</Option>
                                            <Option value="FIXED">Fixed (₫)</Option>
                                        </Select>
                                    </div>

                                    <div className="md:col-span-1">
                                        <Label icon={FaPercentage} text="Value" required color="text-indigo-500" />
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            value={formData.discountValue} onChange={(val) => handleValueChange("discountValue", val)}
                                            size="large" className="w-full font-bold text-slate-800" min={0}
                                            suffix={formData.discountType === 'PERCENT' ? <span className="text-slate-400">%</span> : null}
                                            prefix={formData.discountType === 'FIXED' ? <span className="text-slate-400 text-xs">₫</span> : null}
                                        />
                                    </div>

                                    <div className="md:col-span-1">
                                        <Label icon={FaBan} text="Max Desc" tooltip="Dùng để chặn max giảm giá. Ví dụ giảm 10% nhưng tối đa chỉ giảm 500k." color="text-indigo-500" />
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            disabled={formData.discountType !== 'PERCENT'}
                                            value={formData.maxDiscountAmount} onChange={(val) => handleValueChange("maxDiscountAmount", val)}
                                            size="large" className={`w-full ${formData.discountType !== 'PERCENT' ? 'opacity-50 bg-slate-100' : ''}`}
                                            min={0} placeholder="0"
                                            prefix={<span className="text-slate-400 text-xs">₫</span>}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. Conditions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    {/*<Label icon={FaMoneyBillWave} text="Min Order" />*/}
                                    <Label icon={FaMoneyBillWave} text="Min Order" tooltip="Giá trị đơn hàng tối thiểu" color="text-indigo-500" />
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        value={formData.minOrderValue} onChange={(val) => handleValueChange("minOrderValue", val)}
                                        size="large" className="w-full" min={0} placeholder="0"
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        prefix={<span className="text-slate-400 text-xs">₫</span>}
                                    />
                                </div>
                                <div>
                                    <Label icon={FaClipboardList} text="Usage Limit" />
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        value={formData.usageLimit} onChange={(val) => handleValueChange("usageLimit", val)}
                                        size="large" className="w-full" min={0} placeholder="Unlimited"
                                    />
                                </div>
                            </div>

                            {/* 4. Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <Label icon={FaCalendarAlt} text="Start Date" />
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        value={formData.startDate} onChange={(date) => handleValueChange("startDate", date)}
                                        size="large" className="w-full" format="DD/MM/YYYY" placeholder="DD/MM/YYYY"
                                    />
                                </div>
                                <div>
                                    <Label icon={FaCalendarAlt} text="End Date" />
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        value={formData.endDate} onChange={(date) => handleValueChange("endDate", date)}
                                        size="large" className="w-full" format="DD/MM/YYYY" placeholder="DD/MM/YYYY"
                                    />
                                </div>
                            </div>

                            {/* 5. Note */}
                            <div className="mb-2"> {/* Margin bottom nhỏ cuối cùng */}
                                <Label icon={FaAlignLeft} text="Note" />
                                <TextArea
                                    value={formData.description} onChange={handleInputChange} name="description"
                                    rows={2} placeholder="Internal notes..." className="bg-white"
                                />
                            </div>
                        </div>

                        {/* --- FOOTER (Cố định ở đáy) --- */}

                        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <button onClick={() => setShowModal(false)} className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all">
                                Cancel
                            </button>
                            <button onClick={handleSubmit} disabled={submitLoading} className="w-full sm:w-auto px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95 transition-all">
                                {submitLoading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/>}
                                <FaSave /> {editingId ? "Update" : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCouponSetting;