import { useEffect, useState } from "react";
// import { joinRoom,getMessage } from '../../services/Chat/chat';
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import Chat from "../../components/chat/chat";
import Modal from "../../components/custom-Components/Modal/Modal";
import Toggle from "../../components/custom-Components/Modal/toggle";
import Button from "../../components/custom-Components/button";
import SubbscribeComponent from "../../components/custom-Components/subscribe";
import WebRTCVideoPlayer from "../../components/custom-Components/videoPlayer";
import HlsVideoPlayer from "../../components/custom-Components/videoPlayer";
import { BlockieAvatar } from "../../components/scaffold-eth";
import contracts from "../../generated/deployedContracts";
import { useScaffoldContractRead } from "../../hooks/scaffold-eth/useScaffoldContractRead";
import { getVideoById } from "../../services/stream_functions/mongo";
import { read } from "../../services/stream_functions/read";
import { getBalance, getTokenAddressByAddress } from "../../services/web3/creator/creator";
import { useIsMounted } from "usehooks-ts";
import { useContractRead } from "wagmi";
import { useAccount } from "wagmi";
import HomePage from "../homepage";

const { File } = require("web3.storage");
const { createClient } = require("web3.storage");

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });
function View() {
  const [isSubscribe, setSubscibe] = useState(0);

  const { address, isConnecting, isDisconnected } = useAccount();
  const [url, setUrl] = useState("");

  const router = useRouter();
  const [visible, setVisible] = useState(0);
  const [videoData, setVideoData] = useState({});
  const [tokenAddress, setTokenAddress] = useState("");

  const [mute, setMuted] = useState(true);

  const { id, live } = router.query;

  const { creator } = router.query;
  let ID = "";
  if (id) {
    ID = id[0] + "/" + id[1];
  }
  console.log(url, "urllll");
  async function add() {
    if (!id) {
      return;
    }
    if (live === "true" && id) {
      setUrl(`https://streamvault.site:8000/${id[0]}/${id[1]}/stream.m3u8`);
    } else if (id) {
      setUrl(`https://streamvault.site/${id[1]}/${id[1]}.m3u8`);
    }

    if (id) {
      ID = id[0] + "/" + id[1];
    }
    // console.log(id,"IDDDDDDDD");

    const videoData = await getVideoById(ID);

    const data = videoData?.data?.result;
    if (!data) {
      return;
    }
    // console.log(data,'data');
    const _addr = await getTokenAddressByAddress(data?.creator);
    setTokenAddress(_addr);
    setVideoData(data);
    const balance = await getBalance(_addr);
    // console.log(balance);
    if (balance && balance >= Number(videoData.premiumTokens)) {
      setVisible(true);
    }
  }

  useState(() => {
    add();
  }, [creator, address, router.events, ID]);

  useEffect(() => {
    // router.events.on('routeChangeComplete', add());

    // // Remove the event listener when the component is unmounted
    // return () => {
    //   router.events.off('routeChangeComplete', add());
    // };
    add();
  }, [router.events, ID]);

  // console.log(tokenAddress,'tokenAddress', contracts[80001][0].contracts.Creator.abi)

  const { data: balance } = useScaffoldContractRead({
    contractName: "Creator",
    functionName: "balanceOf",
    args: [address],
    address: tokenAddress,
    watch: true,
  });

  useEffect(() => {
    if (balance && Number(balance) >= Number(videoData.premiumTokens)) {
      setVisible(true);
    } else if (videoData?.premiumTokens === 0) {
      // console.log('hellou',balance)
      setVisible(true);
    } else {
      // console.log('nuuuuuu')

      setVisible(false);
    }
  }, [balance, videoData]);

  //   console.log(balance,'balance',videoData.premiumTokens)

  return (
    <div className=" h-full min-h-screen ">
      <div className="flex ml-3 mt-0  flex justify-between">
        <>
          <div className="flex flex-col contents-left">
            {visible ? (
              <HlsVideoPlayer width={"60vw"} height={"500px"} url={url} />
            ) : (
              <Modal
                videoData={videoData}
                RemainingBalance={videoData.premiumTokens - Number(balance)}
                tokenAddress={tokenAddress}
                address={address}
              />
            )}

            <div className="mt-5">
              <h1 className=" ml-5 pr-9 text-3xl w-full flex items-left text-left font-bold break-words">
                {videoData?.title}
              </h1>
              <div className="flex justify-between w-full">
                <Link className="w-fit" href={`/profile?creator=${videoData?.creator}`}>
                  {videoData?.channelImage ? (
                    <img src={videoData?.channelImage} className="w-[40px] h-[40px] rounded-full " alt="" />
                  ) : (
                    <BlockieAvatar address={videoData?.creator} />
                  )}
                  <div className="flex w-full justify-between">
                    <div>{videoData?.creator}</div>
                  </div>
                </Link>
                {address ? <SubbscribeComponent creator={videoData?.creator} /> : null}
              </div>
            </div>
          </div>
        </>

        <Chat id={ID} />
      </div>

      <div className="divider"></div> 
      
      <div className="w-full">
        <h1 className="text-4xl font-bold mb-6 text-left"> Videos from {videoData?.creator?.slice(0,20)+'...'} - </h1>
        <HomePage creator={id[0]} />
      </div>
    </div>
  );
}
export default View;
