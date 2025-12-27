import { useEffect, useState } from 'react';
import { COL, ROW, SearchBox } from '../../util/components';

import eventBus from '../../util/events';

import
{
    ChevronLeftRounded,
    NumbersRounded,
    SearchRounded,
    CalendarMonthRounded
    
} from '@mui/icons-material';

export default function artists()
{
    const
        [showInside, setShowInside] = useState(false),
        [artists, setArtists] = useState(),
        [artist, setArtist] = useState(),
        [inputSearchSpace, setInputSearchSpace] = useState(),
        [inputMatchSpace, setInputMatchSpace] = useState();
    
    function showArtist(artist)
    {
        window.ipc.invoke('ipc-wantArtist', {artist}).then((data) =>
        {
            const artistToSet = { name: artist, albums: structuredClone(data) };

            setArtist(artistToSet);

            eventBus.dispatchEvent(new CustomEvent('ot-changeSectionTo', {detail: 3}));
    
            setShowInside(true);
        });
    }

    function Artists()
    {
        const components = [];
    
        artists?.forEach((artist, i) =>
        {
            components.push(
                <div key={i} onClick={() => showArtist(artist)} className={`albumItem ${inputMatchSpace?.[i] ? '' : 'displayNone'}`}>
                    <img src='https://unsplash.it/200' draggable={false}/>
                    <span className='artistName block overflowPrevent'>{artist}</span>
                </div>
            );
        });
        
        return components;
    }

    function Albums()
    {
        const components = [];

        artist?.albums?.sort((x, y) => x.year - y.year)?.forEach(({album, year}, i) =>
        {
            components.push(
                <div key={i} onClick={() => eventBus.dispatchEvent(new CustomEvent('ot-showAlbum', {detail: {album, artist: artist.name}}))} className={`albumItem`}>
                    <img src='https://unsplash.it/300' draggable={false}/>
                    <COL className={'info'}>
                        <span className='albumName block overflowPrevent'>{album}</span>
                        <span className='year'>{year}</span>
                    </COL>
                </div>
            );
        });

        return components;
    }

    useEffect(() =>
    {
        window.ipc.invoke('ipc-wantArtists').then((artistsData) =>
        {
            setArtists(artistsData);
            setInputSearchSpace(artistsData);
            setInputMatchSpace([...artistsData].map(x => true));
        });

        eventBus.addEventListener('ot-showArtist', ({detail: {artist}}) => showArtist(artist));
    }, []);

    return (
        <COL className='section' id='artists'>
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
                    <img className='artistPic' src='https://unsplash.it/200' draggable={false}/>
                    <COL className={'content'}>
                        <span className='name'>{artist?.name}</span>
                        <ROW className='info'>
                            <ROW>
                                <NumbersRounded/>
                                <span>{artist?.albums?.length}</span>
                            </ROW>
                            <ROW>
                                <CalendarMonthRounded/>
                                <span>{[...new Set(artist?.albums?.map(x => x.year)).values()].sort((x, y) => x - y).join(' • ')}</span>
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
        </COL>
    )
}