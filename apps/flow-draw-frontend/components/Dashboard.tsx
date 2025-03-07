import React, { useEffect, useRef, useState } from "react";
import { getAllRooms, getRoomBySlug, getRoomId } from "@/services/authService";
import { useRouter } from "next/navigation";
import Card from "./Card";
import { CustomButton } from "./CustomButton";
import Navbar from "./Navbar";

export function Dashboard({ roomId, setRoomId }: { roomId: string | null; setRoomId: (id: string) => void }) {
    console.log(roomId);
    console.log(setRoomId);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const router = useRouter();

    const fetchRooms = async () => {
        try {
            const allRooms = await getAllRooms();
            setRooms(allRooms);
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    useEffect(() => {
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
        <div className="bg-my-custom text-white p-8 w-full h-full">
            <Navbar />
            <div className="flex justify-start items-center mb-8">
                <div className="bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg p-6 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold text-white mb-4">Create Room</h2>
                    <input
                        type="text"
                        placeholder="Enter room name"
                        ref={inputRef}
                        className="border border-gray-600 rounded-lg px-4 py-2 w-full mb-4 bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <CustomButton onClick={handleClick} className="w-full">
                        Create Room
                    </CustomButton>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Existing Rooms */}
                {rooms.map((room) => (
                    <Card
                        key={room.slug}
                        title={room.slug}
                        onJoin={() => handleJoinRoom(room.slug)}
                        onDelete={fetchRooms}
                    />
                ))}
            </div>
        </div>
    );
}

export default Dashboard;