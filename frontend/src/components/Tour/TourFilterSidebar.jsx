import { useState, useEffect } from "react";
import { DatePicker, Select, Slider, InputNumber, Button } from "antd";
import { IoSearchOutline } from "react-icons/io5";
import { IoMdFunnel } from "react-icons/io";
import { cities } from "../../common/common.js";
import dayjs from "dayjs";

const TourFilterSidebar = ({
                               filterParams,
                               setFilterParams,
                               tempSearch,
                               setTempSearch,
                               handleMainSearch, // unused now but kept for backwards compatibility
                               isInsideModal = false // Prop to check if rendered inside the popup
                           }) => {
    // --- LOCAL STATE FOR PRICE ---
    const [priceRange, setPriceRange] = useState([filterParams.minPrice || 0, filterParams.maxPrice || 30000000]);

    // Sync local state if parent resets filters
    useEffect(() => {
        setPriceRange([filterParams.minPrice || 0, filterParams.maxPrice || 30000000]);
    }, [filterParams.minPrice, filterParams.maxPrice]);

    // Formatters for Currency Input
    const currencyFormatter = (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const currencyParser = (value) => value ? value.replace(/\.\s?|(,*)/g, '') : '';

    const onPriceChangeComplete = (val) => {
        setFilterParams(prev => ({
            ...prev,
            minPrice: val[0],
            maxPrice: val[1],
            page: 1
        }));
    };

    // Auto-apply search when typing (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (filterParams.search !== tempSearch) {
                setFilterParams(prev => ({ ...prev, search: tempSearch, page: 1 }));
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [tempSearch, filterParams.search, setFilterParams]);

    const handleReset = () => {
        setFilterParams(prev => ({
            ...prev,
            city: undefined,
            minPrice: 0,
            maxPrice: 30000000,
            duration: null,
            startDate: null,
            endDate: null,
            search: "",
            page: 1
        }));
        setTempSearch("");
    };

    return (
        <div className={isInsideModal ? "" : "bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"}>
            {/* Header (Desktop Mode Only) */}
            {!isInsideModal && (
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <IoMdFunnel /> Filters
                    </h3>
                    <Button 
                        onClick={handleReset} 
                        type="primary"
                        danger
                        className="rounded-full px-6 py-4 h-auto font-bold text-sm shadow-md transition-transform hover:scale-105"
                    >
                        Reset
                    </Button>
                </div>
            )}

            <div className={`space-y-7 divide-y divide-gray-100 ${isInsideModal ? 'p-6' : ''}`}>
                
                {/* 1. Search */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-3 text-sm">Search Name</h4>
                    <div className="relative">
                        <IoSearchOutline className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search tours..."
                            value={tempSearch}
                            onChange={(e) => setTempSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* 2. Price Range */}
                <div className="pt-6">
                    <h4 className="font-bold text-gray-900 mb-4 text-sm">Price Range (VND)</h4>
                    <div className="px-1">
                        <div className="flex items-center justify-between gap-2 mb-4">
                            <div className="flex flex-col gap-1 w-full">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Min</span>
                                <InputNumber
                                    className="w-full bg-gray-50 border-gray-200 rounded-lg text-xs font-bold text-gray-700 pointer-events-none"
                                    min={0}
                                    max={priceRange[1]}
                                    value={priceRange[0]}
                                    readOnly
                                    formatter={currencyFormatter}
                                    parser={currencyParser}
                                    suffix="đ"
                                    controls={false}
                                />
                            </div>
                            <div className="mt-4 text-gray-300">—</div>
                            <div className="flex flex-col gap-1 w-full">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Max</span>
                                <InputNumber
                                    className="w-full bg-gray-50 border-gray-200 rounded-lg text-xs font-bold text-gray-700 pointer-events-none"
                                    min={priceRange[0]}
                                    max={30000000}
                                    value={priceRange[1]}
                                    readOnly
                                    formatter={currencyFormatter}
                                    parser={currencyParser}
                                    suffix="đ"
                                    controls={false}
                                />
                            </div>
                        </div>

                        <Slider
                            range
                            min={0}
                            max={30000000}
                            step={50000}
                            value={priceRange}
                            onChange={(val) => setPriceRange(val)}
                            onChangeComplete={(val) => onPriceChangeComplete(val)}
                            trackStyle={[{ backgroundColor: '#84cc16', height: 6, borderRadius: 4 }]}
                            railStyle={{ backgroundColor: '#ecfccb', height: 6, borderRadius: 4 }}
                            handleStyle={[
                                { borderColor: '#fff', backgroundColor: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', opacity: 1 },
                                { borderColor: '#fff', backgroundColor: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', opacity: 1 }
                            ]}
                        />
                    </div>
                </div>

                {/* 3. Destinations */}
                <div className="pt-6">
                    <h4 className="font-bold text-gray-900 mb-3 text-sm">Location</h4>
                    <Select
                        showSearch
                        allowClear
                        className="w-full"
                        style={{ height: '42px' }}
                        placeholder="Select destination..."
                        optionFilterProp="children"
                        value={filterParams.city || undefined}
                        onChange={(value) => setFilterParams(prev => ({ ...prev, city: value, page: 1 }))}
                        options={cities.map(c => ({ value: c.name, label: c.name }))}
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                    />
                </div>

                {/* 4. Travel Dates */}
                {/* <div className="pt-6">
                    <h4 className="font-bold text-gray-900 mb-3 text-sm">Travel Dates</h4>
                    <div className="flex flex-col gap-3">
                        <DatePicker 
                            className="w-full py-2.5 bg-gray-50 border-gray-200 rounded-lg text-sm hover:border-red-500 focus:border-red-500"
                            placeholder="Start Date" 
                            format="DD/MM/YYYY" 
                            value={filterParams.startDate ? dayjs(filterParams.startDate, "DD/MM/YYYY") : null}
                            onChange={(date, dateString) => setFilterParams(prev => ({ ...prev, startDate: dateString, page: 1 }))} 
                        />
                        <DatePicker 
                            className="w-full py-2.5 bg-gray-50 border-gray-200 rounded-lg text-sm hover:border-red-500 focus:border-red-500"
                            placeholder="End Date" 
                            format="DD/MM/YYYY" 
                            value={filterParams.endDate ? dayjs(filterParams.endDate, "DD/MM/YYYY") : null}
                            onChange={(date, dateString) => setFilterParams(prev => ({ ...prev, endDate: dateString, page: 1 }))} 
                        />
                    </div>
                </div> */}

                {/* 5. Max Duration */}
                <div className="pt-6">
                    <h4 className="font-bold text-gray-900 mb-3 text-sm">Max Duration (Days)</h4>
                    <input 
                        type="number" 
                        min={1} 
                        placeholder="e.g. 3" 
                        value={filterParams.duration || ""} 
                        onChange={(e) => setFilterParams(prev => ({ ...prev, duration: e.target.value, page: 1 }))} 
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all" 
                    />
                </div>

            </div>
        </div>
    );
};

export default TourFilterSidebar;