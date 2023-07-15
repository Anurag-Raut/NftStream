



export default function VideoCard({image,title}){

    return(
        <div className="w-[250px] h-[200px] m-10  break-words">
            <img className="w-full h-full" src={image} alt="" />
            <h5 className="w-full">
                {title}
            </h5>

        </div>

    )


}