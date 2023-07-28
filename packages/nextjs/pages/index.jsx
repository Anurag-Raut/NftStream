import Link from "next/link";
import dynamic from "next/dynamic";
import {fetchFromDB } from '../services/stream_functions/mongo'
import { BugAntIcon, MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { useLocalStorage } from 'usehooks-ts'
import { useEffect, useState } from "react";
import HomePage from './homepage'
import VideoCard from '../components/custom-Components/videoCard'
import Toggle from '../components/custom-Components/Modal/toggle'

const SideBar = dynamic(() => import("../components/custom-Components/SideBar/sidebar"), { ssr: false });
const Home = () => {
  const[videos,setVideos]=useState([]);

  useEffect(()=>{

    async function getItems(){

      let _items= await fetchFromDB(true,1,10);

      let items=_items?.data?.result
   
         setVideos([...videos,  ...items]);
    }
    
    
      getItems();
    // console.log(_items);
   
  },[])

  return (
    <div className="flex h-screen">
    <HomePage />
   
    
    </div>
  );
};

export default Home;
