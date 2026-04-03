// Tạo file hoặc viết ngay trong file hiện tại
import moment from "moment";
import { BiChevronLeft, BiChevronRight, BiCalendar } from "react-icons/bi";

const CustomToolbar = (toolbar) => {
    // Logic điều hướng của thư viện
    const goToBack = () => {
        toolbar.onNavigate("PREV");
    };

    const goToNext = () => {
        toolbar.onNavigate("NEXT");
    };

    const goToCurrent = () => {
        toolbar.onNavigate("TODAY");
    };

    const label = () => {
        const date = moment(toolbar.date);
        return (
            <span className="text-lg font-bold text-gray-700 capitalize flex items-center gap-2">
        {date.format("MMMM")} <span className="text-indigo-600 text-2xl">{date.format("YYYY")}</span>
      </span>
        );
    };

    return (
        <div className="flex items-center justify-between mb-4 px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <BiCalendar size={20} />
                </div>
                {label()}
            </div>

            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
                <button
                    onClick={goToBack}
                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 hover:text-indigo-600 transition-all"
                >
                    <BiChevronLeft size={20} />
                </button>
                <button
                    onClick={goToCurrent}
                    className="px-3 py-1 text-xs font-bold text-indigo-600 uppercase tracking-wide hover:bg-white hover:shadow-sm rounded-lg transition-all"
                >
                    Today
                </button>
                <button
                    onClick={goToNext}
                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 hover:text-indigo-600 transition-all"
                >
                    <BiChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default CustomToolbar;