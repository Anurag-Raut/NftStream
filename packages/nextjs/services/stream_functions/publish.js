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

const unquoteCredential = (v) => (
    JSON.parse(`"${v}"`)
);


async function UploadToIPFS(files){
  


 
   
    // const fileInput = document.querySelector('input[type="file"]')
    // console.log(files,'abbbbbeeeeeeeee');
    // Pack files into a CAR and send to web3.storage
    const cid = await web3Client.put(files) 
    return 'https://'+cid+'.ipfs.w3s.link/'+files[0].name;  

}



const linkToIceServers = (links) => (
    (links !== null) ? links.split(', ').map((link) => {
        const m = link.match(/^<(.+?)>; rel="ice-server"(; username="(.*?)"; credential="(.*?)"; credential-type="password")?/i);
        const ret = {
            urls: [m[1]],
        };

        if (m[3] !== undefined) {
            ret.username = unquoteCredential(m[3]);
            ret.credential = unquoteCredential(m[4]);
            ret.credentialType = "password";
        }

        return ret;
    }) : []
);

const parseOffer = (offer) => {
    const ret = {
        iceUfrag: '',
        icePwd: '',
        medias: [],
    };

    for (const line of offer.split('\r\n')) {
        if (line.startsWith('m=')) {
            ret.medias.push(line.slice('m='.length));
        } else if (ret.iceUfrag === '' && line.startsWith('a=ice-ufrag:')) {
            ret.iceUfrag = line.slice('a=ice-ufrag:'.length);
        } else if (ret.icePwd === '' && line.startsWith('a=ice-pwd:')) {
            ret.icePwd = line.slice('a=ice-pwd:'.length);
        }
    }

    return ret;
};

const generateSdpFragment = (offerData, candidates) => {
    const candidatesByMedia = {};
    for (const candidate of candidates) {
        const mid = candidate.sdpMLineIndex;
        if (candidatesByMedia[mid] === undefined) {
            candidatesByMedia[mid] = [];
        }
        candidatesByMedia[mid].push(candidate);
    }

    let frag = 'a=ice-ufrag:' + offerData.iceUfrag + '\r\n'
        + 'a=ice-pwd:' + offerData.icePwd + '\r\n';

    let mid = 0;

    for (const media of offerData.medias) {
        if (candidatesByMedia[mid] !== undefined) {
            frag += 'm=' + media + '\r\n'
                + 'a=mid:' + mid + '\r\n';

            for (const candidate of candidatesByMedia[mid]) {
                frag += 'a=' + candidate.candidate + '\r\n';
            }
        }
        mid++;
    }

    return frag;
};

const setCodec = (section, codec) => {
    const lines = section.split('\r\n');
    const lines2 = [];
    const payloadFormats = [];

    for (const line of lines) {
        if (!line.startsWith('a=rtpmap:')) {
            lines2.push(line);
        } else {
            if (line.toLowerCase().includes(codec)) {
                payloadFormats.push(line.slice('a=rtpmap:'.length).split(' ')[0]);
                lines2.push(line);
            }
        }
    }

    const lines3 = [];

    for (const line of lines2) {
        if (line.startsWith('a=fmtp:')) {
            if (payloadFormats.includes(line.slice('a=fmtp:'.length).split(' ')[0])) {
                lines3.push(line);
            }
        } else if (line.startsWith('a=rtcp-fb:')) {
            if (payloadFormats.includes(line.slice('a=rtcp-fb:'.length).split(' ')[0])) {
                lines3.push(line);
            }
        } else {
            lines3.push(line);
        }
    }

    return lines3.join('\r\n');
};

const setVideoBitrate = (section, bitrate) => {
    let lines = section.split('\r\n');

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('c=')) {
            lines = [...lines.slice(0, i+1), 'b=TIAS:' + (parseInt(bitrate) * 1024).toString(), ...lines.slice(i+1)];
            break
        }
    }

    return lines.join('\r\n');
};

const setAudioBitrate = (section, bitrate, voice) => {
    let opusPayloadFormat = '';
    let lines = section.split('\r\n');

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('a=rtpmap:') && lines[i].toLowerCase().includes('opus/')) {
            opusPayloadFormat = lines[i].slice('a=rtpmap:'.length).split(' ')[0];
            break;
        }
    }

    if (opusPayloadFormat === '') {
        return section;
    }

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('a=fmtp:' + opusPayloadFormat + ' ')) {
            if (voice) {
                lines[i] = 'a=fmtp:' + opusPayloadFormat + ' minptime=10;useinbandfec=1;maxaveragebitrate='
                    + (parseInt(bitrate) * 1024).toString();
            } else {
                lines[i] = 'a=fmtp:' + opusPayloadFormat + ' maxplaybackrate=48000;stereo=1;sprop-stereo=1;maxaveragebitrate'
                    + (parseInt(bitrate) * 1024).toString();
            }
        }
    }

    return lines.join('\r\n');
};

const editAnswer = (answer, videoCodec, audioCodec, videoBitrate, audioBitrate, audioVoice) => {
    const sections = answer.split('m=');

    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (section.startsWith('video')) {
            sections[i] = setVideoBitrate(setCodec(section, videoCodec), videoBitrate);
        } 
        else if (section.startsWith('audio')) {
            console.log('audioooooo')
            sections[i] = setAudioBitrate(setCodec(section, audioCodec), audioBitrate, audioVoice);
        }
    }

    return sections.join('m=');
};

class Transmitter {
   
    constructor(stream,publishId) {
        // console.log(publishId);
        this.stream = stream;
		this.pc = null;
		this.restartTimeout = null;
        this.eTag = '';
        this.queuedCandidates = [];
        this.publishId=publishId;
		this.start();
    }

  
    start() {
        console.log(`https://streamvault.site:8001/${this.publishId}/publish`);
        console.log("requesting ICE servers");

        fetch(new URL('whip', `https://streamvault.site:8001/${this.publishId}/publish`) , {
            method: 'OPTIONS',
        })
            .then((res) => this.onIceServers(res))
            .catch((err) => {
                console.log('error: ' + err);
             notification.error(err.message)
                this.scheduleRestart();
            });
    }

    onIceServers(res) {
        console.log(res.headers.get('Link'),'lINKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk');
        this.pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        this.pc.onicecandidate = (evt) => this.onLocalCandidate(evt);
        this.pc.oniceconnectionstatechange = () => this.onConnectionState();

        this.stream.getTracks().forEach((track) => {
            this.pc.addTrack(track, this.stream);
        });

        this.pc.createOffer()
            .then((offer) => this.onLocalOffer(offer));
    }

    onLocalOffer(offer) {
        this.offerData = parseOffer(offer.sdp);
        this.pc.setLocalDescription(offer);

        console.log("sending offer");

        fetch(new URL('whip', `https://streamvault.site:8001/${this.publishId}/publish`) , {
            method: 'POST',
            headers: {
                'Content-Type': 'application/sdp',
            },
            body: offer.sdp,
        })
            .then(async (res) => {
               
                if (res.status !== 201) {
                    throw new Error('bad status code');
                }
                this.eTag = res.headers.get('E-Tag');
                const a= await res.text();
                // console.log('a',a);
                return a;
            })
            .then((sdp) =>{ 
                console.log('hello',sdp);
            this.onRemoteAnswer(new RTCSessionDescription({
                type: 'answer',
                sdp,
            }))})
            .catch((err) => {
                console.error('error: ' + err);
             notification.error(err.message)
                this.scheduleRestart();
            });
    }

    onConnectionState() {
        if (this.restartTimeout !== null) {
            return;
        }

        console.log("peer connection state:", this.pc.iceConnectionState);

        switch (this.pc.iceConnectionState) {
        case "disconnected":
            this.scheduleRestart();
        }
    }

    onRemoteAnswer(answer) {
		if (this.restartTimeout !== null) {
			return;
		}
        // console.log(  document.getElementById('video_codec').value,'vvvvvvvvvvvvvvvvaaaalllllllluuuuuuuuuuuuueeeeeeeeeeeee');

        answer = new RTCSessionDescription({
            type: 'answer',
            sdp: editAnswer(
                answer.sdp,
                'h264/90000',
                'opus/48000',
                '10000',
                '32',
                true,
            ),
        });

        this.pc.setRemoteDescription(new RTCSessionDescription(answer));

        if (this.queuedCandidates.length !== 0) {
            this.sendLocalCandidates(this.queuedCandidates);
            this.queuedCandidates = [];
        }
	}

    onLocalCandidate(evt) {
        if (this.restartTimeout !== null) {
            return;
        }

        if (evt.candidate !== null) {
            if (this.eTag === '') {
                this.queuedCandidates.push(evt.candidate);
            } else {
                this.sendLocalCandidates([evt.candidate])
            }
        }
    }

    sendLocalCandidates(candidates) {
        fetch(new URL('whip', `https://streamvault.site:8001/${this.publishId}/publish`) , {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/trickle-ice-sdpfrag',
                'If-Match': this.eTag,
            },
            body: generateSdpFragment(this.offerData, candidates),
        })
            .then((res) => {
                if (res.status !== 204) {
                    throw new Error('bad status code');
                }
            })
            .catch((err) => {
                console.log('error: ' + err);
             notification.error(err.message)
                this.scheduleRestart();
            });
    }

    scheduleRestart() {
        if (this.restartTimeout !== null) {
            return;
        }

        if (this.pc !== null) {
            this.pc.close();
            this.pc = null;
        }

        this.restartTimeout = window.setTimeout(() => {
            this.restartTimeout = null;
            this.start();
        }, restartPause);

        this.eTag = '';
        this.queuedCandidates = [];
    }
}

const onTransmit = (stream,publishId) => {

    
  
    new Transmitter(stream,publishId);
};

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
                deviceId: audioId,
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
                audioDevices.push(device.label);
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
