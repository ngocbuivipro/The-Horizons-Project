import {useEffect, useState} from "react";
import {Rate} from "antd";
import {FaRegBuilding, FaRegHeart, FaHeart, FaMapMarkerAlt} from "react-icons/fa"; // Thêm icon Map
import ImageHotel from "./ImageHotel.jsx";
import InfoHotel from "./InfoHotel.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import toast from "react-hot-toast";
import {addToWishlist, removeFromWishlist} from "../../../redux/actions/WishlistAction.js";
import {useApi} from "../../../contexts/ApiContext.jsx";
import Seo from "../../Utils/Seo.jsx";
import MapDetail from "../../Utils/MapDetail.jsx";

const HotelDetail = () => {
    const {slug} = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const api = useApi();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [click, setClick] = useState(false);
    const {wishlist} = useSelector((state) => state.WishlistReducer);
    const [openImageModal, setOpenImageModal] = useState(false);

    useEffect(() => {
        const fetchHotelDetail = async () => {
            try {
                setLoading(true);
                const res = await api.getHotelBySlug(slug);

                if (res.success) {
                    setData(res.data);
                } else {
                    toast.error("Could not load Hotel details");
                    navigate("/homes");
                }
            } catch (error) {
                console.error("Error fetching Hotel detail:", error);
                toast.error("Hotel not found or Server Error!");
                navigate("/homes");
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchHotelDetail();
        }
        window.scrollTo(0, 0);
    }, [slug, navigate]);

    useEffect(() => {
        if (data && wishlist && wishlist.find((i) => i._id === data._id)) {
            setClick(true);
        } else {
            setClick(false);
        }
    }, [data, wishlist]);

    const removeFromWishlistHandler = (hotelData) => {
        setClick(false);
        dispatch(removeFromWishlist(hotelData));
        toast.success("Removed from wishlist successfully");
    };

    const addToWishlistHandler = (hotelData) => {
        setClick(true);
        dispatch(addToWishlist(hotelData));
        toast.success("Added to wishlist");
    };

    const copyLinkToClipboard = () => {
        const currentUrl = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(currentUrl)
                .then(() => toast.success("Link copied!"))
                .catch(() => toast.error("Failed to copy"));
        } else {
            toast.error("Clipboard not supported (HTTPS required)");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-80 bg-white rounded-2xl border border-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
    );
    if (!data) return null;
    const seoDescription = `Book your stay at ${data.name}. Located in ${data.city}, offering best rates and ${data.type} services. Address: ${data.address}.`;

    return (
        <div className="w-10/12 md:max-w-9/12 mx-auto my-6 px-4 sm:px-6 lg:px-8 font-sans">
            <Seo
                title={data.name}
                description={data.description || seoDescription}
                image={data.photos?.[0]}
                url={window.location.href}
                type="product"
            />

            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
                    {data?.name}
                </h1>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2 mr-2">
                            <Rate
                                disabled
                                allowHalf
                                value={data?.stars || 0}
                                style={{fontSize: 14, color: "#f59e0b"}}
                            />
                            {data?.stars > 0 && <span className="font-bold text-gray-800">{data?.stars} Stars</span>}
                        </div>

                        <span className="text-gray-400 mx-1">•</span>
                        <span className="underline font-medium cursor-pointer">{data?.numberRating || 0} reviews</span>
                        <span className="text-gray-400 mx-1">•</span>
                        <span className="flex items-center gap-1">
                           <FaRegBuilding/> {data?.type || "Hotel"}
                        </span>
                        <span className="text-gray-400 mx-1">•</span>
                        <span
                            className="font-medium underline decoration-gray-300 cursor-pointer">{data?.address}, {data?.city}</span>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={copyLinkToClipboard}
                                className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 text-sm font-medium underline">
                            Share
                        </button>
                        {click ? (
                            <button onClick={() => removeFromWishlistHandler(data)}
                                    className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 text-sm font-medium underline text-rose-600">
                                <FaHeart/> Saved
                            </button>
                        ) : (
                            <button onClick={() => addToWishlistHandler(data)}
                                    className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 text-sm font-medium underline">
                                <FaRegHeart/> Save
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- HERO IMAGES --- */}
            <div className="rounded-2xl overflow-hidden">
                <ImageHotel
                    open={openImageModal}
                    setOpen={setOpenImageModal}
                    data={data}
                    photos={data?.photos}
                />
            </div>

            {/* --- MAIN INFO & BOOKING --- */}
            <InfoHotel data={data}/>

            {/* --- SECTION: MAP --- */}
            {/* <div className="mt-12 mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-500"/> Location
                </h2>
                <p className="text-gray-500 mb-4 text-sm">
                    {data.address}, {data.city}
                </p>

                <div className="sm:w-8/12 w-full">
                    <MapDetail
                        address={data.address}
                        city={data.city}
                        coordinates={data.coordinates}
                    />
                </div>
            </div> */}
        </div>
    );
};

export default HotelDetail;