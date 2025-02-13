"use client"

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient({
    messages,
    id
} : {
    messages: {message: string}[];
    id: string
}) {
    const [chat, setChats] = useState(messages);
    const [currentMessage, setCurrentMessage] = useState("");
    const { socket, loading } = useSocket();

    useEffect(() => {
        if (socket && !loading) {

            socket.send(JSON.stringify({
                type: "join_room",
                roomId: id
            }))
            socket.onmessage = (event : any) => {
                const parsedData = JSON.parse(event.data);
                if (parsedData.type === "chat") {
                    // alert("chat recieved!");
                    //could check if its from same room!
                    setChats(c => [...c, {message: parsedData.message}])
                }
            }
        }
        return () => {
            socket?.close();
        }
    }, [socket, loading, id]);

    return <div>
    {chat.map(m => <div>{m.message}</div>)}

    <input type="text" value={currentMessage} onChange={e  => {
        setCurrentMessage(e.target.value);
    }} name="" id="" />
    <button onClick={() => {
        socket?.send(JSON.stringify({
            type: "chat",
            roomId: id,
            message: currentMessage
        }))
    }}>Send Message</button>
    </div>
}