import { useEffect, useState, useCallback } from "react";
import { Select, Modal, Button, Pagination } from "antd";

// Icons
import { BsGridFill, BsListUl } from "react-icons/bs";
import { IoMdFunnel, IoMdClose } from "react-icons/io";
import { LuCalendarDays, LuMapPin, LuUsers } from "react-icons/lu";

// Internal Imports
import { searchCruiseApi, getCruiseTypesApi } from "../../api/client/service.api.js";
import { cities } from "../../common/common.js"; // Đảm bảo import đúng đường dẫn
import CruiseItem from "./CruiseItem";
import CruiseFilterSidebar from "./CruiseFilterSidebar"; // Import Sidebar

const CruiseList = () => {
    // --- Data State ---
    const [cruises, setCruises] = useState([]);
    const [cruiseTypes, setCruiseTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- UI State ---
    const [viewMode, setViewMode] = useState('grid');
    const [showMobileFilter, setShowMobileFilter] = useState(false);

    // --- Filter & Pagination State ---
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
    });

    const [sortBy, setSortBy] = useState('recommended');

    const [filters, setFilters] = useState({
        city: null,
        date: "",
        guests: 4,
        type: "",
        priceRange: [0, 50000000],
        durations: [],
        stars: [],
        amenities: [],
        search: "",
        sortBy: 'recommended',
        page: 1
    });

    // --- Local State for Price Range and Search (UI Only) ---
    const [priceRange, setPriceRange] = useState(filters.priceRange);
    const [localSearch, setLocalSearch] = useState(filters.search);

    useEffect(() => {
        setPriceRange(filters.priceRange);
    }, [filters.priceRange]);

    useEffect(() => {
        setLocalSearch(filters.search);
    }, [filters.search]);

    // --- Fetch Data ---
    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const [cruiseRes, typeRes] = await Promise.all([
                searchCruiseApi(filters),
                getCruiseTypesApi()
            ]);

            if (cruiseRes && cruiseRes.success) {
                setCruises(cruiseRes.data);
                setPagination({
                    currentPage: cruiseRes.currentPage,
                    totalPages: cruiseRes.totalPages,
                    totalItems: cruiseRes.total
                });
            }

            if (typeRes && typeRes.success) {
                const formattedTypes = typeRes.data.map(item => ({
                    name: item._id,
                    count: item.count,
                    img: item.thumbnail
                }));
                setCruiseTypes(formattedTypes);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // --- Handlers ---
    const executeSearch = async (currentFilters) => {
        setLoading(true);
        try {
            const response = await searchCruiseApi(currentFilters);
            if (response && response.success) {
                setCruises(response.data);
                setPagination({
                    currentPage: response.currentPage,
                    totalPages: response.totalPages,
                    totalItems: response.total
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setShowMobileFilter(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== filters.search) {
                const params = { ...filters, search: localSearch, page: 1 };
                setFilters(params);
                executeSearch(params);
            }
        }, 500);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localSearch]);

    const handleSearch = () => {
        const params = { ...filters, page: 1 };
        setFilters(params);
        executeSearch(params);
    };

    const handlePriceChangeComplete = (newRange) => {
        const params = { ...filters, priceRange: newRange, page: 1 };
        setFilters(params);
        executeSearch(params);
    };

    const handlePageChange = (page) => {
        const params = { ...filters, page: page };
        setFilters(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        executeSearch(params);
    };

    // Handler dùng chung cho Sidebar & Pills
    const handleCheckboxChange = (category, value) => {
        const currentList = filters[category];
        const newList = currentList.includes(value)
            ? currentList.filter(item => item !== value)
            : [...currentList, value];
        const newFilters = { ...filters, [category]: newList, page: 1 };
        setFilters(newFilters);
        executeSearch(newFilters);
    };

    const handleTypeChange = (typeName) => {
        const newType = filters.type === typeName ? "" : typeName;
        setFilters({ ...filters, type: newType, page: 1 });
        executeSearch({ ...filters, type: newType, page: 1 }); // Gọi search ngay khi click pill
    };

    const handleClearFilters = () => {
        const resetFilters = {
            city: null,
            date: "",
            guests: 4,
            type: "",
            priceRange: [0, 50000000],
            durations: [],
            amenities: [],
            search: "",
            page: 1
        };
        setFilters(resetFilters);
        setPriceRange([0, 50000000]);
        executeSearch(resetFilters);
    };

    const activeFilterCount = [
        filters.city,
        filters.date,
        filters.type,
        filters.durations.length > 0
    ].filter(Boolean).length;

    return (
        <div className="w-full max-w-[1350px] mx-auto px-4 md:px-6 my-4">

            {/* --- TOP SEARCH SECTION (Giữ nguyên hoặc dùng component HeaderSearch nếu có) --- */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Find your dream cruise</h1>
                <p className="text-gray-500 mb-6">Explore the world's best destinations by sea.</p>
                {/* (Phần Search Bar code cũ của bạn có thể để ở đây) */}
            </div>

            {/* --- 2. CATEGORIES (Pills) - GIỮ NGUYÊN TYPE CỦA BẠN --- */}
            {/* Đây là phần bạn yêu cầu giữ lại, hiển thị ngang */}
            {/* <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                <div className="flex gap-4 min-w-max">
                    {cruiseTypes.map((type, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleTypeChange(type.name)}
                            className={`
                                flex items-center gap-3 p-2.5 pr-5 rounded-full border cursor-pointer transition-all hover:shadow-md
                                ${filters.type === type.name
                                ? 'bg-red-50 border-red-500 ring-1 ring-red-500' // Active state
                                : 'bg-white border-gray-100 hover:border-gray-200' // Inactive state (như hình bạn gửi)
                            }
                            `}
                        >
                            <img
                                src={type.img}
                                alt={type.name}
                                className="w-9 h-9 rounded-full object-cover"
                            />
                            <div className="flex flex-col">
                                <span className="font-bold text-sm text-gray-800 leading-tight">
                                    {type.name}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                    {type.count} Cruises
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div> */}

            {/* --- MAIN LAYOUT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Sidebar (Desktop) - Dùng Component tách biệt */}
                <aside className="hidden lg:block lg:col-span-3 sticky top-24">
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2"><IoMdFunnel /> Filters</h3>
                            <Button 
                                onClick={handleClearFilters} 
                                type="primary"
                                danger
                                className="rounded-full px-6 py-4 h-auto font-bold text-sm shadow-md transition-transform hover:scale-105"
                            >
                                Reset
                            </Button>
                        </div>

                        <CruiseFilterSidebar
                            filters={filters}
                            setFilters={setFilters}
                            localSearch={localSearch}
                            setLocalSearch={setLocalSearch}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            onPriceChangeComplete={handlePriceChangeComplete}
                            onCheckboxChange={handleCheckboxChange}
                            onTypeChange={handleTypeChange}
                            cruiseTypes={cruiseTypes}
                        />
                    </div>
                </aside>

                {/* Content Area */}
                <div className="lg:col-span-9 w-full min-w-0">

                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <h2 className="text-lg font-bold text-gray-800">
                            {pagination.totalItems} Properties Found
                        </h2>

                        <div className="flex items-center gap-3 ml-auto">
                            <button
                                onClick={() => setShowMobileFilter(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold shadow-sm"
                            >
                                <IoMdFunnel /> Filters
                                {activeFilterCount > 0 && <span className="bg-blue-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{activeFilterCount}</span>}
                            </button>

                            <div className="hidden md:flex bg-gray-100 p-1 rounded-lg">
                                <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}><BsGridFill size={16} /></button>
                                <button onClick={() => setViewMode("list")} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}><BsListUl size={18} /></button>
                            </div>

                            <Select
                                value={sortBy}
                                variant="borderless"
                                className="font-bold min-w-[150px]"
                                onChange={(value) => {
                                    setSortBy(value);
                                    const newFilters = { ...filters, sortBy: value, page: 1 };
                                    setFilters(newFilters);
                                    executeSearch(newFilters);
                                }}
                                options={[
                                    { value: 'recommended', label: 'Recommended' },
                                    { value: 'price_asc', label: 'Price: Low to High' },
                                    { value: 'price_desc', label: 'Price: High to Low' },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Results Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center h-80 bg-white rounded-2xl border border-gray-100">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
                            {cruises.length > 0 ? (
                                cruises.map(cruise => <CruiseItem key={cruise._id} data={cruise} viewMode={viewMode} />)
                            ) : (
                                <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-gray-200">
                                    <h3 className="font-bold text-gray-800 text-lg">No cruises found</h3>
                                    <p className="text-gray-500 text-sm mt-1 mb-4">Try adjusting your filters.</p>
                                    <Button onClick={handleClearFilters} type="primary" className="bg-blue-600">Clear Filters</Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalItems > 0 && (
                        <div className="mt-12 flex justify-center">
                            <Pagination
                                current={pagination.currentPage}
                                total={pagination.totalItems}
                                pageSize={10}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* --- Mobile Filter Modal --- */}
            <Modal
                open={showMobileFilter}
                onCancel={() => setShowMobileFilter(false)}
                footer={null}
                centered
                closable={false}
                width={500}
                styles={{
                    content: { borderRadius: '24px', padding: 0, overflow: 'hidden' },
                    body: { padding: 0, height: '80vh', display: 'flex', flexDirection: 'column' }
                }}
            >
                <div className="flex flex-col h-full bg-white">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white shrink-0">
                        <h3 className="text-xl font-bold text-gray-900">Filter properties</h3>
                        <button onClick={() => setShowMobileFilter(false)} className="p-2 -mr-2 text-gray-400 hover:bg-gray-100 rounded-full"><IoMdClose size={24} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                        <CruiseFilterSidebar
                            filters={filters}
                            setFilters={setFilters}
                            localSearch={localSearch}
                            setLocalSearch={setLocalSearch}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            onPriceChangeComplete={handlePriceChangeComplete}
                            onCheckboxChange={handleCheckboxChange}
                            onTypeChange={handleTypeChange}
                            cruiseTypes={cruiseTypes}
                        />
                    </div>
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
                        <span className="font-bold text-gray-900">{activeFilterCount} selected</span>
                        <Button type="primary" size="large" onClick={handleSearch} className="bg-blue-600 flex-1">Show Results</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CruiseList;