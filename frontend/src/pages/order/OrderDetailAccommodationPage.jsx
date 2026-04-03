import React, { useEffect, useState } from "react";
import Header from "../../components/Utils/Header/Header.jsx";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux"; // Added useDispatch
import toast from "react-hot-toast";
import { getBookingApi } from "../../api/client/api.js";
import Footer from "../../components/Hotel/Footer/Footer.jsx";
import iconMap from "../../common/data/iconMap.js";
import { Carousel } from "antd";
import {
  FaInfoCircle, FaCheckCircle, FaReceipt,
  FaUser, FaEnvelope, FaPhone, FaTag, FaArrowLeft // Added FaArrowLeft
} from "react-icons/fa";

// --- Custom Arrow Components for Carousel ---
const SampleNextArrow = ({ className, style, onClick }) => <div className={`${className} absolute right-2 top-1/2 z-10 !flex items-center justify-center text-white bg-black/30 p-2 rounded-full cursor-pointer hover:bg-black/50`} style={{ ...style }} onClick={onClick}>›</div>;
const SamplePrevArrow = ({ className, style, onClick }) => <div className={`${className} absolute left-2 top-1/2 z-10 !flex items-center justify-center text-white bg-black/30 p-2 rounded-full cursor-pointer hover:bg-black/50`} style={{ ...style }} onClick={onClick}>‹</div>;

const OrderDetailAccommodationPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch(); // Initialize Dispatch
  const stateUser = useSelector((state) => state.UserReducer);
  const navigate = useNavigate();
  const [data, setData] = useState();

  // --- AUTHENTICATION & FETCH DATA ---
  const authenticate = async () => {
    if (!stateUser.isAuthenticated && stateUser.loading === "false") {
      toast.error("Access Denied");
      navigate("/");
    } else {
      const res = await getBookingApi(id);
      if (res.success) {
        if (
            stateUser.loading === "false" &&
            stateUser?.user?.email !== res.data.email
        ) {
          toast.error("Access Denied");
          navigate("/");
        } else {
          setData(res.data);
        }
      } else {
        toast.error(res.message);
        navigate("/");
      }
    }
  };

  useEffect(() => {
    authenticate();
  }, [id]);

  const handleBackToHotel = () => {
    if (!data) return;

    dispatch({
      type: "NEW_SEARCH",
      payload: {
        destination: data?.roomType?.hotel?.city || "",
        dates: [
          {
            startDate: new Date(data.checkIn),
            endDate: new Date(data.checkOut),
            key: "selection",
          },
        ],
        options: {
          adult: data.guests,
          children: 0,
          room: 1,
        },
      },
    });

    if (data?.roomType?.hotel?.slug) {
      navigate(`/homes/${data.roomType.hotel.slug}`);
    } else {
      navigate(-1); // Fallback if slug is missing
    }
  };

  // --- FORMATTERS ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'request') return 'bg-red-50 text-red-700 border border-red-200';
    if (s === 'Pending') return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    if (s === 'UNPAID') return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  };

  // --- LOADING STATE ---
  if (!data) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-semibold text-gray-600">Loading your order...</p>
          </div>
        </div>
    );
  }

  // --- RENDER ---
  return (
      <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
        <Header />

        <main className="flex-grow max-w-7xl mx-auto px-4 md:px-10 py-8 w-full pt-18 md:pt-25">

          {/* Page Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              {/* Back Button */}
              <button
                  onClick={handleBackToHotel}
                  className="group flex items-center gap-2 text-gray-500 hover:text-orange-600 mb-3 transition-colors font-medium w-fit"
              >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                Go Back
              </button>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                Order Details
              </h1>
              <p className="text-gray-500">
                View and manage your booking information.
              </p>
            </div>

            {/* Status Badge */}
            <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide w-fit ${getStatusStyle(data.status)}`}>
              {data.status}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT COLUMN: Booking Information */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* Main Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-100 p-6 flex items-center gap-3">
                  <FaReceipt className="text-orange-500 text-xl" />
                  <h2 className="text-xl font-bold text-gray-900">Booking Summary</h2>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    {/* Booking ID */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Booking ID</label>
                      <p className="font-mono text-lg font-semibold text-gray-800">{data._id}</p>
                    </div>

                    {/* Payment Method */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Payment Method</label>
                      <p className="font-medium text-gray-800 capitalize">{data.paymentMethod || "N/A"}</p>
                    </div>

                    {/* Price Details */}
                    <div className="md:col-span-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm text-gray-500 font-bold">Payment Details</p>
                          <p className="text-xs text-gray-400">Includes taxes & fees</p>
                        </div>

                        {/* Coupon Badge */}
                        {data.couponCode && (
                            <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-bold border border-green-200">
                              <FaTag /> {data.couponCode} Applied
                            </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1 items-end">
                        {/* Original Price */}
                        {data.discountAmount > 0 && (
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>Original Price:</span>
                              <span className="line-through decoration-gray-400">
                                {formatCurrency(data.originalPriceVND || (data.totalPriceVND + data.discountAmount))}
                              </span>
                            </div>
                        )}

                        {/* Discount */}
                        {data.discountAmount > 0 && (
                            <div className="flex items-center gap-4 text-sm text-emerald-600 font-medium">
                              <span>Discount:</span>
                              <span>- {formatCurrency(data.discountAmount)}</span>
                            </div>
                        )}

                        {/* Divider */}
                        {data.discountAmount > 0 && <div className="w-full h-[1px] bg-gray-200 my-1"></div>}

                        {/* Total Paid */}
                        <div className="flex items-center justify-between w-full mt-1">
                          <span className="text-gray-700 font-bold text-base">Total Paid Amount:</span>
                          <p className="text-2xl font-extrabold text-orange-600">
                            {formatCurrency(data.totalPriceVND)}
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Guest Information Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-100 p-6 flex items-center gap-3">
                  <FaUser className="text-blue-500 text-xl" />
                  <h2 className="text-xl font-bold text-gray-900">Guest Details</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <FaUser />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Full Name</p>
                        <p className="font-medium text-gray-900">{data.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <FaEnvelope />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email Address</p>
                        <p className="font-medium text-gray-900 break-all">{data.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <FaPhone />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone Number</p>
                        <p className="font-medium text-gray-900">{data.phoneNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <FaCheckCircle />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Guests Count</p>
                        <p className="font-medium text-gray-900">{data.guests} Person(s)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Hotel Summary */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden top-24">
                {/* Carousel Section */}
                <div className="relative h-56 w-full bg-gray-200">
                  <Carousel
                      arrows
                      className="h-full"
                      autoplay
                      prevArrow={<SamplePrevArrow />}
                      nextArrow={<SampleNextArrow />}
                  >
                    {data?.roomType?.photos?.map((src, index) => (
                        <div key={index} className="h-56">
                          <img src={src} alt={`Room ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                    {data?.roomType?.hotel?.photos?.map((src, index) => (
                        <div key={index + "hotel"} className="h-56">
                          <img src={src} alt={`Hotel ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                  </Carousel>
                </div>

                <div className="p-6">
                  {/* Hotel Name & Rating */}
                  <div className="mb-4">
                    <div className="flex items-center gap-1 text-yellow-400 mb-1">
                      {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                          </svg>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {data?.roomType?.hotel?.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 font-medium">{data?.roomType?.RoomType}</p>
                  </div>

                  {/* Timeline Checkin/Checkout */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Check-in</p>
                        <p className="font-bold text-gray-800 text-sm">
                          {new Date(data?.checkIn).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <p className="text-xs text-gray-500">
                          from {new Date(data?.roomType?.hotel?.checkIn).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="flex flex-col items-center px-2 pt-1">
                        <div className="w-16 h-[1px] bg-gray-300 relative mt-4">
                          <div className="absolute -top-[3px] left-0 w-2 h-2 bg-gray-300 rounded-full"></div>
                          <div className="absolute -top-[3px] right-0 w-2 h-2 bg-gray-300 rounded-full"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-bold uppercase">Check-out</p>
                        <p className="font-bold text-gray-800 text-sm">
                          {new Date(data?.checkOut).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <p className="text-xs text-gray-500">
                          until {new Date(data?.roomType?.hotel?.checkOut).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Amenities Grid */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Included Amenities</h4>
                    <div className="space-y-3">
                      {data?.roomType?.services?.slice(0,3).map((service, index) => (
                          <div key={`service-${index}`} className="flex items-center gap-3 text-gray-700 text-sm">
                            {React.createElement(iconMap[service.icon] || FaInfoCircle, {
                              size: 16, className: "text-blue-500 flex-shrink-0"
                            })}
                            <span className="truncate">{service.name}</span>
                          </div>
                      ))}
                      {data?.roomType?.facilities?.slice(0,3).map((service, index) => (
                          <div key={`facility-${index}`} className="flex items-center gap-3 text-gray-700 text-sm">
                            {React.createElement(iconMap[service?.icon] || FaInfoCircle, {
                              size: 16, className: "text-blue-500 flex-shrink-0"
                            })}
                            <span className="truncate">{service.name}</span>
                          </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </main>
        <Footer />
      </div>
  );
};

export default OrderDetailAccommodationPage;