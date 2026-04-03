import { useEffect } from "react";
import CruiseList from "../../../components/Cruise/CruiseList.jsx";
import Header from "../../../components/Utils/Header/Header.jsx";
import Footer from "../../../components/Hotel/Footer/Footer.jsx";

const CruiseListPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">
            <Header/>

            <main className="flex-grow pt-28 pb-12 w-full">
                <CruiseList/>
            </main>

            <Footer/>
        </div>
    );
};

export default CruiseListPage;
