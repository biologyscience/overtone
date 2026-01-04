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
    PlayArrowRounded
    
} from '@mui/icons-material';

export default function genres()
{
    const
        [showInside, setShowInside] = useState(false),
        [genreData, setGenreData] = useState(),
        [genre, setGenre] = useState(),
        [inputSearchSpace, setInputSearchSpace] = useState(),
        [inputMatchSpace, setInputMatchSpace] = useState();

    function play(trackNumber)
    {
        window.ipc.send('ipc-addQueue', {genre: genre.name, trackNumber});

        eventBus.dispatchEvent(new CustomEvent('ot-changeSectionTo', {detail: 0}));
    }
    
    function showGenre(genre)
    {
        window.ipc.invoke('ipc-wantGenre', {genre}).then((data) =>
        {
            let totalDuration = 0;

            data.songs.forEach(({duration}) => totalDuration += duration);
            data.duration = parseTime(totalDuration).text;
            data.name = genre;

            setGenre(data);

            eventBus.dispatchEvent(new CustomEvent('ot-changeSectionTo', {detail: 4}));
    
            setShowInside(true);
        });
    }

    function Genres()
    {
        return genreData?.sort((x, y) => x?.genre?.localeCompare(y?.genre)).map(({picture, genre}, i) =>
        {
            return (
                <div key={i} onClick={() => showGenre(genre)} className={`genreItem ${inputMatchSpace?.[i] ? '' : 'displayNone'}`}>
                    <img src={picture} draggable={false}/>
                    <span className='genreName block overflowPrevent'>{genre}</span>
                </div>
            );
        });
    }

    function Songs()
    {
        return genre?.songs?.sort((x, y) => x?.title?.localeCompare(y?.title))?.map(({track, title, artists, plays, duration}, i) =>
        {
            return (
                <li key={i} className='tableItem' onClick={() => play(i)}>
                    <span>{track}</span>
                    <COL className={'placeLeft'}>
                        <span className='title'>{title}</span>
                        <span className='artists'>{artists.join(', ')}</span>
                    </COL>
                    <span>{plays}</span>
                    <span>{parseTime(duration).text}</span>
                </li>
            );
        });
    }

    useEffect(() =>
    {
        window.ipc.invoke('ipc-wantGenres').then((genreData) =>
        {
            setGenreData(genreData);
            setInputSearchSpace([...genreData].sort((x, y) => x?.genre?.localeCompare(y?.genre)).map(x => x.genre));
            setInputMatchSpace([...genreData].map(x => true));
        });

    }, []);

    return (
        <COL className='section' id='genres'>
            <COL className={`out ${showInside ? 'displayNone' : ''}`}>
                <ROW className='head'>
                    <ROW className={'searchBar'}>
                        <SearchRounded/>
                        <SearchBox searchSpace={inputSearchSpace} matchSpace={[inputMatchSpace, setInputMatchSpace]} placeholder='Search genres'/>
                    </ROW>
                    <ROW className={'count'}>
                        <NumbersRounded/>
                        <span>{inputMatchSpace?.filter(x => x === true)?.length}</span>
                    </ROW>
                </ROW>
                <ROW className='body'><Genres/></ROW>
            </COL>
            <COL className={`in ${showInside ? '' : 'displayNone'}`}>
                <ROW className='head'>
                    <button className='goBack' onClick={() => setShowInside(false)}><ChevronLeftRounded/></button>
                    <ROW className={'genrePicture'} onClick={() => play(0)}>
                        <img src={genre?.picture} draggable={false}/>
                        <PlayArrowRounded className='icon'/>
                    </ROW>
                    <COL className={'content'}>
                        <span className='name'>{genre?.name}</span>
                        <ROW className='info'>
                            <ROW>
                                <NumbersRounded/>
                                <span>{genre?.songs?.length}</span>
                            </ROW>
                            <ROW>
                                <ScheduleRounded/>
                                <span>{genre?.duration}</span>
                            </ROW>
                        </ROW>
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