// import { notification } from '../../../utils/scaffold-eth/notification';

import { notification } from '../../../utils/scaffold-eth/notification';

const { Web3 } = require('web3');
const { ethers } = require('ethers');
const contracts = require('../../../generated/deployedContracts')

const Creator= contracts.default[80001][0].contracts.Creator;
const Factory = contracts.default[80001][0].contracts.Factory
const factoryContractAddress = Factory.address;

async function getTokenAddress(){
  try{
    const web3 = new Web3(window.ethereum);
 
    const provider = new ethers.BrowserProvider(window.ethereum);
   
    const address = await provider.send("eth_requestAccounts", []);
    // console.log(address[0])
    
   
  
    const contract = new web3.eth.Contract(Factory?.abi, factoryContractAddress, { from:address[0] });
    const _tokenAddress=await contract.methods.CreatorAddress(address[0]).call();
    // console.log(_tokenAddress);
    if(_tokenAddress==='0x0000000000000000000000000000000000000000'){
     return ''
    }
    else{
      return _tokenAddress
    }
   


  }
  catch(error){
    // console.log(error)
    notification.error('Connect to metamask');
  }
 


}



async function getTokenAddressByAddress(_address){
  const web3 = new Web3(window.ethereum);
 
  const provider = new ethers.BrowserProvider(window.ethereum);
 
 
  
 

  const contract = new web3.eth.Contract(Factory?.abi, factoryContractAddress, { from:_address });
  const _tokenAddress=await contract.methods.CreatorAddress(_address).call();
  // console.log(_tokenAddress);
  if(_tokenAddress==='0x0000000000000000000000000000000000000000'){
   return ''
  }
  else{
    return _tokenAddress
  }
 


}


async function getBalance(address){
    if(address==='' || !address){
      return 0;
    }

    // console.log(address,'adddddddddddddd')
    const web3 = new Web3(window.ethereum);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = provider.getSigner();

  
    const addresses = await provider.send("eth_requestAccounts", []);
    const contract = new web3.eth.Contract(Creator.abi, address, { from:addresses[0] });

    const balance=await contract.methods.balanceOf(address).call() 
   return balance
  }

    async function addTokenContract() {
        if (typeof window.ethereum !== 'undefined') {
          try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const web3 = new Web3(window.ethereum);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = provider.getSigner();
      

            const address = await provider.send("eth_requestAccounts", []);
            // console.log(address[0])

        

  
    const contract = new web3.eth.Contract(Factory.abi, factoryContractAddress, { from:address[0] });

    const gasEstimate = await contract.methods.newCreator().estimateGas();
    // console.log('Gas Estimate:', gasEstimate);
    // console.log('sgagasg');
   

    const result = await contract.methods.newCreator().send({ gas: gasEstimate });
    // console.log(result);


    const _addr=await contract.methods.CreatorAddress(address[0]).call();
    return _addr;

        } catch (error) {
         notification.error(error.message)
        console.error('Error connecting to Metamask:', error);
        }
    } else {
        console.error('Metamask extension not detected');
    }
}


const buyTokens= async (tokenAddress,address,amountOfTokens)=>{


    

}



export {getTokenAddress,addTokenContract,getBalance,getTokenAddressByAddress}
