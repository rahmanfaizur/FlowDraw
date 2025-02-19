import React, { useEffect, useRef, useState } from "react";
import { getAllRooms, getRoomBySlug, getRoomId } from "@/services/authService";
import { useRouter } from "next/navigation";
import Card from "./Card";
import { CustomButton } from "./CustomButton";

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
            const room = await getRoomBySlug(slug);
            const roomId = room.id;
            router.push(`/canvas/${roomId}`);
        } catch (error) {
            alert("Room name does not exist or an error occurred.");
            console.error("Error joining room:", error);
        }
    };

    const handleClick = async () => {
        if (inputRef.current) {
            const requestBody = inputRef.current.value;
            console.log("Request Body:", requestBody);
            try {
                const id = await getRoomId(requestBody);
                if (!id) {
                    alert('Room name exists, Try with a new room name! Or join the existing room!');
                    return;
                }
                router.push(`/canvas/${id}`);
            } catch (error) {
                console.error("Error getting room ID:", error);
            }
        }
    };

    return (
        <div className="bg-black text-white p-8">
            <h1 className="text-3xl font-bold mb-4">Welcome to the Dashboard</h1>
            <div className="mb-6">
                <p className="mb-2">Join a Room:</p>
                <input
                    type="text"
                    placeholder="Enter room name"
                    ref={inputRef}
                    className="border border-gray-700 rounded px-4 py-2 w-full mb-2 bg-gray-800 text-white"
                />
                <CustomButton onClick={handleClick}>Join Room</CustomButton>
            </div>
            <p className="text-xl font-semibold mb-4">Available Rooms:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <Card
                        key={room.slug}
                        title={room.slug}
                        onJoin={() => handleJoinRoom(room.slug)}
                    />
                ))}
            </div>
        </div>
    );
}

export default Dashboard;