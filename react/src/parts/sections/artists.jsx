import { useEffect, useState, useRef } from 'react';
import { COL, ROW, SearchBox, ContextMenu } from '../../util/components';

import eventBus from '../../util/events';

import
{
    ChevronLeftRounded,
    NumbersRounded,
    SearchRounded,
    CalendarMonthRounded,
    PlayArrowRounded,
    DeleteRounded,
    PlaylistAddRounded,
    StartRounded
    
} from '@mui/icons-material';

export default function artists()
{
    const sectionRef = useRef();

    const
        [showInside, setShowInside] = useState(false),
        [artists, setArtists] = useState(),
        [artist, setArtist] = useState(),
        [inputSearchSpace, setInputSearchSpace] = useState(),
        [inputMatchSpace, setInputMatchSpace] = useState(),
        [showContextMenu, setShowContextMenu] = useState(false),
        [contextData, setContextData] = useState({});

    function play(name)
    {
        window.ipc.send('ipc-addQueue', {artist: name, trackNumber: 0});

        eventBus.dispatchEvent(new CustomEvent('ot-changeSectionTo', {detail: 0}));
    }

    function openContext(data)
    {
        setContextData({album: data.album});
        setShowContextMenu(true);
    }
    
    function showArtist(artist)
    {
        window.ipc.invoke('ipc-wantArtist', {artist}).then(({picture, albums}) =>
        {
            const artistToSet = { name: artist, picture, albums };

            setArtist(artistToSet);

            eventBus.dispatchEvent(new CustomEvent('ot-changeSectionTo', {detail: 3}));
    
            setShowInside(true);
        });
    }

    function Artists()
    {
        return artists?.sort((x, y) => x?.artist?.localeCompare(y?.artist))?.map(({artist, picture}, i) =>
        {
            return (
                <div key={i} onClick={() => showArtist(artist)} className={`artistItem ${inputMatchSpace?.[i] ? '' : 'displayNone'}`}>
                    <ROW className={'artistPic'}><img src={picture} draggable={false}/></ROW>
                    <span className='artistName block overflowPrevent'>{artist}</span>
                </div>
            );
        });
    }

    function Albums()
    {
        return artist?.albums?.sort((x, y) => y.year - x.year)?.map(({album, year, albumart}, i) =>
        {
            return (
                <div key={i} title={album} onClick={() => eventBus.dispatchEvent(new CustomEvent('ot-showAlbum', {detail: {album, artist: artist.name}}))} onContextMenu={() => openContext({album})} className={`albumItem`}>
                    <img src={albumart} draggable={false}/>
                    <COL className={'info'}>
                        <span className='albumName block overflowPrevent'>{album}</span>
                        <span className='year'>{year}</span>
                    </COL>
                </div>
            );
        });
    }

    useEffect(() =>
    {
        window.ipc.invoke('ipc-wantArtists').then((artistsData) =>
        {
            setArtists(artistsData);
            setInputSearchSpace([...artistsData].sort((x, y) => x?.artist?.localeCompare(y?.artist)).map(x => x.artist));
            setInputMatchSpace([...artistsData].map(x => true));
        });

        eventBus.addEventListener('ot-showArtist', ({detail}) => showArtist(detail));
    }, []);

    return (
        <COL ref={sectionRef} className='section relative' id='artists'>
            <COL className={`out ${showInside ? 'displayNone' : ''}`}>
                <ROW className='head'>
                    <ROW className={'searchBar'}>
                        <SearchRounded/>
                        <SearchBox searchSpace={inputSearchSpace} matchSpace={[inputMatchSpace, setInputMatchSpace]} placeholder='Search artists'/>
                    </ROW>
                    <ROW className={'count'}>
                        <NumbersRounded/>
                        <span>{inputMatchSpace?.filter(x => x === true)?.length}</span>
                    </ROW>
                </ROW>
                <ROW className='body'><Artists/></ROW>
            </COL>
            <COL className={`in ${showInside ? '' : 'displayNone'}`}>
                <ROW className='head'>
                    <button className='goBack' onClick={() => setShowInside(false)}><ChevronLeftRounded/></button>
                    <ROW className={'artistPic'} onClick={() => play(artist?.name)}>
                        <img src={artist?.picture} draggable={false}/>
                        <PlayArrowRounded className='icon'/>
                    </ROW>
                    <COL className={'content'}>
                        <span className='name'>{artist?.name}</span>
                        <ROW className='info'>
                            <ROW>
                                <NumbersRounded/>
                                <span>{artist?.albums?.length}</span>
                            </ROW>
                            <ROW>
                                <CalendarMonthRounded/>
                                <span>{[...new Set(artist?.albums?.map(x => x.year)).values()].sort((x, y) => y - x).join(' • ')}</span>
                            </ROW>
                        </ROW>
                        {/* <GRID className='searchBar'>
                            <SearchRounded/>
                            <SearchBox searchSpace={inputSearchSpace} matchSpace={[inputMatchSpace, setInputMatchSpace]} placeholder='Search song titles'/>
                        </GRID> */}
                    </COL>
                </ROW>
                <ROW className={'albumList'}><Albums/></ROW>
            </COL>
            <ContextMenu
                visibility={[showContextMenu, setShowContextMenu]}
                title={contextData?.album}
                options={[
                    {
                        functions: [() => {}, () => {}],
                        icons: [<PlaylistAddRounded/>, <StartRounded/>],
                        texts: ['Add album to a queue', 'Play after current song']
                    },
                    {
                        functions: [ () => {}],
                        icons: [<DeleteRounded/>],
                        texts: ['Delete permanently']
                    }
                ]}
                parentRef={sectionRef}
            />
        </COL>
    )
}