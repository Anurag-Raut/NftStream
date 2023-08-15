import { useEffect, useState } from "react";
import Link from "next/link";
import { BlockieAvatar } from "../scaffold-eth";
import { getProfileDetails } from "~~/services/stream_functions/mongo";

export default function VideoCard({ image, title, id, creator, live, premiumTokens }) {
  // console.log(id,creator);
  const [profileData, setProfileData] = useState({});

  async function getData() {
    const pdata = await getProfileDetails(creator);
    if (pdata) {
      setProfileData(pdata);
      // console.log(pdata)
    }
  }
  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="  w-[330px] h-[200px] m-10  break-words">
      <Link href={`/view/${id}?live=${live}`}>
        {/* <p className="bg-red-600 w-[45px] font-bold rounded-lg  ">Live</p> */}
        <img className="w-full h-full rounded-lg" src={image} alt="" />
      </Link>

      <div className="flex mt-3">
        <Link href={`/profile?creator=${creator}`} className="w-[40px] h-[40px]">
          {profileData.channelImage ? (
            <img src={profileData.channelImage} className="rounded-full w-[36px] h-[36px] " alt="" />
          ) : (
            <BlockieAvatar address={creator} className="" />
          )}
        </Link>

        <h5 className="w-full text-left ml-3">
          <p className="font-bold m-0">{title?.slice(0,60)+( title?.length>60 ?'...':'')}</p>
          <div className="flex justify-between">
            {profileData?.channelName ? (
              <p className="m-0 text-gray-400 ">{profileData?.channelName}</p>
            ) : (
              <p className="m-0 text-gray-400 ">{creator.slice(0, 6) + "..."}</p>
            )}
            <div className="flex items-start">
              <p className="m-0 mr-2 text-gray-400">{Number(premiumTokens) * 0.001} eth</p>
              {live ? (
                <div className="bg-red-700 w-[50px] font-bold rounded-lg h-[25px] flex justify-center">Live</div>
              ) : null}
            </div>
          </div>
        </h5>
      </div>
    </div>
  );
}
