import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FaCircleQuestion, FaCircleInfo  } from "react-icons/fa6";
import { RxCross1 } from "react-icons/rx";
import {Spin, Tooltip, Select, DatePicker, InputNumber} from "antd";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import iconMap from "../../../common/data/iconMap.js";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useApi } from "../../../contexts/ApiContext.jsx";

// Import the updated ImageHotel component
import ImageHotel from "./ImageHotel";
import {FaCheckCircle} from "react-icons/fa";

// Load plugins for dayjs
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const InfoHotel = ({ data }) => {
  const navigate = useNavigate();
  const stateRoom = useSelector((state) => state.RoomReducer);
  const { isAuthenticated } = useSelector((state) => state.UserReducer);
  const api = useApi();

  // --- STATE DATA ---
  const [roomType, setRoomType] = useState("");
  const [dataRoom, setDataRoom] = useState({});
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [checkInError, setCheckInError] = useState(false);
  const [checkOutError, setCheckOutError] = useState(false);
  const [numberOfGuests, setNumberOfGuests] = useState(1);

  // --- STATE CALCULATION ---
  const [totalPriceVND, setTotalPriceVND] = useState(0);
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [priceBreakdown, setPriceBreakdown] = useState([]);
  const [disablePaymentButton, setDisablePaymentButton] = useState(false);

  // --- STATE CURRENCY ---
  const [selectedCurrency, setSelectedCurrency] = useState("VND");
  const [exchangeRates, setExchangeRates] = useState({});
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  // --- UI STATES ---
  const [showDes, setShowDes] = useState(false); // Only keeps description modal state

  // --- 1. FETCH RATES ---
  useEffect(() => {
    const fetchRates = async () => {
      setIsLoadingRates(true);
      try {
        const res = await api.getExchangeRate();
        if (res.success || res.data) {
          setExchangeRates(res.data || {});
        }
      } catch (error) {
        console.error("Failed to fetch rates:", error);
      } finally {
        setIsLoadingRates(false);
      }
    };
    fetchRates();
  }, [api]);

  // --- 2. SELECT ROOM DATA ---
  useEffect(() => {
    if (data?.roomType?.length > 0 && !roomType) {
      setRoomType(data.roomType[0].RoomType);
    }
  }, [data, roomType]);

  useEffect(() => {
    let foundRoom = data?.roomType?.find((r) => r.RoomType === roomType);
    if (!foundRoom && stateRoom?.rooms) {
      foundRoom = stateRoom.rooms.find(
          (r) => r.hotel?._id === data?._id && r.RoomType === roomType
      );
    }
    setDataRoom(foundRoom || {});
  }, [data, roomType, stateRoom]);

  // --- 3. CORE LOGIC: PROCESS PRICE & BLOCKED DATES ---
  const { priceMap, blockedSet } = useMemo(() => {
    const pMap = {};
    const bSet = new Set();

    if (!dataRoom) return { priceMap: pMap, blockedSet: bSet };

    if (dataRoom.priceExtra?.length > 0) {
      dataRoom.priceExtra.forEach((item) => {
        const extraPrice = item.title || item.price;
        let current = dayjs(item.start);
        const end = dayjs(item.end);
        while (current.isBefore(end)) {
          const dateKey = current.format("YYYY-MM-DD");
          pMap[dateKey] = Number(extraPrice);
          current = current.add(1, 'day');
        }
      });
    }

    if (dataRoom.availabilityRules?.length > 0) {
      dataRoom.availabilityRules.forEach((rule) => {
        if (rule.isBlocked) {
          let current = dayjs(rule.startDate);
          const end = dayjs(rule.endDate);
          while (current.isBefore(end)) {
            bSet.add(current.format("YYYY-MM-DD"));
            current = current.add(1, 'day');
          }
        }
      });
    }

    return { priceMap: pMap, blockedSet: bSet };
  }, [dataRoom]);


  //  CALCULATE TOTAL PRICE ---

  const calculatePrice = useCallback(() => {
    if (!checkIn || !checkOut || !dataRoom) {
      setTotalPriceVND(0);
      setNumberOfDays(0);
      setPriceBreakdown([]);
      return;
    }
    const start = dayjs(checkIn);
    const end = dayjs(checkOut);
    if (start.isSameOrAfter(end)) return;

    const breakdown = [];
    let total = 0;
    let current = start;

    // Lấy số lượng phòng (đảm bảo ít nhất là 1)
    const quantity = numberOfGuests || 1;

    while (current.isBefore(end)) {
      const dateKey = current.format("YYYY-MM-DD");
      // Giá gốc của 1 phòng/đêm
      const unitPrice = priceMap[dateKey] !== undefined
          ? priceMap[dateKey]
          : (dataRoom.price || 0);

      const dailyTotal = unitPrice * quantity;

      total += dailyTotal;

      breakdown.push({ date: dateKey, price: unitPrice, totalDaily: dailyTotal });
      current = current.add(1, "day");
    }

    setNumberOfDays(breakdown.length);
    setPriceBreakdown(breakdown);
    setTotalPriceVND(total);
  }, [checkIn, checkOut, dataRoom, priceMap, numberOfGuests]);

  useEffect(() => {
    calculatePrice();
  }, [calculatePrice]);

  useEffect(() => {
    if (!checkIn || !checkOut) return;
    if (!dayjs(checkOut).isAfter(dayjs(checkIn), "day")) {
      setCheckOut("");
      setCheckOutError(false);
    }
  }, [checkIn, checkOut]);


  // --- 5. DATE PICKER VALIDATION ---
  const disabledCheckInDate = (current) => {
    if (!current) return false;
    if (current.isBefore(dayjs().startOf('day'))) return true;
    const dateKey = current.format("YYYY-MM-DD");
    if (blockedSet.has(dateKey)) return true;
    return false;
  };

  const disabledCheckOutDate = (current) => {
    if (!current) return false;
    if (current.isBefore(dayjs().startOf('day'))) return true;
    const dateKey = current.format("YYYY-MM-DD");
    if (blockedSet.has(dateKey)) return true;
    if (checkIn && !current.isAfter(dayjs(checkIn), "day")) return true;
    return false;
  };

  // --- 6. HELPER FORMATTER ---
  const convertAndFormat = useCallback(
      (amountInVND) => {
        if (!amountInVND && amountInVND !== 0) return "0";
        if (selectedCurrency === "VND") {
          return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amountInVND);
        }
        const rate = exchangeRates[selectedCurrency];
        if (!rate) return "...";
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: selectedCurrency,
          minimumFractionDigits: 2,
        }).format(amountInVND / rate);
      },
      [selectedCurrency, exchangeRates]
  );

  // --- 7. HANDLE BOOKING ---
  const handleBookingStart = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to continue booking.");
      return navigate("/login", { state: { from: window.location.pathname + window.location.search } });
    }

    setDisablePaymentButton(true);
    try {
      const isCheckInMissing = !checkIn;
      const isCheckOutMissing = !checkOut;

      setCheckInError(isCheckInMissing);
      setCheckOutError(isCheckOutMissing);

      if (isCheckInMissing || isCheckOutMissing) return;

      const start = dayjs(checkIn);
      const end = dayjs(checkOut);
      let current = start;
      while (current.isBefore(end)) {
        if (blockedSet.has(current.format("YYYY-MM-DD"))) {
          throw new Error(`Date ${current.format("DD/MM/YYYY")} is not available.`);
        }
        current = current.add(1, 'day');
      }

      const bookingPayload = {
        checkIn,
        checkOut,
        guests: numberOfGuests,
        totalPriceVND,
        selectedCurrency,
        exchangeRateApplied: exchangeRates[selectedCurrency] || 1,
        roomType: {
          ...dataRoom,
          hotel: data
        }
      };

      navigate(`/booking`, { state: bookingPayload });

    } catch (err) {
      toast.error(err.message || "Error occurred");
    } finally {
      setDisablePaymentButton(false);
    }
  };

  const handleRoomTypeChange = (value) => {
    setRoomType(value);
    setCheckIn("");
    setCheckOut("");
    setCheckInError(false);
    setCheckOutError(false);
    setNumberOfGuests(1);
    setPriceBreakdown([]);
  };

  const availableCurrencies = ["VND", ...Object.keys(exchangeRates)];

  return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative">
        {/* --- RIGHT COLUMN (Booking Card) --- */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="sticky top-28">
            <div className="border border-gray-200 rounded-2xl p-6 shadow-md bg-white">
              {/* PRICE HEADER */}
              <div className="flex flex-col items-start gap-1 mb-6">
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">
                    {isLoadingRates ? <Spin size="small" /> : convertAndFormat(dataRoom.price || 0)}
                    </span>
                  <span className="text-gray-500 font-normal">/night (Base)</span>
                </div>
                {dataRoom?.priceExtra?.length > 0 && (
                    <span className="text-xs text-orange-600 italic font-medium">
                    *Price varies on selected dates
                    </span>
                )}
              </div>

              {/* INPUTS */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-4">
                {/* DATE SELECTION: Stack vertical on mobile, horizontal on larger screens */}
                <div className="flex flex-col sm:flex-row border-b border-gray-200">

                  {/* CHECK-IN */}
                  <div className="w-full sm:w-1/2 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-200 hover:bg-gray-50 transition-colors">
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase">Check-in</label>
                    <div className={`rounded-md ${checkInError ? "border border-red-500 px-2 py-1" : ""}`}>
                      <DatePicker
                          value={checkIn ? dayjs(checkIn) : null}
                          onChange={(_, dateString) => {
                            setCheckIn(dateString);
                            if (dateString) setCheckInError(false);
                          }}
                          inputReadOnly
                          disabledDate={disabledCheckInDate}
                          format="YYYY-MM-DD"
                          variant="borderless"
                          placeholder="YYYY-MM-DD"
                          suffixIcon={null}
                          allowClear={false}
                          className="w-full p-0 text-sm font-medium h-6" // Added h-6 for consistent height
                          popupStyle={{ zIndex: 9999 }} // Ensure calendar popup is on top
                      />
                    </div>
                    {checkInError && (
                        <p className="text-red-500 text-xs mt-1">Please select a check-in date</p>
                    )}
                  </div>

                  {/* CHECK-OUT */}
                  <div className="w-full sm:w-1/2 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase">Check-out</label>
                    <div className={`rounded-md ${checkOutError ? "border border-red-500 px-2 py-1" : ""}`}>
                      <DatePicker
                          value={checkOut ? dayjs(checkOut) : null}
                          onChange={(_, dateString) => {
                            setCheckOut(dateString);
                            if (dateString) setCheckOutError(false);
                          }}
                          inputReadOnly
                          disabledDate={disabledCheckOutDate}
                          format="YYYY-MM-DD"
                          variant="borderless"
                          placeholder="YYYY-MM-DD"
                          suffixIcon={null}
                          allowClear={false}
                          className="w-full p-0 text-sm font-medium h-6"
                          popupStyle={{ zIndex: 9999 }}
                      />
                    </div>
                    {checkOutError && (
                        <p className="text-red-500 text-xs mt-1">Please select a check-out date</p>
                    )}
                  </div>
                </div>

                {/* ROOM QUANTITY */}
                <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                  <label className="block text-[10px] font-extrabold text-gray-500 uppercase">
                    Rooms {/* Đổi label thành Rooms cho đúng nghĩa */}
                  </label>
                  <InputNumber
                      min={1}
                      max={dataRoom.quantity || 10}
                      value={numberOfGuests} // Bạn nên đổi tên state này thành numberOfRooms cho code sạch hơn sau này
                      parser={(val) => {
                          if (!val) return '';
                          return String(val).replace(/,/g, '.');
                      }}
                      onChange={(value) => {
                          if (value === null || value === undefined || value === '') {
                              setNumberOfGuests(1);
                              return;
                          }
                          let numStr = String(value).replace(',', '.');
                          let num = parseFloat(numStr);
                          if (isNaN(num)) {
                              setNumberOfGuests(1);
                              return;
                          }

                          let integerPart = Math.floor(num);
                          let decimalPart = num - integerPart;
                          let rounded = decimalPart > 0.5 ? integerPart + 1 : integerPart;

                          if (rounded < 1) rounded = 1;
                          if (rounded > 10) rounded = 10;

                          const maxRoom = dataRoom.quantity || 10;
                          if (rounded > maxRoom) rounded = maxRoom;

                          setNumberOfGuests(rounded);
                      }}
                      variant="borderless"
                      className="w-full !p-0 text-sm font-medium input-number-custom"
                      controls={true} // Bật lại controls +/- để dễ bấm
                      style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* BOOKING BUTTON */}
              <button
                  disabled={disablePaymentButton}
                  onClick={handleBookingStart}
                  className={`w-full py-3.5 rounded-lg text-white font-bold text-lg transition-all duration-200 ${
                      disablePaymentButton ? "bg-gray-300 cursor-not-allowed" : "bg-[#DE3151] hover:bg-[#C11136] shadow-md"
                  }`}
              >
                {disablePaymentButton ? "Processing..." : "Book Now"}
              </button>
              <p className="text-center text-sm text-gray-500 mt-3 mb-3">You won't be charged yet</p>

              {/* CURRENCY SELECTOR */}
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 p-1 rounded-lg flex flex-wrap justify-center gap-1">
                  {availableCurrencies.map(cur => (
                      <button
                          key={cur}
                          onClick={() => setSelectedCurrency(cur)}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                              selectedCurrency === cur ? "bg-white shadow text-gray-900 font-bold" : "text-gray-500 hover:bg-gray-200"
                          }`}
                      >
                        {cur}
                      </button>
                  ))}
                </div>
              </div>

              {/* PRICE BREAKDOWN */}
              {numberOfDays > 0 && (
                  <div className="pt-4 space-y-3">
                    {priceBreakdown.map((d, i) => {
                      const basePrice = dataRoom?.price || 0;
                      const isSpecialPrice = d.price !== basePrice;
                      return (
                          <div
                              key={i}
                              className={`flex justify-between text-sm ${
                                  isSpecialPrice
                                      ? "font-semibold text-gray-900 bg-orange-50 p-2 rounded-lg -mx-2"
                                      : "text-gray-600 underline decoration-gray-300"
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{dayjs(d.date).format("DD/MM/YYYY")}</span>
                              {isSpecialPrice && (
                                  <Tooltip title={`Price varies on this date (Base: ${convertAndFormat(basePrice)})`}>
                                  <span className="text-orange-500 cursor-help">
                                    <FaCircleInfo size={14} />
                                  </span>
                                  </Tooltip>
                              )}
                            </div>
                            <span className={isSpecialPrice ? "text-orange-600" : ""}>
                            {convertAndFormat(d.price)}
                            </span>
                          </div>
                      );
                    })}
                    <hr className="border-gray-200 my-4" />
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total ({selectedCurrency})</span>
                      <span>{convertAndFormat(totalPriceVND)}</span>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* --- LEFT COLUMN (Info, Photos...) --- */}
        <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
          {/* ROOM SELECTOR */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-6 gap-4">
            <div className="w-full max-w-xs">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Room Type</p>
              <Select
                  value={roomType}
                  onChange={handleRoomTypeChange}
                  size="large"
                  className="w-full"
                  variant="filled"
              >
                {data?.roomType?.map((type, i) => (
                    <Select.Option key={i} value={type.RoomType}>
                      <span className="font-semibold text-gray-700 text-sm">{type.RoomType}</span>
                    </Select.Option>
                ))}
              </Select>
            </div>
            <Tooltip title="Room details"><div className="mt-6 text-gray-400"><FaCircleQuestion size={24} /></div></Tooltip>
          </div>

          {/* SERVICES */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-gray-900">Services</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              {dataRoom?.services?.map((s, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-purple-100 text-purple-600 group-hover:scale-110 transition">
                      {React.createElement(iconMap[s.icon] || FaCheckCircle,{ size: 24 })}
                    </div>
                    <div className="flex flex-col">
                      <h4 className="font-semibold text-gray-900 text-[15px]">{s.name}</h4>
                      {s.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{s.description}</p>}
                    </div>
                  </div>
              ))}
            </div>
          </div>
          <hr className="border-gray-200" />

          {/* DESCRIPTION */}
          <div className="bg-white rounded-2xl ">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Introduction</h3>
              <div className="mt-2 h-1 w-12 bg-blue-600 rounded-full"></div>
            </div>
            <div
                className="prose prose-slate prose-lg max-w-none text-gray-600 leading-loose"
                dangerouslySetInnerHTML={{ __html: data?.description }}
            />
          </div>
          <hr className="border-gray-200" />

          {/* PHOTOS - USING NEW IMAGEHOTEL */}
          {/* <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Where you'll sleep</h3>
            <ImageHotel photos={dataRoom?.photos} />
          </div>
          <hr className="border-gray-200" /> */}

          {/* FACILITIES */}
          {/* <div>
            <h3 className="text-xl font-bold mb-6 text-gray-900">What this place offers</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-4">
              {dataRoom?.facilities?.map((i) => (
                  <div key={i._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      {React.createElement(iconMap[i.icon] || FaCircleQuestion,{ size: 20 })}
                    </div>
                    <span className="text-[15px] font-medium text-gray-700">{i?.name}</span>
                  </div>
              ))}
            </div>
          </div>
          <hr className="border-gray-200" /> */}

          {/* POLICIES */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-gray-900">Things to know</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["House rules", "Safety & property", "Cancellation policy"].map((type) => (
                  <div key={type} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 h-full">
                    <h4 className="font-bold text-gray-900 mb-4 text-[16px]">{type}</h4>
                    <ul className="space-y-3">
                      {data?.policy?.filter((i) => i.type === type).map((i) => (
                          <li key={i._id} className="flex items-start gap-3">
                            {i.icon && (
                                <div className="mt-0.5 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white border text-gray-500">
                                  {React.createElement(iconMap[i.icon] || FaCircleQuestion,{ size: 12 })}
                                </div>
                            )}
                            <span className="text-sm text-gray-600 flex-1 line-clamp-3" title={i?.name}>{i?.name}</span>
                          </li>
                      ))}
                    </ul>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* DESCRIPTION MODAL */}
        {showDes && (
            <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-bold text-lg">Introduction</h3>
                  <button onClick={() => setShowDes(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <RxCross1 />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto">
                  <div className="prose" dangerouslySetInnerHTML={{ __html: data?.description }} />
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default InfoHotel;
