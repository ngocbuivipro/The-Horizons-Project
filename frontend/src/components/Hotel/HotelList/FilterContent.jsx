import { IoIosSearch, IoMdCheckmark } from "react-icons/io";
import { Slider, Input } from "antd";

const formatVND = (value) =>
    value.toLocaleString("vi-VN") + " ₫";

const FilterContent = ({
                           filterParams,
                           setFilterParams,
                           tempSearch,
                           setTempSearch,
                           priceRange,
                           handlePriceChange,
                           handlePriceAfterChange,
                           handleMainSearch,
                       }) => {

    // --- 1. Xử lý logic Toggle cho Services (Mảng) ---
    const handleToggleService = (serviceKey) => {
        setFilterParams((prev) => {
            const currentServices = prev.services || [];
            let newServices;

            // Nếu đã có thì xóa đi (uncheck)
            if (currentServices.includes(serviceKey)) {
                newServices = currentServices.filter((s) => s !== serviceKey);
            } else {
                // Nếu chưa có thì thêm vào (check)
                newServices = [...currentServices, serviceKey];
            }

            return { ...prev, services: newServices, page: 1 };
        });
    };

    // --- 2. Xử lý logic Toggle cho Star (Single Select hoặc Toggle tắt/bật) ---
    const handleToggleStar = (star) => {
        setFilterParams((prev) => ({
            ...prev,
            // Nếu đang chọn sao này rồi thì bỏ chọn (null), ngược lại thì set sao mới
            stars: prev.stars === star ? null : star,
            page: 1
        }));
    };

    const SectionTitle = ({ title }) => (
        <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">{title}</h4>
    );

    const SelectableRow = ({ label, isSelected, onClick, subLabel }) => (
        <div
            onClick={onClick}
            className={`
                flex items-center justify-between py-2 cursor-pointer transition-all duration-200 group select-none
            `}
        >
            <div className="flex flex-col">
                <span className={`text-sm ${isSelected ? 'font-bold text-gray-900' : 'text-gray-600 group-hover:text-gray-800'}`}>
                    {label}
                </span>
                {subLabel && <span className="text-xs text-gray-400">{subLabel}</span>}
            </div>

            {/* Checkbox Visual */}
            <div className={`
                w-5 h-5 rounded border flex items-center justify-center transition-colors
                ${isSelected ? 'bg-red-500 border-red-500' : 'border-gray-300 bg-white group-hover:border-gray-400'}
            `}>
                {isSelected && <IoMdCheckmark className="text-white text-xs" />}
            </div>
        </div>
    );

    return (
        <div className={`
            flex flex-col gap-6 
            lg:bg-white lg:rounded-xl lg:p-5 lg:border lg:border-gray-100 lg:shadow-sm
        `}>
            {/* 1. Search Name */}
            <div>
                <SectionTitle title="Search by Hotel Name" />
                <Input
                    prefix={<IoIosSearch className="text-gray-400 text-lg mr-2" />}
                    placeholder="e.g. Hotel Plaza"
                    value={tempSearch}
                    onChange={(e) => setTempSearch(e.target.value)}
                    maxLength={255}
                    status={tempSearch?.length >= 255 ? "error" : undefined}
                    className="w-full rounded-lg py-2.5 bg-gray-50 border-gray-200 hover:bg-white focus:bg-white focus:border-red-400 transition-all"
                    allowClear
                />
                {tempSearch?.length >= 255 && (
                    <div className="text-red-500 text-xs mt-1.5 font-medium">
                        Hotel name cannot exceed 255 characters.
                    </div>
                )}
            </div>

            <hr className="border-gray-100" />

            {/* 2. Popular Filters (Đã sửa logic onClick) */}
            {/*<div>*/}
            {/*    <SectionTitle title="Popular" />*/}
            {/*    <div className="flex flex-col gap-1">*/}
            {/*        <SelectableRow*/}
            {/*            label="Breakfast Included"*/}
            {/*            // Kiểm tra xem 'breakfast' có trong mảng services không*/}
            {/*            isSelected={filterParams.services?.includes("breakfast")}*/}
            {/*            // Gọi hàm toggle*/}
            {/*            onClick={() => handleToggleService("breakfast")}*/}
            {/*        />*/}
            {/*        <SelectableRow*/}
            {/*            label="Free Cancellation"*/}
            {/*            // Ví dụ key là 'free_cancellation', bạn cần đổi theo backend của bạn*/}
            {/*            isSelected={filterParams.services?.includes("free_cancellation")}*/}
            {/*            onClick={() => handleToggleService("free_cancellation")}*/}
            {/*        />*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/*<hr className="border-gray-100" />*/}

            {/* 3. Price Range */}
            <div>
                <div className="text-center font-bold text-gray-800 mb-4 uppercase text-sm tracking-wide">
                    Price Range
                </div>

                <div className="flex items-center justify-between mb-6 gap-2">
                    <div className="flex flex-col w-full">
                        <span className="text-[10px] text-gray-400 mb-1 ml-1">Min</span>
                        <div className="bg-gray-100 text-gray-700 text-sm font-semibold py-2 px-3 rounded-lg text-center">
                            {formatVND(priceRange[0])}
                        </div>
                    </div>
                    <span className="text-gray-300 mt-4">—</span>
                    <div className="flex flex-col w-full">
                        <span className="text-[10px] text-gray-400 mb-1 ml-1">Max</span>
                        <div className="bg-gray-100 text-gray-700 text-sm font-semibold py-2 px-3 rounded-lg text-center">
                            {formatVND(priceRange[1])}
                        </div>
                    </div>
                </div>

                <div className="px-2 pb-2">
                    <Slider
                        range
                        min={0}
                        max={20000000}
                        step={100000}
                        value={priceRange}
                        onChange={handlePriceChange}
                        onAfterChange={handlePriceAfterChange}
                        trackStyle={[{ backgroundColor: '#84cc16', height: 6, borderRadius: 4 }]}
                        railStyle={{ backgroundColor: '#ecfccb', height: 6, borderRadius: 4 }}
                        handleStyle={[
                            {
                                backgroundColor: '#fff',
                                borderColor: '#fff',
                                borderRadius: '50%',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                opacity: 1,
                            },
                            {
                                backgroundColor: '#fff',
                                borderColor: '#fff',
                                borderRadius: '50%',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                opacity: 1,
                            },
                        ]}
                        tooltip={{ open: false }}
                    />
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* 4. Star Rating (Đã sửa logic onClick) */}
            <div>
                <SectionTitle title="Star Rating" />
                <div className="flex flex-col gap-1">
                    {[5, 4, 3].map(star => (
                        <SelectableRow
                            key={star}
                            label={
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">{star} Star Hotels</span>
                                </div>
                            }
                            // So sánh star hiện tại với filter
                            isSelected={filterParams.stars === star}
                            // Gọi hàm toggle star
                            onClick={() => handleToggleStar(star)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterContent;