import React from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter, Routes } from 'react-router-dom';
// import { pagesJSX } from './pages/pages';
import { COL } from './util/components';

import Titlebar from './util/titlebar';
import Navbar from './util/navbar';

import './scss/customClasses.scss';
import './scss/display.scss';
import './scss/displayRight.scss';
import './scss/globals.scss';
import './scss/navbar.scss';

ReactDOM.createRoot(document.body).render(
    <React.StrictMode>
        <BrowserRouter>
            <Titlebar/>
            <COL id = 'main'>
                <Routes>
                    {/* {pagesJSX} */}
                </Routes>
            </COL>
            <Navbar/>
        </BrowserRouter>
    </React.StrictMode>
);

document.addEventListener('DOMContentLoaded', () => window.ipc.send('ipc-maximize'));