import { useEffect, useState } from 'react';
import {sendChat,joinRoom,getMessage} from '../../services/Chat/chat'
function Chat({id}){
    const [queue,setQueue]=useState([]);

    async function join(){
        const a =await joinRoom({id});
        console.log(a);
        setQueue([...a])
    }
    useEffect(()=>{
        if(!id){
            return
        }
        

        join()
       
   
    },[id])
    
    getMessage((msg)=>{
		console.log(msg,queue.length);
        if(queue.length>30){
            queue.shift();
        }
       
		setQueue([...queue,msg]);

	})

    return(

        <div className="h-[65vh] w-[30vw]">
            <div className="h-full w-full  overflow-y-scroll break-words ">
            {
			queue?.map((data)=>{
				return <h5> {data.message}</h5>
			})
			
			}

            </div>
            <div>
                <input type="text" id='message-textbox' />
                <button id="chat-button" className="" onClick={()=>{sendChat(document.getElementById('message-textbox').value,'anurag',id)}}>send</button>
            </div>
           

        </div>

    );
    




}
export default Chat;