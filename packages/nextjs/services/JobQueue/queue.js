require('dotenv').config();
const amqp = require('amqplib');

const { Web3Storage  ,getFilesFromPath ,File } = require('web3.storage');

const token = process.env.WEB3STOJ_TOKEN;
// console.log(process.env.WEB3STOJ_TOKEN)
const client = new Web3Storage({token:token});


async function HLSconversion(queueName,inputFilePath,outputFilePath,outputDirectory){

    const connection= await amqp.connect('amqps://streamvault.site:8004');
    console.log(connection);
    const channel = await connection.createChannel();
    const queue = queueName;
    console.log(queue)
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify({inputFilePath,outputFilePath,outputDirectory})), { persistent: true });
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


