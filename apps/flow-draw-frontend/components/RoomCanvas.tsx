"use client"
import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { useRouter } from "next/navigation"; // Import useRouter
import ConnectingToServer from "./ConnectingToServer";

export function RoomCanvas({roomId} : {roomId : string}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [strokeSize, setStrokeSize] = useState<number>(5); // Add stroke size state
    const [isConnecting, setIsConnecting] = useState(true); //handles the connecting logic!
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
                setIsConnecting(false);
                ws.send(JSON.stringify({
                    type: "join_room",
                    roomId: roomId
                }));
            };

            ws.onerror = (error) => {
                console.error("Ws Error:", error);
                setIsConnecting(false);
            }

            ws.onclose = () => {
                console.error("Ws Closed");
                setIsConnecting(false);
            }
            return () => {
                ws.close();
            }
        }
    }, [roomId, router]); // Add dependencies

    if (isConnecting) {
        return <div>
            <ConnectingToServer></ConnectingToServer>
        </div>
    }

    return (
        <div>
            {
                socket ? (
                    <Canvas roomId={roomId} socket={socket} initialStrokeSize={strokeSize} /> 
                ) : (
                    <p>Failed to connect to the server! Please try again!</p>
                )
            }
        </div>
    );
}