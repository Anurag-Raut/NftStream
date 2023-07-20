import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import factory from "../../hardhat/artifacts/contracts/Factory.sol/Factory.json";
import Button from "../components/custom-Components/button";
import InputBox from "../components/custom-Components/inputBox";
import { BlockieAvatar } from "../components/scaffold-eth";
import { useBurnerWallet } from "../hooks/scaffold-eth/useBurnerWallet";
import { getProfileDetails, upsertProfileDetails } from "../services/stream_functions/mongo";
import { UploadToIPFS } from "../services/stream_functions/publish";
import { addTokenContract, getBalance, getTokenAddress } from "../services/web3/creator/creator";
import { ethers } from "ethers";
import { useAccount, useBalance } from "wagmi";
import HomePage from './homepage'

function Profile() {
  const { address } = useAccount();
  const [tokenAddress, setTokenAddress] = useState("");
  const [editMode, setEditMode] = useState(1);
  const [channelImage, setChannelImage] = useState(null);
  const [profileData, setProfileData] = useState({});
  let imgage;
  const router = useRouter();
  const { creator } = router.query;
  console.log(creator);

  useEffect(() => {
    async function getAddress() {
      const add = await getTokenAddress();
      setTokenAddress(add);
    }

    getAddress();

    getBalance(tokenAddress);
  }, [address]);

  useEffect(() => {
    async function getProfile() {
      const res = await getProfileDetails(address);
      setProfileData(res);
    }
    getProfile();
  }, []);

  const {
    data: balance,
    isError,
    isLoading,
  } = useBalance({
    address: tokenAddress,
  });

  async function channelImageSave(channelImage) {
    const ChannelImageURL = await UploadToIPFS(channelImage);
    upsertProfileDetails({ channelImage: ChannelImageURL, creatorAddress: address, _id: address }, setEditMode);
  }

  return (
    <div className="w-full h-full flex flex-col items-start m-2">
      <h1 className="text-4xl font-bold mb-6"> Profile Details</h1>
      <div className=" flex ml-9">
        <label
          for={"channel-image"}
          className="flex flex-col items-center justify-center w-full h-full   cursor-pointer     "
        >
          <div className="">
            {channelImage ? (
              <div>
                <img className="w-[18vw] h-[18vw] rounded-full	mb-3" src={URL.createObjectURL(channelImage[0])} alt="" />
                <div className="flex w-full justify-around">
                  <Button
                    onClick={() => {
                      setChannelImage(null);
                    }}
                    label={"Cancel"}
                  />
                  <Button onClick={() => channelImageSave(channelImage)} label={"save"} />
                </div>
              </div>
            ) : profileData.channelImage ? (
              <img className="w-[18vw] h-[18vw] rounded-full	mb-3" src={profileData.channelImage} alt="" />
            ) : (
              <BlockieAvatar address={address} size={"50"} />
            )}
          </div>

          <input
            id={"channel-image"}
            type="file"
            className="hidden"
            onChange={event => {
              setChannelImage(event.target.files);
            }}
          />
        </label>

        <div className="ml-[100px] flex flex-col justify-center items-start">
          <div className="flex w-[50vw] justify-between">
            <h1>
              {" "}
              <span className="text-2xl font-bold">Channel Name : </span>{" "}
              {profileData?.channelName ? profileData.channelName : address}{" "}
            </h1>
            <div className="flex">
              <div>
                <Button
                  onClick={() => {
                    setEditMode(!editMode);
                  }}
                  label={editMode ? "Edit" : "Cancel"}
                />
              </div>
              {!editMode ? (
                <div className="flex w-[20vw] justify-between">
                  <InputBox id={"channel-name"} />
                  <Button
                    onClick={() =>
                      upsertProfileDetails(
                        {
                          channelName: document.getElementById("channel-name").value,
                          creatorAddress: address,
                          _id: address,
                        },
                        setEditMode,
                      )
                    }
                    label={"Save"}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <h1>
            {" "}
            <span className="text-2xl font-bold">Subsribers :</span> 200{" "}
          </h1>
          <h1>
            {" "}
            <span className="text-2xl font-bold">Total videos :</span> {profileData.totalCount}{" "}
          </h1>
        </div>
      </div>
      {creator === address ? (
        <div className="mt-5 flex flex-col items-start">
          <h1 className="text-4xl font-bold mb-6"> Token Details</h1>

          {tokenAddress === "" ? (
            <div className="flex w-[50vw] justify-between">
              <div className="text-2xl dark:text-purple-500 font-bold">No token contract found</div>
              <Button label={"Add Contract"} onClick={addTokenContract} />
            </div>
          ) : (
            <div className="flex flex-col items-start">
              <h1>
                {" "}
                <span className="text-2xl dark:text-purple-500 font-bold">Token Contract Address : </span>{" "}
                {tokenAddress}{" "}
              </h1>
              <div className="flex justify-between w-[60vw] items-center">
                <h1>
                  {" "}
                  <span className="text-2xl dark:text-purple-500 font-bold">Contract Balance : </span>{" "}
                  {balance?.formatted} Matic{" "}
                </h1>
                <div className="flex">
                  <div className="w-[100px] mr-5">
                    <InputBox type="number" />
                  </div>

                  <Button label={"Withdraw"} />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
      <div>
      <h1 className="text-4xl font-bold mb-6 text-left"> Videos - </h1>
      <HomePage creator={creator} />
      </div>
     
    </div>
  );
}
export default Profile;
