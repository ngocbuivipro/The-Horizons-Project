import React, { useState } from "react";
import iconMap from "../../common/data/iconMap";
import { Tooltip } from "antd";
import { MdOutlineDeleteOutline, MdOutlineEdit } from "react-icons/md";
import {
  deleteFacilitiesApi,
} from "../../api/client/api";
import toast from "react-hot-toast";
import ModelUpdateFacility from "../Hotel/ModelUpdateFacility/ModelUpdateFacility";

const Item = ({
  isView,
  setFacilitiesDefault,
  facilitiesDefault,
  data,
  handleFaChange,
  facilities,
}) => {  
  const [hover, setHover] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const handleDelete = async (event) => {
    const res = await deleteFacilitiesApi(data._id);
    if (res.success) {
      toast.success(res.message);
      const tmp = facilitiesDefault.filter((i) => {
        if (i._id !== data._id) return i;
      });

      setFacilitiesDefault(tmp);
    } else {
      toast.error(res.message);
    }
  };

  const handleUpdate = (event) => {
    setShowEdit(true);
  };

  return (
      <>
        {isView === true ? (
            <>
              {facilities?.includes(data?._id) && (
                  <>
                    <div
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        className="relative w-full h-full"
                    >
                      <label
                          className={`cursor-pointer w-full h-full min-h-[5rem] border-2 p-3 flex rounded-xl gap-3 items-center transition-all duration-200 select-none
                  ${
                              facilities?.includes(data?._id)
                                  ? "border-indigo-500 bg-indigo-50/40 shadow-sm"
                                  : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50"
                          }
                `}
                      >
                        <input
                            onChange={() => handleFaChange(data._id)}
                            type="checkbox"
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all flex-shrink-0"
                            checked={facilities?.includes(data._id)}
                        />

                        <span
                            className={`text-2xl flex-shrink-0 ${
                                facilities?.includes(data?._id)
                                    ? "text-indigo-600"
                                    : "text-gray-400"
                            }`}
                        >
                  {iconMap[data?.icon]
                      ? React.createElement(iconMap[data?.icon])
                      : null}
                </span>

                        <span
                            className={`text-sm font-medium break-words line-clamp-2 leading-tight ${
                                facilities?.includes(data?._id)
                                    ? "text-gray-900"
                                    : "text-gray-600"
                            }`}
                        >
                  {data?.name}
                </span>
                      </label>

                      {hover && (
                          <div className="absolute -top-3 -right-2 flex items-center gap-2 animate-in fade-in zoom-in duration-200 z-10">
                            <Tooltip title="Edit facility">
                              <div className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-md hover:shadow-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-center cursor-pointer">
                                <MdOutlineEdit onClick={handleUpdate} size={16} />
                              </div>
                            </Tooltip>
                            <Tooltip title="Delete facility">
                              <div className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-md hover:shadow-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center cursor-pointer">
                                <MdOutlineDeleteOutline
                                    onClick={handleDelete}
                                    size={18}
                                />
                              </div>
                            </Tooltip>
                          </div>
                      )}
                    </div>

                    {showEdit && (
                        <>
                          <ModelUpdateFacility
                              data={data}
                              facilitiesDefault={facilitiesDefault}
                              setFacilitiesDefault={setFacilitiesDefault}
                              setShowModel={setShowEdit}
                          />
                        </>
                    )}
                  </>
              )}
            </>
        ) : (
            <>
              {" "}
              <div
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                  className="relative w-full h-full"
              >
                <label
                    className={`cursor-pointer w-full h-full min-h-[5rem] border-2 p-3 flex rounded-xl gap-3 items-center transition-all duration-200 select-none
              ${
                        facilities?.includes(data?._id)
                            ? "border-indigo-500 bg-indigo-50/40 shadow-sm"
                            : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50"
                    }
            `}
                >
                  <input
                      onChange={() => handleFaChange(data._id)}
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all flex-shrink-0"
                      checked={facilities?.includes(data._id)}
                  />

                  <span
                      className={`text-2xl flex-shrink-0 ${
                          facilities?.includes(data?._id)
                              ? "text-indigo-600"
                              : "text-gray-400"
                      }`}
                  >
              {iconMap[data?.icon]
                  ? React.createElement(iconMap[data?.icon])
                  : null}
            </span>

                  <span
                      className={`text-sm font-medium break-words line-clamp-2 leading-tight ${
                          facilities?.includes(data?._id)
                              ? "text-gray-900"
                              : "text-gray-600"
                      }`}
                  >
              {data?.name}
            </span>
                </label>

                {hover && (
                    <div className="absolute -top-3 -right-2 flex items-center gap-2 animate-in fade-in zoom-in duration-200 z-10">
                      <Tooltip title="Edit facility">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-md hover:shadow-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-center cursor-pointer">
                          <MdOutlineEdit onClick={handleUpdate} size={16} />
                        </div>
                      </Tooltip>
                      <Tooltip title="Delete facility">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-md hover:shadow-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center cursor-pointer">
                          <MdOutlineDeleteOutline onClick={handleDelete} size={18} />
                        </div>
                      </Tooltip>
                    </div>
                )}
              </div>
              {showEdit && (
                  <>
                    <ModelUpdateFacility
                        data={data}
                        facilitiesDefault={facilitiesDefault}
                        setFacilitiesDefault={setFacilitiesDefault}
                        setShowModel={setShowEdit}
                    />
                  </>
              )}
            </>
        )}
      </>
  );
};

export default Item;
