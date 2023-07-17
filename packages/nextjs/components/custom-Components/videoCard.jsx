import Link from "next/link";




export default function VideoCard({image,title,id,creator}){
    console.log(id,creator);

    return(
        <Link href={`/view/${id}`} className="w-[250px] h-[200px] m-10  break-words">
            <img className="w-full h-full" src={image} alt="" />
            <h5 className="w-full">
                {title}
            </h5>

        </Link>

    )


}