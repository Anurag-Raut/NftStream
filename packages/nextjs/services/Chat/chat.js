import { resolve } from 'path';
import io from 'socket.io-client'
const socket=io('http://localhost:5000');


const joinRoom= async ({id})=>{
  if(!id){
    return
  }
  console.log('joining');
    return new Promise((resolve, reject) => {
        socket.emit('join', {room:id});
    
        socket.once('joined', (message) => {
          console.log('joined',message)
          resolve(message);
        });
    
       
      });
}

const sendChat= async (message,senderId,roomId)=>{
      console.log('hemlu');
        socket.emit('sendRequest',{
            message,
            senderId,
            roomId
        })

}

  const getMessage=(callback)=>{
    

    socket.on('message-response', (res) => {
      // console.log('efrreefs0',res);
        callback(res);
    });
  }




export {sendChat,joinRoom,getMessage};