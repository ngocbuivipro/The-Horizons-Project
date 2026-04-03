import React, { useMemo } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from "recharts";

const Dashboard = () => {

    const revenueData = useMemo(() => ([
        { name: "Week 1", sales: 20, profit: 15 },
        { name: "Week 2", sales: 40, profit: 25 },
        { name: "Week 3", sales: 60, profit: 45 },
        { name: "Week 4", sales: 80, profit: 65 },
        { name: "Week 5", sales: 100, profit: 85 },
    ]), []);

    const salesAnalyticsData = useMemo(() => ([
        { year: 2015, sales: 25, profit: 20 },
        { year: 2016, sales: 40, profit: 35 },
        { year: 2017, sales: 60, profit: 50 },
        { year: 2018, sales: 75, profit: 65 },
        { year: 2019, sales: 100, profit: 90 },
    ]), []);

    const customerData = useMemo(() => ([
        { name: "New Customers", value: 42 },
        { name: "Repeated", value: 14 },
    ]), []);

    const topProductsData = useMemo(() => ([
        { name: "Bus", sales: 400 },
        { name: "Train", sales: 300 },
        { name: "Tour", sales: 250 },
        { name: "Hotel", sales: 180 },
        { name: "Cruises", sales: 120 },
    ]), []);

    const COLORS = ["#1E90FF", "#32CD32"];

    return (
        // Container chính: Padding thay đổi theo màn hình (p-4 -> p-8)
        <div className="p-2 md:p-4 lg:p-6 min-h-screen bg-gray-50/50 mb-6">

            {/* Header: Font size linh hoạt */}
            <div className="mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 drop-shadow-sm">
                    Dashboard Overview
                </h2>
                <p className="text-sm md:text-base text-gray-500 mt-1">Welcome back, here's what's happening today.</p>
            </div>

            {/* GRID LAYOUT CHÍNH
          - Mobile: 1 cột
          - Tablet (md): 2 cột
          - Desktop lớn (xl): 3 cột
      */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">

                {/* --- 1. REVENUE CHART ---
            Span: Full width trên mobile, Span 2 trên tablet/desktop để biểu đồ dài dễ nhìn
        */}
                <div className="col-span-1 md:col-span-2 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-800">Revenue</h3>
                        <select className="p-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto">
                            <option>This Year</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div className="h-64 md:h-72 lg:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" stroke="#9CA3AF" tick={{fontSize: 12}} />
                                <YAxis stroke="#9CA3AF" tick={{fontSize: 12}} />
                                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Legend verticalAlign="top" height={36} />
                                <Line type="monotone" dataKey="sales" stroke="#FF4500" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                                <Line type="monotone" dataKey="profit" stroke="#4169E1" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- 2. CUSTOMERS (Pie Chart) --- */}
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition min-w-0">
                    <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">Customers</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={customerData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {customerData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#1E90FF]"></span>
                            <span className="text-gray-600 font-medium">New: 349</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#32CD32]"></span>
                            <span className="text-gray-600 font-medium">Return: 20</span>
                        </div>
                    </div>
                </div>

                {/* --- 3. TOP PRODUCTS (Bar Chart) --- */}
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition min-w-0">
                    <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">Top Products</h3>
                    <div className="h-64 md:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProductsData} layout="vertical" margin={{left: 0}}>
                                {/* Layout vertical thường dễ nhìn hơn trên mobile cho tên sản phẩm dài */}
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={70} stroke="#6B7280" tick={{fontSize: 12, fontWeight: 500}} />
                                <Tooltip cursor={{fill: '#f3f4f6'}} />
                                <Bar dataKey="sales" fill="#1E90FF" radius={[0, 4, 4, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- 4. SALES ANALYTICS --- */}
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition min-w-0">
                    <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">Sales Analytics</h3>
                    <div className="h-64 md:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesAnalyticsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="year" stroke="#9CA3AF" tick={{fontSize: 12}} />
                                <YAxis stroke="#9CA3AF" tick={{fontSize: 12}} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="sales" stroke="#1E90FF" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="profit" stroke="#32CD32" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- 5. ORDERS SUMMARY --- */}
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition min-w-0 flex flex-col justify-center items-center">
                    <h3 className="text-lg md:text-xl font-semibold mb-6 text-gray-800 w-full text-left">Orders Summary</h3>

                    <div className="relative w-40 h-40 flex items-center justify-center bg-indigo-50 rounded-full mb-4">
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold text-indigo-600">1,245</p>
                            <p className="text-xs text-indigo-400 font-medium uppercase tracking-wide">Total Orders</p>
                        </div>
                    </div>

                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 8.586 15.586 4H12z" clipRule="evenodd" />
                        </svg>
                        +12% increase this month
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;