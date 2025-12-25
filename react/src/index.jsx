import React from 'react';
import ReactDOM from 'react-dom/client';

import { ROW } from './util/components';

import Titlebar from './util/titlebar';
import DisplayLeft from './util/displayLeft';
import DisplayRight from './util/displayRight';
import Navbar from './util/navbar';

import './scss/customClasses.scss';
import './scss/displayLeft.scss';
import './scss/displayRight.scss';
import './scss/globals.scss';
import './scss/navbar.scss';

ReactDOM.createRoot(document.body).render(
    <React.StrictMode>
        <Titlebar/>
        <ROW id='main'>
            <DisplayLeft/>
            <DisplayRight/>
        </ROW>
        <Navbar/>
    </React.StrictMode>
);

document.addEventListener('DOMContentLoaded', () => window.ipc.send('ipc-maximize'));