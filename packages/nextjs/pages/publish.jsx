import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { InputFile } from "../components/custom-Components/InputFile";
import Toggle from "../components/custom-Components/Toggle";
import Button from "../components/custom-Components/button";
import InputBox from "../components/custom-Components/inputBox";
import Premium from "../components/custom-Components/premiumContent";
import { Select } from "../components/custom-Components/select";
import { getDevices, init, publish } from "../services/stream_functions/publish";
import { getTokenAddress } from "../services/web3/creator/creator";
import { notification } from "../utils/scaffold-eth/notification";
import axios from "axios";
import uniqid from "uniqid";
import { useLocalStorage } from "usehooks-ts";
import { useAccount } from "wagmi";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

let id = uniqid();
function Publish() {
  const { address } = useAccount();
  const [live,setLive]=useState(0);
  const [thumbnail, setThumbnail] = useState(null);
  const [OBS, setOBS] = useState(0);
  const [ID, setID] = useLocalStorage("ID", "");
  const [stream, setStream] = useState(null);
  const [audioDevices, setAudioDevices] = useState(["screen"]);
  const [videoDevices, setVideoDevices] = useState(["none"]);
  const [tokenAddress, setTokenAddress] = useState("");

  useEffect(() => {
    async function getAdd() {
      try {
        const addr = await getTokenAddress();
        setTokenAddress(addr);
      } catch (error) {
        notification.error("helo");
        console.error(error);
      }
    }

    getAdd();
  }, []);

  useEffect(() => {
    async function get() {
      const { audioDevices, videoDevices } = await getDevices();
      if (audioDevices) {
        setAudioDevices([...audioDevices, "none"]);
      }
      if (videoDevices) {
        setVideoDevices([...videoDevices, "screen"]);
      }
    }
    get();

    // setVideoDevices([...videoDevices]);
  }, []);
  // console.log(stream);
  const Delete = async () => {
    const storedValue = localStorage.getItem("ID");
    // console.log('helllooooooooooooooo')

    // console.log(JSON.parse(storedValue),'sdvsdvsfvsvsfsdfsdfwesdf wedf wef ')
    try {
      await axios.post("https://streamvault.site:3499/delete", { id: JSON.parse(storedValue) });
    } catch (error) {
      console.error("Error sending the request:", error);
    }
  };

  useEffect(() => {
    const handleWindowClose = async () => {
      // Perform any cleanup or actions before the window is closed
      Delete();
      // Run your desired function here
      // ...
    };

    window.addEventListener("beforeunload", handleWindowClose);

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  }, []);

  return (
    <div>
      {
        live?
        <div className="bg-red-700 w-[60px] font-bold rounded-lg h-[25px]">Live</div>
        :
        null

      }

    <div className="flex h-full  m-6  flex justify-around ">
  
      <div>
        {OBS ? (
          <ReactPlayer
            width={"45vw"}
            height={"55vh"}
            muted={true}
            autoplay={true}
            url={`https://streamvault.site:8000/${address}/${id}/stream.m3u8`}
            className="m-2"
            playing={true}
            controls={true}
          />
        ) : (
          <video id="publish-video" autoPlay controls className="h-[55vh] min-w-[45vw]">
            {" "}
          </video>
        )}

        <div className="flex">
          {OBS ? (
            <div>
              <h1 className="text-xl font -bold">Steps to Stream From OBS : </h1>
              <ol className="flex flex-col items-start">
                <li>{"Open OBS , Go to Settings->Stream  "}</li>
                <li>{`paste this url in SERVER section - ${`rtmp://streamvault.site`}`}</li>
                <li>{`paste this in Stream Key section - ${address}/${id}`}</li>
              </ol>
            </div>
          ) : (
            <div className="flex">
              <Select label={"select Video device"} id={"videoId"} options={videoDevices} />
              <Select label={"select audio device"} id={"audioId"} options={audioDevices} />
            </div>
          )}
        </div>
      </div>
      <div className="w-full m-10">
        <Toggle label={"Stream through OBS"} setOBS={setOBS} />
        <InputBox label={"Enter Title "} id={"PublishId"} />
        <div className=" flex justify-around">
          <InputFile label={"Thumbnail"} id={"thumbnail"} file={thumbnail} onChange={setThumbnail} />
          <div className="flex flex-col justify-around">
            <Premium />
            <div>
              {!stream && !OBS ? (
                <Button
                  label={"Preview"}
                  onClick={() => {
                    init(document.getElementById("videoId").value, document.getElementById("audioId").value, setStream);
                  }}
                />
              ) : 
              live?(
                <Button label={'End Stream'} color={'red'} onClick={()=>{Delete();setStream(null);setLive(0);
                  
              }}  />
              )
              :
              (
                <Button
                  label={"Go Live"}
                  onClick={async () => {
                    const _id = await publish(
                      stream,
                      document.getElementById("PublishId")?.value,
                      document?.getElementById("thumbnail")?.files,
                      id,
                      document.getElementById("premium-token")?.value,
                      tokenAddress,
                      OBS,
                    );
                    setLive(1)
                    setID(_id);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
export default Publish;
