
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Web3  from 'web3'
import factory from '../../hardhat/artifacts/contracts/Factory.sol/Factory.json';
import {useBurnerWallet} from '../hooks/scaffold-eth/useBurnerWallet'
import {BlockieAvatar} from '../components/scaffold-eth'
import creator from '../../hardhat/artifacts/contracts/Creator.sol/Creator.json'
import {addTokenContract,getBalance,getTokenAddress} from '../services/web3/creator/creator'
import { useAccount, useBalance } from 'wagmi';
import Button from '../components/custom-Components/button'
import InputBox from '../components/custom-Components/inputBox'
import { getProfileDetails ,upsertProfileDetails} from '../services/stream_functions/mongo';
function Profile(){
  const {address}=useAccount();
  const [tokenAddress,setTokenAddress]=useState('');
  const [editMode,setEditMode]=useState(0);
  const [channelImage,setChannelImage]=useState(null)
  let imgage;
  

  useEffect(()=>{
    async function getAddress(){
      const add= await getTokenAddress();
      setTokenAddress(add);
    } 

    getAddress();
   

    getBalance(tokenAddress);
    
    
  },[address])

  useEffect(()=>{
    async function getProfile(){
        const res=await getProfileDetails(address);
        console.log(res,'resss');
    }
    getProfile();
  },[])


  const { data:balance, isError, isLoading } = useBalance({
    address: tokenAddress,
  })

 

 

   


    return(
        <div className="w-full h-full flex flex-col items-start ">
         <h1 className='text-4xl font-bold mb-6'> Profile Details
          </h1> 
          <div className=' flex ml-9'>
          <label for={'channel-image'} className="flex flex-col items-center justify-center w-full h-full   cursor-pointer     ">
                    <div className="">
                    {

                      channelImage?
                      <div>
                          <img className='w-[18vw] h-[18vw] rounded-full	mb-3' src={URL.createObjectURL(channelImage)} alt="" />
                          <div className='flex w-full justify-around'>
                          <Button onClick={()=>{setChannelImage(null)}} label={'Cancel'} />
                          <Button label={'save'} />
                          </div>
                         
                        
                      </div>

                      :
                      <BlockieAvatar address={address} size={'50'}  />

                    }
                   
                  
                       
                 
                    </div>
                    
                    
                    <input id={'channel-image'} type="file" className="hidden" onChange={(event)=>{setChannelImage(event.target.files[0])}} />
                </label>
  

      <div className='ml-[100px] flex flex-col justify-center items-start'>
      <div className='flex w-[50vw] justify-between'>
        <h1>  <span className='text-2xl font-bold'>Channel Name</span> :Anurag </h1>
        <div className='flex'>
        <InputBox id={'channel-name'}   />
      <Button onClick={()=>upsertProfileDetails({channelName:document.getElementById('channel-name').value,creatorAddress:address,_id:address})} label={'Save'}/>

        </div>
     
   
      </div>
      
          <h1>  <span className='text-2xl font-bold'>Subsribers</span> :200 </h1>
          <h1>  <span className='text-2xl font-bold'>Total videos</span> :200 </h1>

            

      </div>
       
          </div>

          <div className='mt-5 flex flex-col items-start' >
          <h1 className='text-4xl font-bold mb-6'> Token Details</h1>

            
          {

            tokenAddress===''?
            <div className='flex w-[50vw] justify-between'>
              <div className='text-2xl dark:text-purple-500 font-bold'>No token contract found</div>
                 <Button label={'Add Contract'} onClick={addTokenContract} />
            </div>
         
            :
            <div className='flex flex-col items-start'>
                   <h1>  <span className='text-2xl dark:text-purple-500 font-bold'>Token Contract Address : </span> {tokenAddress} </h1>
                   <div className='flex justify-between w-[60vw] items-center'>
                   <h1>  <span className='text-2xl dark:text-purple-500 font-bold'>Contract Balance : </span> {balance?.formatted} Matic </h1>
                  <div className='flex'>
                    <div className='w-[100px] mr-5'>
                    <InputBox  type='number' />
                    </div>
                    
                  <Button label={'Withdraw'} />
                  </div>
                   
                   </div>
              

            </div>






}




          </div>


          


        </div>


    );

}
export default Profile;