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
          if(!address){
            return;
          }
          const res=await axios.post('https://streamvault.site:3499/getSubChan',{subscriber:address})
          // console.log(res,'rizz');
          const result=res.data.result;
          for(let i=0;i<result.length;i++){
            const profiledata=await getProfileDetails(result[i].creator
              )
            result[i]={...result[i],...profiledata}
          }
          // console.log(result,'rix')
          setSubscribed(result)
        }
        if(address){

          getSubs();
        }
    },[address])
    let instance = Sidenav.getInstance(document.getElementById("sidenav-2"));
    useEffect(()=>{
      if(typeof document !== 'undefined'){
        initTE({ Sidenav });
        instance = Sidenav.getInstance(document.getElementById("sidenav-2"));
      }
     

    },[])
   
     
    // useEffect(() => {
    
          
    //       // const instance = Sidenav.getInstance(document.getElementById("sidenav-2"));
    //         // console.log(instance,'wattttttttttteeeeeerrrrrrrrr')
    //     //  instance.hide();
           
    //       const handleWindowResize = () => {
          
    //         const width =  window.innerWidth
         
    //         const mode = (width > 900 && router?.pathname==='/' ) ? 'slide' : 'over';
    //         instance.changeMode(mode);
            
    //       };
      
    //       handleWindowResize(); // Initial mode based on the current width
      
    //       window.addEventListener('resize', handleWindowResize);
      
    //       return () => {
    //         window.removeEventListener('resize', handleWindowResize);
    //       };
        
    //   }, [router?.pathname]);


      useEffect(() => {
        // Listen for route changes and call handleRouteChange
        const handleRouteChange = (url) => {
          handleModeOnPathChange(url);
          console.log(url)

          if(url!=='/'){
            console.log('dononoonnnnonnnnoneee')
            instance.hide();
        }
        else if(url==='/' && window.innerWidth<900 ){
            instance.hide()
        }
        else{
          instance.show()
        }


         
        };

        const handleWindowResize = () => {
        
          
          const width =  window.innerWidth
          
            const mode= (width > 900 && router.pathname==='/' ) ? 'slide' : 'over';
          
        
          
          console.log(mode,router.pathname ,width);
          instance.changeMode(mode);
          
        };

        const handleModeOnPathChange=(url)=>{

          const width =  window.innerWidth
          
          const mode= (width > 900 && url==='/' ) ? 'slide' : 'over';
        
      
        
        console.log(mode,url ,width);
        instance.changeMode(mode);

        }
    
      


        router.events.on('routeChangeComplete', handleRouteChange);
        window.addEventListener('resize', handleWindowResize);
        // Remove the event listener when the component is unmounted
        return () => {
          router.events.off('routeChangeComplete', handleRouteChange);
          window.removeEventListener('resize', handleWindowResize);
        };
      }, [router.events]);
  





    return(
        <div>

<nav
  id="sidenav-2"

  className="fixed left-0 top-[60px] z-[10] h-screen w-60 -translate-x-full overflow-hidden bg-base-100 shadow-[0_4px_12px_0_rgba(0,0,0,0.07),_0_2px_4px_rgba(0,0,0,0.05)] data-[te-sidenav-hidden='false']:translate-x-0 dark:bg-base-100"
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
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M2 13.5V7h1v6.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V7h1v6.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5zm11-11V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z"/> <path fill-rule="evenodd" d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z"/> </svg>
        </span>
        <span className="text-lg font-bold">Home</span>
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
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            
            fill="white"
            stroke="#212b36" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
       
          >
            <circle cx="12" cy="8" r="5" />
            <path d="M3,21 h18 C 21,12 3,12 3,21"/>
          </svg>
        </span>
        <span className="text-lg font-bold">Profile</span>
      </Link>
    </li>
    <hr
  class="my-2 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:opacity-100" />

    
    <li class="relative font-bold ml-10 mt-2 mb-2 ">
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
                <img src={item.channelImage} className="rounded-full w-[35px] h-[35px]" alt="" />
              :
                <BlockieAvatar address={item?.creatorAddress} />

            }
         
        </span>
        <span className=" text-lg">{item?.channelName?item?.channelName:item?.creatorAddress?.slice(0,6)+'...'}</span>
        </Link>
          </li>
        )
      })
    }
  
  </ul>
</nav>




<div class="p-5 h-full !pl-[260px] text-center" id="content">
 
  {
    Home
  }
</div>


    </div>

    )
}