const Server = require("socket.io");

require('dotenv').config;
const { MongoClient, ServerApiVersion, Timestamp } = require('mongodb');
const uri = "mongodb+srv://admin:admin@cluster0.ainnpst.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
let db;

const io= Server(5000,{
    cors:{
        origin:'*',
    }
});




io.on('connection',(socket)=>{
    // console.log('hello');
    if(!db){
        socket.emit('error','Database error')
        
    }
  
   
    socket.on('join',async ({room})=>{
        console.log(room,'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
        await socket.join(room);
        let myColl = db.collection(room);
        if(!myColl){
            myColl=db.createCollection(room);  
        }
        let query={};
        const pre30Messages =await myColl.find().sort({timestamp:1}).limit(30).toArray()
    //    console.log(pre30Messages,'waterresffrsf  ');
        await socket.emit('joined',pre30Messages);
    });




    socket.on('sendRequest', async ({message,senderId,roomId})=>{

        try{

            console.log(roomId,'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',db);
            let myColl = db.collection(roomId);
            if(!myColl){
                myColl=db.createCollection(roomId);  
            }
            let ts=new Timestamp();
            const doc = { senderId: senderId, timestamp:ts,message:message };
            const result = await myColl.insertOne(doc);
            console.log(
            `A document was inserted with the _id: ${result.insertedId}`,
            );
            

                if(result){

                    io.to(roomId).emit('message-response',doc)

                }
            
                
            


        }
        catch (error){
            console.error(error);
            socket.emit('error','sendRequestError');

        }
        
     


    })

  

    

    

    




})

async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
    db = client.db('StreamVault_LiveMessages');
    
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } 
    catch(error){
        
    }finally {
      // Ensures that the client will close when you finish/error
    //   await client.close();
    }
  }

  run();




