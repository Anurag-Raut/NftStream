import { useEffect, useState } from "react";
import { getTokenAddress } from "../../services/web3/creator/creator";
import InputBox from "./inputBox";
import Link from 'next/link'



function Premium(){
    const [tokenAddress,setTokenAddress]=useState('');
    const [premiumVisible,setPremiumVisible]=useState(0);
    useEffect(()=>{
        async function getAdd(){
            const addr =await getTokenAddress();
            setTokenAddress(addr);
        }

        getAdd();

      

    },[])
    // console.log(tokenAddress)


    
   


    return (

        <div>

<div class="flex items-center mr-4">
        <input  id="purple-checkbox" type="checkbox" onChange={(e)=>{setPremiumVisible(e.target.checked)}} value="" class="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
        <label for="purple-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Premium Content</label>
    </div>

    {
        premiumVisible?(

        tokenAddress===''?
        <div>
            <p className="text-sm font-bold"> 
            You dont have your Token Contract
            </p>
           
             <Link href={'/profile'}  class="text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 mr-2 mb-2">
        
        Create Token Contract
      </Link>

        </div>
       
    :

        <InputBox type={'number'} id={'premium-token'} label={'enter amount of token'} />
        
        )
        :null
    }


        </div>
    
    
    )

}
export default Premium;