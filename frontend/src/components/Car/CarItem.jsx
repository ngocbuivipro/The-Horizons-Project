import { FaUser, FaSuitcase } from 'react-icons/fa';
import { MdRadioButtonUnchecked, MdCheckCircle } from 'react-icons/md';

const CarItem = ({ car, isSelected, onSelect }) => {
    return (
        <div
            onClick={() => onSelect(car.id)}
            className={`group relative bg-white rounded-2xl p-5 cursor-pointer transition-all duration-300 ease-in-out
                ${isSelected
                ? 'border-2 border-blue-600 shadow-lg shadow-blue-50'
                : 'border border-slate-200 hover:border-blue-300 hover:shadow-md'
            }`}
        >
            {/* Selection Indicator (Radio) */}
            <div className="absolute top-5 right-5 z-10">
                {isSelected ? (
                    <MdCheckCircle className="text-3xl text-blue-600 drop-shadow-sm transition-transform scale-110" />
                ) : (
                    <MdRadioButtonUnchecked className="text-3xl text-slate-300 group-hover:text-blue-400 transition-colors" />
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start">

                {/* 1. Car Image Section */}
                <div className="w-full sm:w-56 h-40 shrink-0 bg-slate-50 rounded-xl overflow-hidden relative self-center sm:self-start border border-slate-100">
                    {/* Type Badge */}
                    <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-10 shadow-sm">
                        {car.type}
                    </span>
                    <img
                        src={car.image}
                        alt={car.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>

                {/* 2. Details Section */}
                <div className="flex-1 flex flex-col justify-between h-full pt-1">
                    <div>
                        <div className="flex justify-between items-start pr-10">
                            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">
                                {car.name}
                            </h3>
                        </div>

                        {/* Specs Badges */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                <FaUser className="text-slate-400" />
                                <span>{car.capacity?.passengers} Passengers</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                <FaSuitcase className="text-slate-400" />
                                <span>{car.capacity?.luggage} Luggage</span>
                            </div>
                        </div>

                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                            {car.description}
                        </p>
                    </div>
                </div>

                {/* 3. Price Section */}
                <div className="w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end sm:pl-6 sm:border-l border-slate-100 mt-4 sm:mt-0 gap-1 min-w-[100px] self-stretch">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-0.5">Total</span>
                        <div className="text-3xl font-black text-slate-900 flex items-start leading-none">
                            {/*<span className="text-sm font-bold mt-1 mr-0.5 text-slate-500">{car.currency}</span>*/}
                            {/*<span className="text-sm font-bold mt-1 mr-0.5 text-slate-500">VND</span>*/}
                            {car.price}
                            <span className="text-sm font-bold mt-1 mr-0.5 text-slate-500">VND</span>

                        </div>
                    </div>

                    <div className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mt-1">
                       {car.ppPrice} VND / person
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CarItem;