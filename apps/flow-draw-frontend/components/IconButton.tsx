import { ReactNode } from "react";

interface IconProps {
    icon: ReactNode;
    onClick: () => void;
    activated: boolean;
    className?: string;
}

export function IconButton({ icon, onClick, activated, className }: IconProps) {
    return (
        <div
            onClick={onClick}
            className={`
                pointer
                rounded-lg
                border
                p-2.5
                transition-all
                duration-200
                ease-in-out
                cursor-pointer
                shadow-sm
                ${activated ? "bg-blue-100 text-blue-600 border-blue-300" : "bg-white hover:bg-gray-50"}
                ${className}
            `}
        >
            {icon}
        </div>
    );
}
