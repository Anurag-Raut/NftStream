import { notification } from '../../utils/scaffold-eth/notification';


const axios =require('axios');
var uniqid = require('uniqid'); 
require('dotenv').config()
const { Web3Storage  ,getFilesFromPath ,File } = require('web3.storage');
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDY2MmMzMzA3OTkxRmM0Nzg0NzNmMmMwMDFmNzBCMGFFQTE2ZjM0NzEiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzczNDIxNDI0NTAsIm5hbWUiOiJzdG9yZTIifQ.K2OCaGVt86PlyD7Tyq71NMCrxwuxK9xmflbYNe0_cIo";

const web3Client = new Web3Storage({token:token});
const ethers = require('ethers');
const INITIALIZING = 0;
const DEVICE = 1;
const TRANSMITTING = 2;
const io=require('socket.io-client');




async function UploadToIPFS(files){
  
    const cid = await web3Client.put(files) 
    return 'https://'+cid+'.ipfs.w3s.link/'+files[0].name;  

}



const onPublish = (_video,_audio,setStream) => {
    const videoId = _video;
    const audioId = _audio;

    if (videoId !== 'screen') {
        let video = false;
        if (videoId !== 'none') {
            video = {
                deviceId: videoId,
            };
        }

        let audio = false;

        if (audioId !== 'none') {
            audio = {
                deviceId: {exact:audioId},
            };

            // const voice = document.getElementById('audio_voice').checked;
            // if (!voice) {
            //     audio.autoGainControl = false;
            //     audio.echoCancellation = false;
            //     audio.noiseSuppression = false;
            // }
        }

        navigator.mediaDevices.getUserMedia({ video, audio })
        .then((stream)=>{
            console.log(stream,'strea')
            setStream(stream);
            document.getElementById('publish-video').srcObject = stream;
     
        });
    } else {
        navigator.mediaDevices.getDisplayMedia({
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: 30 },
                cursor: "always",
            },
            audio: false,
        })
            .then((stream)=>{
                setStream(stream);
                document.getElementById('publish-video').srcObject = stream;
             
            });
    }
};

const populateCodecs = () => {
    const pc = new RTCPeerConnection({});
    pc.addTransceiver("video", { direction: 'sendonly' });
    pc.addTransceiver("audio", { direction: 'sendonly' });

    return pc.createOffer()
        .then((desc) => {

          

            pc.close();
        });
};
const  initialize = async () => {
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(() => Promise.all([
            // populateDevices(),
            populateCodecs(),
        ]))
      
};



async function signMessageWithMetaMask(message) {
    // Prompt user to connect to MetaMask
    await window.ethereum.enable();
    const provider = new ethers.BrowserProvider(window.ethereum);
    
  
  const signer = await provider.getSigner();
  const selectedAddress = await signer.getAddress();
  
    const signature = await signer.signMessage(message);
    return {signature,selectedAddress};
  }

  async function sendVerificationRequestAndPost( message,title,thumbnail,publishId,live) {
    const {selectedAddress,signature}= await signMessageWithMetaMask(message)
    console.log(selectedAddress,signature)
    let thumbnail_url=await UploadToIPFS(thumbnail)

   



  
const payload = {
    publishId: publishId,
    live: live,
    creator: selectedAddress,
    thumbnail: thumbnail_url,
    title: title,
    signature: signature,
    message: message
  };

  return payload;
 
  }

  async function getDevices(){
    var audioDevices = [];
    var videoDevices = [];
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        // Enumerate devices
        const devices =await navigator.mediaDevices.enumerateDevices()
         
            
           
      
            // Iterate over the list of devices
            devices.forEach(function(device) {
              if (device.kind === 'audioinput') {
                audioDevices.push(device);
              } else if (device.kind === 'videoinput') {
                videoDevices.push(device);
              }
            });
           
      
          
  
        
 
      } 
      console.log(audioDevices)
   

      return {audioDevices:audioDevices,videoDevices:videoDevices};
  }

  async function publishHelper(payload){
    console.log(payload,'payload')
    let url;
   url='https://streamvault.site:3499/publish';
    
      try {
          const response=await axios.post(url, payload)
         
        const result = response.data;
        console.log('Verification result:', result);
        return {result:result.verified,address:payload.creator}
      } catch (error) {
        notification.error(error.message)
          return Promise.reject(error);
      }
   

  }

  let mediaRecorder;
  let socket;


  function startStreaming(stream,publishId){
   
     socket=io.connect('https://streamvault.site:3499', { query: { id: publishId } });
    // let combined = new MediaStream([...stream.getTracks()]);

 console.log(publishId,'publishId')
//  socket.emit('publishId',{publishId:publishId});
 mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm; codecs=h264,opus',
    // Audio bitrate (adjust as needed)
    audioBitsPerSecond: 128000,
    videoBitsPerSecond: 2500000,
  });
 
   
     mediaRecorder.start(1000);
     mediaRecorder.ondataavailable= (event) => {
         console.log(event);
         if (event.data.size > 0) {
            socket.emit('stream', {data:event.data,id:publishId});
         }
     }



}


function stopStreaming(stream){
   

    mediaRecorder.stop();
    socket.disconnect();
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    document.getElementById('publish-video').srcObject = null;


}
  

  async function publish(stream, title, thumbnail, id,premiumTokens,tokenAddress,OBS) {
    console.log(premiumTokens,'premiumtokens');
    try {
      const payload = await sendVerificationRequestAndPost(
        'anurag',
        title,
        thumbnail,
        id,
        true
      );


      if(premiumTokens){
        payload.premiumTokens=Number(premiumTokens);

      }
      else{
        
            payload.premiumTokens=Number(0);
    
          
      }
      if(tokenAddress){
        payload.tokenAddress=tokenAddress;
      }
      else{
        payload.premiumTokens=0;

      }
      
      const { result, address } = await publishHelper(payload);
      
      if (!result) {
        console.error('not verified');
        return;
      }
      if(!OBS){
        startStreaming(stream, `${id}`);
      }
  
      
      return `${address}/${id}`;
    } catch (error) {
        notification.error(error.message)
      console.error(error);
    }
  }

 function init(video,audio,setStream){

    try{
        initialize().then(()=>{
            onPublish(video,audio,setStream)
        })


    }
    catch(error){
        notification.error(error.message)
        console.error(error);
    }
   
     
   

   
}

export  {getDevices,publish,init,sendVerificationRequestAndPost,UploadToIPFS,stopStreaming};