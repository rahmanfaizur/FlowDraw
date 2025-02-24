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
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300 group">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{title}</h2>
                <div 
                    onClick={() => void deleteRoomLogic(title, onDelete)} 
                    className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                >
                    <TrashIcon size={20} />
                </div>
            </div>
            <button
                onClick={onJoin}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]"
            >
                Join
            </button>
        </div>
    );
};

export default Card;