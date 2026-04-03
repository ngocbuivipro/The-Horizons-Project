import Header from "../../components/Utils/Header/Header.jsx";
import Footer from "../../components/Hotel/Footer/Footer.jsx";
import CarSelection from "../../components/Car/CarSelection.jsx";

const CarSelectionPage = () => {
    return (
        <div>
            <Header/>

            <main className="flex-grow mt-2 pt-20 w-full mx-auto">
                <CarSelection/>
            </main>

            {/* 3. Footer */}
            <Footer/>
        </div>
    );
};

export default CarSelectionPage;
