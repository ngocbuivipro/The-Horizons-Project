import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import dayjs from "dayjs";

import GlobalResultList from "./GlobalResultList";
import Img1 from "../../../assets/anh_lua.webp";
import Img4 from "../../../assets/update_1.webp";
import Img5 from "../../../assets/img_1.webp";
import { searchAllServiceApi } from "../../../api/client/api.js";
import { getOptimizedVideoUrl } from "../../../utils/cloudinaryHelper";

const Hero = () => {
    const navigate = useNavigate();
    const [activeService, setActiveService] = useState('all');

    // --- SEARCH RESULT STATE ---
    const [searchResults, setSearchResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);

    // --- VIDEO URL SETUP ---
    const videoId = import.meta.env.VITE_HERO_VIDEO_ID;
    const heroVideoUrl = useMemo(() => getOptimizedVideoUrl(videoId), [videoId]);

    const [searchParams, setSearchParams] = useState({
        city: undefined,
        startDate: null,
        endDate: null,
        guests: 1,
    });

    // --- SEARCH HANDLER ---
    const handleSearch = async () => {
        if (activeService === 'all') {
            setLoading(true);
            setSearchResults(null);
            try {
                const res = await searchAllServiceApi({keyword: searchParams.city});
                const responseData = res?.data ? res.data : res;
                if (responseData?.success) {
                    setSearchResults({
                        hotels: responseData.results?.hotels || [],
                        tours: responseData.results?.tours || [],
                        buses: responseData.results?.buses || [],
                    });
                    setTimeout(() => {
                        document.getElementById('search-results-anchor')?.scrollIntoView({behavior: 'smooth'});
                    }, 100);
                }
            } catch (error) {
                console.error("Search error", error);
            } finally {
                setLoading(false);
            }
            return;
        }

        const query = new URLSearchParams();
        if (searchParams.city) {
            if (activeService === 'bus') query.append("cityFrom", searchParams.city);
            else query.append("city", searchParams.city);
        }
        if (searchParams.startDate) query.append("startDate", dayjs(searchParams.startDate).format('YYYY-MM-DD'));
        if (activeService !== 'bus' && searchParams.endDate) query.append("endDate", dayjs(searchParams.endDate).format('YYYY-MM-DD'));
        query.append("guests", searchParams.guests);

        if (activeService === 'hotel') navigate(`/hotels?${query.toString()}`);
        if (activeService === 'tour') navigate(`/tours?${query.toString()}`);
        if (activeService === 'bus') navigate(`/bus?${query.toString()}`);
    };

    return (
        <div className='w-11/12 mx-auto mb-20 relative font-sans'>
            {/* --- HERO TEXT SECTION --- */}
            <div className='w-full mx-auto pt-8 pb-7 lg:pb-13'>
                <div className='flex flex-col lg:flex-row gap-10 items-start justify-between'>

                    {/* Phần Text - GIỮ NGUYÊN */}
                    <div className="flex flex-col gap-6 lg:w-[40%] items-center lg:items-start text-center lg:text-left z-10">
                        <div className="flex flex-col items-center lg:items-start leading-none select-none">
                            <h4 className="font-serif font-bold text-[#165027] tracking-[0.15em] text-[42px] sm:text-[52px] md:text-[60px] lg:text-[68px] xl:text-[80px] transition-all duration-300">
                                THE HORIZONS
                            </h4>
                            <p className="font-serif font-bold text-[#D4A23A] tracking-[0.3em] lg:tracking-[0.35em] text-[12px] sm:text-[14px] md:text-[16px] lg:text-[22px] mt-1 lg:mt-3 transition-all duration-300">
                                VIETNAM TRAVEL
                            </p>
                        </div>
                        <p className="font-[400] text-[15px] lg:text-[17px] leading-[24px] lg:leading-[28px] text-[#6B7280]">
                            Your journey, full of experiences. Book hotels, cruises, and bus tickets all in one place.
                        </p>
                        <div
                            onClick={() => navigate("/homes")}
                            className="py-[13px] gap-[10px] font-[500] text-[16px] leading-[24px] w-fit text-white px-[25px] rounded-full flex items-center justify-center bg-[#4F46E5] cursor-pointer hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                        >
                            <CiSearch size={25} color="white"/>
                            Explore Now
                        </div>
                    </div>

                    {/* --- CẤU TRÚC ẢNH & VIDEO (FIXED LAYOUT) --- */}
                    {/* Desktop: Set cứng chiều cao lg:h-[600px] để khung hình vuông vức, ảnh không bị lệch.
                        Mobile: h-auto để co giãn tự nhiên.
                    */}
                    <div className='flex w-full lg:w-[62%] gap-4 flex-col lg:flex-row-reverse h-auto lg:h-[600px]'>

                        {/* 1. Ảnh lớn (Img1) - Bên Phải (Desktop) / Trên Cùng (Mobile) */}
                        <div className='w-full lg:w-[60%] h-[250px] sm:h-[350px] lg:h-full relative'>
                            {/* object-cover: Bắt buộc dùng để ảnh lấp đầy khung mà không méo.
                                Việc tăng chiều cao container lên 600px giúp hiển thị nhiều nội dung ảnh hơn. */}
                            <img
                                className='object-cover w-full h-full rounded-2xl shadow-md'
                                src={Img1}
                                alt="Main Hero"
                            />
                        </div>

                        {/* 2. Wrapper 2 Ảnh nhỏ - Bên Trái (Desktop) / Dưới Cùng (Mobile) */}
                        <div className='flex w-full lg:w-[40%] gap-4 flex-row lg:flex-col h-[140px] sm:h-[180px] lg:h-full'>

                            {/* Ảnh nhỏ 1 (Trên Desktop) */}
                            {/* lg:h-[calc(50%-8px)]: Chia đôi chiều cao, trừ đi 1/2 gap (gap-4 = 16px -> trừ 8px) */}
                            <div className="w-1/2 lg:w-full h-full lg:h-[calc(50%-8px)] relative">
                                <img
                                    className='object-cover w-full h-full rounded-2xl shadow-md'
                                    src={Img4}
                                    alt="Small decor"
                                />
                            </div>

                            {/* Video/Ảnh nhỏ 2 (Dưới Desktop) */}
                            <div className="relative w-1/2 lg:w-full h-full lg:h-[calc(50%-8px)] rounded-2xl shadow-md overflow-hidden">
                                <video
                                    className={`object-cover w-full h-full transition-opacity duration-700 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    src={heroVideoUrl}
                                    onLoadedData={() => setVideoLoaded(true)}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                                <img
                                    className={`object-cover w-full h-full absolute inset-0 z-10 transition-opacity duration-700 ${videoLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                                    src={Img5}
                                    alt="Video placeholder"
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* /!* TABS *!/*/}
            {/* <div className="flex justify-center lg:justify-start mb-4 lg:mb-0 lg:ml-8 relative z-10">*/}
            {/* <div*/}
            {/* className="bg-white inline-flex items-center gap-1 p-1.5 rounded-xl lg:rounded-b-none lg:rounded-t-2xl shadow-sm border border-gray-100 lg:border-b-0">*/}
            {/* {serviceTabs.map((tab) => (*/}
            {/* <button*/}
            {/* key={tab.id}*/}
            {/* onClick={() => {*/}
            {/* setActiveService(tab.id);*/}
            {/* setSearchResults(null); // Clear results when switching tabs*/}
            {/* }}*/}
            {/* className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeService === tab.id ? 'bg-[#4F46E5] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}*/}
            {/* >*/}
            {/* {tab.icon} {tab.label}*/}
            {/* </button>*/}
            {/* ))}*/}
            {/* </div>*/}
            {/* </div>*/}

            {/* /!* MAIN SEARCH CARD *!/*/}
            {/* <div*/}
            {/* className='relative bg-white rounded-[2rem] lg:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-100 p-4 lg:p-3 flex flex-col lg:flex-row items-stretch gap-3 lg:gap-3'>*/}

            {/* /!* Location Input *!/*/}
            {/* <div className={`flex-1 ${inputWrapperClass}`}>*/}
            {/* <div className={labelClass}><CiLocationOn className='text-[#4F46E5]' size={18}/> Location</div>*/}
            {/* <Select*/}
            {/* showSearch bordered={false} placeholder="Where are you going?"*/}
            {/* value={searchParams.city}*/}
            {/* onChange={(val) => setSearchParams(prev => ({...prev, city: val}))}*/}
            {/* options={cities.map(c => ({value: c.name, label: c.name}))}*/}
            {/* className="w-full !p-0 custom-select-hero text-base font-bold text-gray-800"*/}
            {/* size="large" suffixIcon={null}*/}
            {/* />*/}
            {/* </div>*/}

            {/* /!* Date Inputs *!/*/}
            {/* <div className={`flex-[0.8] ${inputWrapperClass}`}>*/}
            {/* <div className={labelClass}><CiCalendarDate className='text-[#4F46E5]'*/}
            {/* size={18}/> {activeService === 'bus' ? 'Departure' : 'Check in'}*/}
            {/* </div>*/}
            {/* <DatePicker bordered={false} format="DD/MM/YYYY" placeholder="Add date"*/}
            {/* className="w-full !p-0 text-base font-bold text-gray-800" suffixIcon={null}*/}
            {/* value={searchParams.startDate}*/}
            {/* onChange={(date) => setSearchParams(prev => ({...prev, startDate: date}))}*/}
            {/* disabledDate={(current) => current && current < dayjs().endOf('day')}/>*/}
            {/* </div>*/}

            {/* {activeService !== 'bus' && (*/}
            {/* <div className={`flex-[0.8] ${inputWrapperClass}`}>*/}
            {/* <div className={labelClass}><CiCalendarDate className='text-[#4F46E5]' size={18}/> Check out*/}
            {/* </div>*/}
            {/* <DatePicker bordered={false} format="DD/MM/YYYY" placeholder="Add date"*/}
            {/* className="w-full !p-0 text-base font-bold text-gray-800" suffixIcon={null}*/}
            {/* value={searchParams.endDate}*/}
            {/* onChange={(date) => setSearchParams(prev => ({...prev, endDate: date}))}*/}
            {/* disabledDate={disabledEndDate}/>*/}
            {/* </div>*/}
            {/* )}*/}

            {/* /!* Guests *!/*/}
            {/* <div className={`flex-[0.7] ${inputWrapperClass}`}>*/}
            {/* <div className={labelClass}><IoPersonOutline className='text-[#4F46E5]' size={18}/> Guests</div>*/}
            {/* <InputNumber min={1} max={20} bordered={false} value={searchParams.guests}*/}
            {/* onChange={(val) => setSearchParams(prev => ({...prev, guests: val}))}*/}
            {/* className="w-full !p-0 !text-gray-800 text-base font-bold" placeholder="1 Guest"*/}
            {/* controls={false}/>*/}
            {/* </div>*/}

            {/* /!* Search Button *!/*/}
            {/* <button onClick={handleSearch}*/}
            {/* className='absolute lg:static bottom-[-28px] left-1/2 -translate-x-1/2 lg:translate-x-0 w-16 h-16 bg-gradient-to-r from-[#4F46E5] to-[#4338ca] hover:to-[#3730a3] rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 active:scale-95 shrink-0 z-30'>*/}
            {/* {loading ? <Spin/> : <CiSearch size={32} strokeWidth={1.5}/>}*/}
            {/* </button>*/}
            {/* </div>*/}
            {/*</div>*/}


            {/* Only display when in ALL tab and has data or is loading */}
            <div id="search-results-anchor"></div>

            {/* Search Results */}
            {activeService === 'all' && (searchResults || loading) && (
                <div className="relative z-5 mt-8 transition-all duration-500 ease-in-out">
                    <div className="w-10/12 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent mb-1 opacity-50"></div>
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-md border border-white ring-1 ring-white/50 w-full max-w-10/12 mx-auto p-4 sm:p-6">
                        <GlobalResultList
                            data={searchResults}
                            loading={loading}
                            searchParams={searchParams}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default Hero;
