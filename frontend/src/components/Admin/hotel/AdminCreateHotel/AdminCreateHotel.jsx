import { Select, TimePicker, Switch, Rate, Modal, Input } from "antd";
import  { useState, useEffect } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {  FaEye, FaEyeSlash } from "react-icons/fa";

import ModelCreateService from "./ModelCreateService.jsx";
import ModelCreatePolicy from "../../../Hotel/ModelCreatePolicy/ModelCreatePolicy.jsx";
import Services from "../../../Services/Services.jsx";
import Policy from "../../../Utils/Policy/Policy.jsx";
import EditorTiny from "../../../TextEditor/EditorTiny.jsx";

// Import API
import {
  createHotelApi,
  getAllServicesApi,
  getPolicyApi,
  uploadByFilesApi,
  uploadByLinkApi,
} from "../../../../api/client/api.js";
import { getAllHotelsAction } from "../../../../redux/actions/HotelAction.js";
import { getAllRoomsAction } from "../../../../redux/actions/RoomAction.js";
import { cities } from "../../../../common/common.js";
import LocationPicker from "../../../Utils/Map/LocationPicker.jsx";
import {DEFAULT_ROOM_TYPES, HOTEL_TYPES, INITIAL_COORDINATES, POLICY_TYPES} from "../constants/constants.js";

const { Option } = Select;

const AdminCreateHotel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // popup model
  const [showModel, setShowModel] = useState(false);
  const [showModelPolicy, setShowModelPolicy] = useState(false);
  const [isRoomTypeModalVisible, setIsRoomTypeModalVisible] = useState(false);

  const [stars, setStars] = useState(0);

  // default values
  const typeDefault = HOTEL_TYPES;
  const [roomTypeDefault, setRoomTypeDefault] = useState(DEFAULT_ROOM_TYPES);

  // policy
  const [typePolicyDefault, setTypePolicyDefault] = useState(POLICY_TYPES);

  const [inputRoomType, setInputRoomType] = useState("");
  const [servicesDefault, setServicesDefault] = useState([]);

  // --- STATE CREATE HOTEL ---
  const [name, setName] = useState("");
  const [type, setType] = useState("Hotel");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [cheapestPrice, setCheapestPrice] = useState();
  const [roomType, setRoomType] = useState([]);
  const [checkIn, setCheckIn] = useState(dayjs("14:00", "HH:mm"));
  const [checkOut, setCheckOut] = useState(dayjs("12:00", "HH:mm"));
  const [linkPhoto, setLinkPhoto] = useState("");
  const [photos, setPhotos] = useState([]);
  const [description, setDescription] = useState("");
  const [services, setServices] = useState([]);

  // [NEW] Coordinates State
  const [coordinates, setCoordinates] = useState(INITIAL_COORDINATES);

  // --- STATE VISIBILITY ---
  const [isVisible, setIsVisible] = useState(true);

  const [typePolicy, setTypePolicy] = useState("House rules");
  const [policy, setPolicy] = useState([]);
  const [policyChecked, setPolicyChecked] = useState([]);

  // fetch services
  useEffect(() => {
    const fetchServices = async () => {
      const res = await getAllServicesApi();
      setServicesDefault(res.data || []);
    };
    fetchServices();
  }, [showModel]);

  // fetch policies
  const getPolicy = async () => {
    if (typePolicy) {
      const tmp = await getPolicyApi({ type: typePolicy });
      if (tmp.success) setPolicy(tmp.data);
    }
  };
  useEffect(() => {
    getPolicy();
  }, [typePolicy, showModelPolicy]);

  // handlers
  const addPhotoByFile = async (ev) => {
    const files = ev.target.files;
    const data = new FormData();
    for (let i = 0; i < files.length; i++) data.append("photos", files[i]);

    const res = await uploadByFilesApi(data);
    if (res.success)
      setPhotos([...photos, ...res.data.map((item) => item.url)]);
    else toast.error("Error uploading files");
  };

  const addPhotoByLink = async (e) => {
    e.preventDefault();
    if (!linkPhoto) return toast.error("Please enter a valid image URL");
    const res = await uploadByLinkApi({ imageUrl: linkPhoto });
    if (res.code === 200) {
      setPhotos([...photos, res.data.url]);
      setLinkPhoto("");
      toast.success("Photo added");
    } else toast.error("Link error");
  };

  const removePhoto = (ev, filename) => {
    ev.preventDefault();
    setPhotos(photos.filter((photo) => photo !== filename));
  };

  const handleEditorChange = (content) => setDescription(content);

  const handleServiceChange = (serviceId) => {
    setServices((prev) =>
        prev.includes(serviceId)
            ? prev.filter((id) => id !== serviceId)
            : [...prev, serviceId]
    );
  };

  const handleRoomTypeChange = (name) => {
    setRoomType((prev) =>
        prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const handlePolicyChange = (id) => {
    setPolicyChecked((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAddCustomRoomType = () => {
    if (inputRoomType.trim()) {
      setRoomTypeDefault(prev => [...new Set([...prev, inputRoomType.trim()])]);
      setRoomType(prev => [...new Set([...prev, inputRoomType.trim()])]);
      setInputRoomType("");
      setIsRoomTypeModalVisible(false);
    } else {
      toast.error("Please enter a room type");
    }
  };

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    // Validate Basic Info
    if (!name?.trim()) return toast.error("Name cannot be empty");
    if (!type) return toast.error("Type accommodation cannot be empty");
    if (!city) return toast.error("Please choose a city");
    if (!cheapestPrice) return toast.error("Please enter price");
    if (cheapestPrice < 0) return toast.error("Invalid price");
    if (!address?.trim()) return toast.error("Address cannot be empty");

    // Validate Details
    if (!roomType.length) return toast.error("At least one room type is required");
    if (!services.length) return toast.error("Please select at least one service");
    if (!checkIn) return toast.error("Check in time cannot be empty");
    if (!checkOut) return toast.error("Check out time cannot be empty");

    const dataHotel = {
      name,
      type,
      city,
      address,
      roomType,
      cheapestPrice,
      checkIn,
      checkOut,
      policy: policyChecked,
      stars,
      isVisible,
      coordinates,
      ...(photos.length && { photos }),
      ...(description && { description }),
      ...(services.length && { services }),
    };

    const res = await createHotelApi(dataHotel);
    if (res.success) {
      toast.success(isVisible ? "Home published successfully!" : "Home saved as Draft (Hidden).");
      navigate("/dashboard-view-homes");

      // Reload Redux
      dispatch(getAllRoomsAction());
      dispatch(getAllHotelsAction());
    } else {
      toast.error(res.message || "Unable to create home. Please try again later.");
    }
  };

  return (
      <div className="min-h-screen bg-gray-50/50 pb-20">
        {/* --- HEADER --- */}
        <div className="rounded-md mx-5 top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 mb-8">
          <div className="max-w-full mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-bold text-gray-800 text-2xl md:text-3xl tracking-tight">Create New Home</h2>
              <p className="text-gray-500 text-sm mt-1">List a new property for guests to book</p>
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 px-3 border-r border-gray-200 pr-4">
                    <span className={`text-sm font-semibold flex items-center gap-2 ${isVisible ? "text-green-600" : "text-gray-500"}`}>
                        {isVisible ? <FaEye /> : <FaEyeSlash />}
                      {isVisible ? "Public (Visible)" : "Draft (Hidden)"}
                    </span>
                <Switch
                    checked={isVisible}
                    onChange={(checked) => setIsVisible(checked)}
                    className={isVisible ? "bg-green-500" : "bg-gray-300"}
                />
              </div>
              <button
                  onClick={handleCreateHotel}
                  className={`hidden md:block px-6 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-white whitespace-nowrap
                    ${isVisible ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-500 hover:bg-gray-600'}`}
              >
                {isVisible ? "Publish Property" : "Save as Draft"}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-full mx-auto px-4 md:px-6">
          <form className="w-full space-y-8" onSubmit={(e) => e.preventDefault()}>

            {/* SECTION 1: Basic Information */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8">
              <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h2 className="font-semibold text-gray-700 text-lg">Hotel Details</h2>
              </div>

              <div className="space-y-6">
                {/* NAME */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Hotel Name</label>
                  <input
                      placeholder="e.g. Seaside Villa Retreat"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* TYPE + CITY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* TYPE */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Accommodation Type</label>
                    <Select
                        size="large"
                        value={type || undefined}
                        onChange={(value) => setType(value)}
                        className="w-full"
                        style={{ height: '50px' }}
                        options={typeDefault.map((i) => ({ value: i, label: i }))}
                    />
                  </div>

                  {/* CITY */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">City</label>
                    <Select
                        size="large"
                        value={city || undefined}
                        onChange={(value) => setCity(value)}
                        className="w-full"
                        style={{ height: '50px' }}
                        showSearch
                        allowClear
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        options={cities.map((c) => ({ value: c.name, label: c.name }))}
                    />
                  </div>
                </div>

                {/* ADDRESS & MAP PICKER */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Detailed Address</label>
                      <input
                          placeholder="Street, District, etc."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Base Price</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                        <input
                            type="number"
                            value={cheapestPrice}
                            onChange={(e) => setCheapestPrice(e.target.value)}
                            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">Star Rating</label>
                      <div className="h-[40px] flex items-center px-4 border border-gray-200 rounded-xl bg-white">
                        <Rate allowHalf={false} value={stars} onChange={setStars} className="text-yellow-400 text-lg" />
                      </div>
                    </div>
                  </div>

                  {/* [NEW] Location Picker */}
                  <div className="flex flex-col gap-2">
                    <LocationPicker
                        addressString={city && address ? `${address}, ${city}` : ""}
                        setCoordinates={setCoordinates}
                        initialCoordinates={coordinates}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Room Configuration */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8">
              <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                <h2 className="font-semibold text-gray-700 text-lg">Room Configuration</h2>
              </div>
              <div className="flex flex-col gap-4">
                <button
                    type="button"
                    onClick={() => setIsRoomTypeModalVisible(true)}
                    className="w-full md:max-w-[200px] px-4 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition shadow-md font-medium"
                >
                  + Add Type
                </button>
                <div className="flex flex-wrap gap-3 mt-2">
                  {roomTypeDefault.map((item, idx) => (
                      <label key={idx} className={`cursor-pointer px-4 py-2 rounded-lg border flex items-center gap-2 select-none ${roomType.includes(item) ? "bg-purple-50 border-purple-500 text-purple-700" : "bg-white border-gray-200"}`}>
                        <input type="checkbox" checked={roomType.includes(item)} onChange={() => handleRoomTypeChange(item)} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                        <span className="font-medium">{item}</span>
                      </label>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 3: Media */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8">
              <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
                <h2 className="font-semibold text-gray-700 text-lg">Gallery</h2>
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" placeholder="Paste image URL here..." className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" value={linkPhoto} onChange={(e) => setLinkPhoto(e.target.value)} />
                  <button type="button" onClick={addPhotoByLink} className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-medium">Add URL</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <label className="border-2 border-dashed border-gray-300 rounded-2xl h-32 md:h-40 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 hover:border-rose-400 hover:text-rose-500 transition-all group">
                    <input type="file" multiple className="hidden" onChange={addPhotoByFile} />
                    <IoCloudUploadOutline size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Upload Files</span>
                  </label>
                  {photos.map((item, idx) => (
                      <div key={idx} className="relative h-32 md:h-40 group overflow-hidden rounded-2xl shadow-sm border border-gray-100">
                        <img src={item} alt="hotel" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <button onClick={(ev) => removePhoto(ev, item)} className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 text-red-500 rounded-full shadow-md cursor-pointer hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">✕</button>
                      </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 4: Description */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8">
              <div className="flex mb-4 items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                <h2 className="font-semibold text-gray-700 text-lg">About Property</h2>
              </div>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <EditorTiny handleEditorChange={handleEditorChange} description={description} />
              </div>
            </div>

            {/* SECTION 5: Services & Policies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8">
                <div className="flex mb-4 items-center gap-3">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                  <h2 className="font-semibold text-gray-700 text-lg">Services</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div onClick={() => setShowModel(true)} className="cursor-pointer h-20 border-2 border-dashed border-gray-300 rounded-xl p-2 flex flex-col items-center justify-center text-gray-500 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-600">
                    <IoCloudUploadOutline size={20} />
                    <span className="text-xs font-medium mt-1">New Service</span>
                  </div>
                  {servicesDefault.length > 0 && <Services handleServiceChange={handleServiceChange} setServicesDefault={setServicesDefault} servicesDefault={servicesDefault} services={services} />}
                </div>
              </div>

              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                    <h2 className="font-semibold text-gray-700 text-lg">Policies</h2>
                  </div>
                </div>
                <div className="mb-4">
                  <Select value={typePolicy} onChange={(value) => setTypePolicy(value)} className="w-full" size="large" placeholder="Select policy category...">
                    {typePolicyDefault.map((i, idx) => ( <Option key={idx} value={i}>{i}</Option> ))}
                  </Select>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div onClick={() => setShowModelPolicy(true)} className="cursor-pointer h-20 border-2 border-dashed border-gray-300 rounded-xl p-2 flex flex-col items-center justify-center text-gray-500 hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-600">
                    <IoCloudUploadOutline size={20} />
                    <span className="text-xs font-medium mt-1">Add Rule</span>
                  </div>
                  {policy.length > 0 && <Policy typePolicyDefault={typePolicyDefault} handlePolicyChange={handlePolicyChange} policy={policy} setPolicy={setPolicy} policyChecked={policyChecked} />}
                </div>
              </div>
            </div>

            {/* SECTION 6: Timing */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8">
              <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                <h2 className="font-semibold text-gray-700 text-lg">Check-in & Check-out</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Check-in Time</label>
                  <TimePicker onChange={(time) => setCheckIn(time)} value={checkIn} format="HH:mm" className="w-full py-2 px-3 rounded-xl border-gray-200" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Check-out Time</label>
                  <TimePicker onChange={(time) => setCheckOut(time)} value={checkOut} format="HH:mm" className="w-full py-2 px-3 rounded-xl border-gray-200" />
                </div>
              </div>
            </div>

            <button onClick={handleCreateHotel} className={`md:hidden w-full py-4 text-white rounded-xl text-lg font-semibold shadow-xl active:scale-95 transition-transform ${isVisible ? 'bg-gray-900' : 'bg-gray-500'}`}>
              {isVisible ? "Publish Property" : "Save as Draft"}
            </button>
          </form>

          <Modal
              title={<span className="font-semibold text-lg text-gray-800">Add Custom Room Type</span>}
              open={isRoomTypeModalVisible}
              onOk={handleAddCustomRoomType}
              onCancel={() => {
                setIsRoomTypeModalVisible(false);
                setInputRoomType("");
              }}
              okText="Add Type"
              cancelText="Cancel"
              okButtonProps={{ className: "bg-purple-600 hover:bg-purple-700 border-none" }}
              cancelButtonProps={{ className: "rounded-lg" }}
          >
            <div className="py-5">
              <label className="text-sm font-medium text-gray-700 mb-2 block ml-1">Room Type Name</label>
              <Input
                  size="large"
                  value={inputRoomType}
                  onChange={(e) => setInputRoomType(e.target.value)}
                  placeholder="e.g. Presidential Suite"
                  className="rounded-xl py-3 hover:border-purple-400 focus:border-purple-500"
                  onPressEnter={handleAddCustomRoomType}
                  autoFocus
              />
            </div>
          </Modal>

          {showModel && <ModelCreateService services={services} setServices={setServices} setShowModel={setShowModel} />}
          {showModelPolicy && <ModelCreatePolicy typePolicyDefault={typePolicyDefault} setTypePolicy={setTypePolicy} typePolicy={typePolicy} policyChecked={policyChecked} setPolicyChecked={setPolicyChecked} policy={policy} setPolicy={setPolicy} setShowModel={setShowModelPolicy} />}
        </div>
      </div>
  );
}

export default AdminCreateHotel;