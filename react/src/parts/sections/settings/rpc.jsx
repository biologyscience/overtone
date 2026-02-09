import { COL, ROW } from '../../../util/components';

export default function DiscordRPC()
{
    return (
        <COL className={'view'}>
            <ROW className={'option'}>
                <span>Autoconnect Discord RPC on launch</span>
                <input type='checkbox' className='switch'/>
            </ROW>
        </COL>
    )
}