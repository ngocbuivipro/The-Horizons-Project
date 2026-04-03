import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { TiPlusOutline } from "react-icons/ti";
import { DatePicker, Select, Tooltip, InputNumber } from "antd"; // Thêm InputNumber
import { FaBan, FaDollarSign, FaQuestionCircle } from "react-icons/fa";
import { IoCloudUploadOutline } from "react-icons/io5";
import {
  createRoomApi,
  getAllFacilitiesApi,
  getAllServicesApi,
  getAllHotelNamesApi,
} from "../../../../api/client/api.js";
import moment from "moment";
import toast from "react-hot-toast";
import { CiCircleChevUp } from "react-icons/ci";
import ModelCreateService from "../AdminCreateHotel/ModelCreateService.jsx";
import { useNavigate } from "react-router";
import Services from "../../../Services/Services.jsx";
import ModelCreateFacility from "../../../Hotel/ModelCreateFacility/ModelCreateFacility.jsx";
import Facilities from "../../../Facilities/Facilities.jsx";
import UploadImg from "../../../Utils/UploadImg/UploadImg.jsx";
import AdminCalendar from "../../../Utils/Calendar/AdminCalendar.jsx";


function getStartOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
}
function getEndOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
}

const baseDate = new Date();
const INITIAL_EVENTS_TEMPLATE = [
  { title: 9000000, start: getStartOfDay(baseDate), end: getEndOfDay(baseDate) },
];

const AdminCreateRoom = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [hotels, setHotels] = useState([]);
  const [hotelId, setHotelId] = useState();
  const [hotelData, setHotelData] = useState();
  const [price, setPrice] = useState();
  const [roomType, setRoomType] = useState("");
  const [maxPeople, setMaxPeople] = useState();
  const [quantity, setQuantity] = useState(1);

  const [servicesDefault, setServicesDefault] = useState([]);
  const [facilitiesDefault, setFacilitiesDefault] = useState([]);
  const [showModel, setShowModel] = useState(false);
  const [services, setServices] = useState([]);
  const [description, setDescription] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [showCreateFacility, setShowCreateFacility] = useState(false);

  // Calendar State
  const [eventsDefault, setEventsDefault] = useState([]);
  const [blockedEvents, setBlockedEvents] = useState([]);
  const [calendarMode, setCalendarMode] = useState("PRICE");

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      const servicesRes = await getAllServicesApi();
      setServicesDefault(servicesRes.data || []);
      const facilitiesRes = await getAllFacilitiesApi();
      setFacilitiesDefault(facilitiesRes.data || []);
      try {
        const hotelsRes = await getAllHotelNamesApi();
        if (hotelsRes && hotelsRes.success) setHotels(hotelsRes.data);
        else toast.error("Failed to fetch hotels");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [showModel, showCreateFacility]);

  const handleUp = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const generateEventsWithPrice = useCallback((eventsSource, priceValue) => {
    const today = moment();
    const oneYearFromNow = moment().add(1, "year");
    const events = [];
    let currentDay = today;
    while (currentDay.isBefore(oneYearFromNow)) {
      events.push({
        title: priceValue,
        start: currentDay.startOf("day").toDate(),
        end: currentDay.endOf("day").toDate(),
        isBlocked: false,
      });
      currentDay = currentDay.add(1, "day");
    }
    return events;
  }, []);

  useEffect(() => {
    if (hotelId && hotels) {
      const hotel = hotels.find((h) => h._id === hotelId);
      if (hotel) {
        setPrice(hotel.cheapestPrice);
        setHotelData(hotel);
        if (hotel.services) {
          setServices(hotel.services.map((i) => (typeof i === "object" ? i._id : i)));
        }
        setEventsDefault(generateEventsWithPrice(INITIAL_EVENTS_TEMPLATE, hotel.cheapestPrice));
      }
    }
  }, [hotels, hotelId, generateEventsWithPrice]);

  useEffect(() => {
    if (price) {
      const updatedEvents = generateEventsWithPrice(INITIAL_EVENTS_TEMPLATE, price);
      setEventsDefault(updatedEvents);
    }
  }, [price, generateEventsWithPrice]);

  const handleServiceChange = useCallback((serviceId) => {
    setServices((prev) =>
        prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  }, []);

  const handleFaChange = useCallback((id) => {
    setFacilities((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  // Calendar Inputs
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [daysChoosed, setDaysChoosed] = useState([]);
  const [priceEvents, setPriceEvents] = useState("");
  const [priceExtra, setPriceExtra] = useState([]);
  const [availabilityRules, setAvailabilityRules] = useState([]);

  const handleStartDateChange = useCallback((date) => {
    setOpenEndDate(false);
    setStartDate(date);
    setOpenEndDate(true);
  }, []);

  const handleEndDateChange = useCallback((date) => {
    setEndDate(date);
    setOpenEndDate(false);
  }, []);

  const handleDayClick = useCallback((date) => {
    const day = moment(date, "ddd").format("dddd");
    setDaysChoosed((prev) =>
        prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }, []);

  // --- SAFE APPLY CHANGES (FIXED LOGIC) ---
  const handleApplyChanges = useCallback(() => {
    if (!hotelId) return toast.error("Please choose Hotel");
    if (!startDate) return toast.error("Please choose start date");
    if (!endDate) return toast.error("Please choose end date");
    if (startDate.$d > endDate.$d) return toast.error("Start date must be before end date");

    // FIX: Convert explicitly to Moment object to avoid crash
    const newStartDate = moment(startDate.toDate()).startOf("day");
    const newEndDate = moment(endDate.toDate()).endOf("day");

    if (calendarMode === "PRICE") {
      if (!priceEvents) return toast.error("Price cannot be empty");
      if (Number(priceEvents) <= 0) return toast.error("Invalid price");

      // Update Visuals
      setEventsDefault((prevEvents) => {
        return prevEvents.map((event) => {
          if (moment(event.start).isBetween(newStartDate, newEndDate, undefined, '[]')) {
            const shouldUpdate = daysChoosed.length === 0 || daysChoosed.includes(moment(event.start).format("dddd"));
            if (shouldUpdate) return { ...event, title: priceEvents };
          }
          return event;
        });
      });

      // Update Logic Data
      let priceExtraTmp = [];
      let itr = moment(newStartDate);

      while (itr.isSameOrBefore(newEndDate)) {
        const dayName = itr.format("dddd");
        const shouldUpdate = daysChoosed.length === 0 || daysChoosed.includes(dayName);
        if (shouldUpdate) {
          priceExtraTmp.push({
            title: Number(priceEvents),
            start: itr.startOf("day").toDate(),
            end: itr.endOf("day").toDate(),
          });
        }
        itr.add(1, "day");
      }

      setPriceExtra((prevExtra) => {
        const filteredOld = prevExtra.filter((item) => {
          const itemTime = moment(item.start).startOf("day").valueOf();
          const itemDay = moment(item.start).format("dddd");
          const isInRange = itemTime >= newStartDate.valueOf() && itemTime <= newEndDate.valueOf();
          const shouldUpdate = daysChoosed.length === 0 || daysChoosed.includes(itemDay);
          return !isInRange || (isInRange && !shouldUpdate);
        });
        return [...filteredOld, ...priceExtraTmp];
      });
      toast.success("Price updated locally!");

    } else {
      // BLOCK MODE
      let blockedTmp = [];
      let itr = moment(newStartDate);

      while (itr.isSameOrBefore(newEndDate)) {
        const dayName = itr.format("dddd");
        const shouldUpdate = daysChoosed.length === 0 || daysChoosed.includes(dayName);
        if (shouldUpdate) {
          blockedTmp.push({
            title: "Closed",
            start: itr.startOf("day").toDate(),
            end: itr.endOf("day").toDate(),
            isBlocked: true,
          });
        }
        itr.add(1, "day");
      }

      setBlockedEvents((prev) => {
        const filteredOld = prev.filter((item) => {
          const itemTime = moment(item.start).startOf("day").valueOf();
          const itemDay = moment(item.start).format("dddd");
          const isInRange = itemTime >= newStartDate.valueOf() && itemTime <= newEndDate.valueOf();
          const shouldUpdate = daysChoosed.length === 0 || daysChoosed.includes(itemDay);
          return !isInRange || (isInRange && !shouldUpdate);
        });
        return [...filteredOld, ...blockedTmp];
      });

      const newRules = blockedTmp.map((b) => ({
        startDate: b.start,
        endDate: b.end,
        isBlocked: true,
        note: "Manual Block",
      }));

      setAvailabilityRules((prev) => [...prev, ...newRules]);
      toast.success("Dates blocked locally!");
    }

    setPriceEvents("");
    setStartDate(null);
    setEndDate(null);
    setDaysChoosed([]);
  }, [hotelId, startDate, endDate, priceEvents, daysChoosed, calendarMode]);

  const handleCreateRoom = useCallback(async () => {
    if (!hotelId) return toast.error("Please select a home.");
    if (!roomType || roomType.trim().length === 0) return toast.error("Please enter a room type");
    if (!price || price <= 0) return toast.error("Invalid Price");
    if (!maxPeople || maxPeople <= 0) return toast.error("Invalid capacity");
    if (quantity <= 0) return toast.error("Invalid quantity");
    if (services.length === 0) return toast.error("Choose at least 1 service");
    if (facilities.length === 0) return toast.error("Choose at least 1 facility");

    const res = await createRoomApi({
      RoomType: roomType,
      description,
      photos: photos,
      maxPeople: maxPeople,
      services,
      hotel: hotelId,
      price,
      priceExtra: priceExtra,
      facilities,
      quantity: Number(quantity),
      availabilityRules: availabilityRules,
    });

    if (res.success) {
      toast.success("Create room successfully");
      navigate("/dashboard-view-room");
    } else {
      toast.error(res.message || "Failed to create room.");
    }
  }, [hotelId, roomType, price, maxPeople, quantity, services, facilities, description, photos, priceExtra, availabilityRules, dispatch, navigate]);

  const combinedEvents = useMemo(() => {
    const blockedTimes = new Set(blockedEvents.map((e) => e.start.getTime()));
    const visiblePriceEvents = eventsDefault.filter((e) => !blockedTimes.has(e.start.getTime()));
    return [...visiblePriceEvents, ...blockedEvents];
  }, [eventsDefault, blockedEvents]);

  return (
      <>
        <div className="min-h-screen bg-gray-50/50 pb-20">
          {/* Header */}
          <div className="rounded-md mx-5 top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 mb-8">
            <div className="max-w-full mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="font-bold text-gray-800 text-2xl md:text-3xl tracking-tight flex items-center">
                  Create New Room
                  <Tooltip title="Click Publish Room to save all changes">
                    <FaQuestionCircle className="mx-3 text-gray-400 hover:text-gray-600 cursor-help" size={18} />
                  </Tooltip>
                </h2>
                <p className="text-gray-500 text-sm mt-1">Set up room details, inventory, and pricing</p>
              </div>

              <div
                  onClick={handleCreateRoom}
                  className="group cursor-pointer transition-all duration-300 bg-gray-900 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 rounded-xl px-6 py-3 flex items-center gap-3 shadow-md"
              >
                <TiPlusOutline className="text-white group-hover:scale-110 transition-transform" size={20} />
                <p className="text-white font-medium text-sm md:text-base">Publish Room</p>
              </div>
            </div>
          </div>

          <div className="max-w-full mx-auto px-4 md:px-6 flex flex-col gap-6">
            {/* 1. IMAGERY */}
            <div className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-shadow hover:shadow-md">
              <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h2 className="font-semibold text-gray-700 text-lg">Room Imagery</h2>
              </div>
              <UploadImg setPhotos={setPhotos} photos={photos} />
            </div>

            {/* 2. SPECIFICATIONS */}
            <div className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-shadow hover:shadow-md">
              <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                <h2 className="font-semibold text-gray-700 text-lg">Room Specifications</h2>
              </div>

              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                {/* Hotel Select */}
                <div className="flex flex-col gap-2 group">
                  <label className="text-sm font-medium text-gray-600 ml-1">
                    Select Hotel <span className="text-red-500">*</span>
                  </label>

                  <Select
                      showSearch
                      size="large"
                      placeholder="Select Hotel..."
                      optionFilterProp="children"
                      value={hotelId || undefined}
                      onChange={(value) => setHotelId(value)}
                      className="w-full"
                      filterOption={(input, option) => (option?.children ?? "").toLowerCase().includes(input.toLowerCase())}
                  >
                    {hotels?.map((i) => (
                        <Select.Option key={i._id} value={i._id}>
                          {i.name}
                        </Select.Option>
                    ))}
                  </Select>
                </div>

                {/* Price */}
                <div className="flex flex-col gap-2 group">
                  <label className="text-sm font-medium text-gray-600">
                    Base Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                        type="number"
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        value={price || ""}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                  </div>
                </div>

                {/* Room Type */}
                <div className="flex flex-col gap-2 group">
                  <label className="text-sm font-medium text-gray-600">
                    Room Category <span className="text-red-500">*</span>
                  </label>
                  <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      placeholder="e.g. Deluxe King"
                  />
                </div>

                {/* Capacity & Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2 group">
                    <label className="text-sm font-medium text-gray-600 truncate">
                      Max Guests <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        value={maxPeople || ""}
                        onChange={(e) => setMaxPeople(e.target.value)}
                        placeholder="2"
                    />
                  </div>
                  <div className="flex flex-col gap-2 group">
                    <label className="text-sm font-medium text-gray-600 truncate">Total Rooms</label>
                    <input
                        type="number"
                        className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="1"
                        min={0}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. SERVICES & FACILITIES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="flex mb-4 items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                  <h2 className="font-semibold text-gray-700 text-lg">Included Services</h2>
                </div>
                <div className="grid gap-3 mt-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                  <div
                      onClick={() => setShowModel(true)}
                      className="cursor-pointer h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col gap-1 items-center justify-center text-gray-500 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-600 transition-all text-center px-2"
                  >
                    <IoCloudUploadOutline size={20} />
                    <span className="text-xs font-medium">New Service</span>
                  </div>
                  {servicesDefault?.length > 0 && (
                      <Services
                          handleServiceChange={handleServiceChange}
                          setServicesDefault={setServicesDefault}
                          servicesDefault={servicesDefault}
                          services={services}
                      />
                  )}
                </div>
              </div>
              <div className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="flex mb-4 items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                  <h2 className="font-semibold text-gray-700 text-lg">Room Amenities</h2>
                </div>
                <div className="grid gap-3 mt-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                  <div
                      onClick={() => setShowCreateFacility(true)}
                      className="cursor-pointer h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col gap-1 items-center justify-center text-gray-500 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600 transition-all text-center px-2"
                  >
                    <IoCloudUploadOutline size={20} />
                    <span className="text-xs font-medium">New Amenity</span>
                  </div>
                  {facilitiesDefault?.length > 0 && (
                      <Facilities
                          handleFaChange={handleFaChange}
                          facilities={facilities}
                          setFacilitiesDefault={setFacilitiesDefault}
                          facilitiesDefault={facilitiesDefault}
                      />
                  )}
                </div>
              </div>
            </div>

            {/* 4. CALENDAR: PRICING & AVAILABILITY */}
            <div className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-shadow hover:shadow-md overflow-hidden">
              <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                <h2 className="font-semibold text-gray-700 text-lg">Calendar & Availability</h2>
              </div>

              <div className="flex flex-col xl:flex-row gap-8">
                <div className="flex-1">
                  <AdminCalendar events={combinedEvents} />
                </div>

                {/* Control Panel */}
                <div className="w-full xl:w-1/3 h-fit bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full block"></span>
                    Manage Calendar
                  </h3>

                  {/* Mode Switcher */}
                  <div className="mb-6 p-1 bg-gray-100 rounded-xl flex">
                    <button
                        onClick={() => setCalendarMode("PRICE")}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                            calendarMode === "PRICE" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      <FaDollarSign className="inline mb-0.5 mr-1" /> Set Price
                    </button>
                    <button
                        onClick={() => setCalendarMode("BLOCK")}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                            calendarMode === "BLOCK" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      <FaBan className="inline mb-0.5 mr-1" /> Block Dates
                    </button>
                  </div>

                  {/* Date Range */}
                  <div className="mb-6">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Date Range</label>
                    <div className="flex flex-col gap-3">
                      <DatePicker
                          className="w-full h-11 rounded-xl border-gray-200 hover:border-indigo-500 focus:border-indigo-500"
                          disabledDate={(current) => current.isBefore(moment(), "day")}
                          value={startDate}
                          onChange={handleStartDateChange}
                          placeholder="Start Date"
                          format="DD/MM/YYYY"
                      />
                      <DatePicker
                          className="w-full h-11 rounded-xl border-gray-200 hover:border-indigo-500 focus:border-indigo-500"
                          disabledDate={(current) => current.isBefore(moment(), "day")}
                          value={endDate}
                          open={openEndDate}
                          onChange={handleEndDateChange}
                          onClick={() => setOpenEndDate(true)}
                          onOpenChange={(open) => setOpenEndDate(open)}
                          placeholder="End Date"
                          format="DD/MM/YYYY"
                      />
                    </div>
                  </div>

                  {/* Recurring Days */}
                  <div className="mb-6">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Recur on Days</label>
                    <div className="flex flex-wrap gap-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => {
                        const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        const isSelected = daysChoosed.includes(fullDayNames[idx]);
                        return (
                            <div
                                key={idx}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleDayClick(day);
                                }}
                                className={`cursor-pointer w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all shadow-sm border
                                ${
                                    isSelected
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200 scale-105"
                                        : "bg-white text-gray-500 hover:text-indigo-600 border-gray-200 hover:border-indigo-300"
                                }`}
                            >
                              {day.charAt(0)}
                            </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Action Input (NEW STYLE) */}
                  <div className="mb-8">
                    {calendarMode === "PRICE" ? (
                        <div className="relative group">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">
                            Price per night
                          </label>
                          <InputNumber
                              className="w-full !rounded-xl !bg-gray-50 !border-gray-200 hover:!border-indigo-500 focus-within:!border-indigo-500 focus-within:!ring-2 focus-within:!ring-indigo-500/20 shadow-sm transition-all duration-200"
                              placeholder="0"
                              value={priceEvents}
                              onChange={(val) => setPriceEvents(val)}
                              min={0}
                              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                              parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                              style={{ width: '100%' }}
                              controls={false}
                              addonAfter={<span className="text-gray-500 font-semibold px-2">VND</span>}
                              size="large"
                          />
                          <style>{`
                            .ant-input-number-group-addon {
                              background-color: #f9fafb !important;
                              border-color: #e5e7eb !important;
                              border-top-right-radius: 0.75rem !important;
                              border-bottom-right-radius: 0.75rem !important;
                            }
                            .ant-input-number {
                              border-top-left-radius: 0.75rem !important;
                              border-bottom-left-radius: 0.75rem !important;
                              background-color: #f9fafb !important;
                              border-color: #e5e7eb !important;
                            }
                            .ant-input-number-focused, .ant-input-number:focus, .ant-input-number:hover {
                              border-color: #6366f1 !important;
                              box-shadow: none !important;
                            }
                            .ant-input-number-group-wrapper:hover .ant-input-number-group-addon,
                            .ant-input-number-group-wrapper:hover .ant-input-number,
                            .ant-input-number-group-wrapper-focused .ant-input-number-group-addon,
                            .ant-input-number-group-wrapper-focused .ant-input-number{
                              border-color: #6366f1 !important;
                            }
                          `}</style>
                        </div>
                    ) : (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center shadow-sm">
                          <p className="text-red-600 text-sm font-semibold flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Selected dates will be closed for booking
                          </p>
                        </div>
                    )}
                  </div>

                  {/* Apply Button */}
                  <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleApplyChanges();
                      }}
                      className={`w-full py-4 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]
                      ${
                          calendarMode === "PRICE"
                              ? "bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900"
                              : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
                      }`}
                  >
                    {calendarMode === "PRICE" ? "Apply Price" : "Block Selected Dates"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll to top */}
          <div className="fixed bottom-8 right-8 z-40">
            <button
                onClick={handleUp}
                className="bg-white text-gray-800 shadow-lg rounded-full p-3 hover:bg-gray-100 transition-all border border-gray-200 hover:-translate-y-1"
            >
              <CiCircleChevUp size={32} />
            </button>
          </div>

          {showModel && <ModelCreateService services={services} setServices={setServices} setShowModel={setShowModel} />}
          {showCreateFacility && (
              <ModelCreateFacility facilities={facilities} setFacilities={setFacilities} setShowCreateFacility={setShowCreateFacility} />
          )}
        </div>
      </>
  );
};

export default AdminCreateRoom;