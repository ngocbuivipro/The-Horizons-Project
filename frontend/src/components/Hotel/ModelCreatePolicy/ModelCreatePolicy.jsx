import React, { useState, useMemo } from "react";
import iconMap from "../../../common/data/iconMap.js";
import { RxCross1, RxMagnifyingGlass } from "react-icons/rx";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { createPolicyApi } from "../../../api/client/api.js";
import { Input, Select } from "antd";
import toast from "react-hot-toast";

const { Option } = Select;

const ModelCreatePolicy = ({
                             typePolicyDefault,
                             setTypePolicy,
                             typePolicy,
                             policyChecked,
                             setPolicyChecked,
                             policy,
                             setPolicy,
                             setShowModel,
                           }) => {
  const [icon, setIcon] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [name, setName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter icons based on search
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
    if (!name) return toast.error("Policy Name is required");
    if (!typePolicy) return toast.error("Please select a policy type");
    if (!icon) return toast.error("Please select an icon");

    const res = await createPolicyApi({ name, type: typePolicy, icon });

    if (res.success) {
      toast.success("Policy created successfully!");

      // Update the main policy list in the parent component
      if (setPolicy && policy) {
        setPolicy([...policy, res.data]);
      }

      // Also check the newly created policy
      if (setPolicyChecked && policyChecked) {
        setPolicyChecked([...policyChecked, res.data._id]);
      }

      // Reset Form
      setName("");
      setIcon(null);

      // Close Modal - This triggers the parent's useEffect to re-fetch the policy list
      setShowModel(false);
    } else {
      toast.error(res.message || "Failed to create policy");
    }
  };

  return (
      <div className="fixed inset-0 z-50 flex justify-center items-center px-4">
        {/* Backdrop */}
        <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModel(false)}
        />

        {/* Modal Content */}
        <div className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 relative shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Create Policy</h3>
              <p className="text-sm text-gray-500">Add a new rule for your property</p>
            </div>
            <button
                onClick={() => setShowModel(false)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
            >
              <RxCross1 size={20} />
            </button>
          </div>

          <div className="space-y-5">
            {/* 1. Name Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Policy Name</label>
              <Input
                  size="large"
                  placeholder="e.g. No Smoking"
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
                  value={typePolicy || undefined}
                  onChange={(val) => setTypePolicy(val)}
                  placeholder="Select Category"
                  className="w-full rounded-xl"
                  popupClassName="rounded-xl"
              >
                {typePolicyDefault?.map((type, idx) => (
                    <Option key={idx} value={type}>
                      {type}
                    </Option>
                ))}
              </Select>
            </div>

            {/* 3. Icon Select (Custom Grid) */}
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
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <RxMagnifyingGlass size={18} />
                      </div>
                  )}
                  <span className={`text-base font-medium ${icon ? 'text-gray-800' : 'text-gray-400'}`}>
                  {icon || "Select an icon"}
                </span>
                </div>
                {dropdownOpen ? <BiChevronUp size={24} className="text-indigo-500"/> : <BiChevronDown size={24} className="text-gray-400"/>}
              </button>

              {/* Icon Dropdown Panel */}
              {dropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 z-20 bg-white border border-gray-200 rounded-2xl shadow-xl p-3">
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
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                      {filteredIcons.length > 0 ? (
                          filteredIcons.map((iconKey) => (
                              <button
                                  key={iconKey}
                                  onClick={() => handleIconChange(iconKey)}
                                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all
                          ${icon === iconKey
                                      ? "bg-indigo-600 text-white shadow-md scale-95"
                                      : "bg-white text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-105"
                                  }`}
                              >
                                {React.createElement(iconMap[iconKey], { size: 22 })}
                              </button>
                          ))
                      ) : (
                          <div className="col-span-full text-center py-4 text-gray-400 text-sm">
                            No icons found
                          </div>
                      )}
                    </div>
                  </div>
              )}
            </div>

            {/* Submit Button */}
            <button
                onClick={handleClick}
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-lg font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
            >
              Create Policy
            </button>
          </div>
        </div>
      </div>
  );
};

export default ModelCreatePolicy;