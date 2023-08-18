const express = require('express');
const ethers = require('ethers');
const cors=require('cors');
const app = express();
app.use(express.json());
const axios = require('axios');

const fs = require('fs');
const path = require('path');
const {HLSconversion} = require('../JobQueue/queue');
const multer =require('multer');
const http = require('http');
const socketIo = require('socket.io');
const { exec } = require('child_process');
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
const { MongoClient, ServerApiVersion, Timestamp } = require('mongodb');

const { Web3Storage  ,getFilesFromPath ,File } = require('web3.storage');

// const busboy = require('connect-busboy');

let subDB;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // const {publishId,live,creator,thumbnail,title ,signature,message} =JSON.parse(req.body.payload);
    // console.log(creator,'creator');
 
    
    const saveTo = `./uploads/`;
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
   
    cb(null, file.originalname);
  }
});

// const upload = multer({ storage: storage })
const upload = multer({
  storage:storage,
  // dest:'uploads/'
})

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


io.on('connection', (socket) => {
  console.log('A client connected.',socket.handshake.query.id);


  // socket.on('publishId', ({publishId}) => {
  //   console.log(publishId);
  //   socket.data.id = publishId;
    
  // })


  
  const rtmpUrl = `rtmp://localhost:1935/live/${socket.handshake.query.id}`; // Replace with your RTMP server URL
  
  const ffmpegCommand = [
    'ffmpeg',
    '-i', 'pipe:0',         // Read from standard input
    '-c:v', 'libx264',     // Video codec
    '-c:a', 'aac',         // Audio codec (replace with the appropriate codec)
    '-preset', 'ultrafast',// Preset for encoding speed (adjust as needed)
    '-f', 'flv',           // Output format
    rtmpUrl                // Output RTMP URL
  ];
  
  const ffmpegProcess = exec(ffmpegCommand.join(' '), (error, stdout, stderr) => {
    if (error) {
      console.error('FFmpeg error:', error);
    }
  });

  socket.on('stream', ({ id, data }) => {
    // Check if the id is valid for starting FFmpeg process
      console.log(rtmpUrl)
    console.log(id,'iddddddddd',data);
    ffmpegProcess.stdin.write(data);
   
    
  
  });
  // socket.on('stream', (data) => {
  //   // console.log(data);
  //   ffmpegProcess.stdin.write(data);
  // });

  socket.on('disconnect', () => {
    console.log('A client disconnected.');
    ffmpegProcess.stdin.end();
  });

});




app.post('/publish',async (req,res)=>{
  let {publishId,live,creator,thumbnail,title ,signature,message,premiumTokens,tokenAddress} = req.body;
  if(premiumTokens===null){
    premiumTokens=0;
  }
  else{
    premiumTokens=Number(premiumTokens)
  }
  const isVerified = verifySignature(creator, message, signature);
  
  if (!isVerified) {
    console.log('noooo');
    res.status(400).json({ verified: false });
    return;
  } 
  
  const result =await addVideoToDb(publishId,live,creator,thumbnail,title,1,premiumTokens,tokenAddress);
  if(result){
    res.status(200).json({verified:result});
  }
  else{
    res.sendStatus(400)
  }

  

})

app.post('/delete',(req,res)=>{
  // console.log(req.body,'body')

  const {id}=req.body;
  deleteFromDB(id);

})


app.post('/getVideos',async (req,res)=>{
  const {live,creator,currentPage,pageSize } = req.body;
  console.log(creator,'creatorrrrrr')

  const result=await fetchFromDB(creator,live,currentPage,pageSize);

  if(result){
    res.status(200).json({result:result});
  }
  else{
    res.status(400).json({result:[]});
  }




})


app.post('/getVideoDetails',async (req,res)=>{
  const {id } = req.body;

  let myColl = db.collection('videos');
  const filter = { _id: id };
    const result = await myColl.findOne(filter);

 

  if(result){
    res.status(200).json({result:result});
  }
  else{
    res.status(400).json({result:[]});
  }




})



app.post('/upload',upload.single('video'), (req, res) => {
  let {publishId,live,creator,thumbnail,title ,signature,message,premiumTokens,tokenAddress} =JSON.parse(req.body.payload);
  if(premiumTokens===null){
    premiumTokens=0;
  }
  else{
    premiumTokens=Number(premiumTokens)
  }
  
  const isVerified = verifySignature(creator, message, signature);
  if(!isVerified){
    res.status(400).json({verified:false});
    return ;
  }

  // Listen for file events
  let id=creator+'/'+publishId;
  // file.on('file', (fieldname, fileStream, filename, encoding, mimetype) => {
    // Specify the path to save the uploaded file
    // console.log(fieldname,'field nameeeeeeeeeeeeee');
    const saveTo = `uploads/${req.file.originalname}`;

    // Create a write stream to save the file
    // const writeStream = fs.createWriteStream(saveTo);

    // Pipe the file stream to the write stream
    // fileStream.pipe(writeStream);

    // Handle the completion of the file upload
    // writeStream.on('finish', () => {
      console.log('File uploaded successfully');
    filename=req.file

      
      const inputFilePath = saveTo;
      const outputDirectory = publishId;
      const outputFilePath = `output/${outputDirectory}/${outputDirectory}.m3u8`;
      if(!fs.existsSync('./output/'+outputDirectory)){
        fs.mkdirSync('./output/'+outputDirectory, { recursive: true })
       };
       console.log(inputFilePath,outputFilePath);
      
       HLSconversion('HLS',inputFilePath,outputFilePath,outputDirectory,id);

       addVideoToDb(publishId,false,creator,thumbnail,title,false,premiumTokens,tokenAddress);


      
    
});

app.post('/getSubChan',async (req,res)=>{
  const {subscriber}= req.body;
  console.log(subscriber,'hello');

  const result=await getAllSubscribedChannel(subscriber);
  res.json({result});
  


})



app.post('/getProfileDetails',async (req,res)=>{

  const {creatorAddress}=req.body;
  // console.log(creatorAddress,'hehehheheh')

  
  let myColl = db.collection('Profile');

  
  const result= await myColl.findOne({
    _id:creatorAddress})
// console.log(result,'result');

const collection = db.collection('videos');

const query = { creator: creatorAddress };

const totalCount = await collection.countDocuments(query);
// console.log(totalCount,'totalCount')


res.json({ result, totalCount });


})

app.post('/subscribe',async (req,res)=>{

  const {creator,subscriber,subscribe}=req.body;
  // console.log(subscribe)
  let result;
  if(subscribe===1){
    result=await subscribeFunc(creator,subscriber)
    
  }
  else if(subscribe===0){
    result= await UnSubscribe(creator,subscriber)
  }

  res.json({result});





})
app.post('/isSubscribe',async (req,res)=>{

  const {creator,subscriber}=req.body;
  // console.log(creator,subscriber)

  let myColl = subDB.collection(subscriber);
  if(!myColl){
      myColl=subDB.createCollection(subscriber);  

  }
  
  const result=await myColl.findOne({
    _id:creator,
  

    


})



// console.log(result,'ressssss');
if(result){
  res.status(200).json({result:true})
} 
else{
  res.status(200).json({result:false})
}

})
async function UnSubscribe(creator,subscriber){

  let myColl = subDB.collection(subscriber);
  if(!myColl){
      myColl=subDB.createCollection(subscriber);  

  }
  
  const result=await myColl.deleteOne({
    _id:creator,
  

    


})
if(result){

  
  const collection = db.collection('Profile');

  const filter = { _id: creator }; 
  const update = { $inc: { totalSubs: -1 } }; 

  const r = await collection.updateOne(filter, update);

  return true;
}
return false;


}

async function subscribeFunc(creator,subscriber){
  if(!subscriber){
    return ;
  }
  console.log(subscriber);
  let myColl = subDB.collection(subscriber);
  if(!myColl){
      myColl=subDB.createCollection(subscriber);  

  }
  
  const result=await myColl.insertOne({
    _id:creator,
    creator:creator

    


})
if(result){
  
  
  const collection = db.collection('Profile');

  const filter = { _id: creator }; 
  const update = { $inc: { totalSubs: 1 } }; 

  const r = await collection.updateOne(filter, update);

 return true;
} 
else{
  return false;
}


}

async function getAllSubscribedChannel(subscriber){
  if(!subscriber){
    return;
  }
  console.log(subscriber);
  let myColl = subDB.collection(subscriber);
  if(!myColl){
      myColl=subDB.createCollection(subscriber);  

  }
  
  const result=await myColl.find().toArray()

  return result;


}


app.post('/upsertProfileDetails',async (req,res)=>{
  const {payload}=req.body;
  // console.log(payload)
  const result = await upsertProfileData(payload)
  // console.log(result);
  res.json({result})
})

async function upsertProfileData(payload){


  
  const options = { upsert: true }; 


  const filter = { _id: payload.creatorAddress }; 

  
  const updateOperation = { $set: payload }; 
  
  const collection = db.collection('Profile');
  
  const result = await collection.updateOne(filter, updateOperation, options);
  return result;

}


  







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
    subDB=client.db('Streamvault_subs')
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } 
    catch(error){
      throw error;
    }
  
}




async function addVideoToDb(publishId,live,creator,thumbnail,title,uploaded,premiumTokens) {

  if(!db){
      connectDB();
  }
  // console.log(premiumTokens,'premiumTokens')

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
      premiumTokens:premiumTokens,

      


  })
  
  
  if(result){

      return true;
  }
  return false;

  




 





}


async function deleteFromDB(id){
// console.log(id);
try{

  if(!db){
    connectDB();
}



    let myColl = db.collection('videos');
    const filter = { _id: id };
    const result = await myColl.deleteOne(filter);
    if(result){
      // console.log('deleted');
    }


}
catch(error){
  console.error(error);

}


}


async function fetchFromDB(creator,live,currentPage,pageSize=10){

// console.log(creator,'creatorrrrr');
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
      if(live){
        query.live=live;
      }
    


      const result = await myColl.find(query)
      .sort({ timestampField: -1 }) 
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
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
