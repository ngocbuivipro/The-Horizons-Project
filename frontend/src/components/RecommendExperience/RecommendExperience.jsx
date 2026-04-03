import { useState, useEffect } from 'react';
import { IoIosArrowRoundForward } from "react-icons/io";
import Item from './Item.jsx';
import { useNavigate } from 'react-router';
import { Spin } from 'antd';
import {getRecommendedHotelsApi} from "../../api/client/api.js";

const RecommendExperience = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  const locations = [
    { label: "Hanoi", value: "Ha Noi" },
    { label: "Da Nang", value: "Da Nang" },
    { label: "Da Lat", value: "Da Lat" },
    { label: "Ho Chi Minh", value: "Ho Chi Minh" }
  ];

  const [activeLocation, setActiveLocation] = useState(locations[0].value);

  // --- FETCH DATA EFFECT ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getRecommendedHotelsApi(activeLocation);
        if (res && res.success) {
          setHotels(res.data);
        } else {
          setHotels([]);
        }
      } catch (error) {
        console.error("Error fetching recommended hotels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeLocation]);

  return (
      <div className='mx-auto w-full my-16'>
        <div className='w-full bg-[#F9FAFB] border border-gray-100 rounded-[40px] shadow-sm overflow-hidden'>
          <div className='w-11/12 md:w-10/12 py-12 mx-auto'>

            {/* Header Section */}
            <div className='flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8'>
              <div>
                <h2 className='font-bold text-3xl md:text-4xl text-gray-900 mb-3 tracking-tight'>
                  Recommended Experience
                </h2>
                <p className='text-gray-500 text-lg max-w-xl'>
                  Discover popular stays carefully selected by The Horizons for your journey across Vietnam.
                </p>
              </div>

              <div
                  onClick={() => navigate("/homes")}
                  className='hidden md:flex cursor-pointer py-2.5 px-6 border border-gray-200 bg-white rounded-full hover:bg-gray-50 hover:shadow-sm transition-all items-center gap-2 font-medium text-gray-700'
              >
                Find more <IoIosArrowRoundForward size={24}/>
              </div>
            </div>

            {/* Location Tabs */}
            <div className='flex flex-wrap gap-3 items-center mb-10'>
              {locations.map((loc, idx) => (
                  <button
                      key={idx}
                      onClick={() => setActiveLocation(loc.value)}
                      className={`
                        py-2.5 px-6 rounded-full text-sm font-semibold transition-all duration-300
                        ${activeLocation === loc.value
                          ? 'bg-[#134E4A] text-white shadow-md transform scale-105'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }
                      `}
                  >
                    {loc.label}
                  </button>
              ))}
            </div>

            {/* Hotel Grid */}
            <div className='min-h-[300px]'>
              {loading ? (
                  <div className="flex justify-center items-center h-80 bg-white rounded-2xl border border-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                  </div>
              ) : hotels.length > 0 ? (
                  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                    {hotels.map((hotel, index) => (
                        <div key={index} className="transition-all hover:-translate-y-1">
                          {/* We pass 'data' props correctly. Navigation is handled inside Item */}
                          <Item data={hotel} />
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p>No hotels found in {activeLocation}</p>
                  </div>
              )}
            </div>

            {/* Find More Button (Mobile Position) */}
            <div className='md:hidden w-full flex justify-center mt-10'>
              <div
                  onClick={() => navigate("/homes")}
                  className='cursor-pointer py-3 px-8 border border-gray-200 bg-white rounded-full hover:bg-gray-50 flex items-center gap-2 font-medium shadow-sm'
              >
                Find more <IoIosArrowRoundForward size={20}/>
              </div>
            </div>

          </div>
        </div>
      </div>
  );
}

export default RecommendExperience;