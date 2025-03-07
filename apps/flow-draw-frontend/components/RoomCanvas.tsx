"use client"
import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { useRouter } from "next/navigation"; // Import useRouter

export function RoomCanvas({roomId} : {roomId : string}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [strokeSize, setStrokeSize] = useState<number>(5); // Add stroke size state
    const router = useRouter(); // Initialize useRouter
    console.log(setStrokeSize);

    // Check for token and redirect if not found
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You need to sign in first."); // Show alert
            router.push("/signin"); // Redirect to signin page
        } else {
            const ws = new WebSocket(`${WS_URL}?token=${token}`);

            ws.onopen = () => {
                setSocket(ws);
                ws.send(JSON.stringify({
                    type: "join_room",
                    roomId: roomId
                }))
            }
        }
    }, [roomId, router]); // Add dependencies

    if (!socket) {
        return <div>
            Connecting to the server.....
        </div>
    }

    return (
        <div>
            <Canvas roomId={roomId} socket={socket} initialStrokeSize={strokeSize} /> {/* Pass initial stroke size */}
            {/* Control to change stroke size can be removed from here */}
        </div>
    );
}