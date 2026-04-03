import { useEffect } from 'react';
import RecommendExperience from '../../../components/RecommendExperience/RecommendExperience.jsx';
import Hero from '../../../components/Utils/HomePage/Hero.jsx';
import Header from "../../../components/Utils/Header/Header.jsx";
import Footer from "../../../components/Hotel/Footer/Footer.jsx";
import Seo from "../../../components/Utils/Seo.jsx";
import BetelSignature from "../../../components/Utils/HomePage/BetelSignature.jsx";
import CuratedExperiences from "../../../components/Utils/HomePage/CuratedExperience.jsx";

const HomePage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        // Added bg-slate-50 to keep a modern light-gray background consistent with other pages
        <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
            <Seo
                // Không truyền title -> Tự lấy title mặc định
                description="Your journey, full of experiences. Book hotels, cruises, train, and bus tickets all in one place."
            />
            <Header />

            {/* MAIN CONTENT WRAPPER */}
            {/* pt-28 md:pt-32: Add top spacing (~120px) so HomePage isn't covered by Header */}
            <main className="flex-grow pt-28 md:pt-32">

                {/* 1. HERO SECTION */}
                {/* HomePage usually needs a full-width background so keep it outside the centered container */}
                <div className="w-full">
                    <Hero/>
                </div>

                {/* 2. OTHER SECTIONS */}
                {/* Other content sections are wrapped in a w-10/12 container for a centered layout */}
                <div className="w-full md:w-10/12 mx-auto px-8 md:px-3 space-y-12 pb-12 mt-12">
                    {/*<RecommendPlaces/>*/}
                    <BetelSignature/>
                    <CuratedExperiences/>
                    <RecommendExperience/>


                    {/*<SuggestionTrainTicket/>*/}
                </div>
            </main>

            <Footer/>
        </div>
    );
}

export default HomePage;