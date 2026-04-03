import React, { useState, useEffect, useMemo } from "react";
import iconMap from "../../../common/data/iconMap.js";
import { RxCross1, RxMagnifyingGlass } from "react-icons/rx";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { editPolicyApi } from "../../../api/client/api.js";
import { Input, Select } from "antd";
import toast from "react-hot-toast";

const { Option } = Select;

const ModelUpdatePolicy = ({
                             data,
                             setShowModel,
                             typePolicyDefault,
                             policy,
                             setPolicy,
                           }) => {
  const [icon, setIcon] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [name, setName] = useState("");
  const [typePolicy, setTypePolicy] = useState("");

  // UI State for icon search (Visual enhancement only)
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (data) {
      setIcon(data?.icon);
      setName(data?.name);
      setTypePolicy(data?.type);
      setDropdownOpen(false);
    }
  }, [data]);

  // Filter icons for better UX
  const filteredIcons = useMemo(() => {
    const keys = Object.keys(iconMap);
    if (!searchTerm) return keys;
    return keys.filter((key) =>
        key.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleIconChange = (iconKey) => {
    setIcon(iconKey);
    setDropdownOpen(false);
  };

  const handleClick = async () => {
    if (!name) return toast.error("Name must not be empty");

    // Logic kept exactly as original
    const dataBody = { icon, typePolicy, ...(name !== data.name && { name }) };
    const res = await editPolicyApi(data._id, dataBody);

    if (res.success) {
      toast.success("Policy updated successfully!");
      setShowModel(false);
      const tmp = policy.map((i) => (i._id === res.data._id ? res.data : i));
      setPolicy(tmp);
    } else {
      toast.error(res.message);
      setShowModel(false);
    }
  };

  return (
      <div className="fixed inset-0 z-[90] flex justify-center items-center px-4">
        {/* Backdrop */}
        <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModel(false)}
        />

        {/* Modal Content */}
        <div className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 relative shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex justify-between items-center mb-6 shrink-0">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Edit Policy</h3>
              <p className="text-sm text-gray-500">Update property rule details</p>
            </div>
            <button
                onClick={() => setShowModel(false)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
            >
              <RxCross1 size={20} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-5">

            {/* 1. Name Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Policy Name</label>
              <Input
                  size="large"
                  placeholder="Policy name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl py-2.5 border-gray-300 hover:border-indigo-400 focus:border-indigo-500"
              />
            </div>

            {/* 2. Type Select */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Policy Category</label>
              <Select
                  size="large"
                  value={typePolicy}
                  onChange={(val) => setTypePolicy(val)}
                  className="w-full rounded-xl"
                  popupClassName="rounded-xl"
              >
                <Option disabled value="">Select type of policy</Option>
                {typePolicyDefault?.map((i, ind) => (
                    <Option key={ind} value={i}>{i}</Option>
                ))}
              </Select>
            </div>

            {/* 3. Icon Selector (Vibrant Grid) */}
            <div className="flex flex-col gap-2 relative">
              <label className="text-sm font-semibold text-gray-700 ml-1">Icon</label>

              <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`w-full px-4 py-3 border rounded-xl flex items-center justify-between transition-all duration-200 bg-white
                ${dropdownOpen
                      ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg"
                      : "border-gray-300 hover:border-indigo-400 hover:shadow-md"
                  }`}
              >
                <div className="flex items-center gap-3">
                  {icon ? (
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                        {React.createElement(iconMap[icon], { size: 20 })}
                      </div>
                  ) : (
                      <span className="text-gray-400">Select Icon</span>
                  )}
                  <span className={`text-base font-medium ${icon ? 'text-gray-800' : 'text-gray-400'}`}>
                  {icon || ""}
                </span>
                </div>
                {dropdownOpen ? <BiChevronUp size={24} className="text-indigo-500"/> : <BiChevronDown size={24} className="text-gray-400"/>}
              </button>

              {/* Icon Dropdown */}
              {dropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 z-20 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 animate-in fade-in slide-in-from-top-2">
                    {/* Search Bar */}
                    <div className="relative mb-3">
                      <RxMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          placeholder="Search icon..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          autoFocus
                      />
                    </div>

                    {/* Icons Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                      {filteredIcons.map((iconKey) => (
                          <button
                              key={iconKey}
                              onClick={() => handleIconChange(iconKey)}
                              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all
                        ${icon === iconKey
                                  ? "bg-indigo-600 text-white shadow-md scale-95"
                                  : "bg-white text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-105"
                              }`}
                              title={iconKey}
                          >
                            {React.createElement(iconMap[iconKey], { size: 22 })}
                          </button>
                      ))}
                    </div>
                  </div>
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-6 pt-4 border-t border-gray-100 shrink-0">
            <button
                onClick={handleClick}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-lg font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
            >
              Update Policy
            </button>
          </div>

        </div>
      </div>
  );
};

export default ModelUpdatePolicy;