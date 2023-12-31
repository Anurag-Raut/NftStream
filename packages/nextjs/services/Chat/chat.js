import { resolve } from 'path';
import io from 'socket.io-client'
import { notification } from '../../utils/scaffold-eth/notification';
const socket=io('https://streamvault.site:4999');


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
      if(message===''){
        notification.error('enter chat')
      }
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