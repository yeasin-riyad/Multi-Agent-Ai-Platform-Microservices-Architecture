import { useEffect } from "react"
import Home from "./pages/Home"
import getCurrentUser from "./features/getCurrentUser"


const App = () => {
  useEffect(()=>{
    const getUser=async()=>{
      return await getCurrentUser();
    }
      getUser();
  },[])
  return (
   <>
   <Home/>
   </>
  )
}

export default App
