import Header from "../../components/Utils/Header/Header.jsx";
import Footer from "../../components/Hotel/Footer/Footer.jsx";
import BookingCruise from "../../components/Booking/BookingCruise.jsx";

const BookingCruisePage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
            {/* 1. Header: Fixed top */}
            <Header/>

            <main className="flex-grow pt-28 pb-18 w-11/12 md:w-11/12 mx-auto rounded-md">
                <BookingCruise/>
            </main>

            {/* 3. Footer */}
            <Footer/>
        </div>
    );
};

export default BookingCruisePage;
