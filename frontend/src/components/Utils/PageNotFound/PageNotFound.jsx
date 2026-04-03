import { Link } from 'react-router-dom'; // Ensure you use react-router-dom
import { FaArrowLeft, FaHome } from 'react-icons/fa';
import Header from '../Header/Header.jsx';
import Footer from '../../Hotel/Footer/Footer.jsx';

const PageNotFound = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-grow flex items-center justify-center bg-gray-50 relative overflow-hidden">
                {/* Background Decorative Text */}
                <h1 className="absolute text-[20rem] font-black text-gray-200 select-none z-0">
                    404
                </h1>

                <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
                    <div className="mb-8">
            <span className="inline-block p-4 rounded-full bg-red-100 text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
                        <h2 className="text-4xl font-bold text-gray-900 mb-2">Page Not Found</h2>
                        <p className="text-gray-600 text-lg">
                            Sorry, we couldn't find the page you're looking for. It might have been removed, had its name changed, or is temporarily unavailable.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
                        >
                            <FaHome /> Go Home
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FaArrowLeft /> Go Back
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PageNotFound;