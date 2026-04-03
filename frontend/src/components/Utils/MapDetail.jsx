import { useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    ZoomControl,
    Polyline
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import {
    FaExpand,
    FaCompress,
    FaLocationArrow,
    FaRoute
} from "react-icons/fa";
import { IoNavigate } from "react-icons/io5";
import toast from "react-hot-toast";

/* ================= MARKER ICON ================= */
const customIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

/* ================= OSRM ROUTING ================= */
const fetchRoute = async (from, to) => {
    const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${from.lng},${from.lat};${to.lng},${to.lat}` +
        `?overview=full&geometries=geojson`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.routes?.length) return null;

    return data.routes[0].geometry.coordinates.map(
        ([lng, lat]) => [lat, lng]
    );
};

/* ================= LOCATION BUTTON ================= */
const LocateButton = ({ onLocated }) => {
    const map = useMap();
    const [loading, setLoading] = useState(false);

    const locate = () => {
        setLoading(true);
        map.locate().on("locationfound", (e) => {
            setLoading(false);
            map.flyTo(e.latlng, 15);
            onLocated(e.latlng);

            L.circleMarker(e.latlng, {
                radius: 6,
                color: "#fff",
                fillColor: "#2563eb",
                fillOpacity: 1,
                weight: 2
            }).addTo(map);
        }).on("locationerror", () => {
            setLoading(false);
            toast.error("Cannot find your location");
        });
    };

    return (
        <button className="map-btn" onClick={locate} title="My location">
            {loading ? "⌛" : <FaLocationArrow size={14} />}
        </button>
    );
};

/* ================= MAIN ================= */
const MapDetail = ({ address, city, coordinates }) => {
    const lat = coordinates?.lat || 15.8801;
    const lng = coordinates?.lng || 108.338;

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [route, setRoute] = useState(null);
    const [routing, setRouting] = useState(false);

    /* ===== FULLSCREEN ===== */
    const toggleFullScreen = () => {
        const el = document.getElementById("map-wrapper");
        if (!document.fullscreenElement) {
            el.requestFullscreen();
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    /* ===== BUILD ROUTE ===== */
    const buildRoute = async () => {
        if (!userLocation) {
            toast.error("Please turn on your location first");
            return;
        }
        setRouting(true);
        const path = await fetchRoute(
            userLocation,
            { lat, lng }
        );
        setRoute(path);
        setRouting(false);
    };

    const googleMapsDirect =
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    return (
        <div
            id="map-wrapper"
            className={`relative z-0 w-full overflow-hidden shadow-lg bg-gray-100
            ${isFullScreen ? "fixed inset-0 z-[9999]" : "h-[450px] rounded-xl"}`}
        >
            <MapContainer
                center={[lat, lng]}
                zoom={16}
                scrollWheelZoom={false}
                zoomControl={false}
                attributionControl={false}
                style={{ height: "100%", width: "100%" }}
            >
                {/* ===== TILE ===== */}
                {!darkMode ? (
                    <TileLayer
                        url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                        subdomains={["mt0", "mt1", "mt2", "mt3"]}
                    />
                ) : (
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                )}

                <ZoomControl position="bottomright" />

                {/* ===== DESTINATION MARKER ===== */}
                <Marker position={[lat, lng]} icon={customIcon}>
                    <Popup>
                        <div className="text-sm min-w-[200px]">
                            <b>{address}</b>
                            <p className="text-xs text-gray-500 mb-2">{city}</p>
                            <a
                                href={googleMapsDirect}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded text-xs font-bold"
                            >
                                <IoNavigate size={14} /> Google Maps
                            </a>
                        </div>
                    </Popup>
                </Marker>

                {/* ===== ROUTE POLYLINE (REAL ROAD) ===== */}
                {route && (
                    <Polyline
                        positions={route}
                        pathOptions={{
                            color: "#2563eb",
                            weight: 5
                        }}
                    />
                )}

                {/* ===== CONTROLS ===== */}
                <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
                    <button className="map-btn" onClick={toggleFullScreen}>
                        {isFullScreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
                    </button>

                    <LocateButton onLocated={setUserLocation} />

                    <button
                        className="map-btn"
                        onClick={buildRoute}
                        title="Direction"
                    >
                        {routing ? "⌛" : <FaRoute size={14} />}
                    </button>

                    {/*<button*/}
                    {/*    className="map-btn"*/}
                    {/*    onClick={() => setDarkMode(!darkMode)}*/}
                    {/*    title="Dark mode"*/}
                    {/*>*/}
                    {/*    {darkMode ? <FaSun size={14} /> : <FaMoon size={14} />}*/}
                    {/*</button>*/}
                </div>
            </MapContainer>

            {/* ===== STYLE ===== */}
            <style>{`
                .map-btn {
                    background: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 6px rgba(0,0,0,.15);
                    cursor: pointer;
                }
                .map-btn:hover {
                    background: #f3f4f6;
                }
            `}</style>
        </div>
    );
};

export default MapDetail;
