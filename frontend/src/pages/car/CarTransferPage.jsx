import Header from "../../components/Utils/Header/Header.jsx";
import Footer from "../../components/Hotel/Footer/Footer.jsx";
import CarTransfer from "../../components/Car/CarTransfer.jsx";

const CarTransferPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
            {/* 1. Header */}
            <Header/>

            <main className="flex-grow mt-2 py-20 w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
                <CarTransfer/>
            </main>

            {/* 3. Footer */}
            <Footer/>
        </div>
    );
};

export default CarTransferPage;
