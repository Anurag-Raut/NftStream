import { useState } from "react";
import { useScaffoldContractWrite } from "../../../hooks/scaffold-eth/useScaffoldContractWrite";
import Toggle from "./toggle";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "../../scaffold-eth";

export default function Modal({ RemainingBalance, address, tokenAddress, videoData }) {
  const [open, setOpen] = useState(false);
  const handleToggle = () => setOpen(prev => !prev);
  const {isConnected}=useAccount()

  const { writeAsync, isLoading, isMining } = useScaffoldContractWrite({
    contractName: "Creator",
    address: tokenAddress,
    functionName: "mint",

    args: [address, RemainingBalance],
    // For payable functions, expressed in ETH
    value: RemainingBalance ? `${RemainingBalance * 0.01}` : undefined,
    // The number of block confirmations to wait for before considering transaction to be confirmed (default : 1).
    blockConfirmations: 1,
    // The callback function to execute when the transaction is confirmed.
    onBlockConfirmation: txnReceipt => {
      console.log("Transaction blockHash", txnReceipt.blockHash);
    },
  });
  // console.log(videoData)

  return (
    <>
      <div className="relative inline-block w-[62vw] h-[33vw] ">
        <img src={videoData?.thumbnail} alt="Overlay Example" className="w-full h-full" />
        <div className="h-full w-full  absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 flex text-white  justify-center items-center ">
          <div className="absolute z-[2] bg-black w-full h-full opacity-60"></div>

          <div className=" z-[10] ">
            <div className="w-[200px]">
            
              {
                !isConnected?
                <div>
                   <h1 className="text-2xl font-bold ">Wallet Not Connected</h1>
                  <RainbowKitCustomConnectButton/>
                </div>
                :
                <div>

                  <h1 className="text-2xl font-bold ">Not enough tokens</h1>
                  <button className="btn btn-primary" onClick={handleToggle}>
                    Buy Tokens
                  </button>
                </div>
                
              }
              
            </div>

            <Toggle open={open} handleToggle={handleToggle}>
              <h3>Number of Tokens needed : {RemainingBalance}</h3>
              <div className="modal-action">
                {/* closes the modal */}
                <button
                  onClick={() => {
                    setOpen(false);
                  }}
                  className="bg-red-700 hover:bg-red-800 btn z-10 btn-primary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    writeAsync();
                    setOpen(false);
                  }}
                  className="btn z-10 btn-primary"
                >
                  Buy Tokens
                </button>
              </div>
            </Toggle>
          </div>
        </div>
      </div>
    </>
  );
}
