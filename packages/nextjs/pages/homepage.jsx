import Link from "next/link";
import dynamic from "next/dynamic";
import {fetchFromDB } from '../services/stream_functions/mongo'
import { BugAntIcon, MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { useLocalStorage } from 'usehooks-ts'
import { useEffect, useState } from "react";
import VideoCard from '../components/custom-Components/videoCard'

// const SideBar = dynamic(() => import("../components/custom-Components/SideBar/sidebar"), { ssr: false });
const HomePage = () => {
  const[videos,setVideos]=useState([]);

  useEffect(()=>{

    async function getItems(){

      let _items= await fetchFromDB(1,10);

      let items=_items?.data?.result
   
         setVideos([...videos,  ...items]);
    }
    
    
      getItems();
    // console.log(_items);
   
  },[])
  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">

    {
      videos.map((video)=>{

        return (
      
          <VideoCard key={video._id} id={video._id} creator={video.creator} image={video?.thumbnail} live={video.live} title={video?.title} premiumTokens={video.premiumTokens} />
        )

      })
    }

    </div>
  );
};

export default HomePage;
