import { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/router';
import {
    Sidenav,
    initTE,
  } from "tw-elements";
import Link from "next/link";
import { useAccount } from "wagmi";
import axios from "axios";
import { getProfileDetails } from "~~/services/stream_functions/mongo";
import { BlockieAvatar } from "~~/components/scaffold-eth";

  

export default function Sidebar({Home}){
  const {address}=useAccount();
  const [subscribed,setSubscribed]=useState([]);
   
    const router = useRouter();
    // console.log(router?.pathname)
    useEffect(()=>{

        async function getSubs(){
          const res=await axios.post('https://streamvault.site:3499/getAllSubscribedChannels',{subscriber:address})
          console.log(res,'rizz');
          const result=res.data.result;
          for(let i=0;i<result.length;i++){
            const profiledata=await getProfileDetails(result[i].creator
              )
            result[i]={...result[i],...profiledata}
          }
          console.log(result,'rix')
          setSubscribed(result)
        }
        if(address){

          getSubs();
        }
    },[address])
   
     
    useEffect(() => {
        if (typeof document !== 'undefined') {
          initTE({ Sidenav });
          const instance = Sidenav.getInstance(document.getElementById("sidenav-2"));
            // console.log(instance,'wattttttttttteeeeeerrrrrrrrr')
        //  instance.hide();
            if(router.pathname!=='/'){
                // console.log('dononoonnnnonnnnoneee')
                instance.hide();
            }
            if(router.pathname==='/' && window.innerWidth<900 ){
                instance.hide()
            }
          const handleWindowResize = () => {
          
            const width =  window.innerWidth
         
            const mode = (width > 900 && router?.pathname==='/' ) ? 'slide' : 'over';
            instance.changeMode(mode);
            
          };
      
          handleWindowResize(); // Initial mode based on the current width
      
          window.addEventListener('resize', handleWindowResize);
      
          return () => {
            window.removeEventListener('resize', handleWindowResize);
          };
        }
      }, [router?.pathname]);
  





    return(
        <div>

<nav
  id="sidenav-2"

  className="fixed left-0 top-15 z-[1035] h-screen w-60 -translate-x-full overflow-hidden bg-base-100 shadow-[0_4px_12px_0_rgba(0,0,0,0.07),_0_2px_4px_rgba(0,0,0,0.05)] data-[te-sidenav-hidden='false']:translate-x-0 dark:bg-base-100"
  data-te-sidenav-init
  data-te-sidenav-hidden="false"
  data-te-sidenav-mode="side"
  data-te-sidenav-content="#content">
  <ul class="relative m-0 list-none px-[0.2rem]" data-te-sidenav-menu-ref>
    <li class="relative">
      <Link
        href={'/'}
        class="flex h-12 cursor-pointer items-center truncate rounded-[5px] px-6 py-4 text-[0.875rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10"
        data-te-sidenav-link-ref>
        <span
          class="mr-4 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-gray-400 dark:[&>svg]:text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-4 w-4">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
        </span>
        <span>Home</span>
      </Link>
    </li>

    <li class="relative">
      <Link
        href={`/profile?creator=${address}`}
        class="flex h-12 cursor-pointer items-center truncate rounded-[5px] px-6 py-4 text-[0.875rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10"
        data-te-sidenav-link-ref>
        <span
          class="mr-4 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-gray-400 dark:[&>svg]:text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-4 w-4">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
        </span>
        <span>Profile</span>
      </Link>
    </li>
    
    <li class="relative font-bold ml-10 ">
      Subscribed Channels
       
    </li>
    {
      subscribed.map((item)=>{
        return(
          <li className="relative">
            <Link href={`/profile?creator=${item?.creatorAddress}`} class="flex h-12 cursor-pointer items-center truncate rounded-[5px] px-6 py-4 text-[0.875rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10"
        data-te-sidenav-link-ref >

           
              <span
          class="mr-4 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-gray-400 dark:[&>svg]:text-gray-300">
            {
              item?.channelImage?
                <img src={item.channelImage} className="rounded-full w-[37px] h-[37px]" alt="" />
              :
                <BlockieAvatar address={item?.creatorAddress} />

            }
         
        </span>
        <span>{item?.channelName?item?.channelName:item?.creatorAddress?.slice(0,6)+'...'}</span>
        </Link>
          </li>
        )
      })
    }
  
  </ul>
</nav>




<div class="p-5 !pl-[260px] text-center" id="content">
 
  {
    Home
  }
</div>


    </div>

    )
}