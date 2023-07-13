import { useState } from "react";


function Upload(){

    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
      setSelectedFile(event.target.files[0]);
    };
    const handleUpload = () => {
        const formData = new FormData();
        formData.append("video", selectedFile);
      
        const xhr = new XMLHttpRequest();
      
        xhr.open("POST", "https://streamvault.site:8003/upload");
      
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentage = (event.loaded / event.total) * 100;
            console.log(`Upload progress: ${percentage.toFixed(2)}%`);
          }
        });
      
        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
              console.log("Upload complete");
              // Handle successful upload
            } else {
              console.error("Upload failed");
              // Handle upload failure
            }
          }
        };
      
        xhr.send(formData);
      };
  
    return (
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
      </div>
    );
  


}
export default Upload;