import React, {useEffect, useState} from "react";
import {Table, Button, Input, Tag, Popconfirm, Tooltip, Select, Switch, Grid, Pagination, Empty} from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    SearchOutlined,
    PlusOutlined,
    ReloadOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined
} from "@ant-design/icons";
import {FaBus} from "react-icons/fa";
import {useNavigate} from "react-router-dom";
import moment from "moment";
import toast from "react-hot-toast";
import {deleteBusApi, getAdminBusesApi, toggleBusStatusApi} from "../../../api/client/api.js";

const {Option} = Select;
const {useBreakpoint} = Grid;

const AdminViewBus = () => {
    const navigate = useNavigate();
    const screens = useBreakpoint(); // Hook to detect screen size
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pagination & Filter State
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});
    const [searchText, setSearchText] = useState("");
    const [filterOperator, setFilterOperator] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const fetchData = async (params = {}) => {
        setLoading(true);
        try {
            const queryObj = {
                page: params.current || pagination.current,
                limit: params.pageSize || pagination.pageSize,
                search: searchText,
                operator: filterOperator,
                isActive: filterStatus
            };

            const res = await getAdminBusesApi(queryObj);

            if (res.success) {
                setData(res.data);
                setPagination({
                    ...pagination,
                    current: res.currentPage,
                    total: res.total
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch bus list");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [searchText, filterOperator, filterStatus]);

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
        fetchData({current: newPagination.current, pageSize: newPagination.pageSize});
    };

    // Handle Mobile Pagination Change
    const handleMobilePageChange = (page) => {
        const newPagination = { ...pagination, current: page };
        setPagination(newPagination);
        fetchData({ current: page, pageSize: pagination.pageSize });
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteBusApi(id);
            if (res.success) {
                toast.success("Bus deleted successfully");
                fetchData(); // Refresh list
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Delete failed, " + error);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await toggleBusStatusApi(id);
            if (res.success) {
                toast.success(res.message);
                await fetchData(); // Refresh list
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to update status, " + error);
        }
    };

    // --- DESKTOP COLUMNS ---
    const columns = [
        {
            title: 'Image',
            dataIndex: 'photos',
            key: 'photos',
            width: 100,
            render: (photos) => (
                <div className="w-20 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                    {photos && photos.length > 0 ? (
                        <img
                            src={photos[0]}
                            alt="bus"
                            className="w-full h-full object-cover"
                            onError={(e) => {e.target.onerror = null; e.target.src="https://via.placeholder.com/150?text=No+Img"}}
                        />
                    ) : (
                        <FaBus className="text-gray-300 text-xl" />
                    )}
                </div>
            )
        },
        {
            title: 'Bus Info',
            dataIndex: 'operator',
            key: 'operator',
            render: (text, record) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{text}</span>
                    <span className="text-xs text-gray-500">{record.operator}</span>
                    <Tag color="blue" className="w-fit mt-1 text-[10px] uppercase font-bold">{record.busType}</Tag>
                </div>
            )
        },
        {
            title: 'Route',
            key: 'route',
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-indigo-600">{record.cityFrom}</span>
                        <span className="text-gray-400">➝</span>
                        <span className="font-medium text-indigo-600">{record.cityTo}</span>
                    </div>
                </div>
            )
        },
        {
            title: 'Schedule',
            key: 'schedule',
            render: (_, record) => (
                <div className="text-sm">
                    <div className="flex justify-between w-32">
                        <span className="text-gray-400 text-xs font-bold w-8">DEP:</span>
                        <span className="text-gray-700">{moment(record.departureTime).format("DD/MM HH:mm")}</span>
                    </div>
                    <div className="flex justify-between w-32 mt-1">
                        <span className="text-gray-400 text-xs font-bold w-8">ARR:</span>
                        <span className="text-gray-700">{moment(record.arrivalTime).format("DD/MM HH:mm")}</span>
                    </div>
                </div>
            )
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => <span className="font-bold text-emerald-600">{new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND"
            }).format(price)}</span>
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (active, record) => (
                <Popconfirm
                    title={`Mark as ${active ? "Inactive" : "Active"}?`}
                    onConfirm={() => handleToggleStatus(record._id)}
                >
                    <Switch checked={active} size="small" className={active ? "bg-green-500" : "bg-gray-300"} />
                </Popconfirm>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Tooltip title="Edit">
                        <Button
                            type="default"
                            shape="circle"
                            icon={<EditOutlined/>}
                            onClick={() => navigate(`/dashboard-update-bus/${record._id}`)}
                            className="text-blue-600 border-blue-200 hover:border-blue-500 hover:text-blue-700"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete this bus?"
                        description="This action cannot be undone."
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete">
                            <Button danger shape="circle" icon={<DeleteOutlined/>}/>
                        </Tooltip>
                    </Popconfirm>
                </div>
            )
        }
    ];

    // --- MOBILE CARD COMPONENT ---
    const MobileCard = ({ item }) => (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 relative overflow-hidden">
            {/* Left Accent Line */}
            <div className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-500 rounded-r-lg"></div>

            <div className="pl-3">
                {/* Header: Operator & Type */}
                <div className="flex justify-between items-center mb-3">
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{item.operator}</span>
                        <Tag color="blue" className="w-fit text-[10px] uppercase font-bold mt-1 border-0">{item.busType}</Tag>
                    </div>
                    <Popconfirm
                        title={`Mark as ${item.isActive ? "Inactive" : "Active"}?`}
                        onConfirm={() => handleToggleStatus(item._id)}
                    >
                        <Switch checked={item.isActive} size="small" className={item.isActive ? "bg-green-500" : "bg-gray-300"} />
                    </Popconfirm>
                </div>

                {/* Content: Image & Route Info */}
                <div className="flex gap-3 mb-4" onClick={() => navigate(`/dashboard-update-bus/${item._id}`)}>
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                        {item.photos && item.photos.length > 0 ? (
                            <img
                                src={item.photos[0]}
                                className="w-full h-full object-cover"
                                alt="bus"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150?text=No+Img" }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                <FaBus />
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        {/* Route */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                            <EnvironmentOutlined className="text-indigo-500"/>
                            <span className="font-semibold text-gray-700">{item.cityFrom}</span>
                            <span className="text-gray-300">→</span>
                            <span className="font-semibold text-gray-700">{item.cityTo}</span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <ClockCircleOutlined />
                            <span>{moment(item.departureTime).format("HH:mm DD/MM")}</span>
                        </div>
                    </div>
                </div>

                <div className="h-px w-full bg-gray-100 mb-3"></div>

                {/* Footer: Price & Actions */}
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Price</div>
                        <div className="text-lg font-bold text-emerald-600 leading-none">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price)}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="default"
                            shape="circle"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/dashboard-update-bus/${item._id}`)}
                            className="text-blue-600 border-blue-200 hover:border-blue-500 hover:text-blue-700 bg-blue-50/50 shadow-sm"
                        />

                        <Popconfirm
                            title="Delete?"
                            onConfirm={() => handleDelete(item._id)}
                            okText="Yes"
                            cancelText="No"
                        >
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FaBus className="text-indigo-600"/> Bus Management
                </h1>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button icon={<ReloadOutlined/>} onClick={() => fetchData()} className="flex-1 md:flex-none">Refresh</Button>
                    <Button type="primary" icon={<PlusOutlined/>} onClick={() => navigate("/dashboard-add-bus")}
                            className="bg-gray-900 hover:!bg-gray-800 border-0 flex-1 md:flex-none">Add New</Button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Input
                    placeholder="Search by bus number, city..."
                    prefix={<SearchOutlined className="text-gray-400"/>}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    className="rounded-lg h-10 border-gray-200"
                />
                <Input
                    placeholder="Filter by Operator"
                    value={filterOperator}
                    onChange={e => setFilterOperator(e.target.value)}
                    className="rounded-lg h-10 border-gray-200"
                />
                <Select
                    placeholder="Status"
                    allowClear
                    onChange={setFilterStatus}
                    className="w-full h-10"
                >
                    <Option value="true">Active</Option>
                    <Option value="false">Inactive</Option>
                </Select>
            </div>

            {/* CONTENT SWITCHER */}
            {screens.md ? (
                // --- DESKTOP VIEW: Table ---
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="_id"
                        pagination={pagination}
                        loading={loading}
                        onChange={handleTableChange}
                        scroll={{x: 1000}}
                    />
                </div>
            ) : (
                // --- MOBILE VIEW: Card List ---
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-80 bg-white rounded-2xl border border-gray-100">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                        </div>
                    ) : data.length > 0 ? (
                        <>
                            {data.map(item => <MobileCard key={item._id} item={item} />)}
                            <div className="flex justify-center mt-6 mb-8">
                                <Pagination
                                    simple
                                    current={pagination.current}
                                    total={pagination.total}
                                    pageSize={pagination.pageSize}
                                    onChange={handleMobilePageChange}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                            <Empty description="No buses found" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminViewBus;