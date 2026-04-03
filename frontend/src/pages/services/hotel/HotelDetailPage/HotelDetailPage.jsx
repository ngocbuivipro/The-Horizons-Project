import React from 'react'
import Header from '../../../../components/Utils/Header/Header.jsx'
import HotelDetail from '../../../../components/Hotel/HotelDetail/HotelDetail.jsx'
import Footer from '../../../../components/Hotel/Footer/Footer.jsx'

const HotelDetailPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
            <Header/>
            <main className="flex-grow pt-15 md:pt-20">
                <HotelDetail/>
            </main>
            <Footer/>
        </div>
    )
}

export default HotelDetailPage