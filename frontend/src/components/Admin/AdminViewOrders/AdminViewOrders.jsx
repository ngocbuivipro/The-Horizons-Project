import { useEffect, useState, useCallback } from "react";
import {
    Button, message, Input, Select, Popover, Modal, Table,
    ConfigProvider, Tag, Tabs, Typography
} from "antd";
import {
    FilterOutlined, SearchOutlined, DeleteOutlined,
    ExclamationCircleOutlined, SyncOutlined
} from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";

// API Imports
import {
    getAllBookingApi,
    updateStatusBookingApi,
    softDeleteBookingApi,
    hardDeleteBookingApi,
} from "../../../api/client/api.js";

import OrderTableDesktop from "./OrderTableDesktop";
import OrderListMobile from "./OrderListMobile";

const { Title, Text } = Typography;

const AdminViewOrders = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modal, contextHolder] = Modal.useModal();
    const isMobile = useMediaQuery({ maxWidth: 768 });



    // Filters & Pagination
    const [filters, setFilters] = useState({
        search: "", status: "all", bookingType: "all", isPaid: "all", sortBy: "createdAt_desc",
    });
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    // Debounce
    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => setDebouncedValue(value), delay);
            return () => clearTimeout(handler);
        }, [value, delay]);
        return debouncedValue;
    };
    const debouncedSearch = useDebounce(filters.search, 500);

    // --- API CALLS ---
    const fetchApi = useCallback(async (page = 1, pageSize = 10, currentFilters) => {
        setLoading(true);
        try {
            const [sortBy, order] = currentFilters.sortBy.split('_');
            const params = { page, limit: pageSize, sortBy, order };

            if (currentFilters.search) params.search = currentFilters.search;
            if (currentFilters.status && currentFilters.status !== 'all') params.status = currentFilters.status.toUpperCase();
            if (currentFilters.bookingType && currentFilters.bookingType !== 'all') params.bookingType = currentFilters.bookingType;
            if (currentFilters.isPaid !== 'all') params.isPaid = currentFilters.isPaid;

            params.isDeleted = false;

            const res = await getAllBookingApi(params);
            if (res && res.success) {
                const activeItems = res.data.filter(item => !item.isDeleted);

                setData(activeItems);
                setPagination({ current: res.currentPage || 1, pageSize: pageSize, total: res.total || 0 });
            } else {
                setData([]);
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApi(pagination.current, pagination.pageSize, { ...filters, search: debouncedSearch });
    }, [debouncedSearch, filters.status, filters.bookingType, filters.isPaid, filters.sortBy, pagination.current, pagination.pageSize, fetchApi]);

    // --- HANDLERS ---
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleTabChange = (key) => {
        handleFilterChange("status", key);
    };

    const handleResetFilters = () => {
        setFilters({ search: "", status: "all", bookingType: "all", isPaid: "all", sortBy: "createdAt_desc" });
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleTableChange = (newPagination) => {
        setPagination(prev => ({ ...prev, current: newPagination.current }));
    };

    // --- ACTIONS ---
    const handleConfirm = async (record) => {
        try {
            const res = await updateStatusBookingApi(record._id);
            if (res.success) {
                message.success("Payment Confirmed");
                fetchApi(pagination.current, pagination.pageSize, filters);
            }
        } catch (e) { message.error("Action failed ", e); }
    };

    // --- FIX 4: OPTIMISTIC UPDATE FOR SOFT DELETE ---
    const handleSoftDelete = (record) => {
        modal.confirm({
            title: 'Move to Trash',
            icon: <ExclamationCircleOutlined className="text-orange-500" />,
            content: `Move booking #${record._id.slice(-6).toUpperCase()} to trash?`,
            okText: 'Yes, Move it', okType: 'danger', cancelText: 'No',
            onOk: async () => {
                try {
                    const res = await softDeleteBookingApi(record._id);
                    if (res.success) {
                        message.success("Moved to trash");

                        setData(prev => prev.filter(item => item._id !== record._id));

                        fetchApi(pagination.current, pagination.pageSize, filters);
                    }
                } catch (e) { message.error("Action failed ", e); }
            },
        });
    };

    const handleHardDelete = (record) => {
        modal.confirm({
            title: 'Delete Permanently',
            icon: <DeleteOutlined className="text-red-600" />,
            content: 'This cannot be undone.',
            okText: 'Delete Forever', okType: 'danger',
            onOk: async () => {
                try {
                    const res = await hardDeleteBookingApi(record._id);
                    if (res.success) {
                        message.success("Deleted permanently");

                        // Check where we are deleting from (Main list or Trash modal)
                        if (showTrash) {
                            setTrashData(prev => prev.filter(item => item._id !== record._id));
                        } else {
                            setData(prev => prev.filter(item => item._id !== record._id));
                            fetchApi(pagination.current, pagination.pageSize, filters);
                        }
                    }
                } catch (e) { message.error("Action failed ", e); }
            },
        });
    };

    // --- UI HELPERS ---
    const renderAdvancedFilters = () => (
        <div className="w-64 p-1 font-inter">
            <div className="mb-4 flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="font-semibold text-gray-700">Refine Results</span>
                <Button type="text" size="small" onClick={handleResetFilters} className="text-gray-400 hover:text-red-500 text-xs">Reset</Button>
            </div>
            <div className="space-y-4">
                <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Service Type</span>
                    <Select value={filters.bookingType} onChange={v => handleFilterChange("bookingType", v)} className="w-full">
                        <Select.Option value="all">All Services</Select.Option>
                        <Select.Option value="HOTEL">Accommodation</Select.Option>
                        <Select.Option value="TOUR">Tours</Select.Option>
                        <Select.Option value="CRUISE">Cruises</Select.Option>
                    </Select>
                </div>
                <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Payment Status</span>
                    <Select value={filters.isPaid} onChange={v => handleFilterChange("isPaid", v)} className="w-full">
                        <Select.Option value="all">Any</Select.Option>
                        <Select.Option value="true">Paid Only</Select.Option>
                        <Select.Option value="false">Unpaid Only</Select.Option>
                    </Select>
                </div>
                <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Sort By</span>
                    <Select value={filters.sortBy} onChange={v => handleFilterChange("sortBy", v)} className="w-full">
                        <Select.Option value="createdAt_desc">Newest First</Select.Option>
                        <Select.Option value="createdAt_asc">Oldest First</Select.Option>
                        <Select.Option value="totalPriceVND_desc">Highest Price</Select.Option>
                    </Select>
                </div>
            </div>
        </div>
    );

    const tabItems = [
        { key: 'all', label: 'All Orders' },
        { key: 'PENDING', label: 'Pending' },
        { key: 'CONFIRM', label: 'Confirmed' },
        { key: 'CANCELLED', label: 'Cancelled' },
    ];

    return (
        <ConfigProvider
            theme={{
                token: {
                    fontFamily: "'Inter', sans-serif",
                    colorPrimary: '#6366f1', // Indigo 500
                    borderRadius: 6,
                },
                components: {
                    Table: {
                        headerBg: '#EEF2FF',
                        headerColor: '#4338ca',
                        headerSplitColor: '#e0e7ff',
                        headerBorderRadius: 8,
                        borderColor: '#f1f5f9',
                    },
                    Tabs: { itemSelectedColor: '#6366f1', inkBarColor: '#6366f1', titleFontSize: 14 }
                }
            }}
        >
            <div className="min-h-screen p-4 md:p-6 font-inter">
                {contextHolder}
                <div className="max-w-full mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>Orders</Title>
                        <Text type="secondary" className="text-slate-500">Monitor and manage all bookings.</Text>
                    </div>

                </div>

                <div className="max-w-full mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                        <Tabs activeKey={filters.status} onChange={handleTabChange} items={tabItems} type="card" className="custom-tabs" />
                        <div className="flex items-center gap-3">
                            <Input placeholder="Search orders..." prefix={<SearchOutlined className="text-gray-400" />} className="w-full md:w-64" allowClear onChange={e => handleFilterChange("search", e.target.value)} value={filters.search} />
                            <Popover content={renderAdvancedFilters} trigger="click" placement="bottomRight" arrow={false}><Button icon={<FilterOutlined />}>Filter</Button></Popover>
                            <Button icon={<SyncOutlined spin={loading} />} onClick={() => fetchApi(1, pagination.pageSize, filters)} />
                        </div>
                    </div>

                    <div className="overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center items-center h-80 bg-white rounded-2xl border border-gray-100">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                            </div>
                        ) : isMobile ? (
                            <OrderListMobile
                                data={data}
                                pagination={pagination}
                                handleMobilePageChange={(page) => handleTableChange({ current: page })}
                                onConfirm={handleConfirm}
                                onSoftDelete={handleSoftDelete}
                                onHardDelete={handleHardDelete}
                            />
                        ) : (
                            <OrderTableDesktop
                                data={data}
                                loading={false}
                                pagination={pagination}
                                handleTableChange={handleTableChange}
                                onConfirm={handleConfirm}
                                onSoftDelete={handleSoftDelete}
                                onHardDelete={handleHardDelete}
                            />
                        )}
                    </div>
                </div>


            </div>
        </ConfigProvider>
    );
};

export default AdminViewOrders;
