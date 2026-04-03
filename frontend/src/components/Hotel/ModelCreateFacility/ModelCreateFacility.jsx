import React, { useState } from "react";
import iconMap from "../../../common/data/iconMap.js"; // import the iconMap
import { RxCross1 } from "react-icons/rx";
import { AiOutlineSearch } from "react-icons/ai";
import { BiChevronDown } from "react-icons/bi";
import {
  createFacilitiesApi,
  createServicesApi,
} from "../../../api/client/api.js";
import toast from "react-hot-toast";

const ModelCreateFacility = ({
  setShowCreateFacility,
  setFacilities,
  facilities,
  isBus = false,
}) => {
  const [icon, setIcon] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleIconChange = (iconKey) => {
    setIcon(iconKey);
    setDropdownOpen(false); // Close the dropdown after selecting an icon
  };
  const [name, setName] = useState();

  const handleClick = async () => {
    if (!name) {
      return toast.error("Please enter the facility name");
    }
    let data = { name: name, isBus };
    if (icon) data.icon = icon;
    const res = await createFacilitiesApi(data);
    if (res.success) {
      toast.success("Create facility success");
      setShowCreateFacility(false);
      setName("");
      setIcon("");
      if (setFacilities) {
        setFacilities([...facilities, res.data._id]);
      }
    } else {
      toast.error(res.message);
      setShowCreateFacility(false);
      setName("");
      setIcon("");
    }
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowCreateFacility(false)}
        />

        {/* Modal Content */}
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">

          {/* Close Button */}
          <div className="absolute top-4 right-4">
            <button
                onClick={() => setShowCreateFacility(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <RxCross1 size={24} />
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h3 className="font-bold text-2xl text-gray-800">
              New Facility
            </h3>
            <p className="text-sm text-gray-500 mt-1">Add a new amenity to your list</p>
          </div>

          {/* Form Inputs */}
          <div className="flex flex-col gap-5 mb-8">

            {/* Name Input */}
            <div className="w-full">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                Facility Name
              </label>
              <input
                  type="text"
                  placeholder="e.g. Gym, Parking..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder-gray-400"
              />
            </div>

            {/* Icon Select */}
            <div className="w-full relative">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                Select Icon
              </label>

              <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl transition-all bg-white
                ${dropdownOpen
                      ? "border-orange-500 ring-2 ring-orange-500/20"
                      : "border-gray-300 hover:border-orange-400"}`}
              >
                <div className="flex items-center gap-3">
                  {icon ? (
                      <span className="text-orange-600">
                    {React.createElement(iconMap[icon], { size: 22 })}
                  </span>
                  ) : (
                      <span className="text-gray-400">No icon selected</span>
                  )}
                  <span className={`font-medium ${icon ? "text-gray-800" : "text-gray-400"}`}>
                  {icon || "Choose..."}
                </span>
                </div>
                <BiChevronDown
                    size={24}
                    className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Grid */}
              {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-2xl shadow-xl z-20 p-2 custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      {Object.keys(iconMap).map((iconKey) => (
                          <button
                              key={iconKey}
                              onClick={() => handleIconChange(iconKey)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left
                        ${icon === iconKey
                                  ? "bg-orange-50 text-orange-700 font-medium"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                          >
                      <span className={icon === iconKey ? "text-orange-600" : "text-gray-400"}>
                        {React.createElement(iconMap[iconKey], { size: 18 })}
                      </span>
                            <span className="truncate">{iconKey}</span>
                          </button>
                      ))}
                    </div>
                  </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
              onClick={handleClick}
              className="w-full bg-blue-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 transition-all active:scale-[0.98] shadow-sm"
          >
            Add Facility
          </button>

        </div>
      </div>
  );
};

export default ModelCreateFacility;
