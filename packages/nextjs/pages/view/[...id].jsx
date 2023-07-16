import  { useRouter } from 'next/router';
import {read} from '../../services/stream_functions/read'

import { useEffect, useState } from 'react';
import Chat from '../../components/chat/chat';
// import { joinRoom,getMessage } from '../../services/Chat/chat';
import dynamic from 'next/dynamic';
const { File } = require('web3.storage');
const { createClient } = require('web3.storage');

const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });
function View({live=1}){
    // const [ID,setID]=useState
    const router=useRouter();
	
    const {id} = router.query
    let ID='';
    if(id){
        ID=id[0]+'/'+id[1];
    }
    // ID=_id[0]+_id[1];
    console.log(ID);
   
  

    return (
        <div className='flex m-8 '>
			
         
			<ReactPlayer url={`https://streamvault.site:8000/${ID}/${live?'stream':id[1]}.m3u8`} className='m-2'  playing={true} controls={true} />
			<Chat id={ID}  />
        </div>

    )

}
export default View;