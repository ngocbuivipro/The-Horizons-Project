import React, { useEffect, useState } from 'react'
import { LuMapPin } from "react-icons/lu";
import { FaStar } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa6";
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../redux/actions/WishlistAction';
import { useNavigate } from "react-router";

const Item = ({ data }) => {
    const { wishlist } = useSelector((state) => state.WishlistReducer);
    const [click, setClick] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (wishlist && wishlist.find((i) => i?._id === data?._id)) {
            setClick(true);
        } else {
            setClick(false);
        }
    }, [wishlist, data]);

    const removeFromWishlistHandler = (e, data) => {
        e.stopPropagation(); // Prevents clicking heart from navigating
        setClick(false);
        dispatch(removeFromWishlist(data));
    };

    const addToWishlistHandler = (e, data) => {
        e.stopPropagation(); // Prevents clicking heart from navigating
        setClick(true);
        // FIX: Changed from removeFromWishlist to addToWishlist
        dispatch(addToWishlist(data));
    };

    // Navigation Handler
    const handleNavigate = () => {
        navigate(`/homes/${data.slug}`);
    };

    return (
        <div className='h-[396px] rounded-[24px] border-[1px] border-[#F3F4F6] overflow-hidden group hover:shadow-md transition-all duration-300 bg-white'>

            {/* IMAGE SECTION */}
            <div className='w-full h-[219px] relative cursor-pointer' onClick={handleNavigate}>

                {/* Wishlist Button */}
                { !click ? (
                    <div
                        onClick={(e) => addToWishlistHandler(e, data)}
                        className='absolute top-[10px] right-[10px] rounded-[30px] bg-[#00000059] flex items-center justify-center p-2 cursor-pointer hover:bg-black/70 transition-colors z-10'
                    >
                        <FaRegHeart color='white' title="Add to wishlist" className='w-[20px] h-[20px]' />
                    </div>
                ) : (
                    <div
                        onClick={(e) => removeFromWishlistHandler(e, data)}
                        className='absolute top-[10px] right-[10px] rounded-[30px] bg-pink-500 flex items-center justify-center p-2 cursor-pointer hover:bg-pink-600 transition-colors z-10'
                    >
                        <FaRegHeart color='white' title="Remove from wishlist" className='w-[20px] h-[20px]' />
                    </div>
                )}

                <img
                    className='w-full h-full object-cover rounded-t-[24px]'
                    src={`${data?.photos?.[0]}`}
                    alt={data?.name}
                />
            </div>

            {/* CONTENT SECTION */}
            <div onClick={handleNavigate} className='w-full p-[16px] bg-white cursor-pointer'>
                <div className='flex flex-col gap-[10px] mb-[10px]'>
                    <h4 className='text-[18px] font-[500] leading-[28px] min-h-16 flex shrink-0 line-clamp-2 text-gray-800 group-hover:text-[#134E4A] transition-colors'>
                        {data?.name}
                    </h4>
                    <div className='flex items-center min-h-6 text-[#6B7280]'>
                        <LuMapPin size={20} className="pr-1 flex-shrink-0" color='#6B7280'/>
                        <span className='text-[14px] font-[400] leading-[20px] truncate'>
                            {data?.address} - {data?.city}
                        </span>
                    </div>
                </div>

                {/* Line */}
                <div className='w-full h-[1px] bg-[#F3F4F6] my-3'></div>

                <div className='w-full'>
                    <div className='flex justify-between items-center'>
                        <p className='text-[16px] font-[600] text-black'>
                            {new Intl.NumberFormat("en-US").format(data?.cheapestPrice)}
                            <span className='text-[#6B7280] font-normal text-sm ml-1'>VND/night</span>
                        </p>
                        <div className='flex items-center text-sm font-medium text-gray-700'>
                            <FaStar size={18} className="pr-1 pb-0.5" color='#DC2626'/>
                            {data?.rating || 0} ({data?.numberRating || 0})
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Item;