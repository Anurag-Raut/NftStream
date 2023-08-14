

export default function Button({label,onClick,color}){

    return(
        <button style={{backgroundColor:color}}  type="button" onClick={onClick} className="text-white btn btn-secondary hover:btn-secondary focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:btn-secondary dark:hover:bg-purple-700 dark:focus:ring-purple-900">{label}</button>

    )
}