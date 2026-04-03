import { useEffect, useState, useCallback } from "react";
import {IoMdClose, IoMdFunnel} from "react-icons/io";
// 1. IMPORT ICONS
import { BsGridFill, BsListUl } from "react-icons/bs";
import {Button, Select, Pagination, Modal} from "antd";
import { getAllToursApi } from "../../api/client/api.js";
import TourItem from "./TourItem.jsx";
import TourFilterSidebar from "./TourFilterSidebar.jsx";


const TourList = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [openMobileFilter, setOpenMobileFilter] = useState(false);

    const [viewMode, setViewMode] = useState("list");

    const [filterParams, setFilterParams] = useState({
        page: 1, limit: 10, search: "", city: "", minPrice: 0, maxPrice: 30000000, sort: "newest", duration: null, startDate: null, endDate: null, category: ""
    });
    const [tempSearch, setTempSearch] = useState("");

    // --- FETCH DATA ---
    const fetchTours = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllToursApi(filterParams);
            if (response && response.success) {
                setData(response.data);
                setTotal(response.total || 0);
            } else {
                setData([]);
                setTotal(0);
            }
        } catch (error) {
            console.error("Error fetchTours:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [filterParams]);

    useEffect(() => {
        fetchTours();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [fetchTours]);

    // --- HANDLERS ---
    const handleMainSearch = () => {
        setFilterParams(prev => ({ ...prev, page: 1, search: tempSearch }));
        setOpenMobileFilter(false);
    };

    const handleCityChange = (checkedValues) => {
        const cityVal = checkedValues.length > 0 ? checkedValues[checkedValues.length - 1] : "";
        setFilterParams(prev => ({ ...prev, page: 1, city: cityVal }));
    };

    const activeFilterCount = [
        filterParams.city,
        filterParams.search,
        filterParams.startDate,
        filterParams.endDate,
        filterParams.duration,
        (filterParams.minPrice > 0 || filterParams.maxPrice < 30000000)
    ].filter(Boolean).length;

    // --- NO CATEGORIES NEEDED ANYMORE ---
    return (
        <div className="w-full min-h-screen py-3 font-sans text-slate-800">

            {/* --- TOP HEADER SECTION --- */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Find your perfect tour</h1>
                <p className="text-gray-500 mb-6">Discover amazing places and exclusive deals curated for you.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
                {/* SIDEBAR */}
                <aside className="hidden lg:block lg:col-span-3 top-24 shrink-0">
                    <TourFilterSidebar
                        filterParams={filterParams} setFilterParams={setFilterParams} tempSearch={tempSearch} setTempSearch={setTempSearch} handleMainSearch={handleMainSearch} handleCityChange={handleCityChange}
                    />
                </aside>

                {/* CONTENT */}
                <div className="lg:col-span-9 w-full min-w-0">

                    {/* Header & Sort */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <h2 className="text-lg font-bold text-gray-800">
                            {total} <span className="font-normal text-gray-500">tours found</span>
                        </h2>

                        <div className="flex items-center gap-3 mt-4 sm:mt-0 ml-auto">
                            <button
                                onClick={() => setOpenMobileFilter(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold shadow-sm"
                            >
                                <IoMdFunnel /> Filters
                                {activeFilterCount > 0 && <span className="bg-teal-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{activeFilterCount}</span>}
                            </button>

                            {/* Grid/List Buttons: Màu teal */}
                            <div className="hidden md:flex gap-1 bg-gray-100 p-1 rounded-lg">
                                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><BsGridFill size={16}/></button>
                                <button onClick={() => setViewMode("list")} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><BsListUl size={18}/></button>
                            </div>

                            <Select
                                variant="borderless"
                                className="w-[180px]"
                                value={filterParams.sort}
                                onChange={(val) => setFilterParams(prev => ({ ...prev, sort: val, page: 1 }))}
                                options={[
                                    { value: "newest", label: "Recommended" },
                                    { value: "price_asc", label: "Price: Low to High" },
                                    { value: "price_desc", label: "Price: High to Low" },
                                ]}
                            />
                        </div>
                    </div>


                    {/*<div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">*/}
                    {/*    <div className="flex items-center gap-4">*/}
                    {/*        /!* Icon: Đặt trên nền trắng để nổi bật *!/*/}
                    {/*        <div className="bg-white p-3 rounded-full shadow-sm text-emerald-600 border border-emerald-100">*/}
                    {/*            <AiOutlineInfoCircle size={24} />*/}
                    {/*        </div>*/}
                    {/*        <div>*/}
                    {/*            <h3 className="font-bold text-lg text-emerald-900">Summer Sale is on!</h3>*/}
                    {/*            <p className="text-sm text-emerald-700 font-medium">*/}
                    {/*                Book early to save up to <span className="text-orange-600 font-bold">20%</span> on summer tours.*/}
                    {/*            </p>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}

                    {/*    /!* Optional: Thêm nút hành động nhẹ nhàng nếu muốn *!/*/}
                    {/*    /!* <button className="text-sm font-bold text-emerald-700 hover:text-emerald-900 underline decoration-2 underline-offset-4">View Details</button> *!/*/}
                    {/*</div>*/}
                    {/* Tour List */}
                    {loading ? (
                        <div className="flex justify-center items-center h-80 bg-white rounded-2xl border border-gray-100">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                            {data.length > 0 ? (
                                data.map((tour) => <TourItem item={tour} key={tour._id} viewMode={viewMode} />)
                            ) : (
                                <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                                    <h3 className="text-gray-600 font-medium mb-2">No tours found</h3>
                                    <Button onClick={() => setFilterParams(prev => ({ ...prev, search: "", city: "", category: "" }))} className="bg-teal-600 text-white border-none hover:bg-teal-700">Clear Filters</Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {data.length > 0 && (
                        <div className="flex justify-center mt-10 mb-6">
                            <Pagination current={filterParams.page} pageSize={filterParams.limit} total={total} onChange={(p) => setFilterParams(prev => ({ ...prev, page: p }))} showSizeChanger={false} />
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Drawer giữ nguyên logic */}
            <Modal
            open={openMobileFilter}
            onCancel={() => setOpenMobileFilter(false)}
            footer={null}
            centered
            width={380} // Width for mobile/tablet popup feel
            closeIcon={null} // Hide default close icon to use custom one
            styles={{
            content: {
                borderRadius: '24px',
                padding: 0,
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            },
            mask: {
                backdropFilter: 'blur(4px)', // Modern blur effect
                backgroundColor: 'rgba(0, 0, 0, 0.45)'
            }
        }}
            >
            <div className="flex flex-col h-[85vh] md:h-auto max-h-[85vh] bg-white">

                {/* --- 1. Custom Header --- */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                    <div>
                        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Filters</h3>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">Refine your search results</p>
                    </div>

                    <button
                        onClick={() => setOpenMobileFilter(false)}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-all active:scale-95"
                    >
                        <IoMdClose size={20} />
                    </button>
                </div>

                {/* --- 2. Content Body --- */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Pass isInsideModal={true} to adjust internal layout */}
                    <TourFilterSidebar
                        filterParams={filterParams}
                        setFilterParams={setFilterParams}
                        tempSearch={tempSearch}
                        setTempSearch={setTempSearch}
                        handleMainSearch={handleMainSearch}
                        isInsideModal={true}
                    />
                </div>

                {/* --- 3. Custom Bottom Bar --- */}
                <div className="p-5 border-t border-gray-100 bg-white shrink-0 flex gap-3">
                    <Button
                        block
                        size="large"
                        onClick={() => {
                            // Reset Logic
                            setFilterParams(prev => ({ ...prev, city: "", minPrice: 0, maxPrice: 10000000, duration: null, search: "" }));
                        }}
                        className="h-12 flex-1 text-sm font-bold rounded-xl border-gray-200 text-gray-600 hover:text-teal-600 hover:border-teal-600"
                    >
                        Reset
                    </Button>

                    <Button
                        type="primary"
                        block
                        size="large"
                        onClick={() => {
                            handleMainSearch();
                            setOpenMobileFilter(false);
                        }}
                        className="h-12 flex-[2] text-base font-bold rounded-xl bg-teal-700 hover:bg-teal-800 shadow-lg shadow-teal-900/10 border-none"
                    >
                        Show Results
                    </Button>
                </div>
            </div>
        </Modal>
        </div>
    );
};
export default TourList;