import { ReactNode } from "react";

interface IconProps {
    icon: ReactNode;
    onClick: () => void;
    activated: boolean;
    className?: string
}

export function IconButton({ icon, onClick, activated, className }: IconProps) {
    return (
        <div onClick={onClick} className={`pointer rounded-full border p-2 bg-white hover:bg-gray ${activated ? "text-green-600" : "bg-white"} ${className}`}>
            {icon}
        </div>
    );
}
