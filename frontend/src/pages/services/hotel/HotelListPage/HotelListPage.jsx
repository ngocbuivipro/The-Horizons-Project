import { useEffect } from 'react'
import Header from '../../../../components/Utils/Header/Header.jsx'
import HotelList from '../../../../components/Hotel/HotelList/HotelList.jsx'
import Footer from '../../../../components/Hotel/Footer/Footer.jsx'

const HotelListPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (

        <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">
            <Header/>

            <main className="flex-grow pt-28 pb-12 w-full">
                <HotelList/>
            </main>

            <Footer/>
        </div>
    )
}

export default HotelListPage
