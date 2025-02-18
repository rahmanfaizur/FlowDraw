"use client"

import { useRef, useState } from "react";
import { getRoomId } from "@/services/authService"; // Import the new function

export function Dashboard() {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);

    const handleClick = async () => {
        if (inputRef.current) {
            const requestBody = inputRef.current.value;
            console.log("Request Body:", requestBody); // Log the input value
            try {
                const id = await getRoomId(requestBody); // Use the new function
                setRoomId(id);
            } catch (error) {
                console.error("Error getting room ID:", error); // Log any errors
            }
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
            <p className="mt-4">Click to get a room id</p>
            <input type="text" placeholder="Enter your request" ref={inputRef} />
            <button onClick={handleClick}>Click me</button>
            {roomId && <p className="mt-4">Room ID: {roomId}</p>}
        </div>
    );
}