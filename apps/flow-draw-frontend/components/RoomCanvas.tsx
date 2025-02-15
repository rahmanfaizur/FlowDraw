"use client"
import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NTAzMGI1OC1jZTUxLTRjMTAtYjUzNS1jYTBmMWY4NTJiMmMiLCJlbWFpbCI6ImphbWVzQGdtYWlsLmNvbSIsImlhdCI6MTczOTM0MDEzOH0.QqSYSE9hqUit8qcyjlsWeV7lgXugcHlo9CEBDJaWgCQ';

export function RoomCanvas({roomId} : {roomId : string}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    //this runs when component mounts!
    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=${token}`);

        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "join_room",
                roomId: roomId
            }))
        }
    })

    if (!socket) {
        return <div>
            Connecting to the server.....
        </div>
    }

return <div>
    <Canvas roomId={roomId} socket={socket}></Canvas>
</div>

}