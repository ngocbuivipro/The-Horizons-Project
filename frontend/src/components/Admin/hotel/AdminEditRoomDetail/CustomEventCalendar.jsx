const CustomEventCalendar = ({ event }) => {
    return (
        <div className="w-full h-full flex flex-col justify-center items-center bg-indigo-50 border-l-4 border-indigo-500 rounded px-1 py-0.5 shadow-sm">
            <span className="text-[10px] font-semibold text-gray-500">Price</span>
            <span className="text-xs font-bold text-indigo-700">
        {new Intl.NumberFormat('vi-VN').format(event.title)}
      </span>
        </div>
    );
};
