const ethers = require('ethers');
const INITIALIZING = 0;
const DEVICE = 1;
const TRANSMITTING = 2;

let state = INITIALIZING;

const setState = (newState) => {
    state = newState;

    switch (state) {
    case DEVICE:
        // document.getElementById("initializing").style.display = 'none';
        // document.getElementById("device").style.display = 'flex';
        // document.getElementById("transmitting").style.display = 'none';
        break;

    case TRANSMITTING:
        // document.getElementById("initializing").style.display = 'none';
        // document.getElementById("device").style.display = 'none';
        // document.getElementById("transmitting").style.display = 'flex';
        break;
    }
};

const restartPause = 2000;

const unquoteCredential = (v) => (
    JSON.parse(`"${v}"`)
);

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
    }

    return sections.join('m=');
};

class Transmitter {
   
    constructor(stream,publishId) {
        console.log(publishId);
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
        console.log(  document.getElementById('video_codec').value,'vvvvvvvvvvvvvvvvaaaalllllllluuuuuuuuuuuuueeeeeeeeeeeee');

        answer = new RTCSessionDescription({
            type: 'answer',
            sdp: editAnswer(
                answer.sdp,
                'h264/90000',
                'OPUS',
                '20000',
                32,
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
    setState(TRANSMITTING);
    
    document.getElementById('publish-video').srcObject = stream;
    new Transmitter(stream,publishId);
};

const onPublish = (publishId) => {
    const videoId = 'screen';
    const audioId = 'none';

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

            const voice = document.getElementById('audio_voice').checked;
            if (!voice) {
                audio.autoGainControl = false;
                audio.echoCancellation = false;
                audio.noiseSuppression = false;
            }
        }

        navigator.mediaDevices.getUserMedia({ video, audio })
        .then((stream)=>{
            onTransmit(stream,publishId)
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
                onTransmit(stream,publishId)
            });
    }
};

// const populateDevices = () => {
//     return navigator.mediaDevices.enumerateDevices()
//         .then((devices) => {
//             for (const device of devices) {
//                 switch (device.kind) {
//                 case 'videoinput':
//                     {
//                         const opt = document.createElement('option');
//                         opt.value = device.deviceId;
//                         opt.text = device.label;
//                         document.getElementById('video_device').appendChild(opt);
//                     }
//                     break;

//                 case 'audioinput':
//                     {
//                         const opt = document.createElement('option');
//                         opt.value = device.deviceId;
//                         opt.text = device.label;
//                         document.getElementById('audio_device').appendChild(opt);
//                     }
//                     break;
//                 }
//             }

//             // add screen
//             const opt = document.createElement('option');
//             opt.value = "screen";
//             opt.text = "screen";
//             document.getElementById('video_device').appendChild(opt);

//             // set default
//             document.getElementById('video_device').value = document.getElementById('video_device').children[1].value;
//             if (document.getElementById('audio_device').children.length > 1) {
//                 document.getElementById('audio_device').value = document.getElementById('audio_device').children[1].value;
//             }
//         });
// };

const populateCodecs = () => {
    const pc = new RTCPeerConnection({});
    pc.addTransceiver("video", { direction: 'sendonly' });
    pc.addTransceiver("audio", { direction: 'sendonly' });

    return pc.createOffer()
        .then((desc) => {
            const sdp = desc.sdp.toLowerCase();

            // for (const codec of ['h264/90000']) {
            //     if (sdp.includes(codec)) {
            //         // const opt = document.createElement('option');
            //         // opt.value = codec;
            //         // opt.text = codec.split('/')[0].toUpperCase();
            //         // document.getElementById('video_codec').appendChild(opt);
            //     }
            // }
            // for (const codec of ['opus/48000', 'g722/8000', 'pcmu/8000', 'pcma/8000']) {
            //         if (sdp.includes(codec)) {
            //             // const opt = document.createElement('option');
            //             // opt.value = codec;
            //             // opt.text = codec.split('/')[0].toUpperCase();
            //             // document.getElementById('audio_codec').appendChild(opt);
            //         }
            //     }

          

            pc.close();
        });
};
const  initialize = async () => {
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(() => Promise.all([
            // populateDevices(),
            populateCodecs(),
        ]))
        .then(() => {
            setState(DEVICE);
        });
};

const serverUrl='http://localhost:3500'

async function signMessageWithMetaMask(message) {
    // Prompt user to connect to MetaMask
    await window.ethereum.enable();
    const provider = new ethers.BrowserProvider(window.ethereum);
    
  
  const signer = await provider.getSigner();
  const selectedAddress = await signer.getAddress();
  
    const signature = await signer.signMessage(message);
    return {signature,selectedAddress};
  }

  async function sendVerificationRequest( message) {
    const {selectedAddress,signature}= await signMessageWithMetaMask(message)
    console.log(selectedAddress,signature)
    const payload = {
      publicAddress: selectedAddress,
      message: message,
      signature:signature
    };
  
    try {
      const response = await fetch(`${serverUrl}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
  
      const result = await response.json();
      console.log('Verification result:', result);
      return result
    } catch (error) {
        return Promise.reject(error);
    }
  }
  

export function publish(publishId){

    try{
        sendVerificationRequest('anurag').then((result)=>{
            if(!result){
                console.error('not verified');
                return;
            }
            initialize().then(()=>{
                onPublish(publishId)
            })
               
    
        })


    }
    catch(error){
        console.error(error);
    }
   
     
   

   
}
export {initialize};
