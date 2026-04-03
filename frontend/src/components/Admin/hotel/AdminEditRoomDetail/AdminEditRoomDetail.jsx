import { DatePicker, Input, Tooltip, Select, InputNumber } from "antd";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FaQuestionCircle, FaBan, FaDollarSign, FaUnlock } from "react-icons/fa";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router";
import {
  getAllFacilitiesApi,
  getAllServicesApi,
  updateRoomApi,
  uploadByFilesApi,
  getRoomDetailApi,
  getAllRoomApi
} from "../../../../api/client/api.js";
import moment from "moment";
import toast from "react-hot-toast";
import ModelCreateService from "../AdminCreateHotel/ModelCreateService.jsx";
import { RxCross1 } from "react-icons/rx";
import Services from "../../../Services/Services.jsx";
import ModelCreateFacility from "../../../Hotel/ModelCreateFacility/ModelCreateFacility.jsx";
import Facilities from "../../../Facilities/Facilities.jsx";
import AdminCalendar from "../../../Utils/Calendar/AdminCalendar.jsx";

const AdminEditRoomDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // --- STATE QUẢN LÝ DATA ---
  const [data, setData] = useState();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- FORM STATES ---
  const [price, setPrice] = useState();
  const [maxPeople, setMaxPeople] = useState();
  const [roomType, setRoomType] = useState();
  const [hotelId, setHotelId] = useState();
  const [quantity, setQuantity] = useState(1);
  const [services, setServices] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);

  // --- OPTIONS ---
  const [servicesDefault, setServicesDefault] = useState([]);
  const [facilitiesDefault, setFacilitiesDefault] = useState([]);

  // --- UI STATES ---
  const [showModel, setShowModel] = useState(false);
  const [showCreateFacility, setShowCreateFacility] = useState(false);

  // --- CALENDAR STATES ---
  const [calendarMode, setCalendarMode] = useState("PRICE"); // "PRICE" | "BLOCK" | "OPEN"
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [priceEvents, setPriceEvents] = useState("");

  const [priceExtra, setPriceExtra] = useState([]);
  const [availabilityRules, setAvailabilityRules] = useState([]);

  const [daysChoosed, setDaysChoosed] = useState([]);

  // Modal Price Change (Drag) - Keeping state for future use if needed
  const [modelChangePrice, setModelChangePrice] = useState(false);
  const [infoChangePrice, setInfoChangePrice] = useState();

  // --- 1. FETCH DATA INIT ---
  useEffect(() => {
    const fetchInitData = async () => {
      const servicesRes = await getAllServicesApi();
      setServicesDefault(servicesRes.data || []);

      const facilitiesRes = await getAllFacilitiesApi();
      setFacilitiesDefault(facilitiesRes.data || []);

      try {
        const roomsRes = await getAllRoomApi();
        if (roomsRes && roomsRes.success && roomsRes.data) {
          const uniqueHotelsMap = new Map();
          roomsRes.data.forEach(room => {
            if (room.hotel && room.hotel._id) {
              uniqueHotelsMap.set(room.hotel._id, room.hotel);
            }
          });
          setHotels(Array.from(uniqueHotelsMap.values()));
        }
      } catch (error) {
        console.error("Error fetching hotels", error);
      }
    };
    fetchInitData();
  }, [showModel, showCreateFacility]);

  // --- 2. FETCH ROOM DETAIL ---
  const fetchRoomDetail = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await getRoomDetailApi(slug);
      if (res && res.success) {
        const tmp = res.data;
        setData(tmp);
        setPrice(tmp?.price);
        setMaxPeople(tmp?.maxPeople);
        setRoomType(tmp?.RoomType);
        setQuantity(tmp?.quantity || 1);

        setHotelId(typeof tmp?.hotel === 'object' ? tmp?.hotel?._id : tmp?.hotel);
        setServices(tmp?.services?.map((item) => typeof item === 'object' ? item._id : item) || []);
        setFacilities(tmp?.facilities?.map((i) => typeof i === 'object' ? i._id : i) || []);
        setDescription(tmp?.description);
        setPhotos(tmp?.photos || []);

        // Populate Calendar Data
        setPriceExtra(tmp?.priceExtra || []);
        setAvailabilityRules(tmp?.availabilityRules || []);

      } else {
        toast.error("Failed to load room details");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching room");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchRoomDetail();
  }, [fetchRoomDetail]);

  // --- HANDLERS ---
  const addPhotoByFile = async (ev) => {
    const files = ev.target.files;
    const data = new FormData();
    for (let i = 0; i < files.length; i++) data.append("photos", files[i]);
    const res = await uploadByFilesApi(data);
    if (res.success) setPhotos([...photos, ...res.data.map((item) => item.url)]);
    else toast.error("Error uploading photos");
  };

  const removePhoto = (ev, filename) => {
    ev.preventDefault();
    setPhotos([...photos.filter((photo) => photo !== filename)]);
  };

  const handleStartDateChange = (date) => {
    setOpenEndDate(false);
    setStartDate(date);
    setOpenEndDate(true);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    setOpenEndDate(false);
  };

  const handleServiceChange = (serviceId) => {
    setServices((services) => services.includes(serviceId) ? services.filter((id) => id !== serviceId) : [...services, serviceId]);
  };

  const handleFaChange = (id) => {
    setFacilities((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleDayClick = (dayShort) => {
    const mapDay = {
      Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday",
      Thu: "Thursday", Fri: "Friday", Sat: "Saturday",
    };
    const fullDay = mapDay[dayShort];
    setDaysChoosed(prev => prev.includes(fullDay) ? prev.filter((d) => d !== fullDay) : [...prev, fullDay]);
  };


  // 1. Generate Base Events
  const baseEvents = useMemo(() => {
    if (!price) return [];
    const events = [];
    let current = moment().startOf('day');
    const endRange = moment().add(1, "year");

    while (current.isBefore(endRange)) {
      events.push({
        start: current.toDate(),
        end: current.clone().endOf("day").toDate(),
        title: price,
        type: "BASE_PRICE",
        isBlocked: false,
      });
      current.add(1, "day");
    }
    return events;
  }, [price]);

  // 2. Combine with Overrides & Blocks
  const combinedEvents = useMemo(() => {
    const overrideEvents = priceExtra.map((p) => ({
      start: new Date(p.start),
      end: new Date(p.end),
      title: p.title,
      type: "PRICE_OVERRIDE",
      isBlocked: false,
    }));

    const blockEvents = availabilityRules
        .filter((r) => r.isBlocked)
        .map((r) => ({
          start: new Date(r.startDate),
          end: new Date(r.endDate),
          title: "Closed",
          type: "BLOCK",
          isBlocked: true,
        }));

    const occupiedDates = new Set();
    [...overrideEvents, ...blockEvents].forEach((e) => {
      occupiedDates.add(moment(e.start).startOf("day").valueOf());
    });

    const filteredBase = baseEvents.filter(
        (e) => !occupiedDates.has(moment(e.start).startOf("day").valueOf())
    );

    return [...filteredBase, ...overrideEvents, ...blockEvents];
  }, [baseEvents, priceExtra, availabilityRules]);


  // --- APPLY CHANGES (UPDATED WITH OPEN LOGIC) ---
  const handleApplyChanges = useCallback(() => {
    if (!startDate || !endDate) return toast.error("Please select date range");

    // Only constants price if mode is PRICE
    if (calendarMode === "PRICE" && (!priceEvents || Number(priceEvents) <= 0)) return toast.error("Invalid price");

    const start = moment(startDate.toDate()).startOf('day');
    const end = moment(endDate.toDate()).endOf('day');

    let newPrices = [...priceExtra];
    let newRules = [...availabilityRules];

    while(start.isSameOrBefore(end, 'day')) {
      const dayName = start.format("dddd");

      if(daysChoosed.length === 0 || daysChoosed.includes(dayName)) {
        const dateStartJS = start.toDate();
        const dateEndJS = start.clone().endOf('day').toDate();

        // 1. CLEAN UP: Always remove existing data for this day first to avoid conflicts
        newPrices = newPrices.filter(p => !moment(p.start).isSame(start, 'day'));
        newRules = newRules.filter(r => !moment(r.startDate).isSame(start, 'day'));

        // 2. ADD NEW: Only add if not in OPEN mode
        if(calendarMode === "PRICE") {
          newPrices.push({
            start: dateStartJS,
            end: dateEndJS,
            title: Number(priceEvents)
          });
        } else if (calendarMode === "BLOCK") {
          newRules.push({
            startDate: dateStartJS,
            endDate: dateEndJS,
            isBlocked: true,
            note: "Manual Block"
          });
        }
        // If calendarMode === "OPEN", we do nothing here, which effectively leaves the day clean (unblocked/default price)
      }
      start.add(1, 'day');
    }

    setPriceExtra(newPrices);
    setAvailabilityRules(newRules);

    const msg = calendarMode === "OPEN"
        ? "Dates unblocked! Click Save Changes."
        : "Calendar updated locally! Click Save Changes.";

    toast.success(msg);
    setPriceEvents("");
    setStartDate(null);
    setEndDate(null);
    setDaysChoosed([]);
  }, [startDate, endDate, priceEvents, daysChoosed, calendarMode, priceExtra, availabilityRules]);

  // --- SAVE TO SERVER ---
  const handleSaveRoom = async () => {
    if (!data || !data?.hotel) return toast.error("Hotel no exists!");
    if (!price) return toast.error("Please enter price");
    if (!roomType) return toast.error("Please enter a valid room type");
    if (!maxPeople) return toast.error("Please enter max people");
    if (quantity <= 0) return toast.error("Invalid quantity");
    if (price <= 0) return toast.error("Invalid Price");
    if (services.length === 0) return toast.error("Please choose at least 1 services");
    if (facilities.length === 0) return toast.error("Please choose at least 1 facilities");

    let dataUpdate = {
      hotel: hotelId,
      RoomType: roomType,
      maxPeople: maxPeople,
      quantity: Number(quantity),
      photos: photos,
      services: services,
      facilities: facilities,
      price: price,
      priceExtra: priceExtra,
      availabilityRules: availabilityRules, // Send updated rules
    };

    const res = await updateRoomApi(dataUpdate, data._id);
    if (res.success) {
      toast.success("Room updated successfully!");
    } else {
      toast.error("Update failed: " + res.message);
    }
  };

  // --- MODAL HANDLERS (Drag Select) ---
  const handleSelectSlot = (slotInfo) => {
    if (!hotelId) return toast.error("Please choose Hotel");
    const newDate = moment().startOf("day");
    if (moment(slotInfo?.start).startOf("day").isBefore(newDate)) return;
    setInfoChangePrice(slotInfo);
    setModelChangePrice(true);
  };

  return (
      <>
        <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
          {/* Sticky Header Section */}
          <div className="rounded-md md:mx-7 mx-4 top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 mb-8 shadow-sm">
            <div className="max-w-full mx-auto flex justify-between items-center">
              <div>
                <h2 className="font-bold text-gray-800 text-2xl md:text-3xl tracking-tight">
                  Edit Room Detail
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Update room information, photos, inventory, and pricing
                </p>
              </div>
              <button
                  onClick={handleSaveRoom}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
              >
                Save Changes
              </button>
            </div>
          </div>

          <div className="max-w-full mx-auto px-4 md:px-6 space-y-8">

            {/* SECTION 1: Room Picture */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 to-pink-600"></div>
              <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 font-bold">1</div>
                <h2 className="font-bold text-gray-700 text-xl">Room Picture</h2>
                <Tooltip title="Where the customer sleeps">
                  <FaQuestionCircle className="text-gray-400 hover:text-pink-500 transition-colors" size={20} />
                </Tooltip>
              </div>

              <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                <label className="border-2 border-dashed border-gray-300 hover:border-pink-400 hover:bg-pink-50 transition-all cursor-pointer rounded-2xl h-32 md:h-40 flex flex-col items-center justify-center text-gray-500 group">
                  <input type="file" multiple className="hidden" onChange={addPhotoByFile} />
                  <IoCloudUploadOutline size={28} className="mb-2 group-hover:scale-110 transition-transform text-pink-500" />
                  <span className="text-sm font-medium text-pink-600">Upload</span>
                </label>

                {photos.length > 0 && photos.map((item, index) => (
                    <div key={index} className="relative h-32 md:h-40 group overflow-hidden rounded-2xl shadow-sm border border-gray-100">
                      <img src={item} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Room" />
                      <button onClick={(ev) => removePhoto(ev, item)} className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white text-red-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white">
                        ✕
                      </button>
                    </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: Room Details */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">2</div>
                <h2 className="font-bold text-gray-700 text-xl">Room Details</h2>
              </div>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Hotel <span className="text-red-500">*</span></label>
                  <Select
                      value={hotelId}
                      onChange={(val) => setHotelId(val)}
                      className="w-full h-[42px]"
                      placeholder="Select Hotel"
                  >
                    {hotels.map(h => (
                        <Select.Option key={h._id} value={h._id}>{h.name}</Select.Option>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Price <span className="text-red-500">*</span></label>
                  <InputNumber
                      className="w-full py-1.5 rounded-xl border-gray-300"
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      value={price}
                      onChange={setPrice}
                      prefix={<FaDollarSign className="text-gray-400 mr-2"/>}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Room Type <span className="text-red-500">*</span></label>
                  <Input type="text" size="large" value={roomType} onChange={(e) => setRoomType(e.target.value)} placeholder="e.g. Deluxe King" className="rounded-xl py-2.5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Capacity <span className="text-red-500">*</span></label>
                    <InputNumber min={1} className="w-full py-1.5 rounded-xl" value={maxPeople} onChange={setMaxPeople} />
                  </div>
                  {/* QUANTITY FIELD */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Total Rooms</label>
                    <InputNumber min={0} className="w-full py-1.5 rounded-xl" value={quantity} onChange={setQuantity} />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3 & 4: Services and Facilities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                <div className="flex mb-4 items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">3</div>
                  <h2 className="font-bold text-gray-700 text-xl">Services</h2>
                </div>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                  <div onClick={() => setShowModel(true)} className="cursor-pointer h-20 border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-gray-500 hover:text-emerald-600">
                    <IoCloudUploadOutline size={24} />
                    <span className="text-xs font-bold">Add Service</span>
                  </div>
                  {servicesDefault?.length > 0 && (
                      <Services handleServiceChange={handleServiceChange} setServicesDefault={setServicesDefault} servicesDefault={servicesDefault} services={services} />
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                <div className="flex mb-4 items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-bold">4</div>
                  <h2 className="font-bold text-gray-700 text-xl">Facilities</h2>
                </div>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                  <div onClick={() => setShowCreateFacility(true)} className="cursor-pointer h-20 border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-gray-500 hover:text-orange-600">
                    <IoCloudUploadOutline size={24} />
                    <span className="text-xs font-bold">Add Facility</span>
                  </div>
                  {facilitiesDefault?.length > 0 && (
                      <Facilities handleFaChange={handleFaChange} facilities={facilities} setFacilitiesDefault={setFacilitiesDefault} facilitiesDefault={facilitiesDefault} />
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 5: Special Pricing & Calendar */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-indigo-600"></div>
              <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">5</div>
                <h2 className="font-bold text-gray-700 text-xl">Calendar & Availability</h2>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Calendar Container */}
                <div className="w-full lg:w-2/3 bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                  <AdminCalendar events={combinedEvents} />
                </div>

                {/* Controls Container */}
                <div className="w-full lg:w-1/3 h-fit bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-24">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full block"></span>
                    Manage Availability
                  </h3>

                  {/* Mode Switcher */}
                  <div className="mb-6 p-1 bg-gray-100 rounded-xl flex">
                    <button
                        onClick={() => setCalendarMode("PRICE")}
                        className={`flex-1 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${calendarMode === "PRICE" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <FaDollarSign className="inline mb-0.5 mr-1"/> Price
                    </button>
                    <button
                        onClick={() => setCalendarMode("BLOCK")}
                        className={`flex-1 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${calendarMode === "BLOCK" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <FaBan className="inline mb-0.5 mr-1"/> Block
                    </button>
                    <button
                        onClick={() => setCalendarMode("OPEN")}
                        className={`flex-1 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${calendarMode === "OPEN" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <FaUnlock className="inline mb-0.5 mr-1"/> Open
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
                                onClick={() => handleDayClick(day)}
                                className={`cursor-pointer w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all shadow-sm border
                            ${isSelected
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200 scale-105"
                                    : "bg-white text-gray-500 hover:text-indigo-600 border-gray-200 hover:border-indigo-300"
                                }`}
                            >
                              {day.charAt(0)}
                            </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Dynamic Action Input (UPDATED) */}
                  <div className="mb-8">
                    {calendarMode === "PRICE" && (
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
                          <style jsx global>{`
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
                    )}

                    {calendarMode === "BLOCK" && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center shadow-sm">
                          <p className="text-red-600 text-sm font-semibold flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Selected dates will be closed
                          </p>
                        </div>
                    )}

                    {calendarMode === "OPEN" && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center shadow-sm">
                          <p className="text-emerald-600 text-sm font-semibold flex items-center justify-center gap-2">
                            <FaUnlock />
                            Selected dates will be available
                          </p>
                          <p className="text-xs text-emerald-500 mt-1">
                            Removes custom blocks & prices
                          </p>
                        </div>
                    )}
                  </div>

                  <button
                      onClick={handleApplyChanges}
                      className={`w-full py-4 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]
                      ${calendarMode === "PRICE"
                          ? "bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900"
                          : calendarMode === "BLOCK"
                              ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
                              : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500"
                      }`}
                  >
                    {calendarMode === "PRICE" ? "Apply Price" : calendarMode === "BLOCK" ? "Block Dates" : "Unblock / Open Dates"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modals */}
          {showModel && <ModelCreateService services={services} setServices={setServices} setShowModel={setShowModel} />}
          {showCreateFacility && <ModelCreateFacility facilities={facilities} setFacilities={setFacilities} setShowCreateFacility={setShowCreateFacility} />}
        </div>
      </>
  );
};

export default AdminEditRoomDetail;
