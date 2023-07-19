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


async function fetchFromDB(currentPage,pageSize=10,live){
    const payload={
        
        
        creator:null,
        currentPage:currentPage,
        pageSize:pageSize,

    }
    if(live){
        payload.live=live;
    }

    try{

        const result=await axios.post('https://streamvault.site:3499/getVideos',payload);
        // console.log(result);
        return result ;
  

// Calculate the skip value based on the page size and current page
      

    }
    catch(error){
        console.error(error);
        return [];
    }








}

async function getVideoById(id){
    console.log(id,'iddddddddddddddddddddddddddddddddd')
    try{

        const result=await axios.post('https://streamvault.site:3499/getVideoDetails',{id:id});
        // console.log(result);
        return result ;
  

// Calculate the skip value based on the page size and current page
      

    }
    catch(error){
        console.error(error);
        return [];
    }
}


const getProfileDetails =async (creatorAddress)=>{
    console.log('og hellooo')

    try{

        const result=await axios.post('https://streamvault.site:3499/getProfileDetails',{creatorAddress:creatorAddress});
        console.log(result,result);
        return result ;
  

// Calculate the skip value based on the page size and current page
      

    }
    catch(error){
        console.error(error);
        return [];
    }

    


}


const upsertProfileDetails =async (payload)=>{


    try{

        const result=await axios.post('https://streamvault.site:3499/getProfileDetails',{payload:payload});
        // console.log(result);
        return result ;
  

// Calculate the skip value based on the page size and current page
      

    }
    catch(error){
        console.error(error);
        return [];
    }

    


}






export {fetchFromDB,addVideoToDb,getVideoById,getProfileDetails,upsertProfileDetails}
