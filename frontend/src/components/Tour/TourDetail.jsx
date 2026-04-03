import  { useEffect, useState } from "react";
import { FaRegHeart } from "react-icons/fa6";
import { FaShare } from "react-icons/fa";
import InfoTour from "./InfoTour.jsx";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useApi } from "../../contexts/ApiContext.jsx";
import { getTourDetailApi } from "../../api/client/api.js";
import ImageHotel from "../Hotel/HotelDetail/ImageHotel.jsx";
import { StarFilled, EnvironmentOutlined } from "@ant-design/icons";

const TourDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const api = useApi();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openImageModal, setOpenImageModal] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await getTourDetailApi(slug);
                if (res.success) setData(res.data);
                else { toast.error("Tour not found"); navigate("/tours"); }
            } catch (error) {
                console.error(error);
                navigate("/tours");
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchDetail();
        window.scrollTo(0, 0);
    }, [slug, navigate]);

    if (loading) return (
        <div className="flex justify-center items-center h-80 bg-white rounded-2xl border border-gray-100">

            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>

        </div>
    );
    if (!data) return null; // Guard against rendering with no data, e.g., after an error before navigation

    return (
        <div className="w-full mx-auto  lg:px-8  font-sans text-slate-800">
            {/* TITLE HEADER */}
            <header className="mb-8">
                {/* 1. Title Section */}


                {/* 2. Meta & Actions Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">

                    {/* Left: Meta Info (Rating & Location) */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        {/* Rating Badge - Nổi bật hơn */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-100 text-rose-700 font-bold shadow-sm">
                            <StarFilled className="text-rose-500 text-xs mb-[1px]" />
                            <span>{data.rating || "New"}</span>
                        </div>

                        <span className="text-slate-300">|</span>

                        {/* Location Link */}
                        <span className="flex items-center gap-1.5 text-slate-600 group cursor-pointer hover:text-indigo-600 transition-colors">
                <EnvironmentOutlined className="text-slate-400 group-hover:text-indigo-500" />
                <span className="underline decoration-slate-300 underline-offset-4 group-hover:decoration-indigo-300 font-medium">
                    {data.city}, Vietnam
                </span>
            </span>
                    </div>

                    {/* Right: Action Buttons */}
                    {/* Mobile: Nút to dễ bấm. Desktop: Nút gọn gàng */}
                    <div className="flex items-center gap-3 mt-2 md:mt-0">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all shadow-sm active:scale-95">
                            <FaShare className="text-slate-500" />
                            Share
                        </button>

                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all shadow-sm active:scale-95">
                            <FaRegHeart className="text-rose-500" />
                            Save
                        </button>
                    </div>
                </div>
            </header>

            {/* --- HERO IMAGE GRID --- */}
            <div className="relative rounded-2xl overflow-hidden shadow-sm mb-10">
                <ImageHotel open={openImageModal} setOpen={setOpenImageModal} data={data} photos={data.images} />
            </div>

            {/* INFO & BOOKING LAYOUT */}
            <InfoTour data={data} />
        </div>
    );
};

export default TourDetail;