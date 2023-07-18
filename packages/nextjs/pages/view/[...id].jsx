import  { useRouter } from 'next/router';
import {read} from '../../services/stream_functions/read'
import { useIsMounted } from 'usehooks-ts'
import { useEffect, useState } from 'react';
import Chat from '../../components/chat/chat';
// import { joinRoom,getMessage } from '../../services/Chat/chat';
import dynamic from 'next/dynamic';
const { File } = require('web3.storage');
const { createClient } = require('web3.storage');

const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });
function View(){
    // const [ID,setID]=useState
    const router=useRouter();
    const isMounted = useIsMounted();
    const [mute,setMuted]=useState(true);
    
	
    const {id,live} = router.query
    console.log(live)

    let ID='';
    if(id){
        ID=id[0]+'/'+id[1];
    }
    // ID=_id[0]+_id[1];
    console.log(ID);
    var url='';
    if(live==='true' && id){
        url = `https://streamvault.site:8000/${ID}/${'stream'}.m3u8`;
    }
    else if(id){
        url = `https://streamvault.site/${id[1]}/${id[1]}.m3u8`;
    }
    console.log(url);
  

    return (
        <div className=' '>
            {
                live?
                <div  className='flex m-8'>
                       <ReactPlayer muted={mute} autoplay={true} url={url} className='m-2'  playing={true} controls={true} onBufferEnd={() => {
    setMuted(false)
  }} />
                        <Chat id={ID}  />
                </div>
             
                :
                null
                
            }
			
         
		
        </div>

    )

}
export default View;