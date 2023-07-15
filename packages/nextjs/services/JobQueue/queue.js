require('dotenv').config();
const amqp = require('amqplib');

const { Web3Storage  ,getFilesFromPath ,File } = require('web3.storage');

const token = process.env.WEB3STOJ_TOKEN;

const client = new Web3Storage({token:token});


async function HLSconversion(queueName,inputFilePath,outputFilePath,outputDirectory,id){

    const connection= await amqp.connect('amqp://localhost:5672');
    // console.log(connection);
    const channel = await connection.createChannel();
    const queue = queueName;
    console.log(queue)
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify({inputFilePath,outputFilePath,outputDirectory,id})), { persistent: true });
    await channel.close(); 
    await connection.close(); 

}
async function UploadToIPFS(folderPath,outputDirectory){
    
    console.log(folderPath)
    // Create a web3.storage client
  
    // Create an array to hold file objects
    const files = await getFilesFromPath(folderPath);
    const cid = await client.put(files)
    console.log('https://'+cid+'.ipfs.w3s.link/'+outputDirectory);
  
  
}
module.exports = {
    HLSconversion,
    UploadToIPFS,
  };


