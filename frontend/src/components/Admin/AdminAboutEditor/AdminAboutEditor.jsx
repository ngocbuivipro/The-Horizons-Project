import React, { useState, useEffect } from "react";
// React Icons
import { FaSave, FaPenFancy, FaImage,  FaInfoCircle, FaHeading, FaListUl, FaChartBar, FaQuoteRight } from "react-icons/fa";

// Ant Design Imports
import { Input, Select, Button, message, Spin, Tag } from "antd";
import { DeleteOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";

import axios from "axios";
import EditorTiny from "../../TextEditor/EditorTiny.jsx";
import { uploadByFilesApi, uploadByLinkApi } from "../../../api/client/api.js";
import { ICON_MAP, ICON_OPTIONS } from "../../../common/data/iconList.jsx";
import {getAdminAboutPageApi, updateAdminAboutPageApi} from "../../../api/client/system.api.js";

const { TextArea } = Input;
const { Option } = Select;

const AdminAboutEditor = () => {
    // --- STATE ---
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const BASE_URL = import.meta.env.VITE_BASE_URI;

    // Data State
    const [title, setTitle] = useState("About Us");
    const [content, setContent] = useState("");
    const [photos, setPhotos] = useState([]);
    const [linkPhoto, setLinkPhoto] = useState("");

    // Complex Data Arrays
    const [features, setFeatures] = useState([]);
    const [stats, setStats] = useState([]);
    const [highlights, setHighlights] = useState([]);

    // --- EXPANDED COLOR OPTIONS ---
    const COLOR_OPTIONS = [
        { label: "Red", value: "red", class: "bg-red-500" },
        { label: "Orange", value: "orange", class: "bg-orange-500" },
        { label: "Amber", value: "amber", class: "bg-amber-500" },
        { label: "Green", value: "green", class: "bg-green-600" },
        { label: "Teal", value: "teal", class: "bg-teal-500" },
        { label: "Blue", value: "blue", class: "bg-blue-500" },
        { label: "Indigo", value: "indigo", class: "bg-indigo-500" },
        { label: "Violet", value: "violet", class: "bg-violet-500" },
        { label: "Pink", value: "pink", class: "bg-pink-500" },
    ];

    // Helper to get color class for preview
    const getColorClass = (colorVal) => {
        const found = COLOR_OPTIONS.find(c => c.value === colorVal);
        return found ? found.class : "bg-gray-500";
    };

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchAboutContent = async () => {
            try {
                const res = await getAdminAboutPageApi();
                if (res.success && res.data) {
                    const data = res.data;
                    setTitle(data.title || "About Us");
                    setContent(data.content || "");
                    setPhotos(data.photos || []);
                    setFeatures(data.features || []);
                    setStats(data.stats || []);
                    setHighlights(data.highlights || []);
                }
            } catch (error) {
                console.error(error);
                message.error("Could not load data");
            } finally {
                setLoading(false);
            }
        };
        fetchAboutContent();
    }, [BASE_URL]);

    // --- GENERIC HANDLERS (Avoids code repetition) ---
    const handleAddItem = (setter, list, template) => {
        setter([...list, template]);
    };

    const handleRemoveItem = (setter, list, index) => {
        const newList = [...list];
        newList.splice(index, 1);
        setter(newList);
    };

    const handleChangeItem = (setter, list, index, field, value) => {
        const newList = [...list];
        newList[index][field] = value;
        setter(newList);
    };

    // --- PHOTO HANDLERS ---
    const addPhotoByFile = async (ev) => {
        const files = ev.target.files;
        if (!files || files.length === 0) return;
        const data = new FormData();
        for (let i = 0; i < files.length; i++) data.append("photos", files[i]);

        const hide = message.loading("Uploading...", 0);
        try {
            const res = await uploadByFilesApi(data);
            hide();
            if (res.success) {
                setPhotos([...photos, ...res.data.map((item) => item.url)]);
                message.success("Upload successful");
            } else message.error("Upload failed");
        } catch (err) {
            hide();
            message.error("Connection error");
        }
    };

    const addPhotoByLink = async (e) => {
        e.preventDefault();
        if (!linkPhoto) return message.warning("Enter image URL");
        const hide = message.loading("Verifying...", 0);
        try {
            const res = await uploadByLinkApi({ imageUrl: linkPhoto });
            hide();
            if (res.code === 200) {
                setPhotos([...photos, res.data.url]);
                setLinkPhoto("");
                message.success("Image added");
            } else message.error("Invalid link");
        } catch (err) {
            hide();
            message.error("Error adding image, ",err);
        }
    };

    const removePhoto = (filename) => {
        setPhotos(photos.filter((photo) => photo !== filename));
    };

    // --- SAVE ---
    const handleSave = async () => {
        if (!title.trim()) return message.error("Title is required");
        if (!content.trim()) return message.error("Content is required");

        setSaving(true);
        const hide = message.loading("Saving changes...", 0);
        try {
            const payload = { title, content, photos, features, stats, highlights };
            const res = await updateAdminAboutPageApi(payload);
            if (res.success) {
                message.success("Updated successfully!");
            } else message.error("Save failed");
        } catch (error) {
            message.error("Server error, ",error);
        } finally {
            hide();
            setSaving(false);
        }
    };

    const handleEditorChange = (newContent) => setContent(newContent);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Spin size="large" /></div>;

    return (
        <div className="max-h-screen bg-slate-50/50 pb-20 font-sans">

            {/* HEADER */}
            <div className="rounded-md mx-5 top-1 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 py-4 shadow-sm transition-all">
                <div className="max-w-full mx-auto flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-indigo-200 shadow-lg shrink-0">
                            <FaPenFancy size={18} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-bold text-slate-800 text-lg md:text-xl truncate">About Editor</h2>
                        </div>
                    </div>
                    <Button
                        type="primary"
                        onClick={handleSave}
                        loading={saving}
                        icon={<FaSave />}
                        size="large"
                        className="bg-gradient-to-r from-indigo-600 to-violet-600 border-none shadow-lg hover:shadow-indigo-500/30"
                    >
                        Publish
                    </Button>
                </div>
            </div>

            {/* CONTENT CONTAINER */}
            <div className="max-w-full mx-auto px-4 md:px-6 mt-6 md:mt-8 space-y-6 md:space-y-8">

                {/* 1. INFO */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    <div className="px-6 md:px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <FaHeading className="text-indigo-500" />
                        <h3 className="font-bold text-slate-700">Thông tin cơ bản</h3>
                    </div>
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-600">Tiêu đề (Hiển thị trên Banner)</label>
                            <Input
                                size="large"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Nhập tiêu đề..."
                                className="rounded-xl py-2.5"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. HIGHLIGHTS */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    <div className="px-6 md:px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <FaQuoteRight className="text-purple-500" />
                            <h3 className="font-bold text-slate-700">Giới thiệu nổi bật (Highlights)</h3>
                        </div>
                        <Button
                            icon={<PlusOutlined />}
                            onClick={() => handleAddItem(setHighlights, highlights, { icon: "check", color: "red", text: "" })}
                            className="text-purple-600 bg-purple-50 border-purple-100"
                        >
                            Thêm dòng
                        </Button>
                    </div>

                    <div className="p-6 md:p-8 space-y-4">
                        <p className="text-sm text-gray-500 italic mb-2">* Các dòng text hiển thị bên phải ảnh banner (có icon tròn màu).</p>
                        {highlights.map((item, idx) => {
                            // Safety Check for Icon
                            const iconElement = ICON_MAP[item.icon] || ICON_MAP['star'] || ICON_MAP['mountain'];

                            return (
                                <div key={idx} className="flex flex-col md:flex-row gap-4 items-start p-4 border border-slate-200 rounded-xl bg-slate-50/50 relative group">
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleRemoveItem(setHighlights, highlights, idx)}
                                        className="absolute top-2 right-2 opacity-60 hover:opacity-100"
                                    />

                                    {/* Config Column */}
                                    <div className="flex flex-col gap-3 min-w-[220px]">
                                        <div>
                                            <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Màu Sắc</span>
                                            <Select
                                                value={item.color}
                                                style={{ width: '100%' }}
                                                onChange={(val) => handleChangeItem(setHighlights, highlights, idx, "color", val)}
                                            >
                                                {COLOR_OPTIONS.map(opt => (
                                                    <Option key={opt.value} value={opt.value}>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-3 h-3 rounded-full ${opt.class}`}></div>
                                                            {opt.label}
                                                        </div>
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>

                                        <div>
                                            <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Icon</span>
                                            <div className="flex gap-2">
                                                <div className={`w-10 h-8 flex items-center justify-center rounded text-white shadow-sm transition-colors ${getColorClass(item.color)}`}>
                                                    {iconElement ? React.cloneElement(iconElement, { size: 16 }) : null}
                                                </div>
                                                <Select
                                                    showSearch
                                                    value={item.icon}
                                                    style={{ width: '100%' }}
                                                    onChange={(val) => handleChangeItem(setHighlights, highlights, idx, "icon", val)}
                                                    filterOption={(input, option) =>
                                                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                                    }
                                                >
                                                    {ICON_OPTIONS.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 w-full">
                                        <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Nội dung hiển thị</span>
                                        <TextArea
                                            rows={3}
                                            value={item.text}
                                            onChange={(e) => handleChangeItem(setHighlights, highlights, idx, "text", e.target.value)}
                                            placeholder="Nhập nội dung highlight..."
                                            className="rounded-lg"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {highlights.length === 0 && <div className="text-center text-gray-400 py-4">Chưa có nội dung highlight.</div>}
                    </div>
                </div>

                {/* 3. BANNER IMAGES */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    <div className="px-6 md:px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <FaImage className="text-rose-500" />
                            <h3 className="font-bold text-slate-700">Thư viện ảnh</h3>
                        </div>
                        <span className="hidden md:flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                            <FaInfoCircle /> Ảnh đầu tiên = Banner bên trái
                        </span>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        <div className="flex gap-2">
                            <Input
                                placeholder="URL ảnh..."
                                value={linkPhoto}
                                onChange={(e) => setLinkPhoto(e.target.value)}
                                className="rounded-l-lg"
                            />
                            <Button onClick={addPhotoByLink} type="primary" className="bg-rose-500 hover:bg-rose-600 border-none">Thêm Link</Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <label className="border-2 border-dashed border-slate-300 rounded-xl h-32 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-rose-400 hover:text-rose-500 transition hover:bg-rose-50">
                                <input type="file" multiple className="hidden" onChange={addPhotoByFile} />
                                <UploadOutlined className="text-xl mb-1" />
                                <span className="text-xs font-bold">Upload</span>
                            </label>
                            {photos.map((item, idx) => (
                                <div key={idx} className="relative h-32 group rounded-xl overflow-hidden border border-gray-200">
                                    <img src={item} alt="banner" className="w-full h-full object-cover" />
                                    {idx === 0 && <Tag color="#f50" className="absolute top-0 left-0 m-0 rounded-br-lg border-0 z-10">MAIN BANNER</Tag>}
                                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
                                        <Button
                                            type="primary"
                                            danger
                                            shape="circle"
                                            icon={<DeleteOutlined />}
                                            onClick={() => removePhoto(item)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. FEATURES SECTION */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    <div className="px-6 md:px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <FaListUl className="text-orange-500" />
                            <h3 className="font-bold text-slate-700">Dịch vụ nổi bật (Features)</h3>
                        </div>
                        <Button
                            icon={<PlusOutlined />}
                            onClick={() => handleAddItem(setFeatures, features, { icon: "mountain", title: "New Feature", description: "" })}
                            className="text-indigo-600 bg-indigo-50 border-indigo-100"
                        >
                            Thêm mục
                        </Button>
                    </div>

                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                        {features.map((item, idx) => {
                            const iconElement = ICON_MAP[item.icon] || ICON_MAP['mountain'];
                            return (
                                <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 relative group hover:border-indigo-200 transition-colors">
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleRemoveItem(setFeatures, features, idx)}
                                        className="absolute top-1 right-1 opacity-50 hover:opacity-100"
                                        size="small"
                                    />

                                    <div className="mb-3">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Icon</label>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="flex-1">
                                                <Select
                                                    showSearch
                                                    value={item.icon}
                                                    style={{ width: '100%' }}
                                                    onChange={(val) => handleChangeItem(setFeatures, features, idx, "icon", val)}
                                                    size="small"
                                                >
                                                    {ICON_OPTIONS.map((opt) => (
                                                        <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                                                    ))}
                                                </Select>
                                            </div>
                                            <div className="w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 shadow-sm shrink-0">
                                                {iconElement ? React.cloneElement(iconElement, { size: 18 }) : null}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Tiêu đề</label>
                                        <Input
                                            value={item.title}
                                            onChange={(e) => handleChangeItem(setFeatures, features, idx, "title", e.target.value)}
                                            className="mt-1 font-bold text-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Mô tả</label>
                                        <TextArea
                                            rows={2}
                                            value={item.description}
                                            onChange={(e) => handleChangeItem(setFeatures, features, idx, "description", e.target.value)}
                                            className="mt-1 text-xs"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {features.length === 0 && <div className="text-center text-gray-400 col-span-full py-4">Chưa có dịch vụ nào.</div>}
                    </div>
                </div>

                {/* 5. STATS SECTION */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    <div className="px-6 md:px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <FaChartBar className="text-blue-500" />
                            <h3 className="font-bold text-slate-700">Thống kê ấn tượng (Stats)</h3>
                        </div>
                        <Button
                            icon={<PlusOutlined />}
                            onClick={() => handleAddItem(setStats, stats, { icon: "star", label: "New Stat", value: "100+" })}
                            className="text-blue-600 bg-blue-50 border-blue-100"
                        >
                            Thêm số liệu
                        </Button>
                    </div>

                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                        {stats.map((stat, idx) => {
                            const iconElement = ICON_MAP[stat.icon] || ICON_MAP['star'];
                            return (
                                <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 relative group hover:border-blue-200 transition-colors">
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleRemoveItem(setStats, stats, idx)}
                                        className="absolute top-1 right-1 opacity-50 hover:opacity-100"
                                        size="small"
                                    />

                                    <div className="mb-3">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Icon</label>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="flex-1">
                                                <Select
                                                    showSearch
                                                    value={stat.icon}
                                                    style={{ width: '100%' }}
                                                    onChange={(val) => handleChangeItem(setStats, stats, idx, "icon", val)}
                                                    size="small"
                                                >
                                                    {ICON_OPTIONS.map((opt) => (
                                                        <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                                                    ))}
                                                </Select>
                                            </div>
                                            <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg border border-blue-100 shadow-sm shrink-0">
                                                {iconElement ? React.cloneElement(iconElement, { size: 18 }) : null}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Con số (Value)</label>
                                        <Input
                                            value={stat.value}
                                            onChange={(e) => handleChangeItem(setStats, stats, idx, "value", e.target.value)}
                                            className="mt-1 font-bold text-lg text-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Nhãn (Label)</label>
                                        <Input
                                            value={stat.label}
                                            onChange={(e) => handleChangeItem(setStats, stats, idx, "label", e.target.value)}
                                            className="mt-1 text-sm"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {stats.length === 0 && <div className="text-center text-gray-400 col-span-full py-4">Chưa có thống kê nào.</div>}
                    </div>
                </div>

                {/* 6. EDITOR */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    <div className="px-6 md:px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <FaPenFancy className="text-emerald-500" />
                        <h3 className="font-bold text-slate-700">Nội dung bài viết</h3>
                    </div>
                    <div className="w-full overflow-x-auto bg-white min-h-full p-1 md:p-3">
                        <div className="min-w-[350px] md:min-w-full">
                            {!loading && <EditorTiny handleEditorChange={handleEditorChange} description={content} />}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminAboutEditor;