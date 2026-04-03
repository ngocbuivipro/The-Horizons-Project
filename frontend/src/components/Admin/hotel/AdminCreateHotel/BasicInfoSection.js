import { Select, Rate } from "antd";
import { cities } from "../../../../common/common";
import { HOTEL_TYPES } from "../constants/constants.js";
import LocationPicker from "../../../Utils/Map/LocationPicker";

const BasicInfoSection = ({ formState, updateForm }) => {
    return (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 md:p-8">
            <div className="flex mb-6 items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h2 className="font-semibold text-gray-700 text-lg">Hotel Details</h2>
            </div>

            <div className="space-y-6">
                {/* Name */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Hotel Name</label>
                    <input
                        placeholder="e.g. Seaside Villa Retreat"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        value={formState.name}
                        onChange={(e) => updateForm("name", e.target.value)}
                    />
                </div>

                {/* Type & City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Accommodation Type</label>
                        <Select
                            size="large"
                            value={formState.type}
                            onChange={(val) => updateForm("type", val)}
                            className="w-full"
                            options={HOTEL_TYPES.map(t => ({ value: t, label: t }))}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">City</label>
                        <Select
                            size="large"
                            value={formState.city || undefined}
                            onChange={(val) => updateForm("city", val)}
                            className="w-full"
                            showSearch
                            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                            options={cities.map((c) => ({ value: c.name, label: c.name }))}
                        />
                    </div>
                </div>

                {/* Address & Map */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Detailed Address</label>
                            <input
                                placeholder="Street, District..."
                                value={formState.address}
                                onChange={(e) => updateForm("address", e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Base Price</label>
                            <input
                                type="number"
                                value={formState.cheapestPrice}
                                onChange={(e) => updateForm("cheapestPrice", e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Rating</label>
                            <div className="px-4 py-2 border rounded-xl">
                                <Rate value={formState.stars} onChange={(val) => updateForm("stars", val)} />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <LocationPicker
                            addressString={formState.city && formState.address ? `${formState.address}, ${formState.city}` : ""}
                            setCoordinates={(coords) => updateForm("coordinates", coords)}
                            initialCoordinates={formState.coordinates}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicInfoSection;