import { useEffect } from 'react';
import {publish} from '../services/stream_functions/publish'
import { initialize } from '../services/stream_functions/publish';

function Publish(){

   
    
    return (
        <div className='flex h-full w-full'>
             <video id='publish-video' autoPlay controls className="h-[65vh] w-[60vw]" > </video>
            <div>
                <label for="small-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Small input</label>
                <input type="text" id="video-id" class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
            </div>
            <select className='h-[70px] w-[100px]'  id="video_codec">video</select>

            <select className='h-[70px] w-[100px]'  id="audio_codec">audio</select>

            

           
            
            <button className='' onClick={()=>{publish(document.getElementById('video-id').value)}} > publish</button>
        </div>
    );

}
export default Publish;