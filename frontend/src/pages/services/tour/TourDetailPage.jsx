import TourDetail from "../../../components/Tour/TourDetail.jsx";
import Header from "../../../components/Utils/Header/Header.jsx";
import Footer from "../../../components/Hotel/Footer/Footer.jsx";

const TourDetailPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
            {/* 1. Header: Fixed top */}
            <Header/>

            <main className="flex-grow items-center pt-28 pb-18 w-10/12 md:w-8/12 lg:10/12 mx-auto">
                <TourDetail/>
            </main>

            {/* 3. Footer */}
            <Footer/>
        </div>

    )
}
export default TourDetailPage
