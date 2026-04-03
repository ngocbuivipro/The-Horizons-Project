import {DatePicker, TimePicker, Select, AutoComplete, InputNumber} from "antd";
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaUser, FaArrowRight } from "react-icons/fa";

const CarSearchWidget = ({ params, setParams, onSearch, locationOptions = [] }) => {

    const cardClass = "bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-[72px] border border-slate-100 w-full";
    const labelClass = "text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 block";

    const antInputStyle = {
        width: '100%',
        padding: 0,
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        fontSize: '0.95rem',
        fontWeight: 700,
        color: '#0f172a'
    };

    // --- LOGIC LỌC DANH SÁCH (FILTERING) ---

    // 1. Danh sách cho ô Pick-up (From): Loại bỏ địa điểm đang được chọn ở ô Drop-off (To)
    const availableFromOptions = locationOptions.filter(option => option.value !== params.to);

    // 2. Danh sách cho ô Drop-off (To): Loại bỏ địa điểm đang được chọn ở ô Pick-up (From)
    const availableToOptions = locationOptions.filter(option => option.value !== params.from);


    return (
        <div className="w-full bg-white/60 backdrop-blur-xl shadow-2xl border  border-white/60 rounded-[2rem] p-4 lg:p-4  relative z-20">

            {/* Radio Trip Type */}
            {params.serviceType === 'transfers' && (
                <div className="mb-4 flex flex-wrap gap-6 text-sm font-bold text-slate-700 pl-2">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-sky-600 transition-colors">
                        <input
                            type="radio"
                            name="tripType"
                            checked={params.tripType === 'one_way'}
                            onChange={() => setParams({...params, tripType: 'one_way'})}
                            className="accent-sky-600 w-4 h-4 cursor-pointer"
                        />
                        One way
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:text-sky-600 transition-colors">
                        <input
                            type="radio"
                            name="tripType"
                            checked={params.tripType === 'return'}
                            onChange={() => setParams({...params, tripType: 'return'})}
                            className="accent-sky-600 w-4 h-4 cursor-pointer"
                        />
                        Return
                    </label>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-2 lg:gap-3 items-stretch lg:items-center">

                {/* 1. FROM INPUT */}
                <div className={`lg:flex-[1.5] ${cardClass}`}>
                    <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-sky-500 shrink-0">
                        <FaMapMarkerAlt className="text-sm"/>
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className={labelClass}>{params.serviceType === 'transfers' ? 'Pick-up' : 'Meeting point'}</span>
                        <AutoComplete
                            value={params.from}
                            onChange={(val) => setParams({...params, from: val})}

                            // 👇 SỬ DỤNG DANH SÁCH ĐÃ LỌC
                            options={availableFromOptions}

                            placeholder="Location"
                            style={antInputStyle}
                            variant="borderless"
                            // Filter khi người dùng gõ chữ tìm kiếm
                            filterOption={(inputValue, option) =>
                                option?.value?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                            }
                        />
                    </div>
                </div>

                {/* 2. TO INPUT / DURATION */}
                <div className={`lg:flex-[1.5] ${cardClass}`}>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        {params.serviceType === 'transfers' ? <FaMapMarkerAlt className="text-sm"/> : <FaClock className="text-sm"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className={labelClass}>
                            {params.serviceType === 'transfers' ? 'Drop-off' : 'Duration'}
                        </span>
                        {params.serviceType === 'transfers' ? (
                            <AutoComplete
                                value={params.to}
                                onChange={(val) => setParams({...params, to: val})}

                                // 👇 SỬ DỤNG DANH SÁCH ĐÃ LỌC
                                options={availableToOptions}

                                placeholder="Destination"
                                style={antInputStyle}
                                variant="borderless"
                                // Filter khi người dùng gõ chữ tìm kiếm
                                filterOption={(inputValue, option) =>
                                    option?.value?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                }
                            />
                        ) : (
                            <Select
                                value={params.duration}
                                onChange={(val) => setParams({...params, duration: val})}
                                options={[3, 4, 5, 8, 12].map(h => ({value: h, label: `${h} hours`}))}
                                style={antInputStyle}
                                variant="borderless"
                                suffixIcon={null}
                            />
                        )}
                    </div>
                </div>

                {/* 3. DATE */}
                <div className={`lg:flex-1 ${cardClass}`}>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <FaCalendarAlt className="text-sm"/>
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className={labelClass}>Date</span>
                        <DatePicker
                            value={params.date}
                            onChange={(date) => setParams({...params, date})}
                            format="MMM D"
                            allowClear={false}
                            suffixIcon={null}
                            style={antInputStyle}
                            variant="borderless"
                            placeholder="Date"
                        />
                    </div>
                </div>

                {/* 4. TIME */}
                <div className={`lg:flex-1 ${cardClass}`}>
                    <div className="flex-1 min-w-0 px-2">
                        <span className={labelClass}>Time</span>
                        <TimePicker
                            value={params.time}
                            onChange={(time) => setParams({...params, time})}
                            format="HH:mm"
                            minuteStep={15}
                            allowClear={false}
                            suffixIcon={null}
                            style={antInputStyle}
                            variant="borderless"
                            placeholder="00:00"
                        />
                    </div>
                </div>

                {/* 5. PASSENGERS */}
                <div className={`lg:flex-1 ${cardClass}`}>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <FaUser className="text-sm"/>
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className={labelClass}>Travelers</span>
                        <InputNumber
                            min={1}
                            max={50} // Giới hạn số lượng hợp lý
                            value={params.passengers}
                            onChange={(val) => setParams({...params, passengers: val})}
                            style={antInputStyle}
                            variant="borderless"
                            placeholder="1"
                            formatter={(value) => `${value}`}
                        />
                    </div>
                </div>
                {/* 6. BUTTON */}
                <button
                    onClick={onSearch}
                    className="h-[72px] w-[72px] bg-sky-500 hover:bg-sky-400 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/30 transition-all active:scale-95 shrink-0"
                >
                    <FaArrowRight className="text-xl" />
                </button>

            </div>
        </div>
    );
};

export default CarSearchWidget;