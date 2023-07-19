export default function Toggle({label,setOBS}){


    return (
        <div className="flex ">

<input
        id="theme-toggle"
        type="checkbox"
        className="toggle toggle-primary bg-primary mr-2"
        onChange={(e)=>{setOBS(e.target.checked)}}
    
      />
      <label > {label}</label>
        </div>
      
    )
}