import  { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { Button, Input, Select, TimePicker, Tooltip, Switch, Spin, Rate, Modal } from "antd";
import dayjs from "dayjs";
import toast from "react-hot-toast";

// Icons
import { IoCloudUploadOutline } from "react-icons/io5";
import { FaQuestionCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { HomeOutlined } from "@ant-design/icons";

// API
import {
  getAllServicesApi,
  getPolicyApi,
  uploadByFilesApi,
  uploadByLinkApi,
  getHotelDetailApi,
  updateHotelApi
} from "../../../../api/client/api.js";
import { getAllRoomsAction } from "../../../../redux/actions/RoomAction.js";

// Data
import { cities } from "../../../../common/common.js";

// Components
import Services from "../../../Services/Services.jsx";
import ModelCreateService from "../AdminCreateHotel/ModelCreateService.jsx";
import EditorTiny from "../../../TextEditor/EditorTiny.jsx";
import ModelCreatePolicy from "../../../Hotel/ModelCreatePolicy/ModelCreatePolicy.jsx";
import Policy from "../../../Utils/Policy/Policy.jsx";
import LocationPicker from "../../../Utils/Map/LocationPicker.jsx";
import {DEFAULT_ROOM_TYPES, HOTEL_TYPES, POLICY_TYPES} from "../constants/constants.js";

const { Option } = Select;

const AdminViewEditHotel = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const typeDefault = HOTEL_TYPES;

  // --- State: Loading ---
  const [loading, setLoading] = useState(false);

  // --- State: Data Loading ---
  const [dataDefault, setDataDefault] = useState({});

  // --- State: Modals ---
  const [showModel, setShowModel] = useState(false);
  const [showModelPolicy, setShowModelPolicy] = useState(false);
  const [isRoomTypeModalVisible, setIsRoomTypeModalVisible] = useState(false);

  // --- State: Form Fields ---
  const [name, setName] = useState("");
  const [type, setType] = useState("Hotel");
  const [city, setCity] = useState(undefined);
  const [address, setAddress] = useState("");
  const [cheapestPrice, setCheapestPrice] = useState("");

  // [NEW] Coordinates State
  const [coordinates, setCoordinates] = useState({ lat: 21.028511, lng: 105.854444 });

  // --- ROOM CONFIGURATION STATE ---
  const [roomType, setRoomType] = useState([]); // Selected types
  const [roomTypeDefault, setRoomTypeDefault] = useState(DEFAULT_ROOM_TYPES); // Available options
  const [inputRoomType, setInputRoomType] = useState(""); // For adding new custom types

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [linkPhoto, setLinkPhoto] = useState("");
  const [photos, setPhotos] = useState([]);
  const [description, setDescription] = useState("");

  // --- STAR RATING STATE ---
  const [stars, setStars] = useState(0);

  // --- VISIBILITY STATE ---
  const [isVisible, setIsVisible] = useState(true);

  // Services
  const [services, setServices] = useState([]);
  const [servicesDefault, setServicesDefault] = useState([]);

  // Policies
  const typePolicyDefault = POLICY_TYPES;
  const [typePolicy, setTypePolicy] = useState("House rules");
  const [policy, setPolicy] = useState([]);
  const [policyChecked, setPolicyChecked] = useState([]);

  // Constants

  // --- 1. FETCH DATA BY SLUG ---
  useEffect(() => {
    const fetchHotelDetail = async () => {
      if(!slug) return;
      setLoading(true);
      try {
        const res = await getHotelDetailApi(slug);
        const payload = res?.data || res;

        if (payload && (res.success || payload.success)) {
          const hotelData = payload.data || payload;
          setDataDefault(hotelData);
        } else {
          toast.error("Hotel not found");
          navigate("/dashboard-view-homes");
        }
      } catch (error) {
        console.error("Error fetching Hotel detail:", error);
        toast.error("Error loading Hotel data");
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetail();
  }, [slug, navigate]);

  // --- 2. POPULATE FORM ---
  useEffect(() => {
    if (dataDefault && Object.keys(dataDefault).length > 0) {
      setName(dataDefault.name || "");
      setType(dataDefault.type || "Hotel");
      setCity(dataDefault.city || undefined);
      setAddress(dataDefault.address || "");
      setCheapestPrice(dataDefault.cheapestPrice || "");

      // Populate Stars
      setStars(dataDefault.stars || 0);

      // [NEW] Populate Coordinates
      if (dataDefault.coordinates && dataDefault.coordinates.lat) {
        setCoordinates(dataDefault.coordinates);
      }

      // --- Handle Room Types ---
      const existingTypes = dataDefault.roomType?.map(r => r.RoomType ? r.RoomType : r) || [];
      setRoomType(existingTypes);

      setRoomTypeDefault(prev => {
        const combined = [...prev, ...existingTypes];
        return [...new Set(combined)];
      });

      // Date Handling
      setCheckIn(dataDefault.checkIn ? dayjs(dataDefault.checkIn) : null);
      setCheckOut(dataDefault.checkOut ? dayjs(dataDefault.checkOut) : null);

      setPhotos(dataDefault.photos || []);
      setDescription(dataDefault.description || "");

      // Map Services
      setServices(dataDefault.services?.map((service) => service._id || service) || []);

      // Map Policies
      setPolicyChecked(dataDefault.policy?.map((i) => i._id || i) || []);

      // Set Visibility
      setIsVisible(dataDefault.isVisible !== undefined ? dataDefault.isVisible : true);
    }
  }, [dataDefault]);

  // --- 3. FETCH SERVICES & POLICIES OPTIONS ---
  useEffect(() => {
    const fetchServices = async () => {
      const res = await getAllServicesApi();
      if (res?.data) setServicesDefault(res.data);
    };
    fetchServices();
  }, [showModel]);

  useEffect(() => {
    const fetchPolicies = async () => {
      if (typePolicy) {
        const res = await getPolicyApi({ type: typePolicy });
        if (res.success) {
          setPolicy(res.data);
        }
      }
    };
    fetchPolicies();
  }, [typePolicy, showModelPolicy]);

  // --- Handlers ---
  const addPhotoByFile = async (ev) => {
    const files = ev.target.files;
    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append("photos", files[i]);
    }
    const res = await uploadByFilesApi(data);
    if (res.success) {
      const newImg = res.data.map((item) => item.url);
      setPhotos([...photos, ...newImg]);
    } else {
      toast.error("Error uploading photos");
    }
  };

  const addPhotoByLink = async (e) => {
    e.preventDefault();
    if (!linkPhoto) return toast.error("Please enter a valid image URL");
    const res = await uploadByLinkApi({ imageUrl: linkPhoto });
    if (res.code === 200) {
      setPhotos([...photos, res.data.url]);
      setLinkPhoto("");
      toast.success("Photo added");
    } else {
      toast.error("Link error");
    }
  };

  const removePhoto = (ev, filename) => {
    ev.preventDefault();
    setPhotos(photos.filter((photo) => photo !== filename));
  };

  const handleEditorChange = (content) => {
    setDescription(content);
  };

  const handleServiceChange = (serviceId) => {
    setServices((prev) =>
        prev.includes(serviceId)
            ? prev.filter((id) => id !== serviceId)
            : [...prev, serviceId]
    );
  };

  const handlePolicyChange = (id) => {
    setPolicyChecked((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // --- ROOM TYPE HANDLERS ---
  const handleRoomTypeChange = (name) => {
    setRoomType((prev) =>
        prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
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

  const handleSave = async () => {
    if (!name || name.trim().length === 0) return toast.error("Name cannot be empty");
    if (!city) return toast.error("Please choose a city");
    if (!address) return toast.error("Address cannot be empty");
    if (roomType.length === 0) return toast.error("At least one room type is required");
    if (services.length === 0) return toast.error("Please select at least one service");
    if (!cheapestPrice) return toast.error("Please enter price");
    if (Number(cheapestPrice) < 0) return toast.error("Invalid price");
    if (!checkIn) return toast.error("Check in time cannot be empty");
    if (!checkOut) return toast.error("Check out time cannot be empty");

    let dataHotel = {
      _id: dataDefault._id,
      name,
      type,
      city,
      address,
      cheapestPrice,
      checkIn,
      checkOut,
      photos,
      services,
      description,
      policy: policyChecked,
      isVisible,
      stars,
      roomType,
      coordinates // [NEW] Send coordinates update
    };

    try {
      const res = await updateHotelApi(dataHotel);

      if (res && res.success) {
        toast.success("Hotel updated successfully!");
        dispatch(getAllRoomsAction());
        navigate("/dashboard-view-homes");
      } else {
        toast.error(res?.message || "Update failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating");
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <Spin size="large" tip="Loading hotel details..." />
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">

        {/* Header */}
        <div className="rounded-md mx-5 top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 mb-8 shadow-sm sticky">
          <div className="max-w-full mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-bold text-gray-800 text-2xl md:text-3xl tracking-tight">
                Edit Property
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Update information for {name || "your property"}
              </p>
            </div>

            {/* Actions & Status Switch */}
            <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 px-3 border-r border-gray-200 pr-4">
                    <span className={`text-sm font-semibold flex items-center gap-2 ${isVisible ? "text-green-600" : "text-gray-500"}`}>
                        {isVisible ? <FaEye /> : <FaEyeSlash />}
                      {isVisible ? "Public" : "Hidden"}
                    </span>
                <Switch
                    checked={isVisible}
                    onChange={(checked) => setIsVisible(checked)}
                    className={isVisible ? "bg-green-500" : "bg-gray-300"}
                />
              </div>

              <button
                  onClick={handleSave}
                  className="bg-gray-900 hover:bg-gray-800 text-white md:px-4 px-5 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-full mx-auto px-4 md:px-6">
          <form className="w-full space-y-8" onSubmit={(e) => e.preventDefault()}>

            {/* SECTION 1: Basic Information */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 md:p-8">
              <div className="flex mb-8 items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h2 className="font-semibold text-gray-700 text-lg">Hotel Details</h2>
              </div>

              <div className="space-y-8">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 ml-1">Property Name</label>
                  <Input
                      size="large"
                      placeholder="e.g. Sunset Villa Resort"
                      className="rounded-xl py-3 px-4 hover:border-blue-400 focus:border-blue-500"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Type & Star Rating */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Type */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Type</label>
                    <Select
                        size="large"
                        value={type}
                        onChange={setType}
                        className="w-full rounded-xl"
                        popupClassName="rounded-xl"
                        placeholder={
                          <div className="flex items-center gap-2 text-gray-400">
                            <HomeOutlined />
                            <span>Select Type...</span>
                          </div>
                        }
                    >
                      {typeDefault.map((i, index) => (
                          <Option key={index} value={i}>{i}</Option>
                      ))}
                    </Select>
                  </div>

                  {/* Star Rating Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Star Rating</label>
                    <div className="h-[30px] md:h-[40px] flex items-center px-4 border border-gray-200 rounded-xl bg-white focus-within:border-blue-500 transition-colors">
                      <Rate
                          allowHalf={false}
                          value={stars}
                          onChange={setStars}
                          className="text-yellow-400 text-lg"
                      />
                      <span className="ml-3 text-gray-400 text-xs font-semibold uppercase tracking-wide">
                          {stars > 0 ? `${stars} Stars` : "No Rating"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* City & Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">City</label>
                    <Select
                        size="large"
                        value={city || undefined}
                        onChange={(value) => setCity(value)}
                        className="w-full rounded-xl"
                        popupClassName="rounded-xl"
                        showSearch
                        allowClear
                        filterOption={(input, option) =>
                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    >
                      {cities.map((c) => (
                          <Option key={c.id || c.name} value={c.name}>
                            {c.name}
                          </Option>
                      ))}
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Base Price</label>
                    <Input
                        type="number"
                        prefix={<span className="text-gray-400 font-bold">$</span>}
                        size="large"
                        value={cheapestPrice}
                        onChange={(e) => setCheapestPrice(e.target.value)}
                        placeholder="0.00"
                        className="rounded-xl py-3 px-4 hover:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* [NEW] ADDRESS & MAP PICKER */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4 pt-4 border-t border-gray-100">
                  {/* Left Column: Address Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Displayed Address</label>
                    <Input
                        size="large"
                        placeholder="e.g. 198 Tran Quang Khai"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="rounded-xl py-3 px-4 hover:border-blue-400 focus:border-blue-500"
                    />
                    <div className="bg-blue-50 text-blue-700 p-3 rounded-xl text-xs mt-2 border border-blue-100">
                      <p className="font-bold mb-1">Tip:</p>
                      <p>This address text is for display only. Use the map on the right to set the exact GPS location for navigation.</p>
                    </div>
                  </div>

                  {/* Right Column: Location Picker */}
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
            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 md:p-8">
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
                      <label
                          key={idx}
                          className={`cursor-pointer px-4 py-2 rounded-lg border transition-all flex items-center gap-2 select-none
                            ${roomType.includes(item)
                              ? "bg-purple-50 border-purple-500 text-purple-700"
                              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                      >
                        <input
                            type="checkbox"
                            checked={roomType.includes(item)}
                            onChange={() => handleRoomTypeChange(item)}
                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="font-medium">{item}</span>
                      </label>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 3: Gallery */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 md:p-8">
              <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
                <h2 className="font-semibold text-gray-700 text-lg">Gallery</h2>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                      size="large"
                      placeholder="Paste image URL here..."
                      value={linkPhoto}
                      onChange={(e) => setLinkPhoto(e.target.value)}
                      className="rounded-xl py-3 hover:border-rose-400 focus:border-rose-500"
                  />
                  <Button
                      size="large"
                      onClick={addPhotoByLink}
                      className="rounded-xl h-[50px] bg-gray-100"
                  >
                    Add Photo
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <label className="border-2 border-dashed border-gray-300 rounded-2xl h-32 md:h-40 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-rose-50 hover:border-rose-400 hover:text-rose-500 transition-all bg-gray-50">
                    <input type="file" multiple className="hidden" onChange={addPhotoByFile} />
                    <IoCloudUploadOutline size={28} className="mb-2" />
                    <span className="text-sm font-medium">Upload</span>
                  </label>

                  {photos?.map((item, index) => (
                      <div key={index} className="relative h-32 md:h-40 group overflow-hidden rounded-2xl shadow-sm border border-gray-100">
                        <img src={item} alt="hotel" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <button
                            onClick={(ev) => removePhoto(ev, item)}
                            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white text-red-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all"
                        >
                          ✕
                        </button>
                      </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 4: Description */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 md:p-8">
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

              {/* Services */}
              <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 md:p-8">
                <div className="flex mb-4 items-center gap-3">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                  <h2 className="font-semibold text-gray-700 text-lg">Services</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div
                      onClick={() => setShowModel(true)}
                      className="cursor-pointer h-20 border-2 border-dashed border-gray-300 rounded-2xl p-2 flex flex-col items-center justify-center text-gray-500 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-600 transition-all text-center"
                  >
                    <IoCloudUploadOutline size={20} />
                    <span className="text-xs font-medium mt-1">Add Service</span>
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

              {/* Policies */}
              <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 md:p-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                    <h2 className="font-semibold text-gray-700 text-lg">Policies</h2>
                  </div>
                  <Tooltip title="Choose the type of policy before adding">
                    <FaQuestionCircle className="text-gray-400 hover:text-indigo-500" size={18} />
                  </Tooltip>
                </div>

                <div className="mb-6">
                  <Select
                      value={typePolicy}
                      onChange={(value) => setTypePolicy(value)}
                      className="w-full h-[45px] rounded-xl"
                      placeholder="Select policy category..."
                      popupClassName="rounded-xl"
                  >
                    {typePolicyDefault?.map((i, ind) => (
                        <Option key={ind} value={i}>{i}</Option>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div
                      onClick={() => setShowModelPolicy(true)}
                      className="cursor-pointer h-20 border-2 border-dashed border-gray-300 rounded-2xl p-2 flex flex-col items-center justify-center text-gray-500 hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-600 transition-all text-center"
                  >
                    <IoCloudUploadOutline size={20} />
                    <span className="text-xs font-medium mt-1">Create Policy</span>
                  </div>
                  {policy?.length > 0 && (
                      <Policy
                          typePolicyDefault={typePolicyDefault}
                          handlePolicyChange={handlePolicyChange}
                          policy={policy}
                          setPolicy={setPolicy}
                          policyChecked={policyChecked}
                      />
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 6: Timing */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 md:p-8">
              <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                <h2 className="font-semibold text-gray-700 text-lg">Check-in & Check-out</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Check-in</label>
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-1">
                    <TimePicker
                        onChange={setCheckIn}
                        value={checkIn}
                        format="HH:mm"
                        placeholder="14:00"
                        className="w-full !bg-transparent !border-0 !shadow-none py-2 px-3"
                        popupClassName="rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Check-out</label>
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-1">
                    <TimePicker
                        onChange={setCheckOut}
                        value={checkOut}
                        format="HH:mm"
                        placeholder="12:00"
                        className="w-full !bg-transparent !border-0 !shadow-none py-2 px-3"
                        popupClassName="rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MOBILE SAVE BUTTON */}
            <div className="md:hidden mt-6">
              <button
                  onClick={handleSave}
                  className="w-full bg-gray-900 text-white py-4 rounded-xl text-lg font-bold shadow-xl active:scale-95 transition-transform"
              >
                Save Changes
              </button>
            </div>

          </form>

          {/* Modals */}
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
          {showModel && (
              <ModelCreateService setServices={setServices} services={services} setShowModel={setShowModel} />
          )}
          {showModelPolicy && (
              <ModelCreatePolicy
                  typePolicyDefault={typePolicyDefault}
                  setTypePolicy={setTypePolicy}
                  typePolicy={typePolicy}
                  policyChecked={policyChecked}
                  setPolicyChecked={setPolicyChecked}
                  policy={policy}
                  setPolicy={setPolicy}
                  setShowModel={setShowModelPolicy}
              />
          )}
        </div>
      </div>
  );
};

export default AdminViewEditHotel;
