import { useEffect, useState } from "react";
import Button from "./button";
import { getProfileDetails, upsertProfileDetails } from "../../services/stream_functions/mongo";
import { notification } from "../../utils/scaffold-eth/notification";
import axios from "axios";

import { useAccount } from "wagmi";




export default function SubbscribeComponent({creator}){
    const {address}=useAccount();
    const [isSubscribe, setSubscibe] = useState(0);
    const [profileData,setProfileData]=useState({})

      useEffect(() => {
        async function get() {
          try {
            const result = await axios.post("https://streamvault.site:3499/isSubscribe", { creator, subscriber: address });
            // console.log(result, "rrrrrrrrrrrreeeeeeeeeeessssssssssss");
    
            setSubscibe(result.data.result);
          } catch (error) {
            notification.error(error.message);
          }
        }
        if(address){
            get();
        }

      }, [creator,address]);
    
      async function Subscribe() {
        try {
          const result = await axios.post("https://streamvault.site:3499/subscribe", {
            creator,
            subscriber: address,
            subscribe: 1,
          });
          setSubscibe(1);
        } catch (error) {
          notification.error(error.message);
        }
      }
    
      async function UnSubscribe() {
        try {
          const result = await axios.post("https://streamvault.site:3499/subscribe", {
            creator,
            subscriber: address,
            subscribe: 0,
          });
          setSubscibe(0);
        } catch (error) {
          notification.error(error.message);
        }
      }


    return(
        <div>

        {!isSubscribe ? (
            <Button
              label={"Subscribe"}
              onClick={() => {
                Subscribe();
              }}
            />
          ) : (
            <Button
              color={"red"}
              label={"UnSubscribe"}
              onClick={() => {
                UnSubscribe();
              }}
            />
          )}

        </div>



    )




}