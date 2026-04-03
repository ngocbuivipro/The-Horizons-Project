import { useState, useMemo, useEffect } from "react";
import { Table, Button, Input, Tag, Popconfirm, Grid, Pagination, Empty } from "antd";
import { DeleteOutlined, EditOutlined, SearchOutlined, PlusOutlined, ReloadOutlined, EnvironmentOutlined, ClockCircleOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { FaBus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import { deleteBusAction } from "../../../redux/actions/BusAction.js";

const { useBreakpoint } = Grid;

const AdminViewBus = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const dispatch = useDispatch();

  // Redux State
  const stateBus = useSelector((state) => state.BusReducer);
  const { busesAdmin } = stateBus;

  // Local State
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 8 });

  // --- FILTER DATA LOGIC ---
  const filteredBuses = useMemo(() => {
    let data = busesAdmin || [];
    if (searchText) {
      const lower = searchText.toLowerCase();
      data = data.filter(
          (bus) =>
              bus.poName?.toLowerCase().includes(lower) ||
              bus._id?.toLowerCase().includes(lower) ||
              bus.cityFrom?.toLowerCase().includes(lower) ||
              bus.cityTo?.toLowerCase().includes(lower)
      );
    }
    return data;
  }, [searchText, busesAdmin]);

  // Reset pagination when search changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [searchText]);

  const handleDelete = (id) => {
    dispatch(deleteBusAction(id));
  };

  const handlePageChange = (page, pageSize) => {
    setPagination({ current: page, pageSize });
  };

  // Calculate data for Mobile View (Slice array for pagination)
  const currentMobileData = useMemo(() => {
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    return filteredBuses.slice(startIndex, startIndex + pagination.pageSize);
  }, [pagination, filteredBuses]);

  // --- COLUMNS FOR DESKTOP ---
  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (images) => (
          <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
            {images && images.length > 0 ? (
                <img
                    src={images[0]}
                    alt="bus"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150?text=No+Img" }}
                />
            ) : (
                <FaBus className="text-gray-300 text-2xl" />
            )}
          </div>
      ),
    },
    {
      title: 'Bus Operator',
      dataIndex: 'poName',
      key: 'poName',
      render: (text, record) => (
          <div className="flex flex-col">
            <span className="font-bold text-gray-800 line-clamp-2 leading-tight">{text}</span>
            <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold">ID: {record._id.slice(-6)}</span>
          </div>
      ),
    },
    {
      title: 'Route',
      key: 'route',
      width: 220,
      render: (_, record) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span className="font-medium">{record.cityFrom}</span>
            </div>
            <div className="ml-[3px] w-[2px] h-3 bg-gray-200 my-0.5"></div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              <span className="font-medium">{record.cityTo}</span>
            </div>
          </div>
      ),
    },
    {
      title: 'Schedule',
      key: 'schedule',
      width: 180,
      render: (_, record) => (
          <div className="text-xs text-gray-500 flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <ClockCircleOutlined className="text-indigo-400"/>
              <span>{moment(record.departureTime).format("HH:mm DD/MM")}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockCircleOutlined className="text-pink-400"/>
              <span>{moment(record.arrivalTime).format("HH:mm DD/MM")}</span>
            </div>
          </div>
      ),
    },
    {
      title: 'Seats',
      dataIndex: 'totalSeats',
      key: 'totalSeats',
      width: 100,
      render: (seats) => (
          <Tag color="blue" icon={<UsergroupAddOutlined />}>
            {seats}
          </Tag>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => (
          <span className="font-bold text-emerald-600 whitespace-nowrap">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)}
                </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
          <div className="flex gap-2 justify-end">
            <Link to={`/dashboard-edit-bus/${record._id}`}>
              <Button
                  type="default"
                  shape="circle"
                  icon={<EditOutlined />}
                  className="text-blue-600 border-blue-200 hover:border-blue-500 hover:text-blue-700 bg-blue-50/50"
              />
            </Link>
            <Popconfirm title="Delete this bus?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
              <Button danger shape="circle" icon={<DeleteOutlined />} className="bg-red-50/50" />
            </Popconfirm>
          </div>
      ),
    },
  ];

  // --- MOBILE CARD COMPONENT (Fixes UX issue) ---
  const MobileCard = ({ item }) => (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 relative overflow-hidden">
        {/* Left Accent Line */}
        <div className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-500 rounded-r-lg"></div>

        <div className="pl-3">
          {/* Header: ID | Seats */}
          <div className="flex justify-between items-center mb-3">
            <Tag className="m-0 bg-gray-100 text-gray-500 border-0 font-bold">#{item._id.slice(-6).toUpperCase()}</Tag>
            <Tag color="blue" className="m-0 font-bold border-0">{item.totalSeats} Seats</Tag>
          </div>

          {/* Content: Image & Info */}
          <div className="flex gap-3 mb-4" onClick={() => navigate(`/dashboard-edit-bus/${item._id}`)}>
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
              {item.image && item.image.length > 0 ? (
                  <img
                      src={item.image[0]}
                      className="w-full h-full object-cover"
                      alt="bus"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150?text=No+Img" }}
                  />
              ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                    <FaBus />
                  </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 text-sm truncate mb-1">{item.poName}</h3>

              {/* Route */}
              <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                <EnvironmentOutlined className="text-indigo-400"/>
                <span className="truncate max-w-[180px]">
                                {item.cityFrom} <span className="text-gray-300 mx-1">→</span> {item.cityTo}
                            </span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <ClockCircleOutlined />
                <span>{moment(item.departureTime).format("HH:mm DD/MM")}</span>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gray-100 mb-3"></div>

          {/* Footer: Price & Actions */}
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Price</div>
              <div className="text-lg font-bold text-gray-900 leading-none">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.price)}
              </div>
            </div>

            <div className="flex gap-3">
              <Link to={`/dashboard-edit-bus/${item._id}`}>
                <Button
                    type="primary"
                    shape="circle"
                    icon={<EditOutlined />}
                    className="bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 shadow-sm"
                />
              </Link>

              <Popconfirm title="Delete?" onConfirm={() => handleDelete(item._id)} okText="Yes" cancelText="No">
                <Button
                    danger
                    shape="circle"
                    icon={<DeleteOutlined />}
                    className="bg-red-50 text-red-500 border-red-100 hover:bg-red-100 shadow-sm"
                />
              </Popconfirm>
            </div>
          </div>
        </div>
      </div>
  );

  return (
      <div className="p-4 md:p-6 min-h-screen bg-gray-50/50">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><FaBus /></span>
              Bus Management
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1 ml-11">Manage active routes and schedules</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()} className="rounded-lg flex-1 md:flex-none">Refresh</Button>
            <Link to="/dashboard-add-bus" className="flex-1 md:flex-none">
              <Button type="primary" icon={<PlusOutlined />} className="bg-gray-900 w-full rounded-lg hover:!bg-gray-800 border-0">Add Bus</Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Input
              placeholder="Search by bus name, city or ID..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="w-full md:max-w-md rounded-xl h-11 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 bg-white shadow-sm"
          />
        </div>

        {/* CONTENT SWITCHER */}
        {screens.md ? (
            // DESKTOP: Table View
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <Table
                  columns={columns}
                  dataSource={filteredBuses}
                  rowKey="_id"
                  pagination={{
                    ...pagination,
                    total: filteredBuses.length,
                    position: ['bottomCenter'],
                    showSizeChanger: true,
                    onChange: handlePageChange
                  }}
                  className="[&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-500 [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold"
              />
            </div>
        ) : (
            // MOBILE: Card View (No Horizontal Scroll)
            <div className="space-y-4">
              {currentMobileData.length > 0 ? (
                  <>
                    {currentMobileData.map(bus => <MobileCard key={bus._id} item={bus} />)}
                    <div className="flex justify-center mt-6 mb-8">
                      <Pagination
                          simple
                          current={pagination.current}
                          total={filteredBuses.length}
                          pageSize={pagination.pageSize}
                          onChange={handlePageChange}
                      />
                    </div>
                  </>
              ) : (
                  <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                    <Empty description="No buses found" />
                  </div>
              )}
            </div>
        )}
      </div>
  );
};

export default AdminViewBus;