import  { useRouter } from 'next/router';
import {read} from '../../services/stream_functions/read'
import { useIsMounted } from 'usehooks-ts'
import { useContractRead } from 'wagmi'
import { useEffect, useState } from 'react';
import Chat from '../../components/chat/chat';
import contracts from '../../generated/deployedContracts'
// import { joinRoom,getMessage } from '../../services/Chat/chat';
import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi'
import { getTokenAddressByAddress,getBalance } from '../../services/web3/creator/creator';
import {getVideoById} from '../../services/stream_functions/mongo'
import Toggle from '../../components/custom-Components/Modal/toggle';
import Modal from '../../components/custom-Components/Modal/Modal';
import {useScaffoldContractRead} from '../../hooks/scaffold-eth/useScaffoldContractRead'
const { File } = require('web3.storage');
const { createClient } = require('web3.storage');

const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });
function View(){
    const { address, isConnecting, isDisconnected } = useAccount();
    const [url,setUrl]=useState('')
    // console.log(address,'address')
    // const [ID,setID]=useState
    const router=useRouter();
    const [visible,setVisible]=useState(0);
    const [videoData,setVideoData]=useState({});
    const [tokenAddress,setTokenAddress]=useState('');
    
    const [mute,setMuted]=useState(true);
    
    const {id,live} = router.query
    

    
   const {creator}=router.query;
let ID='';
if(id){
    ID=id[0]+'/'+id[1];
}
console.log(url,'urllll')
    async function add(){
       
        if(!id){
            return
        }
        if(live==='true' && id){
           setUrl(`https://streamvault.site:8000/${id[0]}/${id[1]}/stream.m3u8`);
        }
        else if(id){
            setUrl(`https://streamvault.site/${id[1]}/${id[1]}.m3u8`);
        }
      
        if(id){
            ID=id[0]+'/'+id[1];
        }
        // console.log(id,"IDDDDDDDD");
      
        const videoData=await getVideoById(ID);
      
        const data=videoData?.data?.result;
        if(!data){
            return
        }
        // console.log(data,'data');
          const _addr= await getTokenAddressByAddress(data?.creator);
          setTokenAddress(_addr);
          setVideoData(data);
        const balance= await getBalance(_addr);
        // console.log(balance);
        if(balance && balance>=Number(videoData.premiumTokens)){
            setVisible(true);
        }

        
    }


    useState(()=>{
   
        add();

    },[creator,address,router.events,ID])

    useEffect(()=>{
        router.events.on('routeChangeComplete', add());

        // Remove the event listener when the component is unmounted
        return () => {
          router.events.off('routeChangeComplete', add());
        };
    },[router.events,ID])

// console.log(tokenAddress,'tokenAddress', contracts[80001][0].contracts.Creator.abi)
   
    const { data: balance } = useScaffoldContractRead({
        contractName: "Creator",
        functionName: "balanceOf",
        args: [address],
        address:tokenAddress,
        watch:true
      });

      useEffect(()=>{
        if(balance && Number(balance) >=Number(videoData.premiumTokens)){
            setVisible(true);
        }
        else if(videoData?.premiumTokens===0){
            // console.log('hellou',balance)
            setVisible(true);
        }
        else{
            // console.log('nuuuuuu')
            
            setVisible(false);
        }
      },[balance,videoData])

    //   console.log(balance,'balance',videoData.premiumTokens)
      
  



  

    return (
        <div className=' '>
           
              
                <div  className='flex ml-3 mt-0  flex justify-between'>
                    <>
                    {
                          visible?
                       <ReactPlayer width={'62vw'} height={'75vh'} muted={true} autoPlay={true} url={url} className='m-2'  controls={true} /> : 
                   <Modal videoData={videoData} RemainingBalance={videoData.premiumTokens-Number(balance)} tokenAddress={tokenAddress} address={address} /> 
                    }
                    
                    
                    
                    </>
                    
                        <Chat id={ID}  />
                </div>


               
             
               
                
   
			
         
		
        </div>

    )

}
export default View;