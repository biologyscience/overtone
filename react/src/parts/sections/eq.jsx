import { useEffect, useRef, useState } from 'react';
import { COL, ROW, CustomModal } from '../../util/components';
import SortableList from '../../util/sortable';

import eventBus from '../../util/events';

import
{
    DeleteRounded,
    MoreHorizRounded,
    DragHandleRounded,
    ChevronRightRounded,
    ScheduleRounded,
    QueueMusicRounded,
    CloseRounded,
    EditRounded
    
} from '@mui/icons-material';

export default function eq()
{
    const [analyser, setAnalyser] = useState();

    const analyserRef = useRef({});
    const visualizerRef = useRef();

    function draw()
    {
        requestAnimationFrame(draw);

        const freqArray = new Uint8Array(analyserRef.current.analyser.frequencyBinCount);

        analyserRef.current.analyser.getByteFrequencyData(freqArray);

        const ctx = visualizerRef.current.getContext('2d');

        ctx.fillStyle = '#65ffa0';

        ctx.clearRect(0, 0, visualizerRef.current.width, visualizerRef.current.height);

        for (let i = 0; i < freqArray.length; i++)
        {
            const
                x = i * 2,
                y = visualizerRef.current.height,
                w = 1,
                h = -(freqArray[i] / 255) * visualizerRef.current.height;

            ctx.fillRect(x, y, w, h);
        }
    }

    useEffect(() =>
    {
        if (analyser === undefined) return;

        analyserRef.current.analyser = analyser;

        draw();

    }, [analyser]);

    useEffect(() =>
    {
        eventBus.addEventListener('ot-AnalyzerNode', ({detail}) => setAnalyser(detail));

    }, []);

    return (
        <COL className='section' id='eq'>
            <canvas ref={visualizerRef} className='visualizer'/>
        </COL>
    )
}