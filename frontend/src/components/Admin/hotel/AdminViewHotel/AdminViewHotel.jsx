import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
    Popconfirm, Table, Button, Popover,
    Select,
    Input,
    InputNumber,
    Tag,
    Tooltip,
    List,
    Switch,
    Spin,
    Rate
} from "antd";
import {
    FilterOutlined,
    SearchOutlined,
    ReloadOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    EnvironmentOutlined,
    HomeOutlined,
    MoreOutlined
} from "@ant-design/icons";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import {
    toggleVisibilityHotelApi,
    deleteHotelApi,
    getAdminHotelsApi
} from "../../../../api/client/api.js";

const currencyFormatter = new Intl.NumberFormat("vi-VN");

// ... (FilterPanel Component remains exactly the same) ...
const FilterPanel = React.memo(function FilterPanel({ filterParams, setFilterParams, onReset, onClose }) {
    return (
        <div className="w-[300px] flex flex-col gap-5 p-4 font-sans">
            <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-gray-800">Filter Tours</span>
                <Button type="text" size="small" onClick={onClose} className="text-gray-400">Close</Button>
            </div>
            {/* Sort */}
            <div>
                <p className="font-bold text-gray-500 text-xs uppercase mb-2">Sort By</p>
                <Select
                    className="w-full"
                    value={filterParams.sort}
                    onChange={(val) => setFilterParams({ ...filterParams, sort: val })}
                    options={[
                        { value: "newest", label: "Newest First" },
                        { value: "oldest", label: "Oldest First" },
                        { value: "price_asc", label: "Price: Low to High" },
                        { value: "price_desc", label: "Price: High to Low" },
                        { value: "duration_asc", label: "Duration: Short to Long" },
                        { value: "duration_desc", label: "Duration: Long to Short" },
                    ]}
                />
            </div>
            {/* Price */}
            <div>
                <p className="font-bold text-gray-500 text-xs uppercase mb-2">Price Range</p>
                <div className="flex gap-2">
                    <InputNumber placeholder="Min" className="w-full" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(v) => v?.replace(/\$\s?|(,*)/g, "")} value={filterParams.minPrice} onChange={(val) => setFilterParams({ ...filterParams, minPrice: val })} />
                    <InputNumber placeholder="Max" className="w-full" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(v) => v?.replace(/\$\s?|(,*)/g, "")} value={filterParams.maxPrice} onChange={(val) => setFilterParams({ ...filterParams, maxPrice: val })} />
                </div>
            </div>
            {/* City & Duration */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <p className="font-bold text-gray-500 text-xs uppercase mb-2">City</p>
                    <Input placeholder="e.g. Da Nang" value={filterParams.city} onChange={(e) => setFilterParams({ ...filterParams, city: e.target.value })} />
                </div>
                <div>
                    <p className="font-bold text-gray-500 text-xs uppercase mb-2">Days (Max)</p>
                    <InputNumber placeholder="e.g. 5" className="w-full" value={filterParams.duration} onChange={(val) => setFilterParams({ ...filterParams, duration: val })} />
                </div>
            </div>
            {/* Buttons */}
            <div className="flex gap-2 mt-2">
                <Button block onClick={onReset} icon={<ReloadOutlined />}>Reset</Button>
                <Button type="primary" block onClick={onClose}>Apply</Button>
            </div>
        </div>
    );
});

const AdminViewHotel = () => {
    // --- LOCAL STATE ---
    const [dataHotels, setDataHotels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    // REMOVED redundant 'pagination' state. We will use filterParams directly.

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [filterParams, setFilterParams] = useState({
        page: 1,
        limit: 6,
        search: "",
        sort: "newest",
        minPrice: null,
        maxPrice: null,
        city: "",
        type: "",
        isVisible: "",
        stars: null
    });
    const [searchText, setSearchText] = useState("");
    const [openFilter, setOpenFilter] = useState(false);

    // --- 1. FETCH DATA (UPDATED PAGINATION LOGIC) ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAdminHotelsApi(filterParams);

            // Backend format: { success: true, count: 6, total: 17, totalPages: 3, currentPage: 1, data: [] }
            if (res && res.success) {
                setDataHotels(res.data);
                // Important: Use 'total' (17) for pagination, not 'count' (6 - items on current page)
                setTotal(res.total || 0);
            } else {
                setDataHotels([]);
                setTotal(0);
                toast.error(res?.message || "Failed to fetch hotels");
            }
        } catch (error) {
            console.error("Error fetching hotels:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }, [filterParams]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearchTrigger = useCallback(() => {
        setFilterParams((prev) => ({ ...prev, page: 1, search: searchText }));
    }, [searchText]);

    // --- 2. DELETE ---
    const confirm = useCallback(async (id) => {
        try {
            const res = await deleteHotelApi(id);
            if (res && res.success) {
                toast.success("Hotel deleted successfully");
                fetchData();
            } else {
                toast.error(res?.message || "Delete failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error deleting Hotel");
        }
    }, [fetchData]);

    // --- 3. TOGGLE VISIBILITY ---
    const handleToggleVisibility = async (id) => {
        try {
            const res = await toggleVisibilityHotelApi(id);
            if (res && res.success) {
                toast.success(res.message || "Updated visibility successfully");
                fetchData();
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating status");
        }
    };

    const handleResetFilter = useCallback(() => {
        setSearchText("");
        setFilterParams({
            page: 1,
            limit: 6,
            search: "",
            sort: "newest",
            minPrice: null,
            maxPrice: null,
            city: "",
            type: "",
            isVisible: "",
            stars: null
        });
        setOpenFilter(false);
    }, []);

    // --- 4. HANDLE TABLE CHANGE (Server-side Pagination) ---
    const handleTableChange = useCallback((newPagination) => {
        setFilterParams(prev => ({
            ...prev,
            page: newPagination.current,
            limit: newPagination.pageSize
        }));
    }, []);

    // --- COMPONENT MOBILE CARD ---
    const MobileHotelCard = ({ item }) => (
        <div className={`rounded-2xl p-4 shadow-sm border mb-4 flex gap-4 relative overflow-hidden transition-colors ${item.isVisible ? "bg-white border-gray-100" : "bg-gray-50 border-gray-200"}`}>
            <div
                className={`w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative cursor-pointer ${!item.isVisible && "opacity-60"}`}
                onClick={() => window.open(`/homes/${item.slug}`, '_blank')}
            >
                <img
                    src={item.photos?.[0] || "https://via.placeholder.com/150"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-0 left-0 bg-black/50 p-1 rounded-br-lg">
                    <Tag color={item.type?.toLowerCase() === "villa" ? "purple" : "cyan"} className="m-0 border-none text-[10px] font-bold h-auto leading-none py-0.5 px-1.5">
                        {item.type}
                    </Tag>
                </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h4 className={`font-bold text-[15px] leading-tight line-clamp-2 pr-6 ${item.isVisible ? "text-gray-800" : "text-gray-500"}`}>
                            {item.name}
                        </h4>
                        <Popover
                            trigger="click"
                            placement="bottomRight"
                            content={
                                <div className="flex flex-col gap-1 w-32">
                                    <Link to={`/dashboard-hotel/${item.slug}`} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-gray-600">
                                        <EditOutlined /> Edit
                                    </Link>
                                    <Link to={`/homes/${item.slug}`} target="_blank" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-gray-600">
                                        <EyeOutlined /> View
                                    </Link>
                                    <Popconfirm
                                        title="Delete hotel?"
                                        onConfirm={() => confirm(item._id)}
                                        okText="Yes"
                                        cancelText="No"
                                        okButtonProps={{ className: "bg-rose-500" }}
                                    >
                                        <button className="flex items-center gap-2 p-2 hover:bg-rose-50 rounded text-rose-500 w-full text-left">
                                            <DeleteOutlined /> Delete
                                        </button>
                                    </Popconfirm>
                                </div>
                            }
                        >
                            <MoreOutlined className="absolute top-4 right-4 text-gray-400 text-lg rotate-90" />
                        </Popover>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                        <Rate disabled defaultValue={item.stars || 0} className="text-xs" count={5} style={{ fontSize: 12 }} />
                    </div>

                    <div className="flex items-center gap-1 text-gray-400 text-xs mt-1 mb-2">
                        <EnvironmentOutlined />
                        <span className="line-clamp-1">{item.address}</span>
                    </div>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <span className={`block font-extrabold text-lg leading-none ${item.isVisible ? "text-gray-800" : "text-gray-400"}`}>
                          {currencyFormatter.format(item.cheapestPrice)}<span className="text-xs underline align-top ml-0.5">đ</span>
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <Switch
                            checked={item.isVisible}
                            onChange={() => handleToggleVisibility(item._id)}
                            size="small"
                            className={item.isVisible ? "bg-green-500" : "bg-gray-300"}
                        />
                        <span className="text-[9px] text-gray-400 mt-1">{item.isVisible ? "Public" : "Hidden"}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const columns = useMemo(() => [
        {
            title: "Property",
            dataIndex: "name",
            key: "name",
            width: 250,
            render: (text, record) => (
                <div className={`flex items-center gap-4 group cursor-pointer ${!record.isVisible && "opacity-60 grayscale-[50%]"}`}>
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0">
                        <img
                            src={record.photos?.[0] || "https://via.placeholder.com/150"}
                            alt={text}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                    <div className="flex flex-col">
                        <h4 className="font-bold text-gray-800 text-[15px] m-0 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {text} { !record.isVisible && <Tag color="default" className="ml-1 text-[10px]">Hidden</Tag> }
                        </h4>
                        <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                            <EnvironmentOutlined />
                            <span className="line-clamp-1">{record.address}, {record.city}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            width: 100,
            render: (type) => (
                <Tag
                    color={type?.toLowerCase() === "villa" ? "purple" : "cyan"}
                    className="px-3 py-0.5 rounded-full font-bold border-0 bg-opacity-10 capitalize"
                >
                    {type}
                </Tag>
            )
        },
        {
            title: "Rating",
            dataIndex: "stars",
            key: "stars",
            width: 150,
            render: (stars) => (
                <Rate disabled allowHalf defaultValue={stars || 0} className="text-sm text-yellow-400" />
            )
        },
        {
            title: "ROOM TYPES",
            dataIndex: "roomType",
            key: "roomType",
            width: 180,
            render: (rooms) => (
                <div className="flex flex-wrap gap-2">
                    {rooms && rooms.length > 0 ? (
                        rooms.map((room, idx) => (
                            <Tag key={idx} className="m-0 rounded-md font-semibold border-0 bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs">
                                {room.RoomType}
                            </Tag>
                        ))
                    ) : (
                        <span className="text-gray-400 text-xs italic">No rooms added</span>
                    )}
                </div>
            )
        },
        {
            title: "Status",
            dataIndex: "isVisible",
            key: "isVisible",
            width: 120,
            render: (visible, record) => (
                <div className="flex flex-col items-start gap-1">
                    <Switch
                        checked={visible}
                        onChange={() => handleToggleVisibility(record._id)}
                        checkedChildren="Public"
                        unCheckedChildren="Hidden"
                        className={visible ? "bg-green-500" : "bg-gray-300"}
                    />
                </div>
            )
        },
        {
            title: "Price",
            dataIndex: "cheapestPrice",
            key: "cheapestPrice",
            sorter: true,
            width: 150,
            render: (text) => (
                <div>
                   <span className="block font-extrabold text-gray-800 text-base">
                     {currencyFormatter.format(text)} <span className="text-xs font-normal text-gray-400 underline">đ</span>
                   </span>
                </div>
            ),
        },
        {
            title: "Action",
            key: "action",
            width: 120,
            fixed: "right",
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Tooltip title="Preview">
                        <Link to={`/homes/${record.slug}`} target="_blank">
                            <Button type="text" shape="circle" icon={<EyeOutlined />} className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50" />
                        </Link>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Link to={`/dashboard-hotel/${record.slug}`}>
                            <Button type="text" shape="circle" icon={<EditOutlined />} className="text-gray-400 hover:text-orange-500 hover:bg-orange-50" />
                        </Link>
                    </Tooltip>
                    <Popconfirm
                        title="Delete?"
                        onConfirm={() => confirm(record._id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ className: "bg-rose-500" }}
                    >
                        <Tooltip title="Delete">
                            <Button type="text" shape="circle" icon={<DeleteOutlined />} className="text-gray-400 hover:text-rose-600 hover:bg-rose-50" />
                        </Tooltip>
                    </Popconfirm>
                </div>
            ),
        },
    ], [confirm, handleToggleVisibility]);

    return (
        <div className="max-h-screen bg-[#F8F9FC] p-4 md:p-8 font-sans pb-24 md:pb-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 md:mb-8 gap-4">
                <div className="w-full md:w-auto">
                    <h1 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tight mb-1">
                        Hotel List
                    </h1>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <HomeOutlined />
                        <span className="hidden md:inline">Management</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="font-semibold text-indigo-600">{total} Items</span>
                    </div>
                </div>

                    <div className="w-full md:w-auto flex items-center bg-white p-1 rounded-xl md:rounded-md shadow-lg shadow-gray-200/60 border border-gray-100">
                    <div className="flex-1 flex items-center pl-3 pr-2">
                        <SearchOutlined className="text-gray-400 text-lg mr-2" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full md:w-64 bg-transparent border-none outline-none text-gray-700 text-sm h-10"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchTrigger()}
                        />
                    </div>
                    <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
                    <Popover
                        content={
                            <FilterPanel
                                filterParams={filterParams}
                                setFilterParams={setFilterParams}
                                onReset={handleResetFilter}
                                onClose={() => setOpenFilter(false)}
                            />
                        }
                        trigger="click"
                        open={openFilter}
                        onOpenChange={setOpenFilter}
                        placement="bottomRight"
                    >
                        <button
                            className={`flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-5 md:py-2.5 rounded-lg md:rounded-full font-bold text-sm transition-all
                  ${openFilter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                            <FilterOutlined />
                            <span className="hidden md:inline ml-2">Filter</span>
                        </button>
                    </Popover>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                </div>
            ) : isMobile ? (
                <div className="pb-10">
                    <List
                        loading={loading}
                        dataSource={dataHotels}
                        grid={{ gutter: 16, column: 1 }}
                        pagination={{
                            current: filterParams.page,
                            pageSize: filterParams.limit,
                            total: total,
                            onChange: (page) => setFilterParams(prev => ({ ...prev, page })),
                            align: 'center',
                            size: 'small',
                            className: "!mt-4"
                        }}
                        renderItem={(item) => <MobileHotelCard item={item} />}
                    />
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100/50 overflow-hidden relative">
                    <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80"></div>
                    <div className="p-1">
                        <Table
                            columns={columns}
                            dataSource={dataHotels}
                            rowKey="_id"
                            loading={loading}
                            pagination={{
                                current: filterParams.page,
                                pageSize: filterParams.limit,
                                total: total,
                                showSizeChanger: false,
                                position: ["bottomCenter"],
                                className: "p-6 pb-2"
                            }}
                            onChange={handleTableChange}
                            className="admin-table [&_.ant-table-thead_th]:!bg-white [&_.ant-table-thead_th]:!text-gray-400 [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!text-[11px] [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-b-gray-100 [&_.ant-table-thead_th]:!py-6 [&_.ant-table-tbody_tr:hover]:!bg-gray-50/50 [&_.ant-table-tbody_td]:!border-b-gray-50 [&_.ant-table-tbody_td]:!py-4"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminViewHotel;