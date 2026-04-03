import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { Provider } from 'react-redux'
import Store from './redux/store.js'
import { ApiProvider } from './contexts/ApiContext.jsx'
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById('root')).render(
        <Provider store={Store}>
            <BrowserRouter>
                <ApiProvider>
                    <HelmetProvider>
                        <App />
                    </HelmetProvider>
                </ApiProvider>
            </BrowserRouter>
        </Provider>
)