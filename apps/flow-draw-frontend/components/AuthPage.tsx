"use client"
import Input from "../components/Input"
import { Button } from "./Button";

export function AuthPage({isSignin} : {
    isSignin: boolean
}) {
    return (
      <div className="relative w-screen h-screen">
  <img
    src="https://res.cloudinary.com/dvsbdjslb/image/upload/v1739686252/10584.jpg"
    alt=""
    className="w-full h-full"
  />
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vh]  px-8 flex gap-0">
  {/* right div  */}
    <div className="flex-1 border-l-4 border-y-4 rounded-l-xl border-white bg-transparent">
      hey
    </div>
    {/* left div  */}
    <div className="flex-1 bg-white border-r-4 rounded-r-xl">
      <Input placeholder="Enter your email" /> 
      <Input placeholder="Enter your password" /> 
      <Button></Button>
    </div>
  </div>
</div>
      );      
}

