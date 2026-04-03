import { useEffect, useState, useCallback, useMemo } from "react";
import { IoMdFunnel } from "react-icons/io";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Button, Select, Pagination, Drawer } from "antd";
import dayjs from "dayjs";

import BusItem from "./BusItem";
import BusFilterSidebar from "./BusFilterSidebar";
import { searchBusApi, getBusType } from "../../api/client/api.js";

const BusList = () => {
    const [loading, setLoading] = useState(false);
    const [apiData, setApiData] = useState([]);
    const [total, setTotal] = useState(0);
    const [openMobileFilter, setOpenMobileFilter] = useState(false);
    const [busTypes, setBusTypes] = useState([]);

    const [searchParams, setSearchParams] = useState({
        page: 1, limit: 10, keyword: "", cityFrom: undefined, cityTo: undefined,
        date: null, minPrice: 0, maxPrice: 50000000,
        operators: [], timeRanges: [],
        type: [],
        sort: 'newest',
    });
    const [tempKeyword, setTempKeyword] = useState("");

    const availableOperators = useMemo(() => apiData.length > 0 ? [...new Set(apiData.map(b => b.poName).filter(Boolean))] : [], [apiData]);

    useEffect(() => {
        const fetchTypes = async () => {
            const res = await getBusType();
            if (res && res.data) {
                setBusTypes(res.data);
            }
        };
        fetchTypes();
    }, []);

    const fetchBuses = useCallback(async () => {
        setLoading(true);
        try {
            const payload = {
                ...searchParams,
                date: searchParams.date ? dayjs(searchParams.date).format("YYYY-MM-DD") : undefined,
            };

            // Clean params
            Object.keys(payload).forEach(k => {
                if (payload[k] === undefined || payload[k] === "") {
                    delete payload[k];
                }
            });


            if (payload.type && payload.type.length > 0) {
                const sanitizedTypes = payload.type.map(t => t === null ? "Standard" : t);
                payload.type = sanitizedTypes.join(',');
            } else {
                delete payload.type;
            }

            if (payload.operators && payload.operators.length > 0) {
                payload.operators = payload.operators.join(',');
            } else {
                delete payload.operators;
            }

            if (payload.timeRanges && payload.timeRanges.length > 0) {
                payload.timeRanges = payload.timeRanges.join(',');
            } else {
                delete payload.timeRanges;
            }

            const response = await searchBusApi(payload);
            setApiData(response?.data || []);
            setTotal(response?.count || 0);
        } catch (error) {
            console.log(error)
            setApiData([]);
        } finally {
            setLoading(false);
        }
    }, [searchParams]);


    useEffect(() => {
        fetchBuses();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [fetchBuses]);

    const handleSwapLocations = () => setSearchParams(prev => ({ ...prev, cityFrom: prev.cityTo, cityTo: prev.cityFrom, page: 1 }));
    const handleKeywordSearch = () => { setSearchParams(prev => ({ ...prev, keyword: tempKeyword, page: 1 })); setOpenMobileFilter(false); };

    // Handle Top Card Click
    const handleTypeClick = (typeName) => {
        if (typeName === undefined) return;
        setSearchParams(prev => {
            const currentTypes = prev.type || [];
            const isSelected = currentTypes.includes(typeName);
            return {
                ...prev,
                type: isSelected
                    ? currentTypes.filter(t => t !== typeName)
                    : [...currentTypes, typeName],
                page: 1
            };
        });
    };

    return (
        <div className="w-full max-w-[1350px] mx-auto my-2 px-4 md:px-6 min-h-screen font-sans">
            {/*<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8 hidden md:flex items-center justify-between">*/}
            {/*    <div>*/}
            {/*        <h1 className="text-xl font-bold text-gray-800">Book Bus Tickets</h1>*/}
            {/*        <p className="text-sm text-gray-500">Travel comfortably across Vietnam</p>*/}
            {/*    </div>*/}
            {/*</div>*/}

            <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Popular Bus Types</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {busTypes.map((cat, idx) => {
                        const displayLabel = cat.type || "Standard";
                        const typeValue = cat.type;

                        const isSelected = searchParams.type.includes(typeValue);

                        // If not "Standard" (null) and not defined string, skip
                        if (!cat.type && cat.count === 0) return null;

                        return (
                            <div
                                key={idx}
                                onClick={() => handleTypeClick(typeValue)}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                                    ${isSelected
                                    ? 'border-blue-600 bg-blue-50 shadow-md ring-1 ring-blue-600'
                                    : 'border-gray-100 bg-white hover:border-blue-500 hover:shadow-md'
                                }
                                `}
                            >
                                <img
                                    src={cat.photo || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=100&q=80"}
                                    alt={displayLabel}
                                    className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div>
                                    <h4 className={`font-bold text-sm ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                                        {displayLabel}
                                    </h4>
                                    <p className="text-xs text-gray-400">{cat.count} buses</p>
                                </div>
                            </div>
                        );
                    })}

                    {busTypes.length === 0 && !loading && (
                        <div className="col-span-4 text-center text-gray-400 text-sm italic">Loading bus types...</div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
                <aside className="hidden lg:block lg:col-span-3 sticky top-24 shrink-0">
                    <BusFilterSidebar
                        searchParams={searchParams}
                        setSearchParams={setSearchParams}
                        tempKeyword={tempKeyword}
                        setTempKeyword={setTempKeyword}
                        handleKeywordSearch={handleKeywordSearch}
                        handleSwapLocations={handleSwapLocations}
                        availableOperators={availableOperators}
                        busTypes={busTypes}
                    />
                </aside>

                <div className="lg:col-span-9 w-full min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-5 pb-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">
                            {total} <span className="font-normal text-gray-500">Trips Found</span>
                        </h2>

                        <div className="flex items-center gap-3 mt-4 sm:mt-0">
                            <span className="text-sm text-gray-500 whitespace-nowrap">Sort By:</span>
                            <Select
                                variant="borderless" className="w-[160px] font-bold text-gray-700"
                                value={searchParams.sort}
                                onChange={(val) => setSearchParams(prev => ({ ...prev, sort: val }))}
                                options={[
                                    { value: 'newest', label: 'Featured' },
                                    { value: 'price_asc', label: 'Price: Low to High' },
                                    { value: 'price_desc', label: 'Price: High to Low' },
                                    { value: 'time_asc', label: 'Earliest Departure' },
                                    { value: 'time_desc', label: 'Latest Departure' },
                                ]}
                            />
                            <Button className="mobile-filter-btn" icon={<IoMdFunnel />} onClick={() => setOpenMobileFilter(true)}>Filter</Button>
                        </div>
                    </div>

                    <div className="bg-blue-600 rounded-lg p-3 md:p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-md text-white gap-3">
                        <div className="flex items-center gap-3">
                            <AiOutlineInfoCircle size={22} className="text-white/90" />
                            <p className="text-sm font-medium">Safe travel with verified bus operators. 24/7 Support.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-80 bg-white rounded-2xl border border-gray-100">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-0">
                                {apiData.length > 0 ? (
                                    apiData.map((bus, index) => <BusItem key={index} data={bus} selectedDate={searchParams.date} />)
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
                                        <h3 className="text-gray-800 font-bold mb-2 text-lg">No buses found</h3>
                                        <p className="text-gray-500 mb-4">Try changing location, date, or filters.</p>
                                        <Button type="primary" onClick={() => setSearchParams(prev => ({...prev, cityFrom: undefined, cityTo: undefined, type: []}))} className="bg-blue-600">Clear Filters</Button>
                                    </div>
                                )}
                            </div>

                            {total > 0 && (
                                <div className="flex justify-center mt-8 mb-6">
                                    <Pagination
                                        current={searchParams.page} pageSize={searchParams.limit} total={total}
                                        onChange={(p, ps) => setSearchParams(prev => ({ ...prev, page: p, limit: ps }))} showSizeChanger={false}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <Drawer title="Filters" placement="right" onClose={() => setOpenMobileFilter(false)} open={openMobileFilter} width="85%" styles={{ body: { padding: 0 } }}>
                <div className="h-full flex flex-col">
                    <BusFilterSidebar
                        searchParams={searchParams}
                        setSearchParams={setSearchParams}
                        tempKeyword={tempKeyword}
                        setTempKeyword={setTempKeyword}
                        handleKeywordSearch={handleKeywordSearch}
                        handleSwapLocations={handleSwapLocations}
                        availableOperators={availableOperators}
                        busTypes={busTypes}
                    />
                    <div className="mt-auto p-4 border-t bg-white">
                        <Button type="primary" block size="large" onClick={() => setOpenMobileFilter(false)} className="bg-blue-600">Show {total} Results</Button>
                    </div>
                </div>
            </Drawer>
        </div>
    );
};

export default BusList;
