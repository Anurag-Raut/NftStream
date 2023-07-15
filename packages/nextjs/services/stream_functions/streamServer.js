const express = require('express');
const ethers = require('ethers');
const cors=require('cors');
const app = express();
app.use(express.json());
const axios = require('axios');
app.use(cors());
const fs = require('fs');
const path = require('path');
const {HLSconversion} = require('../JobQueue/queue')

const { MongoClient, ServerApiVersion, Timestamp } = require('mongodb');

const { Web3Storage  ,getFilesFromPath ,File } = require('web3.storage');
const busboy = require('connect-busboy');


const uri = "mongodb+srv://admin:admin@cluster0.ainnpst.mongodb.net/?retryWrites=true&w=majority";
const token = process.env.WEB3STOJ_TOKEN;

const web3Client = new Web3Storage({token:token});
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
let db;

// app.post('/verify', (req, res) => {
//   const { publicAddress, message, signature } = req.body;
 


//   const isVerified = verifySignature(publicAddress, message, signature);

//   if (isVerified) {
//     res.status(200).json({ verified: true });
//   } else {
//     res.status(400).json({ verified: false });
//   }
// });


app.post('/publish',async (req,res)=>{
  const {publishId,live,creator,thumbnail,title ,signature,message} = req.body;
  const isVerified = verifySignature(creator, message, signature);
  
  if (!isVerified) {
    console.log('noooo');
    res.status(400).json({ verified: false });
    return;
  } 
  
  const result =await addVideoToDb(publishId,live,creator,thumbnail,title);
  if(result){
    res.status(200).json({verified:result});
  }
  else{
    res.sendStatus(400)
  }

  

})


app.post('/getVideos',async (req,res)=>{
  const {live,creator,currentPage,pageSize } = req.body;
 

  const result=await fetchFromDB(creator,live,currentPage,pageSize);

  if(result){
    res.status(200).json({result:result});
  }
  else{
    res.status(400).json({result:[]});
  }




})



app.post('/upload',busboy(), (req, res) => {
  const file = req.busboy;
  console.log(req.body);
  
  // const {publishId,live,creator,thumbnail,title ,signature,message} =JSON.parse(req.body.payload);
  const isVerified = verifySignature(creator, message, signature);
  if(!isVerified){
    res.status(400).json({verified:false});
    return ;
  }

  // Listen for file events
  let id=creator+'/'+publishId;
  file.on('file', (fieldname, fileStream, filename, encoding, mimetype) => {
    // Specify the path to save the uploaded file
    console.log(fieldname,'field nameeeeeeeeeeeeee');
    const saveTo = `uploads/${id}`;

    // Create a write stream to save the file
    const writeStream = fs.createWriteStream(saveTo);

    // Pipe the file stream to the write stream
    fileStream.pipe(writeStream);

    // Handle the completion of the file upload
    writeStream.on('finish', () => {
      console.log('File uploaded successfully');


      
      const inputFilePath = saveTo;
      const outputDirectory = path.parse(filename.filename).name;
      const outputFilePath = `output/${outputDirectory}/${outputDirectory}.m3u8`;
      // if(!fs.existsSync('./output/'+outputDirectory)){
      //   fs.mkdirSync('./output/'+outputDirectory, { recursive: true })
      //  };
       console.log(inputFilePath,outputFilePath);
       addVideoToDb(publishId,false,creator,thumbnail,title,false);
       HLSconversion('HLS',inputFilePath,outputFilePath,outputDirectory,id);




      // Perform additional processing as needed
    });
  });

  // Listen for finish event when all files are uploaded
  file.on('finish', () => {
    res.status(200).send('All files uploaded successfully');
  });

  // Pipe the incoming request stream to Busboy
  req.pipe(req.busboy);
});







// Verify the message signature with a public address
function verifySignature(publicAddress, message, signature) {

//   const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message));
  const recoveredAddress = ethers.verifyMessage(message, signature);
  // console.log(signature);
  return publicAddress.toLowerCase() === recoveredAddress.toLowerCase();
}


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




async function addVideoToDb(publishId,live,creator,thumbnail,title,uploaded) {

  if(!db){
      connectDB();
  }

  let thumbnail_image_url;


  let myColl = db.collection('videos');
  if(!myColl){
      myColl=db.createCollection('videos');  
  }

  if(thumbnail){
      thumbnail_image_url= thumbnail;
  }
 

  const result=myColl.insertOne({
      _id:creator+'/'+publishId,
      creator:creator,
      live:live,
      thumbnail:thumbnail_image_url,
      timestamp:new Timestamp(),
      title:title,
      uploaded:live?true:uploaded,
      


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


      const result = await myColl.find()
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













// Start the server
const port = 3500;
connectDB();
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
