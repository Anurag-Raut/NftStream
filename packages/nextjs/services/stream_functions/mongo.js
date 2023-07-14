

const { MongoClient, ServerApiVersion, Timestamp } = require('mongodb');

const { Web3Storage  ,getFilesFromPath ,File } = require('web3.storage');
const uri = "mongodb+srv://admin:admin@cluster0.ainnpst.mongodb.net/?retryWrites=true&w=majority";
const token = process.env.WEB3STOJ_TOKEN;

const web3Client = new Web3Storage({token:token});
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
let db;
async function connectDB(){

    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
      db = client.db('Streamvault_videos');
      
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
      } 
      catch(error){
        throw error;
      }
    
}

async function UploadToIPFS(files){
    
   
    // Create a web3.storage client
  
    // Create an array to hold file objects
   
    const cid = await client.put(files)
    return 'https://'+cid+'.ipfs.w3s.link/';  
  
}



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


async function fetchFromDB(creator,live,currentPage,pageSize=10){


    try{


   
    if(!db){
        connectDB();
    }


// Calculate the skip value based on the page size and current page
        const skip = pageSize * (currentPage - 1);
        let myColl = db.collection('videos');
        if(!myColl){
            myColl=db.createCollection('videos');  
        }
        const query={};
        if(creator){
            query.creator=creator
        }
        query.live=live;


        const result = await collection.find()
            .skip(skip)
            .limit(pageSize)
            .toArray();

        return result;



    }
    catch(error){
        console.error(error);
        return [];
    }







}






module.exports={fetchFromDB,addVideoToDb}
