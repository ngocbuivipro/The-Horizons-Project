import React, {useState} from "react";
import iconMap from "../../../common/data/iconMap.js";

const PolicyItem = ({ item }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Threshold to determine if text is "long" (approx 3 lines)
    const isLongText = item?.name?.length > 150;

    return (
        <li className="flex items-start gap-3">
            {/* Icon */}
            {item.icon && (
                <div className="mt-0.5 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 shadow-sm">
                    {React.createElement(iconMap[item.icon], { size: 12 })}
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1">
                <p
                    className={`text-sm text-gray-600 leading-snug break-words transition-all duration-200 ${
                        isExpanded ? "" : "line-clamp-3"
                    }`}
                >
                    {item?.name}
                </p>

                {/* Show More Button (Only appears if text is long) */}
                {isLongText && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-xs font-bold text-indigo-600 mt-1 hover:underline focus:outline-none"
                    >
                        {isExpanded ? "Show less" : "Show more"}
                    </button>
                )}
            </div>
        </li>
    );
};

export default PolicyItem;