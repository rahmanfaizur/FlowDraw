import { useEffect, useRef, useState } from "react";
import { useWindowSize } from "@uidotdev/usehooks";
import { IconButton } from "./IconButton";
import { CircleIcon, EggIcon, EllipsisIcon, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { Game } from "@/app/draw/game";

export type Tool = "circle" | "rect" | "pencil" | "ellipse";

export function Canvas({
    roomId,
    socket,
    initialStrokeSize // Change prop name to initialStrokeSize
} : {
    roomId: string,
    socket: WebSocket,
    initialStrokeSize: number // Define initialStrokeSize type
}) {
    const size = useWindowSize();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");
    const [showStrokeSize, setShowStrokeSize] = useState<boolean>(false); // State for stroke size visibility
    const [strokeSize, setStrokeSize] = useState<number>(initialStrokeSize); // Add strokeSize state

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {
        game?.setStrokeSize(strokeSize);
    }, [strokeSize, game]);

    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            return () => {
                g.destroy();
            }
        }
    }, [canvasRef]);

    return (
        <div style={{ height: "100vh", overflow: "hidden", position: "relative" }}>
            <canvas ref={canvasRef} width={size.width || "2000"} height={size.height || "1000"} />
            <TopBar 
                setSelectedTool={setSelectedTool} 
                selectedTool={selectedTool} 
                setShowStrokeSize={setShowStrokeSize} // Pass the function to toggle visibility
            />
            {showStrokeSize && ( // Conditionally render the stroke size input
                <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={strokeSize} 
                    onChange={(e) => setStrokeSize(Number(e.target.value))} 
                    style={{ position: "absolute", bottom: "20px", left: "20px" }} // Positioning the input
                />
            )}
        </div>
    );
}

function TopBar({ selectedTool, setSelectedTool, setShowStrokeSize } : {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void,
    setShowStrokeSize: (show: boolean) => void // Add prop for toggling stroke size visibility
}) {
    return (
        <div className="absolute top-4 left-4 flex space-x-2">
            <IconButton onClick={() => { setSelectedTool("pencil") }} activated={selectedTool === "pencil"} icon={<Pencil/>}></IconButton>
            <IconButton onClick={() => { setSelectedTool("rect") }} activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon/>}></IconButton>
            <IconButton onClick={() => { setSelectedTool("circle") }} activated={selectedTool === "circle"} icon={<CircleIcon/>}></IconButton>
            <IconButton onClick={() => { setSelectedTool("ellipse") }} activated={selectedTool === "ellipse"} icon={<EggIcon/>}></IconButton>
            <IconButton onClick={() => setShowStrokeSize(prev => !prev)} activated={false} icon={<EllipsisIcon/>}></IconButton> {/* Toggle stroke size input */}
        </div>
    );
}