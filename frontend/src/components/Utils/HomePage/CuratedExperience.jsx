import { useState, useEffect, useRef } from 'react';

// Senior Engineer Note:
// Updated image links to stable high-res sources.
// Content refactored to focus on "storytelling" rather than "transactional" details.
const EXPERIENCE_ITEMS = [
    {
        id: 1,
        title: "The Lantern Soul",
        location: "Hoi An Ancient Town",
        description: "Walk through centuries of history illuminated by the silk lanterns of the old world.",
        // Stable Unsplash ID for Hoi An Lanterns
        image: "https://blisshoian.com/wp-content/uploads/2024/08/hoi-an-dep.webp?auto=format&fit=crop&q=80&w=1600",
        layout: "large-vertical", // Spans 2 rows, 2 cols
        tag: "Cultural Heritage"
    },
    {
        id: 2,
        title: "Taste of Saigon",
        location: "Ho Chi Minh City",
        description: "Navigate the vibrant chaotic energy of the south through its street culinary secrets.",
        // Stable Unsplash ID for Vietnam Street/Vespa
        image: "https://live.staticflickr.com/65535/47558805582_84b6ba8a77_h.jpg",
        layout: "standard",
    },
    {
        id: 3,
        title: "Hands of God",
        location: "Ba Na Hills",
        description: "A surreal walk amongst the clouds on the Golden Bridge.",
        // Stable Unsplash ID for Golden Bridge
        image: "https://thumbor.forbes.com/thumbor/trim/2x1:784x522/fit-in/711x473/smart/https://specials-images.forbesimg.com/imageserve/5e2cb634f133f400076aabb4/0x0.jpg?auto=format&fit=crop&q=80&w=800",
        layout: "standard",
    },
    {
        id: 4,
        title: "Mist of the Mountains",
        location: "Sapa Valley",
        description: "Trek through the emerald rice terraces and meet the guardians of the highlands.",
        // Stable Unsplash ID for Sapa/Rice fields
        image: "https://visa2asia.com/wp-content/uploads/2022/11/Sapa-wallpaper.jpg?auto=format&fit=crop&q=80&w=1600",
        layout: "wide", // Spans 2 cols
        linkIcon: true
    }
];

// Reusable Scroll Reveal Hook (kept internal for portability)
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

const CuratedExperiences = () => {
    const [headerRef, headerVisible] = useScrollReveal(0.1);

    return (
        <section className="w-full py-16 md:py-24">
            {/* Header */}
            <div
                ref={headerRef}
                className={`flex flex-col md:flex-row justify-between items-end mb-12 transition-all duration-1000 ease-out transform ${
                    headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
            >
                <div className="max-w-2xl">
                    <span className="text-xs font-bold tracking-[0.25em] text-[#D4A23A] uppercase block mb-3">
                        Authentic Vietnam
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif font-medium text-slate-900 leading-tight">
                        Curated <span className="italic text-slate-600">Experiences</span>
                    </h2>
                    <p className="mt-4 text-slate-500 font-light text-sm md:text-base max-w-lg">
                        We don't just take you places; we immerse you in the heartbeat of the destination.
                    </p>
                </div>

                {/* <button className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-xs font-bold uppercase tracking-wider hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300">
                    View All Collections
                    <span>&rarr;</span>
                </button> */}
            </div>

            {/* Masonry-style Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-5 h-auto md:h-[650px]">
                {EXPERIENCE_ITEMS.map((item, index) => (
                    <ExperienceCard key={item.id} item={item} index={index} />
                ))}
            </div>

            {/* Mobile View All Button */}
            <button className="md:hidden w-full mt-8 px-6 py-4 rounded-full border border-slate-200 text-xs font-bold uppercase tracking-wider hover:bg-slate-900 hover:text-white transition-all">
                View All Collections
            </button>
        </section>
    );
};

// Sub-component for individual card logic & animation
const ExperienceCard = ({ item, index }) => {
    const [ref, isVisible] = useScrollReveal(0.05);

    // Determine grid classes
    let gridClasses = "md:col-span-1";
    if (item.layout === 'large-vertical') gridClasses = "md:col-span-2 md:row-span-2";
    else if (item.layout === 'wide') gridClasses = "md:col-span-2 md:col-start-3 md:row-start-2";

    return (
        <div
            ref={ref}
            className={`relative group rounded-3xl overflow-hidden cursor-pointer ${gridClasses} transition-all duration-1000 ease-out transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
        >
            {/* Image Layer with slow zoom */}
            <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-110"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

            {/* Tag (if present) */}
            {item.tag && (
                <div className="absolute top-6 left-6">
                     <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        {item.tag}
                    </span>
                </div>
            )}

            {/* Content Layer */}
            <div className="absolute bottom-0 left-0 p-8 w-full transform transition-transform duration-500 group-hover:-translate-y-2">
                <div className="flex items-center gap-2 mb-2 opacity-80">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span className="text-gray-300 text-xs font-medium uppercase tracking-wider">{item.location}</span>
                </div>

                <h3 className="text-white font-serif font-bold text-2xl md:text-3xl mb-2 leading-tight">
                    {item.title}
                </h3>

                <p className="text-gray-300 text-sm font-light leading-relaxed line-clamp-2 opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transition-all duration-500 ease-in-out">
                    {item.description}
                </p>

                {/* Arrow indicator on hover */}
                <div className="mt-4 h-1 w-12 bg-[#D4A23A] transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            </div>

            {/* Decorative Corner Icon for the Wide Card */}
            {item.linkIcon && (
                <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:rotate-45">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                </div>
            )}
        </div>
    );
};

export default CuratedExperiences;