import { useEffect, useRef, useState } from 'react';
import {sendChat,joinRoom,getMessage} from '../../services/Chat/chat'
import { useAccount } from 'wagmi';
import {BlockieAvatar} from '../../components/scaffold-eth'
import { getProfileDetails } from '../../services/stream_functions/mongo';
import Link from 'next/link';

function Chat({id}){
    const {address}=useAccount();

    const scrollableDivRef = useRef(null);
    const [queue,setQueue]=useState([]);

    async function join(){
        const messages=await joinRoom({id});
        // console.log(a);
        const results = await Promise.all(messages.map(async item => {
            // Await the asynchronous function inside the map
            const data = await getProfileDetails(item.senderId);
            // console.log(data,'data');
            return {...data,...item};
          }));

        //   console.log(results)
            
        
        setQueue([...results])
    }
    useEffect(()=>{
        if(!id){
            return
        }
        

        join()
       
   
    },[id])
    
    getMessage(async (msg)=>{
		// console.log(msg,queue.length);
        if(queue.length>30){
            queue.shift();
        }
        const Profiledata=await getProfileDetails(msg.senderId);

       
		setQueue([...queue,{...msg,...Profiledata}]);

	})
    useEffect(() => {
        // console.log('hello')
        
        scrollableDivRef?.current?.scrollIntoView({ behavior: 'smooth' });
      }, [queue]);
    //   console.log(queue)

    return(

        <div className="h-[75vh] w-[30vw] flex flex-col items-start ">
            <p className='text-xl'>Live Chat</p>
            <div  className="h-full w-[30vw] no-scrollbar overflow-x-hidden break-words  ">
            {
			queue?.map( (data)=>{
               
				return (
                <div key={data._id} className='flex mb-3'>
                    <Link  className='w-[70px]' href={`/profile?creator=${data.senderId}`}  >


                  
                    {
                        data.channelImage?
                        <img  src={data.channelImage} className='w-[40px] h-[40px] rounded-full ' alt="" />
                        :
                        <BlockieAvatar address={data.senderId} />
                    }
                          </Link>
                    <h5 className='text-purple-500 text-lg'>{data.channelName? data.channelName:data?.senderId?.slice(0,5)+'...'}</h5>
                   
                    

                <h5 className='w-full break-words flex '> : {data.message}</h5>
                    </div>)
			})
			
			}
              <div ref={scrollableDivRef}></div>

            </div>

                <form action="" className='w-1/2'>
           
            <div class=" ">    
               
                <input type="text" id="message-textbox" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
            </div>

            <button id="chat-button" className="" onClick={(e)=>{e.preventDefault();sendChat(document.getElementById('message-textbox').value,address,id)}}>send</button>
         
            </form>
      
           

        </div>
      

    );
    




}
export default Chat;