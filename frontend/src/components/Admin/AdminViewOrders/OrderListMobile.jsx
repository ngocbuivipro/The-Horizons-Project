import { Button, Tag, Empty, Pagination } from "antd";
import {
    CheckCircleOutlined, DeleteOutlined, UserOutlined,
    HomeOutlined, CarOutlined, CompassOutlined, RocketOutlined,
    StopOutlined
} from "@ant-design/icons";

const OrderListMobile = ({
                             data,
                             pagination,
                             handleMobilePageChange,
                             onConfirm,
                             onSoftDelete,
                             onHardDelete // Recieve the prop
                         }) => {

    if (!data || data.length === 0) {
        return <Empty description="No bookings found" className="py-10" />;
    }

    const getStatusTag = (status) => {
        let color = "default";
        let textClass = "text-gray-500";
        if (status === "PENDING") { color = "gold"; textClass = "text-yellow-700"; }
        if (status === "CONFIRM" || status === "CONFIRMED") { color = "purple"; textClass = "text-purple-700"; }
        if (status === "CANCELLED") { color = "error"; textClass = "text-red-600"; }
        return (
            <Tag color={color} className={`rounded-md px-2 py-0.5 font-bold border-0 ${status.includes('CONFIRM') ? 'bg-purple-100' : ''} ${textClass}`}>
                {status}
            </Tag>
        );
    };

    const getServiceInfo = (item) => {
        switch (item.bookingType) {
            case "HOTEL":
                return {
                    name: item.roomType?.hotel?.name || item.productName,
                    sub: item.roomType?.RoomType || "Room",
                    icon: <HomeOutlined />,
                    colorClass: "bg-blue-500",
                    tagColor: "blue",
                    tagLabel: "HOTEL"
                };
            case "TOUR":
                return {
                    name: item.tour?.name || item.productName,
                    sub: `${item.guests} Guest(s)`,
                    icon: <CompassOutlined />,
                    colorClass: "bg-orange-500",
                    tagColor: "orange",
                    tagLabel: "TOUR"
                };
            case "CRUISE":
                return {
                    name: item.cruise?.title || item.productName,
                    sub: item.cruise?.city || "cruise Trip",
                    icon: <RocketOutlined />,
                    colorClass: "bg-cyan-500",
                    tagColor: "cyan",
                    tagLabel: "CRUISE"
                };
            case "BUS":
                return {
                    name: item.productName || "Bus Trip",
                    sub: (item.bus?.cityFrom && item.bus?.cityTo) ? `${item.bus.cityFrom} -> ${item.bus.cityTo}` : "Seat Ticket",
                    icon: <CarOutlined />,
                    colorClass: "bg-emerald-500",
                    tagColor: "green",
                    tagLabel: "BUS"
                };
            default:
                return {
                    name: item.productName || "Unknown Service",
                    sub: "",
                    icon: <UserOutlined />,
                    colorClass: "bg-gray-400",
                    tagColor: "default",
                    tagLabel: "MISC"
                };
        }
    };

    return (
        <div className="space-y-4 pb-4">
            {data.map(item => {
                const serviceInfo = getServiceInfo(item);

                return (
                    <div key={item._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                        {/* Top Bar: Dynamic Color */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${serviceInfo.colorClass}`}></div>

                        {/* Header: ID, Type and Status */}
                        <div className="flex justify-between items-center mb-3 pl-2">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                    #{item._id.slice(-6).toUpperCase()}
                                </span>
                                <Tag color={serviceInfo.tagColor} className="mr-0 text-[10px] font-bold border-0">
                                    {serviceInfo.icon} {serviceInfo.tagLabel}
                                </Tag>
                            </div>
                            {getStatusTag(item.status)}
                        </div>

                        {/* Content Grid */}
                        <div className="pl-2 space-y-3">
                            {/* Service Info */}
                            <div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-0.5">
                                    <span className="text-gray-400">{serviceInfo.icon}</span>
                                    <span className="truncate">{serviceInfo.name}</span>
                                </div>
                                <div className="text-[11px] text-gray-500 pl-4 truncate">
                                    {serviceInfo.sub}
                                </div>
                            </div>

                            {/* Customer & Date */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-800">{item.name }</span>
                                        <span className="text-[10px] text-gray-400">{ item.email}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Check-in</div>
                                    <div className="text-xs font-mono font-medium text-gray-700">
                                        {item.checkIn ? new Date(item.checkIn).toLocaleDateString("en-GB", { day: '2-digit', month: '2-digit' }) : "--/--"}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 my-2"></div>

                            {/* Footer: Price and Actions */}
                            <div className="flex justify-between items-center pt-1">
                                <div className="flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Total</span>
                                    <span className="text-lg font-extrabold text-gray-800 leading-tight">
                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.totalPriceVND || 0)}
                                    </span>
                                    <span className={`text-[10px] font-bold ${item.isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                                        {item.isPaid ? "PAID" : "UNPAID"} • {item.paymentMethod}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    {/* Confirm Button */}
                                    {item.status !== 'CONFIRM' && item.status !== 'CONFIRMED' && (
                                        <Button
                                            type="primary"
                                            shape="circle"
                                            size="middle"
                                            className="bg-purple-600 hover:bg-purple-500"
                                            icon={<CheckCircleOutlined />}
                                            onClick={() => onConfirm(item)}
                                        />
                                    )}

                                    {/* Soft Delete (Trash) */}
                                    {/*<Button*/}
                                    {/*    shape="circle"*/}
                                    {/*    size="middle"*/}
                                    {/*    className="text-orange-500 border-orange-200 hover:text-orange-600 hover:border-orange-400"*/}
                                    {/*    icon={<DeleteOutlined />}*/}
                                    {/*    onClick={() => onSoftDelete(item)}*/}
                                    {/*/>*/}

                                    {/* Hard Delete (Permanent) - NEW */}
                                    <Button
                                        danger
                                        shape="circle"
                                        size="middle"
                                        icon={<StopOutlined />}
                                        onClick={() => onHardDelete(item)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Mobile Pagination */}
            <div className="flex justify-center pt-2">
                <Pagination
                    simple
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onChange={handleMobilePageChange}
                />
            </div>
        </div>
    );
};

export default OrderListMobile;