import React, { useState } from "react";
import iconMap from "../../common/data/iconMap";
import { MdOutlineDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { deleteServicesApi } from "../../api/client/api";
import toast from "react-hot-toast";
import ModelUpdateService from "../Hotel/ModelUpdateService/ModelUpdateService";
import { useMediaQuery } from "react-responsive";

const Item = ({
  isView,
  services,
  handleServiceChange,
  servicesDefault,
  service,
  setServicesDefault,
}) => {
  const [hover, setHover] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleDelete = async () => {
    const res = await deleteServicesApi(service._id);
    if (res.success) {
      toast.success(res.message);
      const tmp = servicesDefault.filter((i) => i._id !== service._id);
      setServicesDefault(tmp);
    } else {
      toast.error("Failed to delete service");
    }
  };

  const handleUpdate = () => {
    setShowEdit(true);
  };

  const renderIcons = () => (
    <div className="absolute top-1 right-1 flex items-center gap-2">
      <div
        onClick={handleUpdate}
        className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white cursor-pointer"
      >
        <MdOutlineEdit size={16} />
      </div>
      <div
        onClick={handleDelete}
        className="w-6 h-6 rounded-full bg-red-400 flex items-center justify-center text-white cursor-pointer"
      >
        <MdOutlineDeleteOutline size={16} />
      </div>
    </div>
  );

  return (
      <>
        {isView && services?.includes(service?._id) ? (
            <div
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className="relative w-full h-full"
            >
              <label
                  className={`cursor-pointer w-full h-full min-h-[5rem] border-2 p-3 flex rounded-xl gap-3 items-center transition-all duration-200 select-none
            ${
                      services?.includes(service?._id)
                          ? "border-emerald-500 bg-emerald-50/40 shadow-sm"
                          : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-gray-50"
                  }
          `}
              >
                <input
                    onChange={() => handleServiceChange(service?._id)}
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-all flex-shrink-0"
                    checked={services?.includes(service?._id)}
                />

                <span className={`text-2xl flex-shrink-0 ${services?.includes(service?._id) ? "text-emerald-600" : "text-gray-400"}`}>
            {iconMap[service?.icon]
                ? React.createElement(iconMap[service?.icon])
                : null}
          </span>

                <span className={`text-sm font-medium break-words line-clamp-2 leading-tight ${services?.includes(service?._id) ? "text-gray-900" : "text-gray-600"}`}>
            {service?.name}
          </span>
              </label>

              {/* Icons - Styled as floating bubbles */}
              {(isMobile || hover) && (
                  <div className="absolute -top-3 -right-2 flex items-center gap-2 animate-in fade-in zoom-in duration-200 z-10">
                    <div
                        onClick={handleUpdate}
                        className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-md hover:shadow-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <MdOutlineEdit size={16} />
                    </div>
                    <div
                        onClick={handleDelete}
                        className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-md hover:shadow-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <MdOutlineDeleteOutline size={18} />
                    </div>
                  </div>
              )}
            </div>
        ) : (
            <div
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className="relative w-full h-full"
            >
              <label
                  className={`cursor-pointer w-full h-full min-h-[5rem] border-2 p-3 flex rounded-xl gap-3 items-center transition-all duration-200 select-none
            ${
                      services?.includes(service?._id)
                          ? "border-emerald-500 bg-emerald-50/40 shadow-sm"
                          : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-gray-50"
                  }
          `}
              >
                <input
                    onChange={() => handleServiceChange(service?._id)}
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-all flex-shrink-0"
                    checked={services?.includes(service?._id)}
                />

                <span className={`text-2xl flex-shrink-0 ${services?.includes(service?._id) ? "text-emerald-600" : "text-gray-400"}`}>
            {iconMap[service?.icon]
                ? React.createElement(iconMap[service?.icon])
                : null}
          </span>

                <span className={`text-sm font-medium break-words line-clamp-2 leading-tight ${services?.includes(service?._id) ? "text-gray-900" : "text-gray-600"}`}>
            {service?.name}
          </span>
              </label>

              {/* Icons - Styled as floating bubbles */}
              {(isMobile || hover) && (
                  <div className="absolute -top-3 -right-2 flex items-center gap-2 animate-in fade-in zoom-in duration-200 z-10">
                    <div
                        onClick={handleUpdate}
                        className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-md hover:shadow-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <MdOutlineEdit size={16} />
                    </div>
                    <div
                        onClick={handleDelete}
                        className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-md hover:shadow-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <MdOutlineDeleteOutline size={18} />
                    </div>
                  </div>
              )}
            </div>
        )}

        {/* Edit Modal */}
        {showEdit && (
            <ModelUpdateService
                setServicesDefault={setServicesDefault}
                servicesDefault={servicesDefault}
                data={service}
                setShowModel={setShowEdit}
            />
        )}
      </>
  );
};

export default Item;
