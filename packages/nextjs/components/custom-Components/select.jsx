

export function Select({label,options,id}){

    return(
        <div className="m-2">
            
        <label htmlFor="countries" className="block mt-2 m-2 mb-2 text-sm font-medium text-gray-900 dark:text-white">{label}</label>
        <select id={id} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        {
            options.map((data)=>{

                return( <option value={data.deviceId}>{data.label}</option>);
            })
        }
       
   
        </select>

        </div>
        
    )

}