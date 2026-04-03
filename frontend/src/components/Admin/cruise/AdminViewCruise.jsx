import React, { useEffect, useState } from "react";
import { Table, Button, Input, Tag, Popconfirm, Tooltip, Select, Switch, Space, Grid, Pagination } from "antd";
import { DeleteOutlined, EditOutlined, SearchOutlined, PlusOutlined, ReloadOutlined, EnvironmentOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { FaShip} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import toast from "react-hot-toast";
import {
    deleteCruiseApi,
    getAdminCruisesApi,
    updateCruiseApi
} from "../../../api/client/service.api.js";

const { useBreakpoint } = Grid;

const AdminViewCruise = () => {
    const navigate = useNavigate();
    const screens = useBreakpoint(); // Hook to detect screen size
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState(undefined);

    const fetchData = async (params = {}) => {
        setLoading(true);
        try {
            const queryObj = {
                page: params.current || pagination.current,
                limit: params.pageSize || pagination.pageSize,
                keyword: searchText,
                isActive: filterStatus
            };
            const res = await getAdminCruisesApi(queryObj);
            if (res.success) {
                setData(res.data);
                setPagination({ ...pagination, current: res.currentPage, total: res.total });
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch cruise list");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [searchText, filterStatus]);

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
        fetchData({ current: newPagination.current, pageSize: newPagination.pageSize });
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteCruiseApi(id);
            if (res.success) { toast.success("cruise deleted"); fetchData(); }
            else toast.error(res.message);
        } catch (error) { toast.error("Delete failed, ",error); }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const res = await updateCruiseApi(id, { isActive: !currentStatus });
            if (res.success) { toast.success("Status updated"); fetchData(); }
            else toast.error(res.message);
        } catch (error) { toast.error("Failed to update status, ",error); }
    };

    // --- DESKTOP COLUMNS ---
    const columns = [
        {
            title: 'Image',
            dataIndex: 'thumbnail',
            key: 'thumbnail',
            width: 150,
            render: (text, record) => {
                const imgUrl = record.thumbnail || (record.photos && record.photos[0]);
                return (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        {imgUrl ? <img src={imgUrl} alt="cruise" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150?text=No+Img" }} /> : <FaShip className="text-gray-300" />}
                    </div>
                );
            }
        },
        {
            title: 'cruise Info',
            dataIndex: 'title',
            key: 'title',

            render: (text, record) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800 line-clamp-2 leading-tight">{text}</span>
                    <Space size="small" className="mt-1 flex-wrap gap-1">
                        <Tag color="purple" className="text-[10px] uppercase font-bold m-0 border-0">{record.cruiseType}</Tag>
                    </Space>
                </div>
            )
        },
        {
            title: 'Location',
            key: 'location',
            width: 250,
            render: (_, record) => (
                <span className="font-medium text-indigo-600 text-sm">{record?.city}</span>
            )
        },
        {
            title: 'Specs',
            key: 'specs',
            width: 180,
            render: (_, record) => (
                <div className="text-xs text-gray-500 grid grid-cols-2 gap-x-2">

                    <span className="col-span-2">Duration: {record.duration} Days</span>
                </div>
            )
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            render: (price) => <span className="font-bold text-emerald-600 whitespace-nowrap">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)}</span>
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 80,
            render: (active, record) => (
                <Popconfirm title={`Mark as ${active ? "Inactive" : "Active"}?`} onConfirm={() => handleToggleStatus(record._id, active)}>
                    <Switch checked={active} size="small" className={active ? "bg-green-500" : "bg-gray-300"} />
                </Popconfirm>
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <div className="flex gap-2 justify-end">
                    <Tooltip title="Edit">
                        <Button type="default" shape="circle" icon={<EditOutlined />} onClick={() => navigate(`/dashboard-update-cruise/${record.slug}`)} className="text-blue-600 border-blue-200 hover:border-blue-500 hover:text-blue-700 bg-blue-50/50" />
                    </Tooltip>
                    <Popconfirm title="Delete?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
                        <Tooltip title="Delete"><Button danger shape="circle" icon={<DeleteOutlined />} className="bg-red-50/50" /></Tooltip>
                    </Popconfirm>
                </div>
            )
        }
    ];

    // --- MOBILE CARD VIEW (Based on your image) ---
    const MobileCard = ({ item }) => (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 relative overflow-hidden">
            {/* Left Blue Accent Line */}
            <div className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-500 rounded-r-lg"></div>

            <div className="pl-3">
                {/* Header: ID Badge | Type | Status */}
                <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-2">
                        <Tag className="m-0 bg-gray-100 text-gray-500 border-0 font-bold">#{item._id.slice(-6).toUpperCase()}</Tag>
                        <Tag color="blue" className="m-0 font-bold border-0 uppercase">{item.cruiseType === "Luxury cruise" ? "LUXURY" : "CRUISE"}</Tag>
                    </div>
                    <Tag color={item.isActive ? "success" : "default"} className="m-0 border-0 font-bold">
                        {item.isActive ? "ACTIVE" : "INACTIVE"}
                    </Tag>
                </div>

                {/* Content: Title & Location */}
                <div className="flex gap-3 mb-4" onClick={() => navigate(`/dashboard-update-cruise/${item.slug}`)}>
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                        <img
                            src={item.thumbnail || (item.photos && item.photos[0])}
                            className="w-full h-full object-cover"
                            alt="cruise"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150?text=No+Img" }}
                        />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm truncate mb-1">{item.title}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                            <EnvironmentOutlined className="text-indigo-400"/>
                            <span className="truncate">{item.city}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <ClockCircleOutlined />
                            <span>{item.duration} Days</span>
                            {item.departureTime && <span>• Dep: {moment(item.departureTime).format("HH:mm")}</span>}
                        </div>
                    </div>
                </div>

                <div className="h-px w-full bg-gray-100 mb-3"></div>

                {/* Footer: Price & Actions */}
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Starting Price</div>
                        <div className="text-lg font-bold text-gray-900 leading-none">
                            {new Intl.NumberFormat("vi-VN").format(item.price)} <span className="text-xs text-gray-400 font-normal">đ</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Popconfirm title={`Mark as ${item.isActive ? "Inactive" : "Active"}?`} onConfirm={() => handleToggleStatus(item._id, item.isActive)}>
                            <Button
                                shape="circle"
                                icon={<Switch size="small" checked={item.isActive} className={item.isActive ? "bg-indigo-500" : "bg-gray-300"} />}
                                className="border-0 shadow-none bg-transparent "
                            />
                        </Popconfirm>

                        <Button
                            type="primary"
                            shape="circle"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/dashboard-update-cruise/${item.slug}`)}
                            className="bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 shadow-sm"
                        />

                        <Popconfirm title="Delete?" onConfirm={() => handleDelete(item._id)} okText="Yes" cancelText="No">
                            <Button
                                danger
                                shape="circle"
                                icon={<DeleteOutlined />}
                                className="bg-red-50 text-red-500 border-red-100 hover:bg-red-100 shadow-sm"
                            />
                        </Popconfirm>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-6 min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><FaShip /></span>
                        Cruise Management
                    </h1>
                    <p className="text-xs md:text-sm text-gray-400 mt-1 ml-11">Manage fleet, pricing and schedules</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button icon={<ReloadOutlined />} onClick={() => fetchData()} className="rounded-lg flex-1 md:flex-none">Refresh</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/dashboard-add-cruise")} className="bg-gray-900 hover:!bg-gray-800 border-0 rounded-lg flex-1 md:flex-none">Add New</Button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="sm:col-span-2 md:col-span-3">
                    <Input
                        placeholder="Search by cruise name..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="rounded-xl h-11 border-gray-200 hover:border-indigo-400 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <Select
                        placeholder="Filter Status"
                        allowClear
                        onChange={setFilterStatus}
                        className="w-full h-11"
                        size="large"
                        options={[
                            { value: 'true', label: 'Active Only' },
                            { value: 'false', label: 'Inactive Only' }
                        ]}
                    />
                </div>
            </div>

            {/* CONTENT: Switch between Table (Desktop) and List (Mobile) */}
            {screens.md ? (
                // DESKTOP VIEW: Table
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="_id"
                        pagination={{
                            ...pagination,
                            position: ['bottomCenter'],
                            showSizeChanger: true
                        }}
                        loading={loading}
                        onChange={handleTableChange}
                        className="[&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-500 [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold"
                    />
                </div>
            ) : (
                // MOBILE VIEW: Card List (Matches your image)
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-80 bg-white rounded-2xl border border-gray-100">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                        </div>
                    ) : (
                        <>
                            {data.map(item => <MobileCard key={item._id} item={item} />)}
                            <div className="flex justify-center mt-6">
                                <Pagination
                                    simple
                                    current={pagination.current}
                                    total={pagination.total}
                                    pageSize={pagination.pageSize}
                                    onChange={(page, pageSize) => fetchData({ current: page, pageSize })}
                                />
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminViewCruise;
