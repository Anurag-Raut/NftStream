import { useState } from "react";
import axios from 'axios'

function Upload(){
  const headers = {
    'Content-Type': 'multipart/form-data',
  };
    const [selectedFile, setSelectedFile] = useState(null);
    console.log(selectedFile);
    const handleFileChange = (event) => {
      setSelectedFile(event.target.files[0]);
    };
    const handleUpload = async() => {
      const formData = new FormData();
      formData.append('video', selectedFile);
      try {
        const response = axios.post(`https://streamvault.site:8003/upload`, formData, {
         
        });
    
        if (response.ok) {
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
      <div>
        
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
      </div>
    );
  


}
export default Upload;