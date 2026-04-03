import { useEffect, useState, createElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Icons
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BsLightningFill } from "react-icons/bs";

import { addToWishlist, removeFromWishlist } from "../../../redux/actions/WishlistAction.js";
import iconMap from "../../../common/data/iconMap.js";

const Item = ({ i, viewMode = "grid" }) => {
    const { wishlist } = useSelector((state) => state.WishlistReducer);
    const [liked, setLiked] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isGrid = viewMode === "grid";

    useEffect(() => {
        if (wishlist && wishlist.find((data) => i?._id === data?._id)) {
            setLiked(true);
        } else {
            setLiked(false);
        }
    }, [wishlist, i?._id]);

    const toggleWishlist = (e) => {
        e.stopPropagation();
        if (liked) {
            dispatch(removeFromWishlist(i));
            toast.success("Removed from wishlist");
        } else {
            dispatch(addToWishlist(i));
            toast.success("Added to wishlist");
        }
        setLiked(!liked);
    };

    // 2. Rating Logic: Nếu rating = 0 thì hiển thị theo Stars
    const displayRating = i?.rating > 0  ? i.rating : 5;
    const reviewCount = i.numberRating > 0 ? `(${i.numberRating})` : `(5 Stars)`;

    return (
        <div
            onClick={() => navigate(`/homes/${i.slug}`)} // Dùng slug từ API
            className={`
                group bg-white border border-gray-100 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg
                ${isGrid ? 'flex flex-col h-full' : 'flex flex-col md:flex-row md:h-[220px]'}
            `}
        >
            {/* --- IMAGE SECTION --- */}
            <div className={`
                relative overflow-hidden shrink-0 bg-gray-200
                ${isGrid ? 'w-full aspect-[4/3]' : 'w-full md:w-[320px] h-60 md:h-full'}
            `}>
                <img
                    // Lấy ảnh đầu tiên trong mảng photos
                    src={i.photos && i.photos.length > 0 ? i.photos[0] : "https://via.placeholder.com/400x300?text=No+Image"}
                    alt={i.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Badge: Dùng i.type từ API */}
                <div className="absolute top-4 left-4 flex gap-2">
                     <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase rounded flex items-center gap-1 shadow-sm">
                        {i.type || "Hotel"}
                    </span>
                    {/* Nếu feature = true thì hiện Trending */}
                    {i.feature && (
                        <span className="px-2 py-1 bg-red-500/90 text-white text-[10px] font-bold uppercase rounded shadow-sm">
                            Trending
                        </span>
                    )}
                </div>

                <button
                    onClick={toggleWishlist}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-red-500 flex items-center justify-center text-white transition-all backdrop-blur-sm z-10"
                >
                    {liked ? <AiFillHeart size={16} className="text-white" /> : <AiOutlineHeart size={16} />}
                </button>
            </div>

            {/* --- CONTENT SECTION --- */}
            <div className={`flex flex-col flex-1 ${isGrid ? 'p-4' : 'p-5 flex-row gap-4'}`}>

                {/* MIDDLE INFO */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
                            {i.name}
                        </h3>

                        <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                            <FaMapMarkerAlt />
                            {/* Dùng city hoặc address */}
                            <span>{i.city || i.address}</span>
                        </div>

                        {!isGrid && (
                            <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                                {/* API không có desc, fallback bằng address hoặc text mẫu */}
                                {i.desc || `Located nicely in ${i.city}, ${i.address}. A perfect place for your vacation with ${i.stars} stars experience.`}
                            </p>
                        )}
                    </div>

                    {/* SERVICES ICONS */}
                    <div className="flex items-center gap-3 text-gray-400 text-sm mt-auto">
                        {i.services && i.services.slice(0, 4).map((service) => (
                            <div key={service._id} className="flex items-center justify-center w-6 h-6 bg-gray-50 rounded-full" title={service.name}>
                                {iconMap[service.icon]
                                    ? createElement(iconMap[service.icon], { size: 14 })
                                    : <BsLightningFill size={14} />}
                            </div>
                        ))}
                        {i.services && i.services.length > 4 && (
                            <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-medium">
                                +{i.services.length - 4}
                            </span>
                        )}
                    </div>
                </div>

                {!isGrid && <div className="w-[1px] bg-gray-100 my-2"></div>}

                {/* RIGHT INFO (Price & Rating) */}
                <div className={`
                    flex flex-col justify-between
                    ${isGrid ? 'mt-4 border-t border-gray-50 pt-3' : 'w-[180px] items-end text-right pl-2'}
                `}>
                    <div className={`flex items-center gap-2 ${isGrid ? 'justify-between' : 'flex-col items-end gap-1'}`}>

                        <div className="flex items-center gap-1 bg-yellow-400 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                            <FaStar size={10} />
                            <span>{displayRating}</span>
                            <span className="font-normal text-white/80">{reviewCount}</span>
                        </div>
                    </div>

                    <div className={`mt-2 ${isGrid ? 'flex justify-between items-end' : 'mt-auto'}`}>
                        {isGrid && <span className="text-xs text-gray-400">Start from</span>}
                        <div>
                            <span className="text-xl font-bold text-red-500">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(i.cheapestPrice)}
                             </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Item;