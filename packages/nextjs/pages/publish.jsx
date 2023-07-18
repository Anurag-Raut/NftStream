import { useEffect, useState } from 'react';
import {getDevices, init, publish} from '../services/stream_functions/publish'
import uniqid from 'uniqid'
import InputBox from '../components/custom-Components/inputBox';
import { Button } from '../components/custom-Components/button';
import { InputFile } from '../components/custom-Components/InputFile';
import { Select } from '../components/custom-Components/select';
import axios from 'axios'
import { useLocalStorage } from 'usehooks-ts'
import Premium from '../components/custom-Components/premiumContent';
import { getTokenAddress } from '../services/web3/creator/creator';
function Publish(){
    let id= uniqid();
    const [thumbnail,setThumbnail]=useState(null);
    const [ID, setID] = useLocalStorage('ID', '')
    const [stream,setStream]=useState(null)
    const [audioDevices,setAudioDevices]=useState(['screen']);
    const [videoDevices,setVideoDevices]=useState(['none']);
    const [tokenAddress,setTokenAddress]=useState('');

    useEffect(()=>{
      async function getAdd(){
          const addr =await getTokenAddress();
          setTokenAddress(addr);
      }

      getAdd();

    

  },[])


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
    // console.log(stream);
    const hello= async ()=>{
        const storedValue = localStorage.getItem("ID");
        // console.log('helllooooooooooooooo')
      
        // console.log(JSON.parse(storedValue),'sdvsdvsfvsvsfsdfsdfwesdf wedf wef ')
        try {
            await axios.post('https://streamvault.site:3499/delete',{id:JSON.parse(storedValue)});
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
            <div>
            <video id='publish-video' autoPlay controls className="h-[55vh] min-w-[45vw]" > </video>
            <div className='flex'>
            <Select label={'select Video device'} id={'videoId'} options={videoDevices} />
                    <Select label={'select audio device'} id={'audioId'} options={audioDevices} />

            </div>
           
            </div>
             <div className='w-full m-10' >
                    <InputBox label={'Enter Title '} id={'PublishId'} />
                    <div className=' flex justify-around'>
                    <InputFile label={'Thumbnail'} id={'thumbnail'} file={thumbnail} onChange={setThumbnail}  />
                    <div>

                      <Premium />



                    {
                        !stream?
                        <Button label={'Preview'} onClick={()=>{init(document.getElementById('videoId').value,document.getElementById('audioId').value,setStream)}} />
                        :
                        <Button label={'Go Live'} onClick={async ()=>{
                           const _id=await  publish(stream,document.getElementById('PublishId')?.value,document?.getElementById('thumbnail')?.files,id,document.getElementById('premium-token')?.value,tokenAddress);

                                 setID(_id)
                        }                       
                        } 
                        
                            />
                    
                    }

                    </div>
                   
            

                    </div>
                    
                    
                   
                  

             </div>
          

            
            

           
            
           
        </div>
    );

}
export default Publish;