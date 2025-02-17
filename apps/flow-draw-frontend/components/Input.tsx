import { forwardRef } from "react";

interface InputProps {
    placeholder: string,
    className?: string,
    onClick?: () => void,
    type?: string
}
  
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    return (
        <div className="relative">
            <input 
                ref={ref}
                onClick={props.onClick} 
                type={props.type || "text"} 
                placeholder={props.placeholder} 
                className={`bg-gray-100 rounded-lg placeholder-gray-500 font-normal text-sm pl-2 py-2 w-full ${props.className}`} 
            />
        </div>
    );
});

Input.displayName = "Input";
export default Input;
