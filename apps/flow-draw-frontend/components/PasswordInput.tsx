"use client"
import { forwardRef, useState } from "react";

interface PasswordInputProps {
    placeholder: string,
    className?: string,
    onClick?: () => void
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <input 
                ref={ref}
                onClick={props.onClick} 
                type={showPassword ? "text" : "password"} 
                placeholder={props.placeholder} 
                className={`
                    bg-gray-100 rounded-lg placeholder-gray-500 
                    font-normal text-sm pl-2 py-2 pr-10 w-full 
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 
                    focus:bg-white hover:bg-gray-50
                    ${props.className}
                `} 
            />
            <button 
                type="button"
                className={`
                    absolute right-2 top-1/2 -translate-y-1/2 
                    text-gray-500 p-1 rounded-full
                    transition-all duration-200
                    hover:text-gray-700 hover:bg-gray-100
                    active:bg-gray-200
                `}
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.773 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                )}
            </button>
        </div>
    );
});

PasswordInput.displayName = "PasswordInput";
export default PasswordInput;
