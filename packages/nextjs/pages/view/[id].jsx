import  { useRouter } from 'next/router';
import {read} from '../../services/stream_functions/read'

import { useEffect, useState } from 'react';
import Chat from '../../components/chat/chat';
// import { joinRoom,getMessage } from '../../services/Chat/chat';
import dynamic from 'next/dynamic';
const { File } = require('web3.storage');
const { createClient } = require('web3.storage');

const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });
function View(){
    const router=useRouter();
	
    const {id} = router.query
    console.log(id);
   
  

    return (
        <div className='flex m-8 '>
			
         
			<ReactPlayer url={`https://streamvault.site:8000/${id}/stream.m3u8`} className='m-2'  playing={true} controls={true} />
			<Chat id={id}  />
        </div>

    )

}
export default View;