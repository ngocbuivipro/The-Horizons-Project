import { useState } from "react";
import { Image } from "antd"; // Import Ant Design Image component
import { MdApps } from "react-icons/md";

/**
 * ImageHotel Component
 * Displays a custom 5-image grid layout.
 * Clicking any image opens the standard Ant Design Image Previewer (Lightbox).
 */
const ImageHotel = ({ photos }) => {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) return null;

  // Handler to open the preview at a specific index
  const openGallery = (index) => {
    setCurrentIndex(index);
    setVisible(true);
  };

  const imgHoverClass = "w-full h-full object-cover transition-transform duration-700 hover:scale-105 cursor-pointer";

  return (
      <>
        <div className="relative w-full rounded-2xl overflow-hidden shadow-sm bg-gray-200 mb-8">

          {/* --- MOBILE VIEW (Single HomePage Image) --- */}
          <div className="block md:hidden h-[280px] w-full relative group">
            <img
                onClick={() => openGallery(0)}
                className="w-full h-full object-cover cursor-pointer active:opacity-90 transition"
                src={photos[0]}
                alt="Property Main"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <button
                onClick={(e) => { e.stopPropagation(); openGallery(0); }}
                className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 text-xs font-semibold text-gray-800"
            >
              <MdApps size={14} />
              <span>1/{photos.length}</span>
            </button>
          </div>

          {/* --- DESKTOP VIEW (1 Large + 4 Small) --- */}
          <div className="hidden md:grid h-[450px] grid-cols-4 grid-rows-2 gap-2">

            {/* Large Main Image */}
            <div className="col-span-2 row-span-2 relative overflow-hidden group" onClick={() => openGallery(0)}>
              <img src={photos[0]} alt="Main" className={imgHoverClass} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>

            {/* Middle Column */}
            <div className="col-span-1 row-span-2 grid grid-rows-2 gap-2">
              {[1, 2].map((idx) => (
                  <div key={idx} className="relative overflow-hidden group h-full" onClick={() => openGallery(idx)}>
                    {photos[idx] ? (
                        <>
                          <img src={photos[idx]} alt={`Detail ${idx}`} className={imgHoverClass} />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </>
                    ) : <div className="w-full h-full bg-gray-100" />}
                  </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="col-span-1 row-span-2 grid grid-rows-2 gap-2">
              <div className="relative overflow-hidden group h-full" onClick={() => openGallery(3)}>
                {photos[3] ? (
                    <>
                      <img src={photos[3]} alt="Detail 3" className={imgHoverClass} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </>
                ) : <div className="w-full h-full bg-gray-100" />}
              </div>

              <div className="relative overflow-hidden group h-full" onClick={() => openGallery(4)}>
                {photos[4] ? (
                    <>
                      <img src={photos[4]} alt="Detail 4" className={imgHoverClass} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </>
                ) : <div className="w-full h-full bg-gray-100" />}

                {/* Show All Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); openGallery(0); }}
                    className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-gray-100 hover:scale-105 hover:bg-white transition-all duration-200 group/btn"
                >
                  <MdApps size={16} className="text-gray-600 group-hover/btn:text-black" />
                  <span className="font-semibold text-sm text-gray-800">Show all photos</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'none' }}>
          <Image.PreviewGroup
              preview={{
                visible: visible,
                onVisibleChange: (vis) => setVisible(vis),
                current: currentIndex,
                onChange: (val) => setCurrentIndex(val),
              }}
          >
            {photos.map((photo, index) => (
                <Image key={index} src={photo} />
            ))}
          </Image.PreviewGroup>
        </div>
      </>
  );
};

export default ImageHotel;