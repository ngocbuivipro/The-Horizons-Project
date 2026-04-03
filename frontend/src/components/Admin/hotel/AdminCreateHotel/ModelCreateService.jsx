import React, { useState } from "react";
import iconMap from '../../../../common/data/iconMap.js';
import { RxCross1 } from "react-icons/rx";
import { BiChevronDown } from "react-icons/bi";
import { createServicesApi } from "../../../../api/client/api.js";
import toast from "react-hot-toast";

const ModelCreateService = ({ setShowModel, setServices, services }) => {
  const [icon, setIcon] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");

  const handleIconChange = (iconKey) => {
    setIcon(iconKey);
    setDropdownOpen(false);
  };

  const handleClick = async () => {
    if (!name) return toast.error("Name must not be empty");
    // if (!icon) return toast.error("Icon must not be empty");

    const res = await createServicesApi({ name, icon, description });
    if (res.success) {
      toast.success("Create service successfully");
      setShowModel(false);
      setName("");
      setIcon("");
      if (setServices) {
        setServices([...services, res.data._id]);
      }
    } else {
      toast.error(res.message);
      setShowModel(false);
      setName("");
      setIcon("");
    }
  };

  // Shared styles for inputs and triggers for consistency
  const inputBaseStyles =
      "w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 placeholder-gray-400";

  return (
      // Overlay with backdrop blur and darker background
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Modal Container: Changed width percentage to max-w for better large screen handling, updated borders/shadows */}
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 my-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Close Button: Added hover effect and background */}
          <button
              onClick={() => setShowModel(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
          >
            <RxCross1 size={22} />
          </button>

          {/* Header */}
          <h3 className="text-center font-semibold text-2xl mb-8 text-gray-800 leading-tight">
            Create New Service
          </h3>

          {/* Form Row 1: Name and Icon Picker */}
          <div className="flex flex-col sm:flex-row gap-5 mb-5">
            {/* Service Name Input */}
            <div className="flex-1">
              <label className="sr-only">Service Name</label>
              <input
                  type="text"
                  placeholder="Service name (e.g., Free Wi-Fi)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputBaseStyles}
              />
            </div>

            {/* Icon Dropdown Container */}
            <div className="relative flex-1">
              <label className="sr-only">Select Icon</label>
              <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`${inputBaseStyles} flex items-center justify-between text-left`}
              >
              <span className={`flex items-center gap-3 truncate ${!icon ? 'text-gray-400' : ''}`}>
                {icon ? React.createElement(iconMap[icon], { size: 22, className: "text-blue-600 shrink-0" }) : "Select Icon"}
                <span className="truncate">{icon || ""}</span>
              </span>
                <BiChevronDown
                    size={24}
                    className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full max-h-[280px] overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    <div className="grid grid-cols-1 gap-1">
                      {Object.keys(iconMap).map((iconKey) => (
                          <button
                              key={iconKey}
                              type="button"
                              onClick={() => handleIconChange(iconKey)}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left transition-colors ${
                                  icon === iconKey
                                      ? "bg-blue-50 text-blue-700 font-medium"
                                      : "text-gray-700 hover:bg-gray-100"
                              }`}
                          >
                            {React.createElement(iconMap[iconKey], { size: 20, className: icon === iconKey ? "text-blue-600" : "text-gray-500" })}
                            <span className="truncate">{iconKey}</span>
                          </button>
                      ))}
                    </div>
                  </div>
              )}
            </div>
          </div>

          {/* Description Input */}
          <div className="mb-8">
            <label className="sr-only">Short Description</label>
            <input
                type="text"
                placeholder="Short Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputBaseStyles}
            />
          </div>


          {/* Submit Button: Changed from gray to a primary color, added shadow and active states */}
          <button
              onClick={handleClick}
              className="w-full bg-blue-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 transition-all active:scale-[0.98] shadow-sm"
          >
            Add Service
          </button>
        </div>
      </div>
  );
};

export default ModelCreateService;