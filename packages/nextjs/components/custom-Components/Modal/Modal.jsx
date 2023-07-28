import { useState } from "react"
import {useScaffoldContractWrite} from '../../../hooks/scaffold-eth/useScaffoldContractWrite'
import Toggle from "./toggle";
export default function Modal ({RemainingBalance,address,tokenAddress,videoData}){
const [open,setOpen]=useState(false);
const handleToggle = () => setOpen((prev) => !prev);

const { writeAsync, isLoading, isMining } = useScaffoldContractWrite({
  contractName: "Creator",
  address:tokenAddress,
  functionName: "mint",
  
  args: [address,RemainingBalance],
  // For payable functions, expressed in ETH
  value: RemainingBalance?`${RemainingBalance*0.01}`:undefined,
  // The number of block confirmations to wait for before considering transaction to be confirmed (default : 1).
  blockConfirmations: 1,
  // The callback function to execute when the transaction is confirmed.
  onBlockConfirmation: (txnReceipt) => {
    console.log("Transaction blockHash", txnReceipt.blockHash);
  },
});
// console.log(videoData)


    return (
        <>
        <div className="container w-[62vw] h-[33vw] relative ">
          <img src={videoData.thumbnail} className=" w-full h-full "  alt="" />
          <div className="absolute  inset-0 bg-black opacity-60">
          </div>

            <div className="absolute top-[33vh] left-[26vw]  ">
        <div className="w-[200px]">
        <h1 className="text-2xl ">Not enough tokens</h1>

        <button className="btn btn-primary" onClick={handleToggle}>
        Buy Tokens
        </button>

        </div>
           
      <Toggle open={open} handleToggle={handleToggle}>
          <h3>
            Number of Tokens needed : {RemainingBalance}
          </h3>
          <div className="modal-action">
            {/* closes the modal */}
            <button onClick={()=>{setOpen(false)}}  className="bg-red-700 hover:bg-red-800 btn z-10 btn-primary" >
              Cancel
            </button>
            <button onClick={()=>{writeAsync();setOpen(false)}} className="btn z-10 btn-primary" >
              Buy Tokens
            </button>
          </div>
        </Toggle>

          </div>
       
        {/* opens the modal */}
       
      </div>
        </>
    )

}