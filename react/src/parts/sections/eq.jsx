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

        ctx.clearRect(0, 0, visualizerRef.current.width, visualizerRef.current.height);

        const color = document.querySelector(':root').style.getPropertyValue('--accent');

        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();

        const logScale = freqArray.filter((value, i) =>
        {
            const freq = i * 20000 / freqArray.length;

            if (freq > 1000 && freq < 10000 && freq % 100 > 10) return false;
            if (freq > 10000 && freq % 1000 > 100) return false;

            return true;
        });

        for (let i = 0; i < logScale.length; i++)
        {
            const
                x = i * 2,
                y = visualizerRef.current.height,
                w = 1,
                h = -(logScale[i] / 255) * visualizerRef.current.height;

            ctx.fillRect(x, y, w, h);

            // const minF = 20;
            // const maxF = 20000;
            // const freq = i * maxF / freqArray.length;

            // const x = Math.log10(freq / minF) / Math.log10(maxF / minF) * visualizerRef.current.width;
            // const y = visualizerRef.current.height - (freqArray[i] / 255) * visualizerRef.current.height;

            // if (i === 0) ctx.moveTo(x, y);
            // else ctx.lineTo(x, y);
        }

        ctx.stroke();
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