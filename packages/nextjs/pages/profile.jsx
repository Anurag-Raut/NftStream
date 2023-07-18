
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Web3  from 'web3'
import factory from '../../hardhat/artifacts/contracts/Factory.sol/Factory.json';
import {useBurnerWallet} from '../hooks/scaffold-eth/useBurnerWallet'
import creator from '../../hardhat/artifacts/contracts/Creator.sol/Creator.json'
import {addTokenContract,getBalance,getTokenAddress} from '../services/web3/creator/creator'
function Profile(){
  const [address,setAddress]=useState('');
  

  useEffect(()=>{
    async function getAddress(){
      const add= await getTokenAddress();
      setAddress(add);
    } 

    getAddress();
   

    getBalance(address);
    
    
  },[address])

 

   


    return(
        <div className="w-full h-full">
            {

              address===''?
              <button onClick={addTokenContract}>Add Token</button>
              :
              <h1>hello  {address}</h1>






            }
            
          


        </div>


    );

}
export default Profile;