import React, { useState, useEffect } from "react";
import {FaPlus, FaTrash, FaSave, FaMoneyBillWave, FaCoins} from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios from "axios";

const AdminExchangeRateSetting = () => {
    // State to store the list of exchange rates. Defaults to one empty row if there is no data
    const [ratesList, setRatesList] = useState([
        { currency: "", rate: "" }
    ]);
    const BASE_URL = import.meta.env.VITE_BASE_URI;

    const [loading, setLoading] = useState(false);

    // 1. Fetch existing data when the component mounts
    useEffect(() => {

        const fetchData = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/rates`);
                console.log("res, ", res.data)
                if (res.data.success) {
                    const dataApi = res.data.data; // { USD: 24000, EUR: 27000 }
                    console.log("data api ", dataApi)
                    // Chuyển đổi Object {KEY: VALUE} sang Array [{currency: KEY, rate: VALUE}] để map ra UI
                    const formattedList = Object.keys(dataApi).map(key => ({
                        currency: key,
                        rate: dataApi[key]
                    }));
                    // Nếu có dữ liệu thì set, không thì để mặc định 1 dòng trống
                    if (formattedList.length > 0) {
                        setRatesList(formattedList);
                    }
                }
            } catch (error) {
                console.error("Error loading rates", error);
            }
        };
        fetchData();
    }, []);
    // 2. Handle input changes
    const handleChange = (index, field, value) => {
        const updatedList = [...ratesList];
        // If the field is 'currency', convert it to uppercase for standardization (e.g., usd -> USD)
        updatedList[index][field] = field === "currency" ? value.toUpperCase() : value;
        setRatesList(updatedList);
    };

    // 3. Add a new row
    const handleAddRow = () => {
        setRatesList([...ratesList, { currency: "", rate: "" }]);
        // Automatically scroll to the bottom when adding a new row (Optional logic could go here)
    };

    // 4. Remove a row
    const handleRemoveRow = (index) => {
        const updatedList = [...ratesList];
        updatedList.splice(index, 1);
        setRatesList(updatedList);
    };

    // 5. Save data (Submit)
    const handleSave = async () => {
        // Basic validation: Filter out empty rows
        const validRates = ratesList.filter(item => item.currency && item.rate);

        if (validRates.length === 0) {
            return toast.error("Please enter at least one currency.");
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            // Call Bulk Update API
            await axios.put(`${BASE_URL}/rates`, { rates: validRates }, config);

            toast.success("Exchange rates updated successfully!");
        } catch (error) {
            toast.error("Error saving exchange rates!");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        // CHANGE 1: Change 'min-h-[...]' to 'h-[...]' to fix the frame height,
        // allowing the content inside to know its limits for displaying the scrollbar.
        <div className="max-w-full w-full max-h-screen mx-auto mt-2 p-6 mx-4 lg:p-10 bg-white shadow-2xl shadow-indigo-100 rounded-3xl border border-slate-100 h-[calc(100vh-3rem)] flex flex-col">

            {/* --- Header Section --- */}
            <div className="mb-6 border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                    <span className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                        <FaCoins />
                    </span>
                        Exchange Rate
                    </h2>
                    <p className="text-slate-500 text-base mt-2 font-medium">
                        Manage exchange rates to VND for the entire system.
                    </p>
                </div>
            </div>

            {/* CHANGE 2: Add 'overflow-y-auto' for vertical scrolling and 'pr-2' for a better-looking scrollbar */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">

                {/* --- Table Header (Hidden on Mobile, Visible on Desktop) --- */}
                <div className="hidden md:grid grid-cols-12 gap-6 px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 rounded-lg border border-slate-100 sticky top-0 z-10 backdrop-blur-sm">
                    <div className="col-span-5 pl-2 border-r border-slate-500">Currency</div>
                    <div className="col-span-6 border-r border-slate-500">Exchange Rate (to VND)</div>
                    <div className="col-span-1 text-center">Action</div>
                </div>

                {/* --- Dynamic Input Rows --- */}
                <div className="space-y-4 pb-2">
                    {ratesList.map((item, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start md:items-center p-5 md:p-4 border border-slate-200 rounded-2xl bg-white hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group relative animate-fadeIn"
                        >
                            {/* Mobile Delete Button */}
                            <button
                                onClick={() => handleRemoveRow(index)}
                                className="md:hidden absolute top-3 right-3 text-slate-300 hover:text-red-500 transition p-2"
                            >
                                <FaTrash size={14} />
                            </button>

                            {/* Input Currency Name */}
                            <div className="col-span-1 md:col-span-5">
                                <label className="md:hidden block text-xs font-bold text-slate-500 mb-1.5 uppercase">Currency</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 text-sm font-bold">{index + 1}</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="E.g., USD"
                                        value={item.currency}
                                        onChange={(e) => handleChange(index, "currency", e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 placeholder-slate-300 uppercase"
                                    />
                                </div>
                            </div>

                            {/* Input Rate Value */}
                            <div className="col-span-1 md:col-span-6">
                                <label className="md:hidden block text-xs font-bold text-slate-500 mb-1.5 uppercase">Exchange Rate (VND)</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-indigo-500 transition-colors">
                                        <FaMoneyBillWave />
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="E.g., 25000"
                                        value={item.rate}
                                        onChange={(e) => handleChange(index, "rate", e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400 bg-slate-100 px-2 py-1 rounded">VND</span>
                                </div>
                            </div>

                            {/* Desktop Delete Button */}
                            <div className="col-span-1 hidden md:flex justify-center">
                                <button
                                    onClick={() => handleRemoveRow(index)}
                                    className="w-10 h-10 flex items-center justify-center text-slate-400 bg-transparent hover:bg-red-50 hover:text-red-500 rounded-full transition-all duration-200 group-hover:bg-slate-50 group-hover:text-slate-500"
                                    title="Remove this row"
                                >
                                    <FaTrash size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State Decorator */}
                {ratesList.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <p className="text-slate-400 font-medium">No exchange rates have been set up yet.</p>
                        <button onClick={handleAddRow} className="text-indigo-600 font-bold mt-2 hover:underline">Add one now</button>
                    </div>
                )}
            </div>

            {/* --- Footer Action Buttons --- */}
            <div className="mt-4 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4 justify-between flex-shrink-0 bg-white">
                <button
                    onClick={handleAddRow}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                >
                    <div className="p-1 bg-slate-100 rounded-full text-inherit"><FaPlus size={10} /></div>
                    Add Currency
                </button>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all active:scale-95 ml-auto ${
                        loading ? "opacity-70 cursor-not-allowed grayscale" : ""
                    }`}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Processing...
                    </span>
                    ) : (
                        <>
                            <FaSave size={18} />
                            <span>Save Changes</span>
                        </>
                    )}
                </button>
            </div>

        </div>
    );
};

export default AdminExchangeRateSetting;