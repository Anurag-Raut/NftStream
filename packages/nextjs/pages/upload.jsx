import { useState } from "react";
import axios from 'axios'
import { InputFile } from "../components/custom-Components/InputFile";
import InputBox from "../components/custom-Components/inputBox";
import {sendVerificationRequestAndPost} from '../services/stream_functions/publish';
import uniqid from 'uniqid'

function Upload(){
 
    const [selectedFile, setSelectedFile] = useState(null);
    console.log(selectedFile);
    const handleFileChange = (event) => {
      setSelectedFile(event.target.files[0]);
    };
    const handleUpload = async() => {
      const formData = new FormData();
      
      var id=uniqid();
        //
        try {
          const serverurl='https://streamvault.site:3499'

          const payload = await sendVerificationRequestAndPost('anurag',document.getElementById('upload-title').value,document.getElementById('upload-thumbnail').files,id,false)
          formData.append('video', selectedFile);
          formData.append('payload', JSON.stringify(payload));
          const response = await axios.post(serverurl+'/upload', formData, {
            onUploadProgress: (progressEvent) => {
              const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`Upload Progress: ${percentage}%`);
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
        console.error('Upload error:', error);
        // Handle error
      }
    };
  
    return (
      <div className='flex m-5 w-[98vw] h-full justify-around'>
        <div className="w-[350px] h-[250px]">
        <InputFile id='upload-video' onChange={handleFileChange} label={'Select Your Video'}/>
        <InputFile id='upload-thumbnail' onChange={handleFileChange} label={'Select Thubmbail for this video '}/>
        </div>

        <div className="w-[40vw] h-full">
        <InputBox id={'upload-title'} label={'Select title for this video '} />


        <button onClick={handleUpload}>Upload</button>


        </div>
      
       
      </div>
    );
  


}
export default Upload;