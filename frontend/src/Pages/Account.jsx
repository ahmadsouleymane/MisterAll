import BigTitle from "../components/BigTitle";
import Buttons from "../components/Buttons";
import { useNavigate } from "react-router-dom";
import { MoveLeftIcon } from 'lucide-react'

const Account = () => {

  const navigate = useNavigate()

  return (
    <div className='bg-primaryBlack gap-5 p-5 justify-between items-center flex flex-col min-h-dvh w-full'>
        <div className="justify-center items-start flex flex-col w-full">
          <MoveLeftIcon onClick={() => navigate(-1)} className="text-white h-12 w-12" />  
        </div>
        <div className="justify-center items-center flex flex-col">
          <BigTitle primary title="Bienvenue"/>
          <p className="text-white font-medium text-[18px] text-center leading-[18px] ">Commence ton aventure avec MisterAll, ton compagnon d'études.</p>
        </div>
        <div className="gap-2 flex flex-col w-full">
          <Buttons onClick={() => navigate("/signup")} primary title="Créer un compte"/>
          <Buttons onClick={() => navigate("/login")} dark secondary title="Se connecter"/>
        </div>

    </div>
  )
}

export default Account