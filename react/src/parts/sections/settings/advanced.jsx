import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { OpenInNewRounded, CancelRounded, FileUploadRounded, RestoreRounded, RotateRightRounded } from '@mui/icons-material';

import { COL, CustomModal, ROW, Slider } from '../../../util/components';
import { useDebounce } from 'react-haiku';
import eventBus from '../../../util/events';

export default function Advanced()
{
    const parentRef = useRef();

    const
        [launchOnStartup, setLaunchOnStartup] = useState(),
        [autoplay, setAutoplay] = useState(),
        [hideToSystemTray, setHideToSystemTray] = useState(),
        [percent, setPercent] = useState(),
        [showBackupRestoreModal, setShowBackupRestoreModal] = useState(false),
        [showConfirmRestoreModal, setShowConfirmRestoreModal] = useState(false),
        [partialRestore, setPartialRestore] = useState(false),
        [RPCAutoConnect, setRPCAutoConnect] = useState(),
        [restartingRPC, setRestartingRPC] = useState(false),
        [showResetAppModal, setShowResetAppModal] = useState(false);

    const debouncedPercent = useDebounce(percent);

    function backup()
    {
        const id = toast.loading('Archiving ...', {toasterId: 'settings'});

        window.ipc.invoke('ipc-backupAppdata').then((result) =>
        {
            if (result === false) toast.error('Error backing up data', {id});
            else toast.success(`Backup saved to ${result}`, {id});

            setShowBackupRestoreModal(false);
        });
    }

    function restore()
    {
        const id = toast.loading('Waiting for backup file ...', {toasterId: 'settings'});

        window.ipc.invoke('ipc-restoreAppdata').then((result) =>
        {
            setShowBackupRestoreModal(false);

            if (result === false) toast.error('Error restoring data', {id});

            else
            {
                toast.dismiss(id);

                setPartialRestore(result.partial);
                setShowConfirmRestoreModal(true);
            }
        });
    }

    useEffect(() => window.ipc.send('ipc-updateConfig', {value: launchOnStartup, keys: ['launchOnStartup']}), [launchOnStartup]);
    useEffect(() => window.ipc.send('ipc-updateConfig', {value: autoplay, keys: ['audio', 'autoPlayOnLaunch']}), [autoplay]);
    useEffect(() => window.ipc.send('ipc-updateConfig', {value: hideToSystemTray, keys: ['systemTray']}), [hideToSystemTray]);
    useEffect(() => window.ipc.send('ipc-updateConfig', {value: RPCAutoConnect, keys: ['discordRPC', 'autoConnect']}), [RPCAutoConnect]);

    useEffect(() =>
    {
        eventBus.dispatchEvent(new CustomEvent('ot-changePercentForSongCount', {detail: Math.round(debouncedPercent)}));

        window.ipc.send('ipc-updateConfig', {value: Math.round(debouncedPercent), keys: ['audio', 'percentForPlaycount']});

    }, [debouncedPercent]);

    useEffect(() =>
    {
        if (restartingRPC)
        {
            window.ipc.invoke('ipc-startRPC', {restart: true}).then((status) =>
            {
                if (status) toast.success('Discord RPC restarted', {toasterId: 'settings'});

                else toast.error('Error starting Discord RPC', {toasterId: 'settings'});

                setRestartingRPC(false);
            });
        }
    }, [restartingRPC]);

    useEffect(() =>
    {
        window.ipc.on('ipc-takeConfig', (config) =>
        {
            setLaunchOnStartup(config.launchOnStartup);
            setAutoplay(config.audio.autoPlayOnLaunch);
            setHideToSystemTray(config.systemTray);
            setPercent(config.audio.percentForPlaycount);
            setRPCAutoConnect(config.discordRPC.autoConnect);

            if (config.discordRPC.autoConnect) window.ipc.invoke('ipc-startRPC');
        });
    }, []);
        
    return (
        <COL ref={parentRef} className={'view'}>
            <ROW className={'option'}>
                <span>Launch OverTone on startup</span>
                <input type='checkbox' className='switch' checked={launchOnStartup} onChange={() => setLaunchOnStartup(x => !x)}/>
            </ROW>
            {/* <ROW className={'option'}>
                <span>Automatically start playback on launch</span>
                <input type='checkbox' className='switch' checked={autoplay} onChange={() => setAutoplay(x => !x)}/>
            </ROW> */}
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
                <span>Autoconnect Discord RPC on launch</span>
                <input type='checkbox' className='switch' checked={RPCAutoConnect} onChange={() => setRPCAutoConnect(x => !x)}/>
            </ROW>
            <ROW className={'option'}>
                <span>Restart Discord RPC</span>
                <button className={`popup ${restartingRPC ? 'spin' : null}`} onClick={() => setRestartingRPC(true)}><RotateRightRounded/></button>
            </ROW>
            <div className='divider'/>
            <ROW className={'option'}>
                <span>Backup and restore</span>
                <button className='popup' onClick={() => setShowBackupRestoreModal(true)}><OpenInNewRounded/></button>
            </ROW>
            <ROW className={'option'}>
                <span>Reset app</span>
                <button className='popup' onClick={() => setShowResetAppModal(true)}><OpenInNewRounded/></button>
            </ROW>
            <CustomModal visibility={[showBackupRestoreModal, setShowBackupRestoreModal]} parentRef={parentRef}>
                <ROW className={'backupRestoreModal'}>
                    <COL className={'choice'} onClick={backup}>
                        <FileUploadRounded/>
                        <span>Backup appdata</span>
                        <span>(export as .zip)</span>
                    </COL>
                    <COL className={'choice'} onClick={restore}>
                        <RestoreRounded/>
                        <span>Restore backed-up data</span>
                        <span>(Choose a .zip)</span>
                    </COL>
                </ROW>
            </CustomModal>
            <CustomModal visibility={[showConfirmRestoreModal, setShowConfirmRestoreModal]} parentRef={parentRef}>
                <COL className={'confirmRestoreModal'}>
                    <span className='title'>Restoring successful! {partialRestore ? '(partially)' : null}</span>
                    { partialRestore ? <span>Only some of the files could be restored, missing files will be created as defaults.</span> : null }
                    <span>Restart the app to apply changes</span>
                    <ROW className={'buttons'}>
                        <button className='accent' onClick={() => { toast.loading('Restarting ...', {toasterId: 'settings'}); window.ipc.send('ipc-restoreNow'); }}>Restart now</button>
                    </ROW>
                </COL>
            </CustomModal>
            <CustomModal visibility={[showResetAppModal, setShowResetAppModal]} parentRef={parentRef}>
                <COL className={'resetAppModal'}>
                    <span className='title'>Reset app</span>
                    <span>Files used to store Albumart, Playlists, Themes, Configs, etc. will be permanently deleted</span>
                    <span>All your music files will <strong><u>not be deleted</u></strong></span>
                    <span style={{marginTop: '.5em'}}>Are you sure you want to proceed?</span>
                    <ROW className={'buttons'}>
                        <button className='yes' onClick={() => window.ipc.send('ipc-resetApp')}>Yes</button>
                        <button onClick={() => setShowResetAppModal(false)}>No</button>
                        <button onClick={() => { setShowResetAppModal(false); setShowBackupRestoreModal(true); }}>Backup instead?</button>
                    </ROW>
                </COL>
            </CustomModal>
        </COL>
    )
}