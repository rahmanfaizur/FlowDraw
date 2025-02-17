export interface IconProps {
    size: "sm" | "md" | "lg" | "xl" | "xxl" | "errorPage";
    className?: string;
}

export const iconSizeVariants = {
    "sm": "size-2",
    "md": "size-4",
    "lg": "size-6",
    "xl": "size-8",
    "xxl": "size-10",
    "errorPage": "size-60"
}