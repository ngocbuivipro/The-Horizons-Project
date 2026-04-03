import React, { useState } from "react";
import iconMap from "../../../common/data/iconMap.js";
import { MdOutlineDeleteOutline, MdOutlineEdit } from "react-icons/md";
import toast from "react-hot-toast";
import ModelUpdatePolicy from "./ModelUpdatePolicy.jsx";
import { deletePolicyApi } from "../../../api/client/api.js";
import { useMediaQuery } from "react-responsive";

const Item = ({ typePolicyDefault, policy, setPolicy, policyChecked, data, handlePolicyChange }) => {
  const [hover, setHover] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleDelete = async () => {
    const res = await deletePolicyApi(data._id);
    if (res.success) {
      toast.success(res.message);
      const tmp = policy.filter((i) => i._id !== data._id);
      setPolicy(tmp);
    } else {
      toast.error("Failed to delete policy");
    }
  };

  const handleUpdate = () => {
    setShowEdit(true);
  };

  return (
      <>
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="relative w-full h-full"
        >
          <label
              className={`cursor-pointer w-full h-full min-h-[5rem] border-2 p-3 flex rounded-xl gap-3 items-center transition-all duration-200 select-none
            ${
                  policyChecked?.includes(data?._id)
                      ? "border-blue-500 bg-blue-50/40 shadow-sm"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
              }
          `}
          >
            <input
                onChange={() => handlePolicyChange(data?._id)}
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all flex-shrink-0"
                checked={policyChecked?.includes(data?._id)}
            />

            <span
                className={`text-2xl flex-shrink-0 ${
                    policyChecked?.includes(data?._id) ? "text-blue-600" : "text-gray-400"
                }`}
            >
            {iconMap[data?.icon]
                ? React.createElement(iconMap[data?.icon])
                : null}
          </span>

            <span
                className={`text-sm font-medium break-words line-clamp-2 leading-tight ${
                    policyChecked?.includes(data?._id)
                        ? "text-gray-900"
                        : "text-gray-600"
                }`}
            >
            {data?.name}
          </span>
          </label>

          {/* Edit/Delete buttons - Styled as Floating Bubbles */}
          {(isMobile || hover) && (
              <div className="absolute -top-3 -right-2 flex items-center gap-2 animate-in fade-in zoom-in duration-200 z-10">
                <div
                    onClick={handleUpdate}
                    className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-md hover:shadow-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-center cursor-pointer"
                    title="Edit policy"
                >
                  <MdOutlineEdit size={16} />
                </div>
                <div
                    onClick={handleDelete}
                    className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-md hover:shadow-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center cursor-pointer"
                    title="Delete policy"
                >
                  <MdOutlineDeleteOutline size={18} />
                </div>
              </div>
          )}
        </div>

        {/* Update policy modal */}
        {showEdit && (
            <ModelUpdatePolicy
                typePolicyDefault={typePolicyDefault}
                setPolicy={setPolicy}
                policy={policy}
                data={data}
                setShowModel={setShowEdit}
            />
        )}
      </>
  );
};

export default Item;
