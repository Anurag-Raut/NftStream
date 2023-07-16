import { useEffect, useState } from 'react';
import {getDevices, init, publish} from '../services/stream_functions/publish'
import uniqid from 'uniqid'
import InputBox from '../components/custom-Components/inputBox';
import { Button } from '../components/custom-Components/button';
import { InputFile } from '../components/custom-Components/InputFile';
import { Select } from '../components/custom-Components/select';
import axios from 'axios'
import { useLocalStorage } from 'usehooks-ts'
function Publish(){
    let id= uniqid();
    const [ID, setID] = useLocalStorage('ID', '')
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
    const hello= async ()=>{
        const storedValue = localStorage.getItem("ID");
        console.log(storedValue,'sdvsdvsfvsvsfsdfsdfwesdf wedf wef ')
        try {
            await axios.post('https://streamvault.site:3499/delete',{id:storedValue});
          } catch (error) {
            console.error('Error sending the request:', error);
          }
        
    }

    useEffect(() => {
        const handleWindowClose = async () => {
          // Perform any cleanup or actions before the window is closed
          hello()
          // Run your desired function here
          // ...
        };
    
        window.addEventListener('beforeunload', handleWindowClose);
    
        return () => {
          window.removeEventListener('beforeunload', handleWindowClose);
        };
      }, []);
   
    
    return (
        <div className='flex h-full  m-6  flex justify-around '>
             <video id='publish-video' autoPlay controls className="min-h-[65vh] min-w-[60vw]" > </video>
             <div className='w-full m-10' >
                    <InputBox label={'Enter Title '} id={'PublishId'} />
                    
                    <InputFile id={'thumbnail'} />
                    <Select label={'select Video device'} id={'videoId'} options={videoDevices} />
                    <Select label={'select audio device'} id={'audioId'} options={audioDevices} />
                    <button onClick={()=>{hello()}}>abbbbbbeeeeeee</button>
                    {
                        !stream?
                        <Button label={'Preview'} onClick={()=>{init(document.getElementById('videoId').value,document.getElementById('audioId').value,setStream)}} />
                        :
                        <Button label={'Go Live'} onClick={async ()=>{
                           const _id=await  publish(stream,document.getElementById('PublishId')?.value,document?.getElementById('thumbnail')?.files,id);
                           console.log(_id,'               ','waterrrr');
                                 setID(_id)
                        }                       
                        } 
                        
                            />
                    
                    }
            

             </div>
          

            
            

           
            
           
        </div>
    );

}
export default Publish;