import { useState, useEffect } from 'react';
import { Image } from 'antd';
import { FaImages, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Gallery = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [previewOpen, setPreviewOpen] = useState(false);

    // State để xác định limit dựa trên màn hình
    const [limit, setLimit] = useState(5);

    // Xử lý Responsive: Mobile (dưới 768px) hiện 3, Desktop hiện 5
    useEffect(() => {
        const updateLimit = () => {
            // 768px là breakpoint 'md' của Tailwind
            const isMobile = window.innerWidth < 768;
            setLimit(isMobile ? 4 : 5);
        };

        // Chạy ngay khi mount
        updateLimit();

        // Lắng nghe sự kiện resize
        window.addEventListener('resize', updateLimit);

        // Cleanup function
        return () => window.removeEventListener('resize', updateLimit);
    }, []);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-[360px] md:h-[500px] rounded-3xl bg-gray-100 flex flex-col items-center justify-center text-gray-400 mb-8">
                <FaImages size={48} />
                <span className="text-sm mt-2">No images available</span>
            </div>
        );
    }

    const next = (e) => {
        e?.stopPropagation();
        setCurrentIndex(i => (i === images.length - 1 ? 0 : i + 1));
    };

    const prev = (e) => {
        e?.stopPropagation();
        setCurrentIndex(i => (i === 0 ? images.length - 1 : i - 1));
    };

    const handleThumbnailClick = (index, isOverlay) => {
        if (isOverlay) {
            setPreviewOpen(true);
        } else {
            setCurrentIndex(index);
        }
    };

    return (
        <div className="mb-10 select-none group">
            {/* Hidden Preview Logic (Ant Design) */}
            <div className="hidden">
                <Image.PreviewGroup
                    preview={{
                        visible: previewOpen,
                        current: currentIndex,
                        onVisibleChange: setPreviewOpen,
                        onChange: setCurrentIndex,
                    }}
                >
                    {images.map((img, i) => (
                        <Image key={i} src={img} />
                    ))}
                </Image.PreviewGroup>
            </div>

            {/* HERO IMAGE */}
            <div className="relative w-full h-[360px] md:h-[520px] rounded-3xl overflow-hidden bg-gray-100 shadow-md mb-4">
                <img
                    src={images[currentIndex]}
                    alt="gallery"
                    onClick={() => setPreviewOpen(true)}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-500"
                />

                {/* <button
                    onClick={() => setPreviewOpen(true)}
                    className="absolute top-5 right-5 z-20 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-xs font-bold flex items-center gap-2 hover:bg-white transition-all"
                >
                    <FaImages />
                    See All
                </button> */}

                {images.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute top-1/2 left-5 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition z-20"
                        >
                            <FaChevronLeft size={14} />
                        </button>
                        <button
                            onClick={next}
                            className="absolute top-1/2 right-5 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition z-20"
                        >
                            <FaChevronRight size={14} />
                        </button>
                    </>
                )}
            </div>

            {/* THUMBNAILS (Dynamic Limit) */}
            {images.length > 1 && (
                <div className="flex gap-3 overflow-hidden">
                    {/* Sử dụng biến 'limit' động thay vì hằng số */}
                    {images.slice(0, limit).map((img, idx) => {
                        const isLastItem = idx === limit - 1;
                        const hasMore = images.length > limit;

                        // Logic tính số lượng còn lại:
                        // Ví dụ: Có 5 ảnh, limit là 3.
                        // Hiển thị: [0], [1], [2 (+3)].
                        // (+3) ở đây nghĩa là tính cả ảnh đang bị đè và 2 ảnh ẩn.
                        const remainingCount = images.length - limit + 1;

                        return (
                            <div
                                key={idx}
                                onClick={() => handleThumbnailClick(idx, isLastItem && hasMore)}
                                className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all
                                    ${currentIndex === idx && !(isLastItem && hasMore)
                                    ? 'ring-2 ring-offset-2 ring-gray-100'
                                    : 'opacity-100 hover:opacity-90'
                                }`}
                            >
                                <img
                                    src={img}
                                    alt={`thumb-${idx}`}
                                    className="w-full h-full object-cover"
                                />

                                {isLastItem && hasMore && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="text-white font-bold text-lg md:text-2xl">
                                            +{remainingCount}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Gallery;