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

let state = INITIALIZING;

// socket.setMaxListeners(Infinity);

const restartPause = 2000;



async function UploadToIPFS(files){
  


 
   
    // const fileInput = document.querySelector('input[type="file"]')
    // console.log(files,'abbbbbeeeeeeeee');
    // Pack files into a CAR and send to web3.storage
    const cid = await web3Client.put(files) 
    return 'https://'+cid+'.ipfs.w3s.link/'+files[0].name;  

}

function hello(selectedDevice){
  let audioContext;
    let analyser;
    let microphone;

    const startAudioMonitoring = async () => {
      try {
        if (!selectedDevice) return;
        
        const constraints = {
          audio: {
            deviceId: { exact: selectedDevice },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);

        microphone.connect(analyser);
        analyser.connect(audioContext.destination);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateAudioLevel = () => {
          analyser.getByteFrequencyData(dataArray);

          const sum = dataArray.reduce((acc, value) => acc + value, 0);
          const avg = sum / dataArray.length;
          setAudioLevel(avg);
          
          requestAnimationFrame(updateAudioLevel);
        };

        updateAudioLevel();
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    startAudioMonitoring();

}

const onPublish = async (_video,_audio,setStream) => {
    const videoId = _video;
    const audioId = _audio;
    console.log(audioId,'idd audioooo',videoId)

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
         
              deviceId: { exact: _audio },
     
          };

            // const voice = document.getElementById('audio_voice').checked;
            // if (!voice) {
                audio.autoGainControl = false;
                audio.echoCancellation = false;
                audio.noiseSuppression = false;
            // }
        }

        console.log(audioId,'audioId');
        const stream = await navigator.mediaDevices.getUserMedia({video,audio});
        // startAudioMonitoring('',stream)
      // const updateMeterInterval = setInterval(() => {
        // console.log(audioId)
                    setStream(stream);
            document.getElementById('publish-video').srcObject = stream;
        // updateVolumeMeter(stream);
    // }, 1000); // Update every 1 second





        // navigator.mediaDevices.getUserMedia({ video:false, audio })
        // .then((stream)=>{
        //     console.log(stream,'strea')
        //     updateVolumeMeter(stream);
         
        //     setStream(stream);
        //     document.getElementById('publish-video').srcObject = stream;
     
        // });
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
    // await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    //     .then(() => Promise.all([
    //         // populateDevices(),
    //         // populateCodecs(),
    //     ]))
      
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
                audioDevices.push(device.deviceId);
              } else if (device.kind === 'videoinput') {
                videoDevices.push(device.label);
              }
            });
           
      
          
  
        
 
      } 
      console.log(audioDevices)
   

      return {audioDevices:audioDevices,videoDevices:videoDevices};
  }

  async function publishHelper(payload){
    console.log(payload,'payload')
    let url;
   url='http://localhost:3500/publish';
    
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
   
     socket=io.connect('http://localhost:3500', { query: { id: publishId } });
    // let combined = new MediaStream([...stream.getTracks()]);

 console.log(publishId,'publishId')
//  socket.emit('publishId',{publishId:publishId});
 mediaRecorder = new MediaRecorder(stream, {
    audioBitsPerSecond: 128000,
    videoBitsPerSecond: 2500000,
    mimeType: "video/webm; codecs=h264,opus",
  });
  
 
   
     mediaRecorder.start(1000);
     mediaRecorder.ondataavailable= (event) => {
         console.log(event);
       

       
        // Display live audio levels
        // console.log(`Live Audio Level: ${average}`);

         if (event.data.size > 0) {
            socket.emit('stream', {data:event.data,id:publishId});
         }
     }



}


function stopStreaming(publishId){
   

    mediaRecorder.stop();
    socket.disconnect();

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
      
    //   const { result, address } = await publishHelper(payload);
      const result=1;
      const address='0x00';
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

export async function getAudioInputDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices = devices.filter(device => device.kind === 'audioinput');
    return audioDevices;
  } catch (error) {
    console.error('Error enumerating audio devices:', error);
    return [];
  }
}

export async function startAudioMonitoring(selectedDevice,stream) {
  try {
    console.log(selectedDevice)
    const constraints = {
      audio: {
        deviceId: { exact: selectedDevice },
      },
    };

    // const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // let socket=io.connect('http://localhost:3500', { query: { id: 'd' } });
    // let combined = new MediaStream([...stream.getTracks()]);

//  console.log(publishId,'publishId')
//  socket.emit('publishId',{publishId:publishId});
//  let mediaRecorder = new MediaRecorder(stream, {
//     audioBitsPerSecond: 128000,
//     videoBitsPerSecond: 2500000,
//     mimeType: "video/webm; codecs=h264,opus",
//   });
  
 
   
    //  mediaRecorder.start(1000);
    //  mediaRecorder.ondataavailable= (event) => {
    //      console.log(event);
       

       
    //     // Display live audio levels
    //     // console.log(`Live Audio Level: ${average}`);

    //      if (event.data.size > 0) {
    //         socket.emit('stream', {data:event.data,id:'publishId'});
    //      }
    //  }




    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);

    microphone.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);

      const sum = dataArray.reduce((acc, value) => acc + value, 0);
      const avg = sum / dataArray.length;
      // setAudioLevel(avg);
      console.log(avg)

      requestAnimationFrame(updateAudioLevel);
    };

    updateAudioLevel();

    return { microphone, analyser, audioContext };
  } catch (error) {
    console.error('Error starting audio monitoring:', error);
    return null;
  }
}

export function stopAudioMonitoring(microphone, analyser, audioContext) {
  try {
    if (microphone) microphone.disconnect();
    if (analyser) analyser.disconnect();
    if (audioContext) audioContext.close();
  } catch (error) {
    console.error('Error stopping audio monitoring:', error);
  }
}



export  {getDevices,publish,init,sendVerificationRequestAndPost,UploadToIPFS,stopStreaming};
