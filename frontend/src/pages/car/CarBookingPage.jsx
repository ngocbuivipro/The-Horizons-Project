import Header from "../../components/Utils/Header/Header.jsx";
import Footer from "../../components/Hotel/Footer/Footer.jsx";
import BookingCar from "../../components/Car/BookingCar.jsx";

const CarBookingPage = () => {
    return (
        <div>
            <Header/>

            <main className="flex-grow mt-2 pt-20 w-full mx-auto">
                <BookingCar/>
            </main>

            {/* 3. Footer */}
            <Footer/>
        </div>
    );
};

export default CarBookingPage;
