import { Table, Button, Input, Tag, Switch, Popconfirm, Tooltip } from "antd";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
    getAllCarRoutesApi,
    deleteCarRouteApi,
    updateCarRouteApi
} from "../../../api/client/car.api.js";

const AdminViewRouteTransfer = () => {
    const navigate = useNavigate();

    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    /*
     * Centralized data fetching mechanism.
     * Wrapped in useCallback to prevent unnecessary re-creations across renders.
     */
    const fetchRoutes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAllCarRoutesApi();
            if (res?.success && res?.data) {
                setRoutes(res.data);
            } else {
                toast.error(res?.message || "Failed to fetch routes.");
            }
        } catch (error) {
            toast.error(error?.message || "Internal server error while fetching data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoutes();
    }, [fetchRoutes]);

    /*
     * Handles state mutations for route activation status.
     * Implements optimistic-like behavior by refreshing strictly after API confirms success.
     */
    const handleStatusChange = useCallback(async (checked, record) => {
        try {
            const res = await updateCarRouteApi(record._id, { isActive: checked });
            if (res?.success) {
                toast.success(`Route status updated successfully`);
                fetchRoutes();
            } else {
                toast.error(res?.message || "Failed to update route status");
            }
        } catch (error) {
            toast.error(error?.message || "Error occurred during status update");
        }
    }, [fetchRoutes]);

    /*
     * Processes route deletion with immediate local state update
     * to prevent UI flicker while bypassing an immediate secondary API call.
     */
    const handleDelete = useCallback(async (id) => {
        try {
            const res = await deleteCarRouteApi(id);
            if (res?.success) {
                toast.success("Route deleted successfully");
                setRoutes(prev => prev.filter(item => item._id !== id));
            } else {
                toast.error(res?.message || "Failed to delete route");
            }
        } catch (error) {
            toast.error(error?.message || "Error occurred during deletion");
        }
    }, []);

    /*
     * Memoized computed dataset for filtering logic.
     * Guarantees that the filtering operation only runs when dependencies change.
     */
    const filteredData = useMemo(() => {
        if (!searchText.trim()) return routes;

        const search = searchText.toLowerCase();
        return routes.filter(item =>
            item.origin?.toLowerCase().includes(search) ||
            item.destination?.toLowerCase().includes(search)
        );
    }, [routes, searchText]);

    const columns = [
        {
            title: 'ORIGIN',
            dataIndex: 'origin',
            key: 'origin',
            render: (text) => <span className="font-bold text-gray-800">{text}</span>
        },
        {
            title: 'DESTINATION',
            dataIndex: 'destination',
            key: 'destination',
            render: (text) => <span className="font-bold text-gray-800">{text}</span>
        },
        {
            title: 'DISTANCE',
            dataIndex: 'distance',
            key: 'distance',
            render: (text) => <span className="text-gray-600">{text} km</span>
        },
        {
            title: 'DURATION',
            dataIndex: 'duration',
            key: 'duration',
            render: (text) => <span className="text-gray-600">{text}</span>
        },
        {
            title: 'POPULAR',
            dataIndex: 'isPopular',
            key: 'isPopular',
            render: (isPopular) => (
                isPopular ?
                    <Tag color="orange" className="!rounded-full font-semibold">Popular</Tag> :
                    <Tag className="!rounded-full text-gray-500">Standard</Tag>
            )
        },
        {
            title: 'STATUS',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive, record) => (
                <Switch
                    checked={isActive}
                    onChange={(checked) => handleStatusChange(checked, record)}
                    size="small"
                    className={isActive ? "!bg-indigo-500" : "!bg-gray-300"}
                />
            )
        },
        {
            title: 'ACTIONS',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <div className="flex gap-4">
                    <button
                        className="text-blue-500 hover:text-blue-700 font-medium transition-colors"
                        onClick={() => navigate(`/dashboard-update-route-transfer/${record._id}`)}
                    >
                        Edit
                    </button>

                    <Popconfirm
                        title="Delete Route"
                        description="Are you sure you want to delete this route?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <button className="text-red-500 hover:text-red-700 font-medium transition-colors">
                            Delete
                        </button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-indigo-600 uppercase">Car Routes</h1>
                <p className="text-sm text-gray-500 mt-1">Manage pricing and details for all car transfer routes.</p>
            </div>

            <div className="bg-transparent md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-100 md:p-6">

                {/* Responsive Control Panel */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                        <Input
                            placeholder="Search routes..."
                            className="w-full sm:w-[250px] !bg-white md:!bg-gray-50 !border-gray-200 !rounded-xl hover:!bg-white focus:!bg-white py-2"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button className="flex-1 sm:flex-none !rounded-xl !border-gray-200 !text-gray-600 py-2 h-auto">
                                Filter
                            </Button>
                            <Button
                                type="primary"
                                className="flex-1 sm:flex-none !bg-indigo-600 !rounded-xl hover:!bg-indigo-700 shadow-lg shadow-indigo-200 py-2 h-auto"
                                onClick={() => navigate('/dashboard-create-route-transfer')}
                            >
                                + New
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile View: Card Layout */}
                <div className="md:hidden flex flex-col gap-4">
                    {loading ? (
                        <div className="text-center text-gray-500 py-8">Loading...</div>
                    ) : filteredData.length === 0 ? (
                        <div className="text-center text-gray-500 py-8 bg-white rounded-xl border">No routes found</div>
                    ) : (
                        filteredData.map(item => (
                            <div key={item._id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
                                        <span>{item.origin}</span>
                                        <span className="text-gray-400 font-normal">-&gt;</span>
                                        <span>{item.destination}</span>
                                    </div>
                                    <Tag color={item.isActive ? "green" : "default"} className="!m-0 !rounded-md">
                                        {item.isActive ? "Active" : "Inactive"}
                                    </Tag>
                                </div>

                                <div className="text-xs text-gray-400 mb-4">
                                    ID: #{item._id?.slice(-5) || 'N/A'}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-500 tracking-wider mb-1">DISTANCE</div>
                                        <div className="text-sm font-semibold text-gray-800">{item.distance} km</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-500 tracking-wider mb-1">DURATION</div>
                                        <div className="text-sm font-semibold text-gray-800">{item.duration}</div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <div>
                                        {item.isPopular ? (
                                            <span className="text-orange-500 font-bold text-sm">Popular</span>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Standard Route</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => navigate(`/dashboard-update-route-transfer/${item._id}`)}
                                            className="text-blue-600 text-sm font-semibold"
                                        >
                                            Edit
                                        </button>
                                        <Popconfirm
                                            title="Delete Route"
                                            description="Are you sure?"
                                            onConfirm={() => handleDelete(item._id)}
                                            okText="Yes"
                                            cancelText="No"
                                            okButtonProps={{ danger: true }}
                                        >
                                            <button className="text-red-500 text-sm font-semibold">
                                                Delete
                                            </button>
                                        </Popconfirm>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View: Table Layout */}
                <div className="hidden md:block">
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="_id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} results`,
                            className: "mt-4"
                        }}
                        rowClassName="hover:bg-gray-50/50 transition-colors"
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminViewRouteTransfer;