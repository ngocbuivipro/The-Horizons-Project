import { useState, useEffect } from "react";
import { Button, Select, DatePicker, Slider, Checkbox, Input, Collapse, InputNumber } from "antd";
import { SwapOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { cities } from "../../common/common.js";

const { Panel } = Collapse;
const { Option } = Select;

const TIME_RANGES = [
    { label: "Early Morning (00-06)", value: "00-06" },
    { label: "Morning (06-12)", value: "06-12" },
    { label: "Afternoon (12-18)", value: "12-18" },
    { label: "Evening (18-24)", value: "18-24" },
];

const BusFilterSidebar = ({
                              searchParams,
                              setSearchParams,
                              tempKeyword,
                              setTempKeyword,
                              handleKeywordSearch,
                              handleSwapLocations,
                              availableOperators,
                              busTypes,
                          }) => {
    // --- LOCAL STATE FOR PRICE ---
    // Dùng state này để hiển thị UI mượt mà, chưa gọi API ngay
    const [priceRange, setPriceRange] = useState([searchParams.minPrice, searchParams.maxPrice]);

    // Đồng bộ lại local state nếu searchParams thay đổi từ bên ngoài (ví dụ nút Reset)
    useEffect(() => {
        setPriceRange([searchParams.minPrice, searchParams.maxPrice]);
    }, [searchParams.minPrice, searchParams.maxPrice]);

    const SectionTitle = ({ title }) => (
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 mt-1">{title}</h4>
    );

    const handleReset = () => {
        setTempKeyword("");
        const defaultMin = 0;
        const defaultMax = 50000000;
        setPriceRange([defaultMin, defaultMax]); // Reset UI ngay lập tức
        setSearchParams(prev => ({
            ...prev,
            cityFrom: undefined,
            cityTo: undefined,
            date: null,
            minPrice: defaultMin,
            maxPrice: defaultMax,
            operators: [],
            timeRanges: [],
            type: [],
            keyword: ""
        }));
    };

    // Hàm xử lý Apply Price
    const handleApplyPrice = () => {
        setSearchParams(prev => ({
            ...prev,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            page: 1
        }));
    };

    // Formatter tiền tệ cho InputNumber
    const currencyFormatter = (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const currencyParser = (value) => value.replace(/\.\s?|(,*)/g, '');

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-blue-600 text-white md:bg-white md:text-gray-800 md:rounded-t-lg flex justify-between items-center">
                <h3 className="font-bold text-lg">Filters</h3>
                <button
                    onClick={handleReset}
                    className="text-xs font-medium hover:text-blue-600 underline text-gray-100 md:text-gray-500"
                >
                    Reset
                </button>
            </div>

            <div className="p-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar">

                {/* 1. Date */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <label className="text-xs font-bold uppercase tracking-wider mb-2 block text-blue-800">Departure Date</label>
                    <DatePicker
                        className="w-full h-9 border-blue-200 rounded"
                        format="DD/MM/YYYY"
                        placeholder="Select Date"
                        value={searchParams.date ? dayjs(searchParams.date) : null}
                        onChange={(d) => setSearchParams(prev => ({ ...prev, date: d, page: 1 }))}
                    />
                </div>

                {/* 2. Route Selection */}
                <div>
                    <SectionTitle title="Route" />
                    <div className="space-y-2 relative">
                        <Select
                            className="w-full" placeholder="From" showSearch allowClear optionFilterProp="children"
                            value={searchParams.cityFrom}
                            onChange={(val) => setSearchParams(prev => ({ ...prev, cityFrom: val, page: 1 }))}
                        >
                            {cities.map((city, idx) => <Option key={idx} value={city.name}>{city.name}</Option>)}
                        </Select>

                        <div className="flex justify-center -my-1 relative z-10">
                            <Button shape="circle" size="small" icon={<SwapOutlined rotate={90} className="text-blue-600" />} onClick={handleSwapLocations} className="shadow-sm border-blue-100" />
                        </div>

                        <Select
                            className="w-full" placeholder="To" showSearch allowClear optionFilterProp="children"
                            value={searchParams.cityTo}
                            onChange={(val) => setSearchParams(prev => ({ ...prev, cityTo: val, page: 1 }))}
                        >
                            {cities.map((city, idx) => <Option key={idx} value={city.name}>{city.name}</Option>)}
                        </Select>
                    </div>
                </div>

                {/* 3. Keyword Search */}
                <div>
                    <SectionTitle title="Bus Operator / Keyword" />
                    <Input
                        prefix={<SearchOutlined className="text-gray-400" />}
                        placeholder="Type bus name..."
                        value={tempKeyword}
                        onChange={(e) => setTempKeyword(e.target.value)}
                        onPressEnter={handleKeywordSearch}
                        className="rounded-md"
                        allowClear
                    />
                    <Button type="primary" block className="mt-2 bg-blue-600 border-none" onClick={handleKeywordSearch}>Apply</Button>
                </div>

                {/* 4. Price Slider (UPDATED UI) */}
                <div>
                    <SectionTitle title="Price Range" />
                    <div className="px-1">
                        {/* Inputs Row */}
                        <div className="flex items-center justify-between gap-2 mb-4">
                            <div className="flex flex-col gap-1 w-full">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Min</span>
                                <InputNumber
                                    className="w-full bg-gray-50 border-gray-200 rounded-lg text-xs font-bold text-gray-700"
                                    min={0}
                                    style={{width : "100%"}}
                                    max={priceRange[1]} // Không lớn hơn max
                                    value={priceRange[0]}
                                    onChange={(val) => setPriceRange([val, priceRange[1]])}
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
                                    className="w-full bg-gray-50 border-gray-200 rounded-lg text-xs font-bold text-gray-700"
                                    min={priceRange[0]} // Không nhỏ hơn min
                                    max={50000000}
                                    style={{width : "100%"}}

                                    value={priceRange[1]}
                                    onChange={(val) => setPriceRange([priceRange[0], val])}
                                    formatter={currencyFormatter}
                                    parser={currencyParser}
                                    suffix="đ"
                                    controls={false}
                                />
                            </div>
                        </div>

                        {/* Slider */}
                        <Slider
                            range
                            min={0}
                            max={50000000} // Set max hợp lý với thực tế (ví dụ 50 triệu hoặc 20 triệu)
                            step={50000}
                            value={priceRange}
                            onChange={(val) => setPriceRange(val)}
                            trackStyle={[{ backgroundColor: '#84cc16', height: 6, borderRadius: 4 }]}
                            // Rail: Light Greenish/Gray background
                            railStyle={{ backgroundColor: '#ecfccb', height: 6, borderRadius: 4 }}
                            handleStyle={[
                                {
                                    backgroundColor: '#fff',
                                    borderColor: '#fff', // White border to blend in or match
                                    borderRadius: '50%', // Forces the circle shape
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)', // Soft shadow for depth
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

                        {/* Apply Button */}
                        <div className="flex justify-end mt-4">
                            <Button
                                className="rounded-full px-6 border-gray-300 font-bold text-gray-600 hover:text-blue-600 hover:border-blue-600 transition-colors"
                                size="middle"
                                onClick={handleApplyPrice}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 5. Collapse Filters */}
                <Collapse ghost expandIconPosition="end" className="site-collapse-custom-collapse" defaultActiveKey={['1', '2', '3']}>
                    {busTypes && busTypes.length > 0 && (
                        <Panel header={<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bus Type</span>} key="3">
                            <Checkbox.Group
                                className="flex flex-col gap-2"
                                options={busTypes.map(t => ({
                                    label: t.type || "Standard",
                                    value: t.type === null ? 'standard_null' : t.type
                                }))}
                                value={searchParams.type.map(t => t === null ? 'standard_null' : t)}
                                onChange={(values) => {
                                    const newTypes = values.map(v => v === 'standard_null' ? null : v);
                                    setSearchParams(prev => ({ ...prev, type: newTypes, page: 1 }));
                                }}
                            />
                        </Panel>
                    )}

                    <Panel header={<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Departure Time</span>} key="1">
                        <Checkbox.Group
                            className="flex flex-col gap-2"
                            options={TIME_RANGES}
                            value={searchParams.timeRanges}
                            onChange={(v) => setSearchParams(prev => ({ ...prev, timeRanges: v, page: 1 }))}
                        />
                    </Panel>

                    {availableOperators.length > 0 && (
                        <Panel header={<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Operators</span>} key="2">
                            <div className="max-h-40 overflow-y-auto custom-scrollbar">
                                <Checkbox.Group
                                    className="flex flex-col gap-2"
                                    options={availableOperators}
                                    value={searchParams.operators}
                                    onChange={(v) => setSearchParams(prev => ({ ...prev, operators: v, page: 1 }))}
                                />
                            </div>
                        </Panel>
                    )}
                </Collapse>
            </div>
        </div>
    );
};

export default BusFilterSidebar;
