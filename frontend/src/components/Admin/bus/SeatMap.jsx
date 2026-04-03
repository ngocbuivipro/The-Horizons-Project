import React from 'react';
import { Tooltip } from 'antd';
import { FaUser } from 'react-icons/fa';

const SeatMap = ({ totalSeats, seats, setSeats, readOnly = false }) => {
    // Nếu chưa có seats data (lúc tạo mới), khởi tạo mảng rỗng
    // seats cấu trúc: [{ number: "A01", isBooked: false, user: null }, ...]

    const handleToggleSeat = (seatNumber) => {
        if (readOnly) return;

        const newSeats = seats.map(seat => {
            if (seat.number === seatNumber) {
                // Nếu đã có user đặt thật (user != null), không cho Admin gỡ (hoặc cần warning)
                // Ở đây ta giả định Admin chỉ block/unblock ghế trống
                return { ...seat, isBooked: !seat.isBooked };
            }
            return seat;
        });
        setSeats(newSeats);
    };

    // Render Grid Ghế
    // Giả sử xe 40 chỗ, chia làm 4 cột (2 trái - lối đi - 2 phải)
    // Logic này chỉ mang tính minh họa layout, thực tế tùy loại xe

    return (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex justify-between mb-4 text-xs font-semibold text-gray-500">
                <div className="flex items-center gap-1"><div className="w-4 h-4 bg-white border border-gray-300 rounded"></div> Available</div>
                <div className="flex items-center gap-1"><div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div> Booked/Blocked</div>
                <div className="flex items-center gap-1"><div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div> Selected</div>
            </div>

            <div className="grid grid-cols-4 gap-3 justify-items-center max-w-[300px] mx-auto bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                {/* Driver Seat */}
                <div className="col-span-4 w-full flex justify-end mb-4 border-b border-gray-100 pb-2">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 font-bold text-xs">Driver</div>
                </div>

                {seats.map((seat, index) => {
                    const isBooked = seat.isBooked;
                    const hasUser = seat.user; // Kiểm tra có khách thật không

                    return (
                        <Tooltip key={seat.number} title={hasUser ? `Booked by User` : (isBooked ? "Blocked by Admin" : "Available")}>
                            <div
                                onClick={() => handleToggleSeat(seat.number)}
                                className={`
                                    w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all border-b-4 select-none
                                    ${isBooked
                                    ? (hasUser ? "bg-blue-100 text-blue-600 border-blue-300" : "bg-red-100 text-red-600 border-red-300")
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50 shadow-sm"
                                }
                                    ${(index + 1) % 2 === 0 && (index + 1) % 4 !== 0 ? "mr-4" : ""} 
                                `}
                            >
                                {isBooked && hasUser ? <FaUser size={12}/> : seat.number}
                            </div>
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );
};

export default SeatMap;