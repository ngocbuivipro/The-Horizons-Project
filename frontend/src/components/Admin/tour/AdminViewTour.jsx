import React, { useEffect, useState } from "react";
import { Table, Button, Input, Tag, Popconfirm, Tooltip, Select, Switch, Space, Grid, Pagination } from "antd";
import { DeleteOutlined, EditOutlined, SearchOutlined, PlusOutlined, ReloadOutlined, EnvironmentOutlined, ClockCircleOutlined, TeamOutlined, StarFilled } from "@ant-design/icons";
import { FaMapMarkedAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    getAdminToursApi,
    deleteTourApi,
    toggleVisibilityTourApi
} from "../../../api/client/api.js"; // Ensure path is correct

const { useBreakpoint } = Grid;

const AdminViewTour = () => {
    const navigate = useNavigate();
    const screens = useBreakpoint(); // Hook to detect screen size
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter & Pagination State
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState(undefined); // undefined = all, true = public, false = draft

    // --- FETCH DATA ---
    const fetchData = async (params = {}) => {
        setLoading(true);
        try {
            // Map UI params to API params
            const queryObj = {
                page: params.current || pagination.current,
                limit: params.pageSize || pagination.pageSize,
                search: searchText, // Assuming API accepts 'search' or 'keyword'
                isVisible: filterStatus // Filter by Public/Draft
            };

            const res = await getAdminToursApi(queryObj);
            if (res && res.success) {
                setData(res.data);
                setPagination({ ...pagination, current: res.currentPage || params.current, total: res.total || res.count });
            } else {
                // Fallback for empty data
                setData([]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch tour list");
        } finally {
            setLoading(false);
        }
    };

    // Trigger fetch on Search or Filter change
    useEffect(() => {
        fetchData({ current: 1 }); // Reset to page 1 on filter change
    }, [searchText, filterStatus]);

    // Handle Table Pagination Change
    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
        fetchData({ current: newPagination.current, pageSize: newPagination.pageSize });
    };

    // --- ACTIONS ---
    const handleDelete = async (id) => {
        try {
            const res = await deleteTourApi(id);
            if (res.success) {
                toast.success("Tour deleted successfully");
                fetchData();
            } else {
                toast.error(res.message || "Delete failed");
            }
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            // Optimistic Update can be done here, but usually safer to wait for API
            const res = await toggleVisibilityTourApi(id);
            if (res.success) {
                toast.success(currentStatus ? "Tour hidden (Draft)" : "Tour published");
                fetchData();
            } else {
                toast.error(res.message || "Update failed");
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    // --- DESKTOP COLUMNS ---
    const columns = [
        {
            title: 'Image',
            dataIndex: 'images',
            key: 'images',
            width: 100,
            render: (images, record) => {
                const imgUrl = images?.[0];
                return (
                    <div className="w-16 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                        {imgUrl ? (
                            <img src={imgUrl} alt="tour" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150?text=No+Img" }} />
                        ) : (
                            <FaMapMarkedAlt className="text-gray-300" />
                        )}
                    </div>
                );
            }
        },
        {
            title: 'Tour Info',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800 line-clamp-2 leading-tight mb-1" title={text}>{text}</span>
                    <Space size="small" className="flex-wrap gap-1">
                        {record.featured && <Tag color="gold" icon={<StarFilled />} className="text-[10px] uppercase font-bold m-0 border-0">HOT</Tag>}
                        <span className="text-xs text-gray-400 flex items-center gap-1"><EnvironmentOutlined /> {record.city}</span>
                    </Space>
                </div>
            )
        },
        {
            title: 'Specs',
            key: 'specs',
            width: 150,
            render: (_, record) => (
                <div className="text-xs text-gray-500 flex flex-col gap-1">
                    <span className="flex items-center gap-1"><ClockCircleOutlined /> {record.duration} Days</span>
                    <span className="flex items-center gap-1"><TeamOutlined /> Max {record.maxGroupSize}</span>
                </div>
            )
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 140,
            sorter: true,
            render: (price) => <span className="font-bold text-indigo-600 whitespace-nowrap text-base">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)}</span>
        },
        {
            title: 'Status',
            dataIndex: 'isVisible',
            key: 'isVisible',
            width: 100,
            align: 'center',
            render: (visible, record) => (
                <Popconfirm title={`Mark as ${visible ? "Draft" : "Public"}?`} onConfirm={() => handleToggleStatus(record._id, visible)}>
                    <Switch checked={visible} size="small" className={visible ? "bg-green-500" : "bg-gray-300"} />
                </Popconfirm>
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            align: 'right',
            render: (_, record) => (
                <div className="flex gap-2 justify-end">
                    <Tooltip title="Edit">
                        <Button type="default" shape="circle" icon={<EditOutlined />} onClick={() => navigate(`/dashboard-tour/${record.slug}`)} className="text-blue-600 border-blue-200 hover:border-blue-500 hover:text-blue-700 bg-blue-50/50" />
                    </Tooltip>
                    <Popconfirm title="Delete?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
                        <Tooltip title="Delete"><Button danger shape="circle" icon={<DeleteOutlined />} className="bg-red-50/50 border-red-200" /></Tooltip>
                    </Popconfirm>
                </div>
            )
        }
    ];

    // --- MOBILE CARD VIEW (Adapted from AdminViewCruise) ---
    const MobileCard = ({ item }) => (
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 mb-4 relative overflow-hidden transition-transform active:scale-[0.99]">
            {/* Left Indigo Accent Line */}
            <div className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-500 rounded-r-lg"></div>

            <div className="pl-3">
                {/* Header: Status & Tags */}
                <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-2">
                        <Tag className="m-0 bg-gray-100 text-gray-500 border-0 font-bold">#{item._id.slice(-4).toUpperCase()}</Tag>
                        {item.featured && (
                            <Tag color="gold" className="m-0 font-bold border-0 uppercase flex items-center gap-1">
                                <StarFilled style={{fontSize: 10}}/> Featured
                            </Tag>
                        )}
                    </div>
                    <Tag color={item.isVisible ? "success" : "default"} className="m-0 border-0 font-bold">
                        {item.isVisible ? "PUBLIC" : "DRAFT"}
                    </Tag>
                </div>

                {/* Content: Title & Location */}
                <div className="flex gap-3 mb-4" onClick={() => navigate(`/dashboard-tour/${item.slug}`)}>
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100 shadow-sm">
                        <img
                            src={item.images?.[0] || "https://via.placeholder.com/150"}
                            className="w-full h-full object-cover"
                            alt="tour"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150?text=No+Img" }}
                        />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="font-bold text-gray-800 text-sm truncate mb-1">{item.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                            <EnvironmentOutlined className="text-indigo-400"/>
                            <span className="truncate">{item.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><ClockCircleOutlined /> {item.duration} Days</span>
                            <span className="flex items-center gap-1"><TeamOutlined /> Max {item.maxGroupSize}</span>
                        </div>
                    </div>
                </div>

                <div className="h-px w-full bg-gray-100 mb-3"></div>

                {/* Footer: Price & Actions */}
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Price per adult</div>
                        <div className="text-lg font-bold text-gray-900 leading-none">
                            {new Intl.NumberFormat("vi-VN").format(item.price)} <span className="text-xs text-gray-400 font-normal">đ</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {/* Quick Switch */}
                        <Popconfirm title={`Mark as ${item.isVisible ? "Draft" : "Public"}?`} onConfirm={() => handleToggleStatus(item._id, item.isVisible)} placement="topRight">
                            <Button
                                shape="circle"
                                icon={<Switch size="small" checked={item.isVisible} className={item.isVisible ? "bg-indigo-500" : "bg-gray-300"} />}
                                className="border-0 shadow-none bg-transparent pt-1"
                            />
                        </Popconfirm>

                        {/* Edit */}
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/dashboard-tour/${item.slug}`)}
                            className="bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 shadow-sm"
                        />

                        {/* Delete */}
                        <Popconfirm title="Delete?" onConfirm={() => handleDelete(item._id)} okText="Yes" cancelText="No" placement="topRight">
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
                        <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><FaMapMarkedAlt /></span>
                        Tour Management
                    </h1>
                    <p className="text-xs md:text-sm text-gray-400 mt-1 ml-11">Manage travel packages, pricing and availability</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button icon={<ReloadOutlined />} onClick={() => fetchData({current: 1})} className="rounded-lg flex-1 md:flex-none">Refresh</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/dashboard-create-tour")} className="bg-gray-900 hover:!bg-gray-800 border-0 rounded-lg flex-1 md:flex-none">Add New</Button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="sm:col-span-2 md:col-span-3">
                    <Input
                        placeholder="Search by tour name..."
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
                            { value: 'true', label: 'Published Only' },
                            { value: 'false', label: 'Draft Only' }
                        ]}
                    />
                </div>
            </div>

            {/* CONTENT: Responsive Switch */}
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
                            showSizeChanger: false
                        }}
                        loading={loading}
                        onChange={handleTableChange}
                        className="[&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-500 [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold"
                    />
                </div>
            ) : (
                // MOBILE VIEW: Modern Card List
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-80 bg-white rounded-2xl border border-gray-100">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                        </div>
                    ) : (
                        <>
                            {data.length > 0 ? (
                                data.map(item => <MobileCard key={item._id} item={item} />)
                            ) : (
                                <div className="text-center py-10 text-gray-400">No tours found</div>
                            )}

                            {/* Simple Mobile Pagination */}
                            {data.length > 0 && (
                                <div className="flex justify-center mt-6">
                                    <Pagination
                                        simple
                                        current={pagination.current}
                                        total={pagination.total}
                                        pageSize={pagination.pageSize}
                                        onChange={(page, pageSize) => fetchData({ current: page, pageSize })}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminViewTour;