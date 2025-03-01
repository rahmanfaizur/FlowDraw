import { Tool } from "./Canvas";
import { IconButton } from "./IconButton";
import {
    HomeIcon,
    Pencil,
    RectangleHorizontalIcon,
    CircleIcon,
    EggIcon,
    EllipsisIcon,
    Palette,
    PointerIcon,
    ArrowUpIcon,
    LetterText,
    PenLineIcon,
    SlashIcon,
} from "lucide-react";

interface ToolbarButtonsProps {
    selectedTool: Tool;
    setSelectedTool: (tool: Tool) => void;
    setShowStrokeSize: (show: boolean) => void;
    setShowColorPicker: (show: boolean) => void;
    onHomeClick: () => void;
}

export function ToolbarButtons({
    selectedTool,
    setSelectedTool,
    setShowStrokeSize,
    setShowColorPicker,
    onHomeClick,
}: ToolbarButtonsProps) {
    return (
        <>
            <IconButton
                onClick={onHomeClick}
                icon={<HomeIcon />}
                activated={false}
                className="hover:bg-blue-50"
            />
            <IconButton
                onClick={() => setSelectedTool("pencil")}
                activated={selectedTool === "pencil"}
                icon={<Pencil />}
                className="hover:bg-blue-50"
            />
            <IconButton
                onClick={() => setSelectedTool("rect")}
                activated={selectedTool === "rect"}
                icon={<RectangleHorizontalIcon />}
                className="hover:bg-blue-50"
            />
            <IconButton
                onClick={() => setSelectedTool("circle")}
                activated={selectedTool === "circle"}
                icon={<CircleIcon />}
                className="hover:bg-blue-50"
            />
            <IconButton
                onClick={() => setSelectedTool("ellipse")}
                activated={selectedTool === "ellipse"}
                icon={<EggIcon />}
                className="hover:bg-blue-50"
            />
            <IconButton
                onClick={() => setShowStrokeSize((prev) => !prev)}
                activated={false}
                icon={<EllipsisIcon />}
                className="hover:bg-blue-50"
            />
            <IconButton
                onClick={() => setShowColorPicker((prev) => !prev)}
                activated={false}
                icon={<Palette />}
                className="hover:bg-blue-50"
            />
            <IconButton
                onClick={() => setSelectedTool("pointer")}
                activated={selectedTool === "pointer"}
                icon={<PointerIcon />}
                className="hover:bg-blue-50"
            />
            <IconButton
                onClick={() => setSelectedTool("arrow")}
                activated={selectedTool === "arrow"}
                icon={<ArrowUpIcon />}
                className="hover:bg-blue-50"
            />
            <IconButton
                onClick={() => setSelectedTool("text")}
                activated={selectedTool === "text"}
                icon={<LetterText />}
                className="hover:bg-blue-50"
            />
            <IconButton
                onClick={() => setSelectedTool("line")}
                activated={selectedTool === "line"}
                icon={<SlashIcon />}
                className="hover:bg-blue-50"
            />
        </>
    );
} 