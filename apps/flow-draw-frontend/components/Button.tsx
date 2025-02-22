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
  SMALL = "px-2 py-1 text-sm",
  MEDIUM = "px-4 py-2 text-base",
  LARGE = "px-6 py-3 text-lg",
  LONG = "py-2 w-[25vw]"
}

export enum ButtonVariant {
  PRIMARY = "bg-blue-500 text-white",
  SECONDARY = "bg-gray-500 text-white",
  OUTLINE = "border border-gray-500 text-gray-500",
  BLACK = "border bg-black text-white shadow-md",
  WHITE = "border bg-white text-black border-gray-300 shadow-md",
  RED = "border bg-red-500 text-white shadow-md"
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
        rounded-md ${size} ${variant} 
        transition-all duration-200 
        hover:opacity-90 hover:scale-[1.02] hover:shadow-lg
        active:scale-[0.98] active:opacity-80
        flex items-center justify-center gap-2
        ${className}
      `}
      onClick={onClick}
    >
      {icon && icon}
      {children}
    </button>
  );
};
