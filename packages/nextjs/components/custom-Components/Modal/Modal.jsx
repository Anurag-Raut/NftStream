import { useState } from "react"
import {useScaffoldContractWrite} from '../../../hooks/scaffold-eth/useScaffoldContractWrite'
import Toggle from "./toggle";
export default function Modal ({RemainingBalance,address,tokenAddress}){
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


    return (
        <>
        <div className="container">
        <h1 className="text-2xl">Not enough tokens</h1>
        {/* opens the modal */}
        <button className="btn btn-primary" onClick={handleToggle}>
          Buy Tokens
        </button>
      <Toggle open={open} handleToggle={handleToggle}>
          <h3>
            remainingBalance : {RemainingBalance}
          </h3>
          <div className="modal-action">
            {/* closes the modal */}
            <button onClick={()=>writeAsync()} className="btn btn-primary" >
              Buy Tokens
            </button>
          </div>
        </Toggle>
      </div>
        </>
    )

}