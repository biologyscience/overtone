import { useEffect, useState, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import { COL, ROW, GRID, SearchBox, ContextMenu, SongInfoModal, DeleteModal } from '../../util/components';
import { parseTime, songInfoSetter } from '../../util/functions';
import eventBus from '../../util/events';

import
{
    ChevronLeftRounded,
    NumbersRounded,
    ScheduleRounded,
    SearchRounded,
    PersonRounded,
    CalendarMonthRounded,
    PlayArrowRounded,
    DeleteRounded,
    InfoOutlineRounded,
    PlaylistAddRounded,
    StartRounded,
    MoreHorizRounded
    
} from '@mui/icons-material';

export default function albums()
{
    const sectionRef = useRef();

    const
        [showInside, setShowInside] = useState(false),
        [albumData, setAlbumData] = useState(),
        [album, setAlbum] = useState(),
        [inputSearchSpace, setInputSearchSpace] = useState(),
        [inputMatchSpace, setInputMatchSpace] = useState(),
        [showContextMenu, setShowContextMenu] = useState(false),
        [contextData, setContextData] = useState({}),
        [songInfo, setSongInfo] = useState({}),
        [songInfoModal, setShowSongInfoModal] = useState(false),
        [showDeleteModal, setShowDeleteModal] = useState(false);

    function play(trackNumber)
    {
        window.ipc.send('ipc-addQueue', { trackNumber, songLocations: album.songs.map(x => x.location), queueName: album.album });
        eventBus.dispatchEvent(new CustomEvent('ot-changeSectionTo', {detail: 0}));
    }
    
    function showAlbum(album, artist)
    {
        window.ipc.invoke('ipc-wantAlbum', {album, artist}).then((albumToSet) =>
        {
            let totalDuration = 0;
            albumToSet.songs.forEach(({duration}) => totalDuration += duration);

            albumToSet.duration = parseTime(totalDuration).text;
            setAlbum(albumToSet);

            if (albumToSet?.colors?.DarkMuted !== undefined)
            {
                const inside = sectionRef.current.querySelector('.in');

                inside.style.setProperty('--background', `rgb(${albumToSet.colors.DarkMuted.join(',')})`);
                inside.style.setProperty('--accent', `rgb(${albumToSet.colors.LightVibrant.join(',')})`);
                inside.style.setProperty('--accent2', `rgba(${albumToSet.colors.LightVibrant.join(',')}, .25)`);
            }

            eventBus.dispatchEvent(new CustomEvent('ot-changeSectionTo', {detail: 2}));
    
            setShowInside(true);
        });
    }

    function Albums()
    {
        return albumData?.sort((x, y) => x?.album?.localeCompare(y?.album)).map(({artist, album, albumart, accent}, i) =>
        {
            return (
                <div key={i} style={{'--shadow': `rgba(${accent.join(',')}, .5)`}} onClick={() => showAlbum(album, artist)} className={`albumItem ${inputMatchSpace?.[i] ? '' : 'displayNone'}`}>
                    <img src={albumart} draggable={false}/>
                    <span title={album} className='albumName block overflowPrevent'>{album}</span>
                </div>
            );
        });
    }

    function openContext(data)
    {
        setContextData({title: data.title, filepath: data.location});
        setShowContextMenu(true);
    }

    function Songs()
    {
        return album?.songs?.sort((x, y) => x.track - y.track)?.map(({track, title, artists, plays, duration, location}, i) =>
        {
            return (
                <li key={i} className='tableItem' onClick={({target}) => target.tagName === 'BUTTON' ? null : play(i)} onContextMenu={() => openContext({title, location})}>
                    <span>{track}</span>
                    <COL className={'placeLeft'}>
                        <span className='title'>{title}</span>
                        <span className='artists'>{artists.join(', ')}</span>
                    </COL>
                    <span>{plays}</span>
                    <span>{parseTime(duration).text}</span>
                    <button onClick={() => openContext({title, location})}><MoreHorizRounded/></button>
                </li>
            );
        });
    }

    function triggerReload()
    {
        if (!showInside) return;

        window.ipc.invoke('ipc-wantAlbum', {album: album?.album, artist: album?.artist}).then((albumToSet) =>
        {
            if (albumToSet.songs.length > 0)
            {
                let totalDuration = 0;
                albumToSet.songs.forEach(({duration}) => totalDuration += duration);
    
                albumToSet.duration = parseTime(totalDuration).text;
                setAlbum(albumToSet);
            }

            else
            {
                window.ipc.invoke('ipc-wantAlbums').then((albumData) =>
                {
                    setAlbumData(albumData);
                    setInputSearchSpace([...albumData].sort((x, y) => x?.album?.localeCompare(y?.album)).map(x => x.album));
                    setInputMatchSpace([...albumData].map(x => true));
                    setShowInside(false);
                });
            }
        });
    }

    useEffect(() =>
    {
        window.ipc.invoke('ipc-wantAlbums').then((albumData) =>
        {
            setAlbumData(albumData);
            setInputSearchSpace([...albumData].sort((x, y) => x?.album?.localeCompare(y?.album)).map(x => x.album));
            setInputMatchSpace([...albumData].map(x => true));
        });

        eventBus.addEventListener('ot-showAlbum', ({detail: {album, artist}}) => showAlbum(album, artist));
        eventBus.addEventListener('ot-filesDeleted', triggerReload);
    }, []);

    return (
        <COL ref={sectionRef} className='section relative' id='albums'>
            <COL className={`out ${showInside ? 'displayNone' : ''}`}>
                <ROW className='head'>
                    <ROW className={'searchBar'}>
                        <SearchRounded/>
                        <SearchBox searchSpace={inputSearchSpace} matchSpace={[inputMatchSpace, setInputMatchSpace]} placeholder='Search albums'/>
                    </ROW>
                    <ROW className={'count'}>
                        <NumbersRounded/>
                        <span>{inputMatchSpace?.filter(x => x === true)?.length}</span>
                    </ROW>
                </ROW>
                <ROW className='body'><Albums/></ROW>
            </COL>
            <COL className={`in ${showInside ? '' : 'displayNone'}`}>
                <ROW className='head'>
                    <button className='goBack' onClick={() => setShowInside(false)}><ChevronLeftRounded/></button>
                    <ROW className={'albumart'} onClick={() => play(0)}>
                        <img src={album?.albumart} draggable={false}/>
                        <PlayArrowRounded className='icon'/>
                    </ROW>
                    <COL className={'content'}>
                        <span className='name'>{album?.album}</span>
                        <ROW className='info'>
                            <ROW>
                                <PersonRounded/>
                                <span className={'linkToArtist'} onClick={() => eventBus.dispatchEvent(new CustomEvent('ot-showArtist', {detail: album?.artist}))}>{album?.artist}</span>
                            </ROW>
                            <ROW>
                                <CalendarMonthRounded/>
                                <span>{album?.year}</span>
                            </ROW>
                            <ROW>
                                <NumbersRounded/>
                                <span>{album?.songs?.length}</span>
                            </ROW>
                            <ROW>
                                <ScheduleRounded/>
                                <span>{album?.duration}</span>
                            </ROW>
                        </ROW>
                        {/* <GRID className='searchBar'>
                            <SearchRounded/>
                            <SearchBox searchSpace={inputSearchSpace} matchSpace={[inputMatchSpace, setInputMatchSpace]} placeholder='Search song titles'/>
                        </GRID> */}
                    </COL>
                </ROW>
                <COL className={'body'}>
                    <GRID className={'tableHead tableItem'}>
                        <NumbersRounded/>
                        <span className='placeLeft'>TITLE</span>
                        <span>PLAYS</span>
                        <ScheduleRounded/>
                    </GRID>
                    <ul className='songList'>
                        <Songs/>
                    </ul>
                </COL>
            </COL>
            <SongInfoModal
                visibility={[songInfoModal, setShowSongInfoModal]}
                parentRef={sectionRef}
                songInfo={songInfo}
            />
            <DeleteModal
                visibility={[showDeleteModal, setShowDeleteModal]}
                parentRef={sectionRef}
                files={[contextData?.filepath]}
                toasterId={'albums'}
            />
            <ContextMenu
                visibility={[showContextMenu, setShowContextMenu]}
                title={contextData?.title}
                options={[
                    {
                        functions: [() => {}, () => {}],
                        icons: [<PlaylistAddRounded/>, <StartRounded/>],
                        texts: ['Add to a queue', 'Play after current song']
                    },
                    {
                        functions: [
                            () => songInfoSetter(contextData?.filepath, setShowContextMenu, setSongInfo, setShowSongInfoModal),
                            () => { setShowContextMenu(false); setShowDeleteModal(true); }
                        ],
                        icons: [<InfoOutlineRounded/>, <DeleteRounded/>],
                        texts: ['Song info', 'Delete permanently']
                    }
                ]}
                parentRef={sectionRef}
            />
            <Toaster
                toasterId='albums'
                position='bottom-right'
                containerStyle={{
                    position: 'absolute',
                    fontSize: '.8rem'
                }}
            />
        </COL>
    )
}