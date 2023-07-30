
import { useReadLocalStorage } from "usehooks-ts";
import {useIsMounted} from 'usehooks-ts'
import Hls from 'hls.js';
import { useEffect } from "react";

const HlsVideoPlayer = ({url,width,height}) => {
    const isMounted=useIsMounted();
  const videoRef = useReadLocalStorage(null);
  function Load(){
  
    var video = document.getElementById('HlsVideoPlayer');
    // const video = videoRef?.current;

    if (Hls.isSupported()) {
      const hls = new Hls();
      console.log('hello');
      hls.loadSource(url);
      hls.attachMedia(video);
      video.muted=0;

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    }

  }

  useEffect(()=>{
    Load();
  },[isMounted])

  console.log(width);

  

  return (
    <div className="h-fit w-fit">
      <video autoPlay className={`w-[${width}] h-[${height}]`} id='HlsVideoPlayer' ref={videoRef} controls />
    
    </div>
  );
};

export default HlsVideoPlayer;
