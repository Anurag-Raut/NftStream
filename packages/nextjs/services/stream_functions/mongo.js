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


async function fetchFromDB(live,currentPage,pageSize=10){
    const payload={
        live:live,
        
        creator:null,
        currentPage:currentPage,
        pageSize:pageSize,

    }

    try{

        const result=await axios.post('http://localhost:3500/getVideos',payload);
        console.log(result);
        return result ;
  

// Calculate the skip value based on the page size and current page
      

    }
    catch(error){
        console.error(error);
        return [];
    }







}






export {fetchFromDB,addVideoToDb}
