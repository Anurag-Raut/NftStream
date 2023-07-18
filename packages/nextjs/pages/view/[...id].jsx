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
    console.log(address,'address')
    // const [ID,setID]=useState
    const router=useRouter();
    const [visible,setVisible]=useState(0);
    const [videoData,setVideoData]=useState({});
    const [tokenAddress,setTokenAddress]=useState('');
    
    const [mute,setMuted]=useState(true);
    
	
    const {id,live,creator} = router.query
    console.log(id)

    let ID='';
    if(id){
        ID=id[0]+'/'+id[1];
    }
    // ID=_id[0]+_id[1];
    console.log(ID);
    var url='';
    if(live==='true' && id){
        url = `https://streamvault.site:8000/${ID}/${'stream'}.m3u8`;
    }
    else if(id){
        url = `https://streamvault.site/${id[1]}/${id[1]}.m3u8`;
    }
    console.log(videoData,url);

    useState(()=>{
       
        async function add(){
            if(id){
                ID=id[0]+'/'+id[1];
            }
            // console.log(ID,"IDDDDDDDD");
          
            const videoData=await getVideoById(ID);
          
            const data=videoData?.data?.result;
            if(!data){
                return
            }
            console.log(data,'data');
              const _addr= await getTokenAddressByAddress(data?.creator);
              setTokenAddress(_addr);
              setVideoData(data);
            const balance= await getBalance(_addr);
            console.log(balance);
            if(balance && balance>=Number(videoData.premiumTokens)){
                setVisible(true);
            }

            
        }
       
        add()
       
    },[creator,id])

console.log(tokenAddress,'tokenAddress', contracts[80001][0].contracts.Creator.abi)
    // const { balance, isError, isLoading } =   useContractRead({
    //     address: '0x7E1596A5370B9ef3865D73efC8203980F24342EE',
    //     abi: contracts[80001][0].contracts.Creator.abi,
    //     functionName: 'balanceOf',
    //     args:['0x7887A48BFf1E07971f912AF1271E3bae2bA278AD'],
    //    watch:true,
    //    chainId: 80001,
        
    //   })

    const { data: balance } = useScaffoldContractRead({
        contractName: "Creator",
        functionName: "balanceOf",
        args: [address],
        address:tokenAddress,
        watch:true
      });

      useEffect(()=>{
        if(balance && balance>=Number(videoData.premiumTokens)){
            setVisible(true);
        }
        else{
            setVisible(false);
        }
      },[balance])

      console.log(balance,'balance',videoData.premiumTokens)



  

    return (
        <div className=' '>
           
              
                <div  className='flex ml-3 mt-0  flex justify-between
                '>
                    <>
                    {
                          visible?
                       <ReactPlayer width={'62vw'} height={'75vh'} muted={mute} autoplay={true} url={url} className='m-2'  playing={true} controls={true} onBufferEnd={() => {
                        setMuted(false)
                    }} /> : 
                   <Modal RemainingBalance={videoData.premiumTokens-Number(balance)} tokenAddress={tokenAddress} address={address} />
          

                   
            }
                    
                    
                    
                    </>
                    
                        <Chat id={ID}  />
                </div>


               
             
               
                
   
			
         
		
        </div>

    )

}
export default View;