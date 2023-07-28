import { useState,useEffect } from "react";
import axios from 'axios'
import { InputFile } from "../components/custom-Components/InputFile";
import InputBox from "../components/custom-Components/inputBox";
import {sendVerificationRequestAndPost} from '../services/stream_functions/publish';
import uniqid from 'uniqid'
import Premium from "../components/custom-Components/premiumContent";
import { getTokenAddress } from "../services/web3/creator/creator";
import { notification } from "../utils/scaffold-eth/notification";
import Button from "../components/custom-Components/button";
import Progress from "../components/custom-Components/progess";

function Upload(){
  const [progress,setProgress]=useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [tokenAddress,setTokenAddress]=useState('')
    const [selectedThumbnail,setselectedThumbnail]=useState(null)

    useEffect(()=>{
      async function getAdd(){
          const addr =await getTokenAddress();
          setTokenAddress(addr);
      }

      getAdd();

    

  },[])

    // console.log(selectedFile);
 
    const handleUpload = async() => {
      const formData = new FormData();
      
      var id=uniqid();
        //
        try {
          const serverurl='https://streamvault.site:3499'
          console.log(document.getElementById('upload-title').value,'text')
          const payload = await sendVerificationRequestAndPost('anurag',document.getElementById('upload-title').value,document.getElementById('upload-thumbnail').files,id,false)
          // console.log(payload,selectedFile)
          payload.premiumTokens=document.getElementById('premium-token')?.value?document.getElementById('premium-token')?.value:0;

          payload.tokenAddress=tokenAddress;
          formData.append('video', selectedFile);
          formData.append('payload', JSON.stringify(payload));
          const response = await axios.post(serverurl+'/upload', formData, {
            onUploadProgress: (progressEvent) => {
              const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(percentage);
              // console.log(`Upload Progress: ${percentage}%`);
            },
          });

          // const dbResponse=await axios.post(serverurl+'/saveToDB',payload);

    
          if (response.status === 200) {
            console.log('Upload successful');
            // Handle successful upload
          } else {
            console.error('Upload failed');
            // Handle upload failure
          }
      } catch (error) {
       notification.error(error.message)
        // Handle error
      }
    };

    console.log(progress)
  
    return (
      <div className='flex m-5 w-[98vw] h-full justify-around'>
        <div className="w-[350px] h-[250px]">
        <InputFile id='upload-video' onChange={setSelectedFile} file={selectedFile} label={'Select Your Video'}/>
        <InputFile id='upload-thumbnail' file={selectedThumbnail} onChange={setselectedThumbnail} label={'Select Thubmbail for this video '}/>
        </div>

        <div className="w-[40vw] h-full">
        <InputBox id={'upload-title'} label={'Select title for this video '} />
        <Premium />
        {
          progress===0?
         null
          :
        
          <Progress progress={progress} />
          
        }
       
        <Button label={'Upload'} onClick={handleUpload}/>


        </div>
      
       
      </div>
    );
  


}
export default Upload;