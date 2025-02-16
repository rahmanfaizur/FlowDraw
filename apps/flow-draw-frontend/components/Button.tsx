import React from "react";
interface ButtonProps {
    size?: ButtonSize;
  variant?: ButtonVariant;
  onClick?: () => void;
  children: React.ReactNode;
}

enum ButtonSize {
  SMALL = "px-2 py-1 text-sm",
  MEDIUM = "px-4 py-2 text-base",
  LARGE = "px-6 py-3 text-lg",
}

enum ButtonVariant {
  PRIMARY = "bg-blue-500 text-white",
  SECONDARY = "bg-gray-500 text-white",
  OUTLINE = "border border-gray-500 text-gray-500",
}

export const Button: React.FC<ButtonProps> = ({
  size = ButtonSize.MEDIUM,
  variant = ButtonVariant.PRIMARY,
  onClick,
  children,
}) => {
  return (
    <button
      className={`rounded-md ${size} ${variant} transition-all duration-200 hover:opacity-80`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};