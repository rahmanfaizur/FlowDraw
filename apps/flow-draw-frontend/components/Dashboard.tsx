"use client"

import { useEffect, useRef, useState } from "react";
import { getAllRooms, getRoomBySlug, getRoomId } from "@/services/authService"; // Import the new function
import { useRouter } from "next/navigation";

interface Room {
    slug: string;
}

export function Dashboard() {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const allRooms = await getAllRooms();
                setRooms(allRooms);
            } catch (error) {
                console.error("Error fetching rooms:", error);
            }
        };

        fetchRooms();
    }, []);

    const handleJoinRoom = async (slug: string) => {
        try {
            const room = await getRoomBySlug(slug); // Use the new function
            const roomId = room.id; // Assuming the room object contains an id field
            router.push(`/canvas/${roomId}`);
        } catch (error) {
            console.error("Error joining room:", error);
        }
    };

    const handleClick = async () => {
        if (inputRef.current) {
            const requestBody = inputRef.current.value;
            console.log("Request Body:", requestBody); // Log the input value
            try {
                const id = await getRoomId(requestBody); // Use the new function
                router.push(`/canvas/${id}`); // Navigate to the canvas page
            } catch (error) {
                console.error("Error getting room ID:", error); // Log any errors
            }
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
            <p className="mt-4">Join a Room:</p>
            <input type="text" placeholder="Enter room name" ref={inputRef} />
            <button onClick={handleClick} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Join Room</button>
            <p className="mt-4">Available Rooms:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                    <div key={room.slug} className="border p-4 rounded">
                        <h2 className="text-xl">{room.slug}</h2>
                        <button
                            onClick={() => handleJoinRoom(room.slug)}
                            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Join
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
