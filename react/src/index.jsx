import React from 'react';
import ReactDOM from 'react-dom/client';

import { ROW } from './util/components';

import Titlebar from './parts/titlebar';
import DisplayLeft from './parts/displayLeft';
import DisplayRight from './parts/displayRight';
import Navbar from './parts/navbar';

import './scss/customClasses.scss';
import './scss/displayLeft.scss';
import './scss/displayRight.scss';
import './scss/globals.scss';
import './scss/navbar.scss';

import './scss/parts/queues.scss';
import './scss/parts/folders.scss';
import './scss/parts/albums.scss';
import './scss/parts/artists.scss';
import './scss/parts/eq.scss';
import './scss/parts/settings.scss';

ReactDOM.createRoot(document.body).render(
    // <React.StrictMode>
    <>
        <Titlebar/>
        <ROW id='main'>
            <DisplayLeft/>
            <DisplayRight/>
        </ROW>
        <Navbar/>
    {/* </React.StrictMode> */}
    </>
);

document.addEventListener('DOMContentLoaded', () => window.ipc.send('ipc-maximize'));