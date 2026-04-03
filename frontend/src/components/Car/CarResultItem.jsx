import { FaUser, FaSuitcase, FaCheck } from "react-icons/fa";

const CarResultItem = ({ data, isSelected, onSelect }) => {
    return (
        <div
            onClick={onSelect}
            className={`
                group relative bg-white rounded-xl border-2 transition-all cursor-pointer overflow-hidden
                ${isSelected
                ? 'border-blue-600 shadow-lg ring-1 ring-blue-600'
                : 'border-gray-100 hover:border-blue-400 shadow-sm'
            }
            `}
        >
            <div className="flex flex-col sm:flex-row items-center p-4 gap-6">

                {/* Image Section */}
                <div className="w-full sm:w-1/3 flex-shrink-0">
                    <img
                        src={data.image}
                        alt={data.name}
                        className="w-full h-32 object-contain mix-blend-multiply"
                    />
                </div>

                {/* Info Section */}
                <div className="flex-1 w-full">
                    <h3 className="text-xl font-bold text-gray-900">{data.name}</h3>

                    <div className="flex items-center gap-4 text-gray-500 text-sm mt-1 mb-3">
                        <div className="flex items-center gap-1">
                            <FaUser className="text-gray-400" />
                            <span>1-{data.maxPassengers}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <FaSuitcase className="text-gray-400" />
                            <span>{data.maxLuggage}</span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">{data.description}</p>
                </div>

                {/* Price Section */}
                <div className="w-full sm:w-auto text-right pl-4 border-l border-gray-100 min-w-[100px]">
                    <div className="text-2xl font-bold text-blue-600">
                        ${data.price}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                        ${data.perPerson} pp
                    </div>

                    <button className={`
                        w-full py-2 px-4 rounded-full text-sm font-bold transition-all
                        ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-700'}
                    `}>
                        {isSelected ? 'Selected' : 'Select'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CarResultItem;