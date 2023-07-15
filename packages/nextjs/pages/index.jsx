import Link from "next/link";

import {fetchFromDB } from '../services/stream_functions/mongo'
import { BugAntIcon, MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { useLocalStorage } from 'usehooks-ts'
import { useEffect, useState } from "react";
import VideoCard from '../components/custom-Components/videoCard'
const Home = () => {
  const[videos,setVideos]=useState([]);

  useEffect(()=>{

    async function getItems(){

      let _items= await fetchFromDB(true,1,10);
      let items=_items.data.result
   
         setVideos([...videos,...items]);
    }
    
    
      getItems();
    // console.log(_items);
   
  },[])
  return (
    <>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">

    {
      videos.map((video)=>{

        return (
      
          <VideoCard key={video._id} image={video?.thumbnail} title={video?.title} />
        )

      })
    }

    </div>
    </>
  );
};

export default Home;
