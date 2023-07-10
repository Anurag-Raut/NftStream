import  { useRouter } from 'next/router';
import {read} from '../../services/stream_functions/read'

import { useEffect, useState } from 'react';
import Chat from '../../components/chat/chat';
import { joinRoom,getMessage } from '../../services/Chat/chat';
import dynamic from 'next/dynamic';
const { File } = require('web3.storage');
const { createClient } = require('web3.storage');

const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });
function View(){
    const router=useRouter();
	
    const {id} = router.query
   
  

    return (
        <div className='flex '>
			
            {/* <video src="" id='receive-video' ></video> */}
			<ReactPlayer url={`http://localhost:8888/${id}/stream.m3u8`}  playing={true} controls={true} />
			{/* <Chat id={id} /> */}
        </div>

    )

}
export default View;