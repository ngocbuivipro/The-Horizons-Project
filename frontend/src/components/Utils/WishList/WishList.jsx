import React, {useEffect} from 'react';
import { RxCross1 } from "react-icons/rx";
import { AiOutlineHeart } from 'react-icons/ai';
import { BsCartPlus } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromWishlist } from '../../../redux/actions/WishlistAction.js';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';

const WishList = ({ setOpenWishList }) => {
    const { wishlist } = useSelector((state) => state.WishlistReducer);


    const dispatch = useDispatch();
    const removeFromWishlistHandler = (data) => {
        // Logic preserved as requested
        dispatch(removeFromWishlist(data));
        toast.success("Removed from wishlist");
    };

    return (
        <div className="fixed inset-0 w-full h-screen z-50 bg-black/40 backdrop-blur-sm flex justify-end">
            {/* Sidebar Container - Responsive width (full on mobile, 400px on desktop) */}
            <div className="relative h-full w-full sm:w-[450px] bg-white shadow-2xl flex flex-col animate-slideIn">

                {/* Header Section - Sticky at top */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white z-10">
                    <div className="flex items-center gap-2 text-gray-800">
                        <AiOutlineHeart size={24} className="text-red-500" />
                        <h5 className="text-xl font-semibold">
                            Wishlist <span className="text-sm font-normal text-gray-500">({wishlist?.length || 0})</span>
                        </h5>
                    </div>
                    <button
                        onClick={() => setOpenWishList(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                        <RxCross1 size={22} className="text-gray-600" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {wishlist && wishlist.length === 0 ? (
                        // Empty State
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                            <div className="bg-gray-50 p-6 rounded-full mb-4">
                                <AiOutlineHeart size={40} className="text-gray-300" />
                            </div>
                            <h5 className="text-lg font-medium text-gray-700">Your list is empty</h5>
                            <p className="text-sm mt-1">Start saving your favorite stays!</p>
                        </div>
                    ) : (
                        // List Items
                        <div className="flex flex-col">
                            {wishlist && wishlist.map((i, index) => (
                                <CartSingle
                                    key={index}
                                    data={i}
                                    removeFromWishlistHandler={removeFromWishlistHandler}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CartSingle = ({ data, removeFromWishlistHandler }) => {
    const navigate = useNavigate();
    useEffect(() => {
        console.log("data: ",data)
    }, []);

    return (
        <div className="group relative flex gap-4 p-4 border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors duration-200">

            {/* Image Section */}
            <div
                className="w-28 h-28 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg bg-gray-100"
                onClick={() => navigate("/homes/" + data.slug)}
            >
                {/*<img*/}
                {/*    src={data?.photos[0] || []}*/}
                {/*    alt={data.name}*/}
                {/*    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"*/}
                {/*/>*/}
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col justify-between py-1">

                {/* Top: Title & Remove */}
                <div className="flex justify-between items-start gap-2">
                    <h3
                        className="text-base font-semibold text-gray-800 leading-tight line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => navigate("/homes/" + data.slug)} // Preserved logic but adjusted path to match other handlers
                    >
                        {data.name}
                    </h3>
                    <button
                        onClick={() => removeFromWishlistHandler(data)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-2 -mt-2"
                        title="Remove"
                    >
                        <RxCross1 size={18} />
                    </button>
                </div>

                {/* Bottom: Price & Action */}
                <div className="flex items-end justify-between mt-2">
                    <div className="flex flex-col">
                        <h4 className="text-lg font-bold text-gray-900">
                            {new Intl.NumberFormat("en-US").format(data.cheapestPrice)}
                            <span className="text-xs font-normal text-gray-500 ml-1">VND</span>
                        </h4>
                        <span className="text-xs text-gray-400">per night</span>
                    </div>

                    <button
                        onClick={() => navigate("/homes/" + data.slug)}
                        className="p-2 bg-white border border-gray-200 shadow-sm rounded-full text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all duration-200"
                        title="View Details"
                    >
                        <BsCartPlus size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WishList;