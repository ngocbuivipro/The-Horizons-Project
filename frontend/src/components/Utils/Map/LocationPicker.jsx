import { useState, useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { IoSearch, IoLocationSharp } from "react-icons/io5";
import { FaGoogle } from "react-icons/fa";
import { toast } from "react-hot-toast";

// --- Fix icon Leaflet ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- 1. Component Marker Kéo Thả ---
function DraggableMarker({ position, setPosition, setCoordinates }) {
    const markerRef = useRef(null);

    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const newPos = marker.getLatLng();
                const newCoords = { lat: newPos.lat, lng: newPos.lng };
                setPosition(newCoords);
                setCoordinates(newCoords);
            }
        },
    }), [setPosition, setCoordinates]);

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        >
            <Popup minWidth={90}>
                <span className="text-center block text-xs">
                    Vị trí hiện tại<br/>
                    {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                </span>
            </Popup>
        </Marker>
    );
}

// --- 2. Component Recenter Map ---
function RecenterMap({ position }) {
    const map = useMap();
    useEffect(() => {
        map.setView(position, 16); // Zoom level 16
    }, [position, map]);
    return null;
}

// --- 3. MAIN COMPONENT ---
const LocationPicker = ({ addressString, setCoordinates, initialCoordinates }) => {
    // Default Hanoi
    const defaultCoords = { lat: 21.028511, lng: 105.854444 };

    const [position, setPosition] = useState(initialCoordinates || defaultCoords);
    const [googleUrl, setGoogleUrl] = useState(""); // State lưu link Google Maps
    const [loading, setLoading] = useState(false);

    // Sync initialCoordinates khi edit
    useEffect(() => {
        if(initialCoordinates && initialCoordinates.lat) {
            setPosition(initialCoordinates);
        }
    }, [initialCoordinates]);

    // --- LOGIC 1: Tìm bằng Google Maps Link ---
    const handleExtractFromGoogle = () => {
        if (!googleUrl) return toast.error("Please paste a Google Maps link");

        // Regex tìm pattern @lat,lng (VD: @21.0285,105.8544)
        // Link browser thường dạng: https://www.google.com/maps/place/.../@21.028511,105.854444,17z...
        const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const match = googleUrl.match(regex);

        if (match && match.length >= 3) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);

            const newPos = { lat, lng };
            setPosition(newPos);
            setCoordinates(newPos);
            toast.success("Coordinates extracted from Google Maps!");
        } else {
            // Thử regex khác cho dạng ?q=lat,lng
            const regexQ = /q=(-?\d+\.\d+),(-?\d+\.\d+)/;
            const matchQ = googleUrl.match(regexQ);
            if (matchQ && matchQ.length >= 3) {
                const lat = parseFloat(matchQ[1]);
                const lng = parseFloat(matchQ[2]);
                const newPos = { lat, lng };
                setPosition(newPos);
                setCoordinates(newPos);
                toast.success("Coordinates extracted!");
            } else {
                toast.error("Could not find coordinates in URL. Please copy the URL from the browser address bar.");
            }
        }
    };

    // --- LOGIC 2: Tìm bằng OpenStreetMap (Nominatim) ---
    const handleAutoFind = async () => {
        if (!addressString || addressString.length < 3) return toast.error("Address is too short to search.");

        setLoading(true);
        try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1`);
            if (res.data && res.data.length > 0) {
                const { lat, lon } = res.data[0];
                const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
                setPosition(newPos);
                setCoordinates(newPos);
                toast.success("Location found by address!");
            } else {
                toast.error("Address not found. Try using Google Maps Link.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Search error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <IoLocationSharp className="text-red-500"/> Pin Location on Map
            </h3>

            {/* --- INPUT GROUP --- */}
            <div className="flex flex-col gap-3 mb-4">

                {/* Option 1: Google Maps URL */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaGoogle className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Paste Google Maps URL here (e.g. google.com/maps/@21.02...)"
                            className="pl-10 w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={googleUrl}
                            onChange={(e) => setGoogleUrl(e.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleExtractFromGoogle}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition whitespace-nowrap"
                    >
                        Extract Coords
                    </button>
                </div>

                {/* Option 2: Auto Find Button */}
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                        Or search using the address entered above:
                    </span>
                    <button
                        type="button"
                        onClick={handleAutoFind}
                        disabled={loading}
                        className="text-xs flex items-center gap-1 bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-700 font-medium transition"
                    >
                        {loading ? "Searching..." : <><IoSearch /> Auto-find by Address</>}
                    </button>
                </div>
            </div>

            {/* --- MAP DISPLAY --- */}
            <div className="h-[300px] w-full border border-gray-300 rounded-lg overflow-hidden relative z-0 shadow-inner">
                <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <DraggableMarker
                        position={position}
                        setPosition={setPosition}
                        setCoordinates={setCoordinates}
                    />
                    <RecenterMap position={position} />
                </MapContainer>

                {/* Lat/Lng Display Overlay */}
                <div className="absolute bottom-1 right-1 bg-white/90 px-2 py-1 text-[10px] rounded z-[1000] font-mono text-gray-600 pointer-events-none border border-gray-200">
                    Lat: {position.lat.toFixed(6)} | Lng: {position.lng.toFixed(6)}
                </div>
            </div>

            <p className="mt-2 text-xs text-gray-400 italic">
                * Drag the marker to adjust the exact position.
            </p>
        </div>
    );
};

export default LocationPicker;