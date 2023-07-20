import Link from "next/link";
import { BlockieAvatar } from "../scaffold-eth";
import { getProfileDetails } from "~~/services/stream_functions/mongo";
import { useEffect, useState } from "react";




export default function VideoCard({image,title,id,creator,live}){
    // console.log(id,creator);
    const [profileData,setProfileData]=useState({});
    
    async function getData(){
        const pdata=await getProfileDetails(creator);
        if(pdata ){
            setProfileData(pdata)
            console.log(pdata)
        }

    }
    useEffect(()=>{
        getData()
    },[])

    return(
        <div  className="  w-[300px] h-[220px] m-10  break-words">
            <Link href={`/view/${id}?live=${live}`} >
                {/* <p className="bg-red-600 w-[45px] font-bold rounded-lg  ">Live</p> */}
            <img  className="w-full h-full rounded-lg" src={image} alt="" />
            </Link>
          
            <div className="flex mt-3">
                <Link href={`/profile?creator=${creator}`} className="w-[40px] h-[40px]" >

                {
                 profileData.channelImage?
                 <img src={profileData.channelImage} className="rounded-full w-[36px] h-[36px] " alt="" />
                 :
                <BlockieAvatar  className='' />
            }

                </Link>
           
            <h5 className="w-full text-left ml-3">
                <p className="font-bold m-0">{title}</p>
                {
                    profileData.channelName?
                    <p className="m-0 text-gray-400 ">{profileData.channelName}</p>
                    :
                    <p className="m-0 text-gray-400 ">{creator.slice(0,6)+'...'}</p>

                }
              
            </h5>


            </div>
           

        </div>

    )


}