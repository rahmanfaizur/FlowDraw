import Image from "next/image";

export default function ConnectingToServer() {
    return (
        <div className="bg-my-custom text-white flex items-center justify-center w-screen h-screen">
            <div className="font-semibold text-2xl flex">
                Connecting to the server
                <Image src="https://res.cloudinary.com/dvsbdjslb/image/upload/v1741893387/images.gif" width={30} height={10} alt="..."/>
            </div>
        </div>
    )
}