import {  FaCalendarAlt, FaClock, FaInfoCircle } from "react-icons/fa";
import { Button } from "antd";

const CarSummarySidebar = ({ searchParams, selectedCar, onBookNow }) => {

    // Format Date
    const dateStr = searchParams.date?.format("ddd, MMM D");
    const timeStr = searchParams.time?.format("h:mm A");
    const endTimeStr = searchParams.type === 'By the hour'
        ? searchParams.time?.add(searchParams.duration, 'hour').format("h:mm A")
        : null;

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 p-4 text-white">
                <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-2">
                    {searchParams.type}
                </div>

                <div className="flex items-start gap-2 text-sm mb-1">
                    <FaCalendarAlt className="mt-0.5 opacity-80" />
                    <span>{dateStr}</span>
                </div>
                <div className="flex items-start gap-2 text-sm font-bold">
                    <FaClock className="mt-0.5 opacity-80" />
                    <span>{timeStr} {endTimeStr && `- ${endTimeStr}`}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Location */}
                <div className="mb-6 relative">
                    <div className="absolute left-[5px] top-[6px] bottom-[20px] w-0.5 bg-gray-200"></div>

                    <div className="flex gap-3 mb-4 relative z-10">
                        <div className="w-3 h-3 rounded-full bg-blue-600 mt-1.5 border-2 border-white ring-1 ring-gray-200"></div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Pick-up</p>
                            <p className="text-gray-800 font-medium text-sm line-clamp-1" title={searchParams.from}>
                                {searchParams.from || "Select location"}
                            </p>
                        </div>
                    </div>

                    {searchParams.type === 'One-way' && (
                        <div className="flex gap-3 relative z-10">
                            <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 border-2 border-white ring-1 ring-gray-200"></div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Drop-off</p>
                                <p className="text-gray-800 font-medium text-sm line-clamp-1" title={searchParams.to}>
                                    {searchParams.to || "Select location"}
                                </p>
                            </div>
                        </div>
                    )}

                    {searchParams.type === 'By the hour' && (
                        <div className="ml-6 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                            Duration: <span className="font-bold">{searchParams.duration} hours</span>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                {/* Price Details */}
                <div className="mb-2">
                    <h4 className="text-sm font-bold text-gray-800 mb-3">Price details</h4>
                    {selectedCar ? (
                        <>
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>{selectedCar.name}</span>
                                <span>${selectedCar.price}</span>
                            </div>
                            {searchParams.type === 'By the hour' && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <FaInfoCircle />
                                    <span className="underline">{(searchParams.duration * 20)} km included</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Select a vehicle to see price</p>
                    )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-end mt-6 mb-4">
                    <span className="text-gray-600 font-medium">Total</span>
                    <span className="text-3xl font-bold text-gray-900">
                        ${selectedCar ? selectedCar.price : 0}
                    </span>
                </div>

                {/* Note */}
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
                    <p className="text-xs text-green-800 flex gap-2">
                        <FaInfoCircle className="shrink-0 mt-0.5"/>
                        Free cancellation up to 24 hours before your pickup time.
                    </p>
                </div>

                <Button
                    type="primary"
                    size="large"
                    block
                    className="bg-blue-600 h-12 text-base font-bold rounded-full"
                    disabled={!selectedCar}
                    onClick={onBookNow}
                >
                    Next: Checkout
                </Button>
            </div>
        </div>
    );
};

export default CarSummarySidebar;
