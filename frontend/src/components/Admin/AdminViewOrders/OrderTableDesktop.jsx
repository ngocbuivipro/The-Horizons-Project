import { Table, Button, Tag, Dropdown } from "antd";
import {
    CheckCircleOutlined, HomeOutlined, CarOutlined,
    CalendarOutlined, EllipsisOutlined,
    CompassOutlined, RocketOutlined, StopOutlined
} from "@ant-design/icons";
import moment from "moment";

const OrderTableDesktop = ({
                               data,
                               loading,
                               pagination,
                               handleTableChange,
                               onConfirm,
                               onSoftDelete,
                               onHardDelete, // Recieve the prop
                           }) => {

    const columns = [
        {
            title: "Reference",
            dataIndex: "_id",
            key: "_id",
            width: 110,
            align: 'center',
            render: (text) => (
                <Tag color="default" className="font-mono font-bold border-0 bg-slate-100 text-slate-600">
                    #{text.slice(-6).toUpperCase()}
                </Tag>
            )
        },
        {
            title: "Customer",
            key: "customer",
            width: 250,
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 leading-tight">Name: {record.fullName || record.name || "Guest User"}</span>
                        <span className="text-xs text-slate-400">Email: {record.email}</span>
                    </div>
                </div>
            )
        },
        {
            title: "Service Detail",
            key: "service",
            render: (_, record) => {
                let serviceName = record.productName || "Unknown Service";
                let subDetail = "";
                let Icon = HomeOutlined;
                let iconColor = "text-gray-500";

                switch (record.bookingType) {
                    case "HOTEL":
                        serviceName = record.roomType?.hotel?.name || record.productName;
                        subDetail = record.roomType?.RoomType || "Room Booking";
                        Icon = HomeOutlined;
                        iconColor = "text-blue-500";
                        break;
                    case "BUS":
                        serviceName = record.productName || "Bus Ticket";
                        if (record.bus?.cityFrom && record.bus?.cityTo) {
                            subDetail = `${record.bus.cityFrom} -> ${record.bus.cityTo}`;
                        } else {
                            subDetail = "Bus Route";
                        }
                        Icon = CarOutlined;
                        iconColor = "text-emerald-500";
                        break;
                    case "TOUR":
                        serviceName = record.tour?.name || record.productName;
                        subDetail = `${record.guests} Guest(s)`;
                        Icon = CompassOutlined;
                        iconColor = "text-orange-500";
                        break;
                    case "CRUISE":
                        { serviceName = record.cruise?.title || record.productName;
                        const city = record.cruise?.city ? `${record.cruise.city}` : "";
                        const dur = record.cruise?.duration ? ` • ${record.cruise.duration} Days` : "";
                        subDetail = city + dur;
                        Icon = RocketOutlined;
                        iconColor = "text-cyan-600";
                        break; }
                    default:
                        serviceName = record.productName || "Service #" + record._id.slice(-4);
                }

                return (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Icon className={iconColor} />
                            <div className="flex flex-col">
                                <span className="font-medium text-slate-700 truncate max-w-[250px]" title={serviceName}>
                                    {serviceName}
                                </span>
                                {subDetail && (
                                    <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{subDetail}</span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            title: "Schedule",
            key: "schedule",
            width: 150,
            render: (_, record) => (
                <div className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded w-fit">
                    <CalendarOutlined className="text-slate-400"/>
                    {moment(record.checkIn).format("DD/MM")} - {moment(record.checkOut).format("DD/MM/YYYY")}
                </div>
            )
        },
        {
            title: "Total & Payment",
            key: "payment",
            width: 160,
            render: (_, record) => (
                <div>
                    <div className="font-bold text-slate-800">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.totalPriceVND || 0)}
                    </div>
                    {record.isPaid ? (
                        <Tag color="success" bordered={false} className="mt-1 text-[10px] px-1 py-0 m-0">
                            PAID • {record.paymentMethod}
                        </Tag>
                    ) : (
                        <Tag color="warning" bordered={false} className="mt-1 text-[10px] px-1 py-0 m-0">
                            UNPAID • {record.paymentMethod}
                        </Tag>
                    )}
                </div>
            )
        },
        {
            title: "Status",
            key: "status",
            width: 120,
            render: (_, record) => {
                let color = "default";
                let text = record.status;
                if (text === "CONFIRM" || text === "CONFIRMED") { color = "green"; text = "Confirmed"; }
                if (text === "PENDING") { color = "blue"; text = "Pending"; }
                if (text === "CANCELLED") { color = "red"; text = "Cancelled"; }
                if (text === "UNPAID") { color = "orange"; text = "Unpaid"; }

                return (
                    <Tag color={color} className="font-semibold px-3 py-1 text-center min-w-[80px]">
                        {text}
                    </Tag>
                );
            }
        },
        {
            title: "",
            key: "action",
            align: 'center',
            width: 60,
            render: (_, record) => {
                const items = [
                    !record.isPaid && {
                        key: '1',
                        label: 'Mark as Paid',
                        icon: <CheckCircleOutlined className="text-green-500"/>,
                        onClick: () => onConfirm(record)
                    },
                    // {
                    //     key: '2',
                    //     label: 'Move to Trash',
                    //     icon: <DeleteOutlined className="text-orange-500"/>,
                    //     onClick: () => onSoftDelete(record)
                    // },
                    {
                        key: '2',
                        type: 'divider'
                    },
                    {
                        key: '3',
                        label: 'Delete Permanently',
                        icon: <StopOutlined className="text-red-600"/>,
                        danger: true,
                        onClick: () => onHardDelete(record)
                    }
                ].filter(Boolean);

                return (
                    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                        <Button type="text" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100" icon={<EllipsisOutlined />} />
                    </Dropdown>
                );
            }
        }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <Table
                columns={columns}
                dataSource={data}
                rowKey="_id"
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: false,
                    className: "p-4 font-medium opacity-80"
                }}
                onChange={handleTableChange}
                scroll={{ x: 1100 }}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
        </div>
    );
};

export default OrderTableDesktop;