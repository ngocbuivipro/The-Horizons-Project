import TourList from "../../../components/Tour/TourList.jsx";
import Header from "../../../components/Utils/Header/Header.jsx";
import Footer from "../../../components/Hotel/Footer/Footer.jsx";

const TourListPage = () => {
    return (
        <>
            <div className="flex flex-col min-h-screen bg-blend-soft-light font-sans text-slate-900">
                {/* 1. Header: Fixed top */}
                <Header/>

                <main className="flex-grow pt-28 pb-22 w-11/12 md:w-9/12 mx-auto">
                    <TourList/>
                </main>

                {/* 3. Footer */}
                <Footer/>
            </div>

        </>

    )
}
export default TourListPage
