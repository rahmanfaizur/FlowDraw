import { deleteRoom, getRoomBySlug } from "@/services/authService";
import { TrashIcon } from "lucide-react";
import React from "react";

interface CardProps {
    title: string;
    onJoin: () => void;
    onDelete: () => void;
}

async function deleteRoomLogic(title: string, onDelete: () => void) {
    try {
        console.log('Attempting to delete room with title:', title);
        
        console.log('Fetching room details for title:', title);
        const room = await getRoomBySlug(title);
        console.log('Retrieved room:', room);
        
        if (room && room.id) {
            console.log('Deleting room with ID:', room.id);
            const result = await deleteRoom(room.id.toString());
            console.log('Delete result:', result);
            onDelete();
        } else {
            console.error('Room not found for title:', title);
            throw new Error('Room not found');
        }
    } catch (error) {
        console.error('Failed to delete room:', error);
    }
}

const Card: React.FC<CardProps> = ({ title, onJoin, onDelete }) => {
    return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-6 transition-transform transform hover:scale-105">
            <div className="flex justify-between">
                <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
                <div 
                    onClick={() => void deleteRoomLogic(title, onDelete)} 
                    className="cursor-pointer hover:text-red-500"
                >
                    <TrashIcon />
                </div>
            </div>
            <button
                onClick={onJoin}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg w-full shadow-md transition duration-200"
            >
                Join
            </button>
        </div>
    );
};

export default Card;