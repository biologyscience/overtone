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
                <div key={i} onClick={() => eventBus.dispatchEvent(new CustomEvent('ot-showAlbum', {detail: {album, artist: artist.name}}))} className={`albumItem`}>
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
            setInputSearchSpace(artistsData);
            setInputMatchSpace([...artistsData].map(x => true));
        });

        eventBus.addEventListener('ot-showArtist', ({detail}) => showArtist(detail));
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
                    <ROW className='artistPic'><img src={artist?.picture} draggable={false}/></ROW>
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