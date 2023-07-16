const express = require('express');
const ethers = require('ethers');
const cors=require('cors');
const app = express();
app.use(express.json());
const axios = require('axios');

const fs = require('fs');
const path = require('path');
const {HLSconversion} = require('../JobQueue/queue')
const multer =require('multer')
app.use(cors());
const { MongoClient, ServerApiVersion, Timestamp } = require('mongodb');

const { Web3Storage  ,getFilesFromPath ,File } = require('web3.storage');

// const busboy = require('connect-busboy');


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

app.post('/delete',(req,res)=>{
  console.log(req.body,'body')
  const {id}=JSON.parse(req.body);
  deleteFromDB(id);

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



app.post('/upload',upload.single('video'), (req, res) => {
  const {publishId,live,creator,thumbnail,title ,signature,message} =JSON.parse(req.body.payload);
  // console.log(req.body.payload);
  // const payload = JSON.parse(req.body.payload);
  
  // 
  
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

       addVideoToDb(publishId,false,creator,thumbnail,title,false);


      
    // });
  // });

  // Listen for finish event when all files are uploaded
  // file.on('finish', () => {
  //   res.status(200).send('All files uploaded successfully');
  // });

  // // Pipe the incoming request stream to Busboy
  // req.pipe(req.busboy);
});


app.post('/saveVODToDB',(req,res)=>{

  

})






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

async function deleteFromDB(id){
console.log(id);
try{

  if(!db){
    connectDB();
}



    let myColl = db.collection('videos');
    const filter = { _id: id };
    const result = await myColl.deleteOne(filter);
    if(result){
      console.log('deleted');
    }


}
catch(error){
  console.error(error);

}


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
