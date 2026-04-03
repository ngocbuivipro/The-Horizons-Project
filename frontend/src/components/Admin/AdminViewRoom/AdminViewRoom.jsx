import React, { useState, useEffect, useCallback } from "react";
// Remove useDispatch, useSelector
import { AiOutlineSearch } from "react-icons/ai";
import { Popconfirm, Space, Table, Spin } from "antd";
import { Link } from "react-router-dom";
// Import API
import { deleteRoomApi, getAllRoomApi } from "../../../api/client/api.js";
import toast from "react-hot-toast";

const AdminViewRoom = () => {
  const [searchText, setSearchText] = useState("");
  // --- STATE LOCAL thay thế Redux ---
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // State for filtering (Logic cũ của bạn)
  const [dataRooms, setDataRooms] = useState([]);
  const [hotelSelectedId, setHotelSelectedId] = useState("");

  // --- MOBILE PAGINATION STATE ---
  const [mobilePage, setMobilePage] = useState(1);
  const MOBILE_PAGE_SIZE = 5;

  // --- 1. FETCH DATA FUNCTION ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllRoomApi();
      // Kiểm tra cấu trúc response (axios response.data hoặc object lỗi trả về)
      const payload = res;

      if (payload ) {
        setRooms(payload.data || []);
        setDataRooms(payload.data || []);
      } else {
        toast.error(payload.message || "Failed to fetch rooms");
        setRooms([]);
        setDataRooms([]);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Error loading data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Gọi API khi component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset mobile page when data changes
  useEffect(() => {
    setMobilePage(1);
  }, [dataRooms?.length, searchText]);

  // --- 2. FILTERING LOGIC (Updated to use local 'rooms' state) ---
  useEffect(() => {
    let filtered = rooms;

    // Filter by Selected Hotel (Nếu có logic chọn Hotel sau này)
    if (hotelSelectedId.length > 0) {
      filtered = filtered.filter((room) => room.hotel?._id === hotelSelectedId);
    }

    // Filter by Search Text
    if (searchText) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(
          (room) =>
              room?.RoomType?.toLowerCase().includes(lower) ||
              room?.hotel?.city?.toLowerCase().includes(lower) ||
              room?.hotel?.name?.toLowerCase().includes(lower) ||
              room?.hotel?.type?.toLowerCase().includes(lower)
      );
    }

    setDataRooms(filtered);
  }, [searchText, hotelSelectedId, rooms]);

  // --- 3. DELETE HANDLER (Updated) ---
  const confirm = async (record) => {
    try {
      // Đảm bảo record.Hotel tồn tại trước khi lấy _id
      const hotelId = record.hotel?._id;
      const res = await deleteRoomApi(record._id, hotelId);

      if (res && res.success) {
        toast.success("Delete success");
        fetchData(); // Reload data trực tiếp thay vì dispatch action
      } else {
        toast.error(res.message || "Failed to delete room");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting room");
    }
  };

  // --- MOBILE DATA SLICING ---
  const currentMobileData = dataRooms?.slice(
      (mobilePage - 1) * MOBILE_PAGE_SIZE,
      mobilePage * MOBILE_PAGE_SIZE
  );
  const totalMobilePages = Math.ceil((dataRooms?.length || 0) / MOBILE_PAGE_SIZE);

  const columns = [
    {
      title: "Home",
      dataIndex: "hotel",
      key: "Hotel name",
      render: (hotel) => <p className="font-semibold">{hotel?.name || "N/A"}</p>,
    },
    {
      title: "Room Type",
      dataIndex: "RoomType",
      key: "RoomType",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text) => <span className="text-emerald-600 font-bold">{new Intl.NumberFormat("de-DE").format(text)} VND</span>,
    },
    {
      title: "Capacity",
      dataIndex: "maxPeople",
      key: "maxPeople",
      render: (text) => <span>{text} People</span>
    },
    {
      title: "City",
      dataIndex: "hotel",
      render: (hotel) => <p>{hotel?.city}</p>,
    },
    {
      title: "Address",
      dataIndex: "hotel",
      render: (hotel) => <p className="truncate max-w-[200px]" title={hotel?.address}>{hotel?.address}</p>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
          <Space size="middle">
            {/*<Link to={"/dashboard-view-roomDetail/" + record.slug} className="text-blue-500 hover:underline">View</Link>*/}
            <Link to={`/dashboard-edit-roomDetail/${record.slug}`} className="text-orange-500 hover:underline">Edit</Link>
            <Popconfirm
                title="Delete the room?"
                description="Are you sure to delete this room?"
                onConfirm={() => confirm(record)}
                okText="Yes"
                cancelText="No"
            >
              <p className="text-red-500 cursor-pointer hover:text-red-700">
                Delete
              </p>
            </Popconfirm>
          </Space>
      ),
    },
  ];

  return (
      <div className="max-h-screen bg-gray-50/30 p-4 md:p-8">
        {/* 1. Header & Search Section */}
        <div className="flex flex-col md:flex-row md:justify-between justify-center items-start md:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
              Room Management
            </h1>
            <p className="text-gray-600 text-sm mt-2 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              Active Availability & Pricing
            </p>
          </div>

          {/* Custom Tailwind Search */}
          <div className="w-full md:w-80 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-200"></div>
            <div className="relative flex items-center bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
              <AiOutlineSearch className="w-5 h-5 text-gray-400 ml-2" />
              <input
                  type="text"
                  value={searchText}
                  placeholder="Search rooms..."
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full bg-transparent p-2 text-gray-700 placeholder-gray-400 outline-none text-sm font-medium"
              />
              <button className="bg-gray-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors shadow-md">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* 2. Content Area */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">

          {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
          ) : (
              <>
                {/* MOBILE VIEW (Paginated Cards) */}
                <div className="block md:hidden p-4 space-y-5">
                  {currentMobileData?.map((room) => (
                      <div
                          key={room._id}
                          className="relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-indigo-100 transition-all duration-300 overflow-hidden group"
                      >
                        {/* Decorative left strip */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 to-fuchsia-500"></div>

                        {/* Header */}
                        <div className="flex justify-between items-start pl-3 mb-4">
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                              {room.hotel?.name || "Unknown Hotel"}
                            </h3>
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-gray-100 text-xs font-mono text-gray-500">
                            {room.RoomType}
                        </span>
                          </div>
                          <div className="flex flex-col items-end mx-1">
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
                            Per Night
                        </span>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-base font-bold border border-emerald-200">
                            {new Intl.NumberFormat("de-DE").format(room.price)}{" "}
                              <span className="text-xs font-normal">VND</span>
                        </span>
                          </div>
                        </div>

                        {/* Details Section */}
                        <div className="pl-3 flex flex-col gap-3 mb-5">
                          <div className="bg-cyan-50/50 p-3 rounded-xl border border-cyan-100/50">
                            <p className="text-xs text-cyan-600 font-bold uppercase tracking-wider mb-1">
                              Details
                            </p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Capacity:</span>
                              <span className="font-bold text-gray-700">
                            {room.maxPeople} People
                            </span>
                            </div>
                          </div>

                          <div className="bg-fuchsia-50/50 p-3 rounded-xl border border-fuchsia-100/50">
                            <p className="text-xs text-fuchsia-600 font-bold uppercase tracking-wider mb-1">
                              Location
                            </p>
                            <div className="text-sm font-bold text-gray-700 truncate">
                              {room.hotel?.city || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 truncate">
                              {room.hotel?.address || "N/A"}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-3 gap-3 pl-3">
                          <Link
                              to={"/dashboard-view-roomDetail/" + room.slug}
                              className="flex items-center justify-center py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors"
                          >
                            View
                          </Link>
                          <Link
                              to={`/dashboard-edit-roomDetail/${room.slug}`}
                              className="flex items-center justify-center py-2.5 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-sm hover:bg-indigo-200 transition-colors"
                          >
                            Edit
                          </Link>
                          <Popconfirm
                              title="Delete this room?"
                              description="Are you sure?"
                              onConfirm={() => confirm(room)}
                              okText="Yes"
                              cancelText="No"
                              okButtonProps={{ className: "!bg-rose-500" }}
                          >
                            <button className="flex items-center justify-center py-2.5 rounded-xl bg-rose-100 text-rose-700 font-bold text-sm hover:bg-rose-200 transition-colors">
                              Delete
                            </button>
                          </Popconfirm>
                        </div>
                      </div>
                  ))}

                  {/* --- MOBILE PAGINATION CONTROLS --- */}
                  {dataRooms?.length > MOBILE_PAGE_SIZE && (
                      <div className="flex justify-center items-center gap-4 pt-4 pb-2">
                        <button
                            onClick={() => setMobilePage((prev) => Math.max(prev - 1, 1))}
                            disabled={mobilePage === 1}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                                mobilePage === 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-indigo-600 border border-indigo-100 shadow-sm hover:bg-indigo-50"
                            }`}
                        >
                          Previous
                        </button>

                        <span className="text-sm font-medium text-gray-600">
                        Page <span className="text-indigo-600 font-bold">{mobilePage}</span> of {totalMobilePages}
                    </span>

                        <button
                            onClick={() => setMobilePage((prev) => Math.min(prev + 1, totalMobilePages))}
                            disabled={mobilePage === totalMobilePages}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                                mobilePage === totalMobilePages
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-indigo-600 border border-indigo-100 shadow-sm hover:bg-indigo-50"
                            }`}
                        >
                          Next
                        </button>
                      </div>
                  )}
                </div>

                {/* DESKTOP VIEW (Table) */}
                <div className="hidden md:block p-2">
                  <Table
                      columns={columns}
                      dataSource={dataRooms}
                      rowKey="_id"
                      scroll={{ x: 800 }}
                      pagination={{
                        pageSize: 6,
                        className: "p-4",
                      }}
                      className="
                    [&_.ant-table-thead_th]:!bg-indigo-50/80
                    [&_.ant-table-thead_th]:!text-indigo-900
                    [&_.ant-table-thead_th]:!font-bold
                    [&_.ant-table-thead_th]:!border-b-indigo-100
                    [&_.ant-table-tbody_tr:hover]:!bg-indigo-50/30
                    [&_.ant-table-tbody_td]:!text-gray-600
                    [&_.ant-pagination-item-active]:!border-indigo-500
                    [&_.ant-pagination-item-active_a]:!text-indigo-600
                    "
                  />
                </div>
              </>
          )}
        </div>
      </div>
  );
};

export default AdminViewRoom;