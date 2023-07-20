import { useEffect, useState } from "react"
import { fetchFromDB } from "../services/stream_functions/mongo";
import { useAccount } from "wagmi";


export default function uploadedFile(){
    const [uploadedVideos,setUploadedVideos]=useState([]);
    const {address}=useAccount();


    useEffect(()=>{

        async function get(){

            const res=await fetchFromDB(1,50,address,false);
            console.log(res,'res')
            const result=res.data.result;
            setUploadedVideos(result);
        }

        get();

    },[])
    console.log(uploadedVideos)
    return (
        <div>

            {
                uploadedVideos?.map((item)=>{
                    return(
                        <div>
                            hello
                        </div>
                    )
                })
            }


        </div>
    )

}