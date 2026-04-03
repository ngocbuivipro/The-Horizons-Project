import React from 'react';
import { useNavigate } from "react-router-dom";

// Senior Engineer Note:
// Mocking the specific assets for the car section.
// Ideally, these images come from a CDN or a specific 'Transport' media collection in the DB.
const MOCK_IMAGES = {
    carExterior: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2670&auto=format&fit=crop', // Blue coupe/sedan
    carInterior: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=2670&auto=format&fit=crop', // Luxury interior
};

const JourneyComfort = () => {
    const navigate = useNavigate();

    return (
        <section className="w-full py-16">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

                {/* Left Side: Text & Service Cards */}
                <div className="w-full lg:w-5/12 space-y-8">
                    <div>
                        <span className="text-xs font-bold tracking-[0.2em] text-[#D4A23A] uppercase">
                            Seamless Transfers
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif font-medium text-slate-900 mt-3 leading-tight">
                            Journey in <br/>
                            <span className="italic text-slate-600">Absolute</span> Comfort
                        </h2>
                        <p className="mt-6 text-slate-500 leading-relaxed font-light">
                            From private luxury sedans to premium sleeper buses, our fleet ensures your journey between destinations is as memorable as the destination itself.
                        </p>
                    </div>

                    {/* Small Service Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Card 1 */}
                        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-slate-50 hover:border-slate-200 transition-colors">
                            <div className="mb-4 text-slate-900">
                                {/* Simple car icon representation */}
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M2 12h12"/></svg>
                            </div>
                            <h4 className="font-bold text-slate-900 mb-1">Private Chauffeur</h4>
                            <p className="text-xs text-slate-500 mb-4 line-clamp-2">Luxury sedans & SUVs for personal inter-city transfers.</p>
                            <button
                                onClick={() => navigate('/car-transfer')}
                                className="text-xs font-bold underline decoration-slate-300 underline-offset-4 hover:text-[#4F46E5] hover:decoration-[#4F46E5] transition-all"
                            >
                                Book a Car
                            </button>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-slate-50 hover:border-slate-200 transition-colors">
                            <div className="mb-4 text-slate-900">
                                {/* Bus icon representation */}
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>
                            </div>
                            <h4 className="font-bold text-slate-900 mb-1">Premium Limousine</h4>
                            <p className="text-xs text-slate-500 mb-4 line-clamp-2">Spacious sleeper cabins for comfortable long-distance travel.</p>
                            <button
                                onClick={() => navigate('/bus')}
                                className="text-xs font-bold underline decoration-slate-300 underline-offset-4 hover:text-[#4F46E5] hover:decoration-[#4F46E5] transition-all"
                            >
                                Find Routes
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Imagery (Asymmetric Layout) */}
                <div className="w-full lg:w-7/12 relative h-[400px] md:h-[500px]">
                    {/* Main Image (Car Exterior) */}
                    <div className="absolute top-0 right-0 w-[90%] h-[80%] rounded-tr-[40px] rounded-bl-[40px] overflow-hidden shadow-2xl">
                        <img
                            src={MOCK_IMAGES.carExterior}
                            alt="Luxury Car Transfer"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Overlay Image (Interior) - Positioned bottom left */}
                    <div className="absolute bottom-0 left-0 w-[55%] h-[55%] rounded-tl-[30px] rounded-br-[30px] border-4 border-white overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-10">
                        <img
                            src={MOCK_IMAGES.carInterior}
                            alt="Limousine Interior"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default JourneyComfort;
