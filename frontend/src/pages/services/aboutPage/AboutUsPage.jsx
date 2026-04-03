import React, {useState, useEffect} from 'react';
import {toast} from 'react-hot-toast';
import CountUp from 'react-countup';
import {ICON_MAP} from "../../../common/data/iconList.jsx";
import {useApi} from '../../../contexts/ApiContext';
import Header from "../../../components/Utils/Header/Header.jsx";
import Footer from "../../../components/Hotel/Footer/Footer.jsx";

const DEFAULT_STATS = [
    {label: "Beautiful Destinations", value: "49+", icon: "map"},
    {label: "Booking Completed", value: "600+", icon: "check"},
    {label: "Client Globally", value: "100+", icon: "user"},
    {label: "Accommodations", value: "89+", icon: "briefcase"}
];

const TESTIMONIALS_DATA = [
    {
        name: "Andrew Fletcher",
        location: "Newyork, United States",
        title: "Great Hospitalization",
        text: "Betel Hospitality is the best. We had the time of our life on our trip to the Hoi An. The customer service was wonderful & the staff was very helpful.",
        avatar: "https://i.pravatar.cc/150?u=andrew",
        rating: 5.0
    },
    {
        name: "Bryan Bradfield",
        location: "Cape Town, South Africa",
        title: "Hidden Treasure",
        text: "I went on the Gone with the Wind tour, and it was my first multi-day bus tour. The experience was terrific, thanks to the friendly tour guides.",
        avatar: "https://i.pravatar.cc/150?u=bryan",
        rating: 5.0
    },
    {
        name: "Prajakta Sasane",
        location: "Paris, France",
        title: "Easy to Find your Leisuere Place",
        text: "Thanks for arranging a smooth travel experience for us. Our cab driver was polite, timely, and helpful. The team ensured making it a stress-free trip.",
        avatar: "https://i.pravatar.cc/150?u=prajakta",
        rating: 5.0
    }
];

const AboutUsPage = () => {
    const api = useApi();
    const [data, setData] = useState({
        title: "",
        content: "",
        photos: [],
        features: [],
        stats: [],
        highlights: []
    });
    const [loading, setLoading] = useState(true);

    // Helper to map Admin colors to Tailwind Classes
    const getHighlightStyles = (colorName) => {
        const styles = {
            red: {bg: "bg-red-100", text: "text-red-500"},
            green: {bg: "bg-green-100", text: "text-green-600"},
            blue: {bg: "bg-blue-100", text: "text-blue-500"},
            orange: {bg: "bg-orange-100", text: "text-orange-500"},
            purple: {bg: "bg-purple-100", text: "text-purple-500"},
            volt: {bg: "bg-[#D4E831]/30", text: "text-olive-600"},
            default: {bg: "bg-gray-100", text: "text-gray-600"}
        };
        return styles[colorName] || styles.default;
    };

    useEffect(() => {
        const fetchAboutContent = async () => {
            setLoading(true);
            try {
                const response = await api.getPageContent('about');
                if (response.success) {
                    setData(response.data);
                } else {
                    toast.error(response.message || "Could not load page content.");
                }
            } catch (error) {
                console.error(error);
                toast.error("Could not load content.");
            } finally {
                setLoading(false);
            }
        };
        fetchAboutContent();
    }, [api]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-80 bg-white rounded-2xl border border-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
        );
    }

    const sideImage = data.photos && data.photos.length > 0
        ? data.photos[0]
        : 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80';

    const displayStats = (data.stats && data.stats.length > 0) ? data.stats : DEFAULT_STATS;

    return (
        <>
            <Header/>
            <div className="min-h-screen font-sans text-gray-800 bg-white">

                {/* --- SECTION 1: ABOUT INTRODUCTION --- */}
                <div className="container mx-auto px-4 py-16 lg:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                        {/* Left: Image */}
                        <div className="relative">
                            <div className="absolute top-4 left-4 right-[-10px] bottom-[-10px] bg-[#D4E831] rounded-[2rem] -z-10 transform rotate-1"></div>
                            <div className="relative rounded-[2rem] overflow-hidden shadow-xl border-4 border-white">
                                <img
                                    src={sideImage}
                                    alt="About Us"
                                    className="w-full h-[400px] lg:h-[500px] object-cover object-center shadow-md"
                                />
                                <div className="absolute bottom-8 right-8 bg-white p-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce-slow">
                                    <div className="bg-green-100 p-2 rounded-full">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Today's Earnings</p>
                                        <p className="font-bold text-gray-900">$2500</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Content */}
                        <div>
                            <h4 className="text-red-500 font-bold tracking-wider uppercase mb-2 text-sm">
                                {data.title || "About Us"}
                            </h4>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                                All-in-one platform for unforgettable travel experiences!
                            </h2>

                            <div
                                className="text-gray-600 text-lg leading-relaxed mb-8"
                                dangerouslySetInnerHTML={{__html: data.content}}
                            />

                            {/* --- DYNAMIC HIGHLIGHTS --- */}
                            <div className="space-y-6">
                                {data.highlights && data.highlights.map((item, idx) => {
                                    const styles = getHighlightStyles(item.color);

                                    // FIX 1: Ensure we have a valid element before cloning
                                    const IconComponent = ICON_MAP[item.icon] || ICON_MAP['check'];

                                    if (!IconComponent) return null;

                                    return (
                                        <div key={idx} className="flex gap-4">

                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${styles.bg}`}>
                                                <div className={`w-6 h-6 ${styles.text}`}>
                                                    {React.cloneElement(IconComponent, {size: 24, className: "fill-current"})}
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <p className="text-gray-700 font-medium leading-relaxed">{item.text}</p>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>
                </div>

                {/* --- SECTION 2: DYNAMIC STATS (WITH COUNTER ANIMATION) --- */}
                <div className="relative py-12 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
                            {displayStats.map((stat, idx) => {
                                const numericValue = parseInt(stat.value) || 0;
                                const suffix = stat.value.replace(/[0-9]/g, '');

                                return (
                                    <div key={idx} className="flex flex-col items-center p-2">
                                        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tabular-nums">
                                            <CountUp
                                                end={numericValue}
                                                duration={2.5}
                                                separator=","
                                                enableScrollSpy={true}
                                                scrollSpyOnce={true}
                                            />
                                            {suffix}
                                        </h3>
                                        <p className="text-indigo-500 font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                            {stat.label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* --- SECTION 3: TESTIMONIALS --- */}
                <div className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What's Our <span className="text-red-500 border-b-4 border-red-500">User</span> Says</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">Betel Hospitality is a tour operator specializing in dream destinations, offers a variety of benefits for travelers.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {TESTIMONIALS_DATA.map((item, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full">
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-lg text-gray-900 mb-3">{item.title}</h4>
                                        <p className="text-gray-500 text-sm leading-relaxed italic mb-6">"{item.text}"</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={item.avatar}
                                                alt={item.name}
                                                className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                                                loading="lazy"
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 leading-none">{item.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">{item.location}</p>
                                            </div>
                                        </div>
                                        <span className="bg-yellow-400 text-xs font-bold px-2 py-1 rounded text-white">{item.rating}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- SECTION 4: WHY CHOOSE US --- */}
                <div className="py-20 bg-white">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16">Why Choose <span className="text-red-500">Us?</span></h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                            {data.features && data.features.length > 0 ? (
                                data.features.map((feature, idx) => {
                                    // FIX 2: Ensure FeatureIcon is defined
                                    const FeatureIcon = ICON_MAP[feature.icon] || ICON_MAP['mountain'];

                                    return (
                                        <div key={idx} className="flex flex-col items-center group">
                                            <div className="w-16 h-16 bg-amber-300 rounded-full flex items-center justify-center mb-6 text-white transition-all duration-300 group-hover:bg-red-500 group-hover:scale-110 shadow-lg">
                                                <div className="w-8 h-8 flex items-center justify-center">
                                                    {/* Conditional Rendering: Only clone if exists */}
                                                    {FeatureIcon ? React.cloneElement(FeatureIcon, {size: 32}) : null}
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                            {feature.description && (
                                                <p className="text-gray-500 text-sm max-w-xs">{feature.description}</p>
                                            )}
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="flex justify-center items-center h-80 bg-white w-full col-span-full">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
            <Footer/>
        </>
    );
};

export default AboutUsPage;