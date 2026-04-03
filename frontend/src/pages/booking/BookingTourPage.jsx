import React from 'react'
import BookingTour from "../../components/Booking/BookingTour.jsx";
import Header from "../../components/Utils/Header/Header.jsx";
import Footer from "../../components/Hotel/Footer/Footer.jsx";

const BookingTourPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
            {/* 1. Header: Fixed top */}
            <Header/>

            <main className="flex-grow pt-14 pb-18 w-11/12 md:w-10/12 mx-auto">
                <BookingTour/>
            </main>

            {/* 3. Footer */}
            <Footer/>
        </div>

    )
}
export default BookingTourPage
