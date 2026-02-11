import { useEffect, useState } from 'react';
import { OpenInNewRounded, CancelRounded } from '@mui/icons-material';

import { COL, ROW, Slider } from '../../../util/components';
import { useDebounce } from 'react-haiku';
import eventBus from '../../../util/events';

export default function Advanced()
{
    const
        [launchOnStartup, setLaunchOnStartup] = useState(),
        [autoplay, setAutoplay] = useState(),
        [hideToSystemTray, setHideToSystemTray] = useState(),
        [percent, setPercent] = useState();

    const debouncedPercent = useDebounce(percent);

    useEffect(() => window.ipc.send('ipc-updateConfig', {value: launchOnStartup, keys: ['launchOnStartup']}), [launchOnStartup]);
    useEffect(() => window.ipc.send('ipc-updateConfig', {value: autoplay, keys: ['audio', 'autoPlayOnLaunch']}), [autoplay]);
    useEffect(() => window.ipc.send('ipc-updateConfig', {value: hideToSystemTray, keys: ['systemTray']}), [hideToSystemTray]);

    useEffect(() =>
    {
        eventBus.dispatchEvent(new CustomEvent('ot-changePercentForSongCount', {detail: Math.round(debouncedPercent)}));

        window.ipc.send('ipc-updateConfig', {value: Math.round(debouncedPercent), keys: ['audio', 'percentForPlaycount']});

    }, [debouncedPercent]);

    useEffect(() =>
    {
        window.ipc.on('ipc-takeConfig', (config) =>
        {
            setLaunchOnStartup(config.launchOnStartup);
            setAutoplay(config.audio.autoPlayOnLaunch);
            setHideToSystemTray(config.systemTray);
            setPercent(config.audio.percentForPlaycount);
        });
    }, []);
        
    return (
        <COL className={'view'}>
            <ROW className={'option'}>
                <span>Launch OverTone on startup</span>
                <input type='checkbox' className='switch' checked={launchOnStartup} onChange={() => setLaunchOnStartup(x => !x)}/>
            </ROW>
            <ROW className={'option'}>
                <span>Automatically start playback on launch</span>
                <input type='checkbox' className='switch' checked={autoplay} onChange={() => setAutoplay(x => !x)}/>
            </ROW>
            <ROW className={'option'}>
                <span>Hide app to system tray when closed</span>
                <input type='checkbox' className='switch' checked={hideToSystemTray} onChange={() => setHideToSystemTray(x => !x)}/>
            </ROW>
            <ROW className={'option'}>
                <span>Percentage of song duration to be considered as a play count</span>
                <ROW className={'sliderInOption'}>
                    <button className={Math.round(percent) === 50 ? 'visibilityHidden' : null } onClick={() => setPercent(50)}><CancelRounded/></button>
                    <Slider progressState={[percent, setPercent]}/>
                    <span>{Math.round(percent)}%</span>
                </ROW>
            </ROW>
            <ROW className={'option'}>
                <span>Backup and restore</span>
                <button className='popup'><OpenInNewRounded/></button>
            </ROW>
            <ROW className={'option'}>
                <span>Reset app</span>
                <button className='popup'><OpenInNewRounded/></button>
            </ROW>
        </COL>
    )
}