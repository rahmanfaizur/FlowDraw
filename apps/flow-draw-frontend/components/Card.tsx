import React from "react";

interface CardProps {
    title: string;
    onJoin: () => void;
}

const Card: React.FC<CardProps> = ({ title, onJoin }) => {
    return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-6 transition-transform transform hover:scale-105">
            <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
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