import React, { ReactNode } from "react";

interface ButtonProps {
  size?: ButtonSize;
  variant?: ButtonVariant;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  icon?: ReactNode | null;
}

export enum ButtonSize {
  SMALL = "px-3 py-1.5 text-sm",
  MEDIUM = "px-4 py-2 text-base",
  LARGE = "px-6 py-3 text-lg",
  LONG = "py-2.5 w-[25vw]"
}

export enum ButtonVariant {
  PRIMARY = "bg-blue-600 text-white shadow-md hover:bg-blue-700",
  SECONDARY = "bg-gray-600/80 text-white shadow-md hover:bg-gray-700/80",
  OUTLINE = "border-2 border-gray-400 text-gray-300 hover:border-gray-300 hover:text-white",
  BLACK = "bg-black/80 text-white shadow-md hover:bg-black",
  WHITE = "bg-white/90 text-gray-800 border border-gray-200 shadow-md hover:bg-white",
  RED = "bg-red-600/90 text-white shadow-md hover:bg-red-700"
}

export const Button: React.FC<ButtonProps> = ({
  size = ButtonSize.MEDIUM,
  variant = ButtonVariant.PRIMARY,
  onClick,
  children,
  className,
  icon = null
}) => {
  return (
    <button
      className={`
        rounded-lg ${size} ${variant} 
        transition-all duration-300 
        hover:shadow-lg hover:translate-y-[-1px]
        active:translate-y-[1px] active:shadow-sm
        backdrop-blur-sm
        flex items-center justify-center gap-2
        font-medium
        ${className}
      `}
      onClick={onClick}
    >
      {icon && icon}
      {children}
    </button>
  );
};
