import { createPortal } from "react-dom";
import { deleteRoomLogic } from "./Card";

interface GeneralPopupProps {
    title?: string;
    onDelete?: () => void;
    onClose: () => void;
    header: string;
    buttonOneText?: string;
    buttonTwoText?: string;
}

export default function GeneralPopup({title, onDelete, onClose, header, buttonOneText, buttonTwoText} : GeneralPopupProps) {

    return createPortal(
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-blue-950 text-white p-6 rounded-lg shadow-lg w-68"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <p className="text-center font-semibold text-white">{header}</p>
                <div className="flex justify-center gap-4 mt-4">
                    {buttonOneText && 
                    <button 
                    onClick={() => {
                        void deleteRoomLogic(title ?? "", onDelete ?? (() => {}));
                        onClose();
                    }} 
                    className="px-3 py-1 bg-white text-black rounded-md"
                >
                    {buttonOneText}
                </button>}
                    {buttonTwoText && 
                    <button
                    onClick={onClose}
                    className="px-3 py-1 bg-white text-black rounded-md">
                    {buttonTwoText}
                    </button>}
                </div>
            </div>
        </div>,
        document.body // Mounts the popup outside the normal component tree
    );
}
