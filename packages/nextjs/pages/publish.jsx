import { useEffect, useState } from 'react';
import {getDevices, init, publish} from '../services/stream_functions/publish'

import InputBox from '../components/custom-Components/inputBox';
import { Button } from '../components/custom-Components/button';
import { InputFile } from '../components/custom-Components/InputFile';
import { Select } from '../components/custom-Components/select';

function Publish(){
    const [stream,setStream]=useState(null)
    const [audioDevices,setAudioDevices]=useState(['screen']);
    const [videoDevices,setVideoDevices]=useState(['none']);


    useEffect(()=>{
        async function get(){
            const {audioDevices,videoDevices}=await getDevices();
            if(audioDevices){
                setAudioDevices([...audioDevices,'none']);
            }
            if(videoDevices){
                setVideoDevices([...videoDevices,'screen']);
            }
            
        }
       get();
        
       
       
        // setVideoDevices([...videoDevices]);
    },[])
    console.log(stream);
   
    
    return (
        <div className='flex h-full  m-6  flex justify-around '>
             <video id='publish-video' autoPlay controls className="h-[65vh] w-[60vw]" > </video>
             <div className='w-full m-10' >
             <InputBox label={'Enter Title '} id={'PublishId'} />
             
             <InputFile id={'thumbnail'} />
             <Select label={'select Video device'} id={'videoId'} options={videoDevices} />
             <Select label={'select audio device'} id={'audioId'} options={audioDevices} />
             {
                !stream?
                <Button label={'Preview'} onClick={()=>{init(document.getElementById('videoId').value,document.getElementById('audioId').value,setStream)}} />
                :
                <Button label={'Go Live'} onClick={()=>{publish(stream,document.getElementById('PublishId')?.value,document?.getElementById('thumbnail')?.files)}} />
               
             }
            

             </div>
          

            
            

           
            
           
        </div>
    );

}
export default Publish;