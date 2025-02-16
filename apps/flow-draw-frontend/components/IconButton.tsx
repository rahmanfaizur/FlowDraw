import { ReactNode } from "react";

interface IconProps {
    icon: ReactNode;
    onClick: () => void;
    activated: boolean;
}

export function IconButton({ icon, onClick, activated }: IconProps) {
    return (
        <div onClick={onClick} className={`pointer rounded-full border p-2 bg-white hover:bg-gray ${activated ? "bg-green-600" : "text-black"}`}>
            {icon}
        </div>
    );
}
