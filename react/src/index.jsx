import React from 'react';
import ReactDOM from 'react-dom/client';

import { COL, ROW } from './util/components';

import Titlebar from './util/titlebar';
import DisplayRight from './util/displayRight';
import Navbar from './util/navbar';

import './scss/customClasses.scss';
import './scss/displayLeft.scss';
import './scss/displayRight.scss';
import './scss/globals.scss';
import './scss/navbar.scss';

import 'rc-slider/assets/index.css';

ReactDOM.createRoot(document.body).render(
    <React.StrictMode>
        <Titlebar/>
        <ROW id='main'>
            <ROW id='displayLeft'>
                <COL className='section'>woah1</COL>
                <COL className='section'>woah2</COL>
                <COL className='section'>woah3</COL>
            </ROW>
            <DisplayRight/>
        </ROW>
        <Navbar/>
    </React.StrictMode>
);

document.addEventListener('DOMContentLoaded', () => window.ipc.send('ipc-maximize'));