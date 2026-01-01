import { useEffect, useState } from 'react';
import { COL, ROW, GRID, SearchBox } from '../../util/components';

import { parseTime } from '../../util/functions';

import eventBus from '../../util/events';

import
{
    ChevronLeftRounded,
    NumbersRounded,
    ScheduleRounded,
    SearchRounded,
    PersonRounded,
    CalendarMonthRounded,
    PlayArrowRounded
    
} from '@mui/icons-material';

export default function albums()
{
    const
        [showInside, setShowInside] = useState(false),
        [albumData, setAlbumData] = useState(),
        [album, setAlbum] = useState(),
        [inputSearchSpace, setInputSearchSpace] = useState(),
        [inputMatchSpace, setInputMatchSpace] = useState();

    function play(trackNumber)
    {
        window.ipc.send('ipc-addQueue', {album: album.album, artist: album.songs[0].artists[0], trackNumber});

        eventBus.dispatchEvent(new CustomEvent('ot-changeSectionTo', {detail: 0}));
    }
    
    function showAlbum(album, artist)
    {
        window.ipc.invoke('ipc-wantAlbum', {album, artist}).then((data) =>
        {
            const albumToSet = structuredClone(data);

            let totalDuration = 0;
            data.songs.forEach(({duration}) => totalDuration += duration);
            const { hours, minutes, seconds } = parseTime(totalDuration);

            albumToSet.duration = `${hours}:${minutes}:${seconds}`;
            setAlbum(albumToSet);

            eventBus.dispatchEvent(new CustomEvent('ot-changeSectionTo', {detail: 2}));
    
            setShowInside(true);
        });
    }

    function Albums()
    {
        return albumData?.sort((x, y) => x?.album?.localeCompare(y?.album)).map(({artist, album, albumart}, i) =>
        {
            return (
                <div key={i} onClick={() => showAlbum(album, artist)} className={`albumItem ${inputMatchSpace?.[i] ? '' : 'displayNone'}`}>
                    <img src={albumart} draggable={false}/>
                    <span className='albumName block overflowPrevent'>{album}</span>
                </div>
            );
        });
    }

    function Songs()
    {
        return album?.songs?.sort((x, y) => x.track - y.track)?.map(({track, title, artists, plays, duration}, i) =>
        {
            const { minutes, seconds } = parseTime(duration);

            return (
                <li key={i} className='tableItem' onClick={() => play(i)}>
                    <span>{track}</span>
                    <COL className={'placeLeft'}>
                        <span className='title'>{title}</span>
                        <span className='artists'>{artists.join(', ')}</span>
                    </COL>
                    <span>{plays}</span>
                    <span>{`${minutes}:${seconds}`}</span>
                </li>
            );
        });
    }

    useEffect(() =>
    {
        window.ipc.invoke('ipc-wantAlbums').then((albumData) =>
        {
            setAlbumData(albumData);
            setInputSearchSpace([...albumData].map(x => x.album));
            setInputMatchSpace([...albumData].map(x => true));
        });

        eventBus.addEventListener('ot-showAlbum', ({detail: {album, artist}}) => showAlbum(album, artist));
    }, []);

    return (
        <COL className='section' id='albums'>
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
        </COL>
    )
}