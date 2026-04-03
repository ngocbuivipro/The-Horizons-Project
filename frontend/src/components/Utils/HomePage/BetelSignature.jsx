import { useState, useEffect, useRef } from 'react';

const SIGNATURE_ITEMS = [
    {
        id: 1,
        category: 'Authentic Experiences',
        title: "EXCLUSIVE EXPERIENCES",
        location: null,
        description: "Experience the soul of Vietnam through the lens of local culture. At The Horizons, we blend modern comfort with authentic hospitality to create a space where travelers can rest, reflect, and reconnect with meaningful experiences.",
        image: 'https://vietnam.travel/sites/default/files/inline-images/things%20to%20do%20in%20phong%20nha-4.jpg',
    },
    {
        id: 2,
        category: 'Seamless Travel',
        title: "EFFORTLESS EXPLORATION",
        location: null, // This card has "HOI AN" above the title
        description: "Designed for the modern traveler, The Horizons offers curated experiences that combine comfort, thoughtful design, and personalized local insights. Every detail is crafted to ensure your journey is seamless and memorable.",
        image: 'https://media.uniquetours.com/wp-content/uploads/2012/07/emeraude-cruise-halong-bay-vietnam-.jpeg',
    }
];

// Reusable Hook for Scroll Animation
const useScrollReveal = (threshold = 0.1) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold }
        );

        if (ref.current) observer.observe(ref.current);

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [threshold]);

    return [ref, isVisible];
};

const BetelSignature = () => {
    const [headerRef, headerVisible] = useScrollReveal(0.1);

    return (
        <section className="w-full py-16 px-4 md:px-8">
            {/* Header Section */}
            <div
                ref={headerRef}
                className={`flex justify-between items-end mb-12 transition-all duration-1000 ease-out transform ${
                    headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
            >
                <div className="max-w-2xl">
                    <span className="text-xs font-bold tracking-[0.25em] text-[#D4A23A] uppercase block mb-3">
                        Curated Excellence
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif font-medium text-slate-900 leading-tight">
                        Our <span className="italic text-slate-600">Signature Experiences</span>
                    </h2>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {SIGNATURE_ITEMS.map((item, index) => (
                    <SignatureCard key={item.id} item={item} index={index} />
                ))}
            </div>
        </section>
    );
};

const SignatureCard = ({ item, index }) => {
    const [ref, isVisible] = useScrollReveal(0.1);

    return (
        <div
            ref={ref}
            className={`group relative h-[500px] lg:h-[600px] w-full rounded-[32px] overflow-hidden cursor-pointer shadow-xl transition-all duration-1000 ease-out transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`}
            style={{ transitionDelay: `${index * 150}ms` }}
        >
            {/* Background Image with Zoom Effect */}
            <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-105"
            />

            {/* Gradient Overlay: Transparent top to dark bottom for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Top Left Glass Pill (Category) */}
            <div className="absolute top-6 left-6 z-20">
                <div className="bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full shadow-lg">
                    <span className="text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase text-white antialiased">
                        {item.category}
                    </span>
                </div>
            </div>

            {/* Bottom Content Area */}
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 z-20 flex flex-col items-start justify-end h-full">
                <div className="mt-auto transform transition-transform duration-500 group-hover:-translate-y-2">

                    {/* Optional Location Tag (seen in the second card of your image) */}
                    {item.location && (
                        <div className="mb-2">
                             <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/90">
                                 {item.location}
                             </span>
                            <div className="w-6 h-[1px] bg-white/50 mt-1"></div>
                        </div>
                    )}

                    {/* Main Title */}
                    <h3 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold font-serif text-white mb-4 leading-[1.1] tracking-wide shadow-black drop-shadow-md">
                        {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/80 text-sm md:text-[15px] font-light leading-relaxed max-w-lg line-clamp-4 antialiased">
                        {item.description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BetelSignature;