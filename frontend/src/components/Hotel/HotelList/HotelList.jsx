import { useEffect, useState, useCallback } from "react";
import { Select, Pagination, Modal, Button } from "antd";

import Item from "./Item.jsx";
import FilterContent from "./FilterContent.jsx";
import { cities } from "../../../common/common.js";
import { getAllHotelApi } from "../../../api/client/api.js";
import {BsGridFill, BsListUl} from "react-icons/bs";
import { HOTEL_TYPES } from "../../Admin/hotel/constants/constants";

const HotelList = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [openMobileFilter, setOpenMobileFilter] = useState(false);
    const [viewMode, setViewMode] = useState("list");

    const [filterParams, setFilterParams] = useState({
        page: 1, limit: 6, search: "", city: "", type: "", minPrice: 0, maxPrice: 20000000, sort: "newest", stars: null
    });

    const [tempSearch, setTempSearch] = useState("");
    const [priceRange, setPriceRange] = useState([0, 20000000]);
    const [propertyType, setPropertyType] = useState("");

    /* Ensure parameters are evaluated correctly before triggering network requests to avoid redundant calls */
    const fetchHotels = useCallback(async () => {
        setLoading(true);
        try {
            const paramsToSend = { ...filterParams, minPrice: priceRange[0], maxPrice: priceRange[1] };
            const response = await getAllHotelApi(paramsToSend);

            if (response?.success) {
                setData(response.data || []);
                setTotal(response.total || 0);
            } else {
                setData([]);
                setTotal(0);
            }
        } catch (error) {
            console.error("Fetch hotels failed:", error);
            setData([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [filterParams, priceRange]);

    useEffect(() => {
        fetchHotels();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [fetchHotels]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (tempSearch !== filterParams.search) {
                setFilterParams(prev => ({
                    ...prev,
                    page: 1,
                    search: tempSearch
                }));
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [tempSearch, filterParams.search]);

    const handleMainSearch = () => {
        setFilterParams(prev => ({
            ...prev,
            page: 1,
            search: tempSearch,
            type: propertyType || ""
        }));
    };

    const handleClearFilters = () => {
        setTempSearch("");
        setPropertyType("");
        setPriceRange([0, 20000000]);
        setFilterParams({ page: 1, limit: 6, search: "", city: "", type: "", minPrice: 0, maxPrice: 20000000, sort: "newest", stars: null });
    };

    return (
        <div className="w-full min-h-screen font-sans text-gray-800 relative">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">

                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-3 mt-8 mb-10 border border-gray-100 hidden lg:flex items-center gap-2">
                    <div className="flex-1 px-4 border-r border-gray-100">
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">Location</label>
                        <Select
                            showSearch
                            variant="borderless"
                            placeholder="Where?"
                            className="w-full -ml-3"
                            onChange={(val) => setFilterParams(p => ({...p, city: val}))}
                            options={cities.map(c => ({value: c.name, label: c.name}))}
                            notFoundContent={<span className="text-red-500 font-medium">No matching location found.</span>}
                        />
                    </div>
                    <div className="flex-1 px-4 border-r border-gray-100">
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">Property Type</label>
                        <Select
                            variant="borderless"
                            placeholder="Select property type"
                            className="w-full -ml-3"
                            value={propertyType || undefined}
                            onChange={(value) => setPropertyType(value)}
                            options={HOTEL_TYPES.map((type) => ({ value: type, label: type }))}
                        />
                    </div>
                    <button
                        onClick={handleMainSearch}
                        disabled={!filterParams.city && !propertyType}
                        className={`font-bold h-12 w-28 rounded-xl transition-colors shadow-lg ${
                            !filterParams.city && !propertyType
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                                : "bg-red-500 hover:bg-red-600 text-white shadow-red-200"
                        }`}
                    >
                        Search
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start relative">
                    <aside className="hidden lg:block lg:col-span-1 sticky top-24">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Filters</h3>
                            <Button 
                                onClick={handleClearFilters} 
                                type="primary"
                                danger
                                className="rounded-full px-6 py-4 h-auto font-bold text-sm shadow-md transition-transform hover:scale-105"
                            >
                                Reset
                            </Button>
                        </div>
                        <FilterContent
                            filterParams={filterParams} setFilterParams={setFilterParams}
                            tempSearch={tempSearch} setTempSearch={setTempSearch}
                            priceRange={priceRange} handlePriceChange={setPriceRange}
                            handlePriceAfterChange={() => setFilterParams(p => ({...p, page: 1}))}
                            handleMainSearch={handleMainSearch}
                        />
                    </aside>

                    <div className="lg:col-span-3 w-full">
                        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6">
                            <h2 className="text-lg font-bold text-gray-800">{total} Properties Found</h2>

                            <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => setOpenMobileFilter(true)}
                                    className="lg:hidden flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                                >
                                    Filters
                                </button>

                                <div className="hidden md:flex bg-white border border-gray-200 p-1 rounded-lg">
                                    <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-red-500' : 'text-gray-400'}`}><BsGridFill size={16}/></button>
                                    <button onClick={() => setViewMode("list")} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100 text-red-500' : 'text-gray-400'}`}><BsListUl size={18}/></button>
                                </div>

                                <Select
                                    variant="borderless"
                                    className="font-bold w-36 md:w-32"
                                    value={filterParams.sort}
                                    onChange={(val) => setFilterParams(prev => ({...prev, sort: val, page: 1}))}
                                    options={[
                                        { value: "newest", label: "Recommended" },
                                        { value: "price_asc", label: "Price Low" },
                                        { value: "price_desc", label: "Price High" }
                                    ]}
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-80 bg-white rounded-2xl border border-gray-100">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                            </div>
                        ) : (
                            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-5"}>
                                {data.map((hotel) => <Item i={hotel} key={hotel._id} viewMode={viewMode} />)}
                                {data.length === 0 && <div className="text-center py-10 text-gray-500">No properties found.</div>}
                            </div>
                        )}

                        {data.length > 0 && !loading && (
                            <div className="mt-8 flex justify-center">
                                <Pagination current={filterParams.page} total={total} pageSize={filterParams.limit} onChange={(p) => setFilterParams(prev => ({...prev, page: p}))} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                open={openMobileFilter}
                onCancel={() => setOpenMobileFilter(false)}
                footer={null}
                closeIcon={<span className="font-bold text-gray-600 px-2">X</span>}
                centered
                width="90%"
            >
                <FilterContent
                    filterParams={filterParams} setFilterParams={setFilterParams}
                    tempSearch={tempSearch} setTempSearch={setTempSearch}
                    priceRange={priceRange} handlePriceChange={setPriceRange}
                    handlePriceAfterChange={() => setFilterParams(p => ({...p, page: 1}))}
                    handleMainSearch={handleMainSearch}
                />
            </Modal>
        </div>
    );
};

export default HotelList;
