import { notification } from '~~/utils/scaffold-eth';

const axios =require('axios');

async function addVideoToDb(publishId,live,owner,thumbnail,title){

    if(!db){
        connectDB();
    }

    let thumbnail_image_url;


    let myColl = db.collection('videos');
    if(!myColl){
        myColl=db.createCollection('videos');  
    }

    if(thumbnail){
        thumbnail_image_url= await UploadToIPFS(thumbnail);
    }

    const result=myColl.insertOne({
        _id:owner+'/'+publishId,
        creator:owner,
        live:live,
        thumbnail:thumbnail_image_url,
        timestamp:new Timestamp(),
        title:title,

    })

    if(result){

        return true;
    }
    return false;

    




   





}


async function fetchFromDB(currentPage,pageSize=10,creator,live){
    // console.log(creator,'creatorrrrrrrrrrrrr')
    const payload={
        creator:creator,
        currentPage:currentPage,
        pageSize:pageSize,

    }
    if(live){
        payload.live=live;
    }
    if(creator){
        payload.creator=creator;
    }

    try{

        const result=await axios.post('https://streamvault.site:3499/getVideos',payload);
        // console.log(result);
        return result ;
  

// Calculate the skip value based on the page size and current page
      

    }
    catch(error){
        notification.error(error.message)
        console.error(error);
        return [];
    }








}

async function subscribe(creator,subscriber){

    
    const result=await axios.post('https://streamvault.site:3499/subscribe',{creator,subscriber});
    // console.log(result);

}

async function getVideoById(id){
    // console.log(id,'iddddddddddddddddddddddddddddddddd')
    try{

        const result=await axios.post('https://streamvault.site:3499/getVideoDetails',{id:id});
        // console.log(result);
        return result ;
  

// Calculate the skip value based on the page size and current page
      

    }
    catch(error){
        notification.error(error.message)
        console.error(error);
        return [];
    }
}


const getProfileDetails =async (creatorAddress)=>{
    // console.log('og hellooo')

    try{

        const res=await axios.post('https://streamvault.site:3499/getProfileDetails',{creatorAddress:creatorAddress});
       
        const result={...res.data.result,totalCount:res.data.totalCount}
        // console.log(result,'result');
        return result ;
  

// Calculate the skip value based on the page size and current page
      

    }
    catch(error){
       notification.error(error.message)
        console.error(error);
        return [];
    }

    


}


const upsertProfileDetails =async (payload,setEditMode)=>{


    try{

        const result=await axios.post('https://streamvault.site:3499/upsertProfileDetails',{payload:payload});
        // console.log(result);
        setEditMode(false);
        return result ;
  

// Calculate the skip value based on the page size and current page
      

    }
    catch(error){
       notification.error(error.message)
        console.error(error);
        return [];
    }

    


}






export {fetchFromDB,addVideoToDb,getVideoById,getProfileDetails,upsertProfileDetails}
