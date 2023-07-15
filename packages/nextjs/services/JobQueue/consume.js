const express = require('express');
const amqp = require('amqplib/callback_api');
const ffmpeg = require('fluent-ffmpeg');
const fs=require('fs');
const app = express();



const {UploadToIPFS} =require('./queue');
const { MongoClient, ServerApiVersion, Timestamp,ObjectId  } = require('mongodb');
const uri = "mongodb+srv://admin:admin@cluster0.ainnpst.mongodb.net/?retryWrites=true&w=majority";
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

async function updateStatus(id){

  try{

  const collection = db.collection('videos');

  const filter = { _id: id };
  const update = {
    $set: {
     uploaded:true
    }
  };

  const result = await collection.updateOne(filter, update);

  }
  catch(error){
    throw error;
  }

}



function HlsConversion(inputFilePath, outputFilePath,outputDirectory,id) {
  inputFilePath = '../stream_functions/' + inputFilePath;
  outputFilePath = '/var/www/' + outputDirectory+'/'+outputDirectory+'.m3u8';
  let outputDirectoryName=outputDirectory;
  outputDirectory='/var/www/'+outputDirectory
  console.log(inputFilePath," ",outputDirectory,' ',outputFilePath);

        if(!fs.existsSync(outputDirectory)){
        fs.mkdirSync(outputDirectory, { recursive: true })
       };

  ffmpeg(inputFilePath)
    .output(outputFilePath)
    .outputOptions([
      '-c:v libx264',
      '-c:a aac',
      '-hls_time 10',
      '-hls_segment_type mpegts',
      '-hls_list_size 0',
      '-map 0:v', // Include only video stream
      '-map 0:a'  // Include only audio stream
    ])
    .on('end', async () => {
      console.log('Conversion to HLS completed');
      //remove input file 
      fs.rm(inputFilePath,()=>{
        console.log('deleted file');
      });


      await updateStatus(id);


    })
    .on('error', (error) => {
      console.error('Error converting to HLS:', error);
    })
    .run();
}

amqp.connect('amqp://localhost:5672', function (error0, connection) {
  if (error0) {
    throw error0;
  }
  console.log('Connected to RabbitMQ');
  
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'HLS';

    channel.assertQueue(queue, {
      durable: true
    });

    channel.consume(queue, function (msg) {
      // console.log('Received message:', msg.content.toString());

      let {inputFilePath,outputFilePath,outputDirectory,id} = JSON.parse(msg.content);


      // Trigger HLS conversion
      HlsConversion(inputFilePath, outputFilePath,outputDirectory,id);

    }, {
      noAck: true
    });
  });
});

connectDB();
// Start consuming paths from the queue when the server starts
app.listen(4500, () => {
  console.log('Server started on port 4500');
});
