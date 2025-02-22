import { useEffect, useRef, useState } from "react";
import { useWindowSize } from "@uidotdev/usehooks";
import { IconButton } from "./IconButton";
import { CircleIcon, EggIcon, EllipsisIcon, EraserIcon, HomeIcon, Palette, Pencil, PointerIcon, RectangleHorizontalIcon } from "lucide-react";
import { Game } from "@/app/draw/game";
import { SketchPicker, ColorResult } from 'react-color';
import { useRouter } from "next/navigation";


export type Tool = "circle" | "rect" | "pencil" | "ellipse" | "pointer";

export function Canvas({
    roomId,
    socket,
    initialStrokeSize
} : {
    roomId: string,
    socket: WebSocket,
    initialStrokeSize: number
}) {
    const size = useWindowSize();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");
    const [showStrokeSize, setShowStrokeSize] = useState<boolean>(false);
    const [strokeSize, setStrokeSize] = useState<number>(initialStrokeSize);
    const [strokeColor, setStrokeColor] = useState<string>("#ffffff");
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {
        game?.setStrokeSize(strokeSize);
    }, [strokeSize, game]);

    useEffect(() => {
        game?.setStrokeColor(strokeColor);
    }, [strokeColor, game]);

    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            return () => {
                g.destroy();
            }
        }
    }, [canvasRef]);

    const handleColorChange = (color: ColorResult) => {
        const { r, g, b, a } = color.rgb;
        const rgba = `rgba(${r}, ${g}, ${b}, ${a})`;
        setStrokeColor(rgba);
    };

    return (
        <div style={{ height: "100vh", overflow: "hidden", position: "relative" }}>
            <canvas ref={canvasRef} width={size.width || "2000"} height={size.height || "1000"} />
            <TopBar 
                setSelectedTool={setSelectedTool} 
                selectedTool={selectedTool} 
                setShowStrokeSize={setShowStrokeSize}
                setShowColorPicker={setShowColorPicker}
            />
            {showStrokeSize && (
                <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={strokeSize} 
                    onChange={(e) => setStrokeSize(Number(e.target.value))} 
                    style={{ position: "absolute", bottom: "20px", left: "20px" }}
                />
            )}
            {showColorPicker && (
                <div style={{ position: "absolute", bottom: "60px", left: "20px" }}>
                    <SketchPicker color={strokeColor} onChange={handleColorChange} />
                </div>
            )}
        </div>
    );
}

function TopBar({ selectedTool, setSelectedTool, setShowStrokeSize, setShowColorPicker } : {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void,
    setShowStrokeSize: (show: boolean) => void,
    setShowColorPicker: (show: boolean) => void
}) {
    const router = useRouter();

    function goToDashboard() {
        router.push('/dashboard');
    }
    return (
        <div className="absolute top-4 left-4 flex space-x-2">
            <IconButton onClick={goToDashboard} icon={<HomeIcon/>}></IconButton>
            <IconButton onClick={() => { setSelectedTool("pencil") }} activated={selectedTool === "pencil"} icon={<Pencil/>}></IconButton>
            <IconButton onClick={() => { setSelectedTool("rect") }} activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon/>}></IconButton>
            <IconButton onClick={() => { setSelectedTool("circle") }} activated={selectedTool === "circle"} icon={<CircleIcon/>}></IconButton>
            <IconButton onClick={() => { setSelectedTool("ellipse") }} activated={selectedTool === "ellipse"} icon={<EggIcon/>}></IconButton>
            <IconButton onClick={() => setShowStrokeSize(prev => !prev)} activated={false} icon={<EllipsisIcon/>}></IconButton>
            <IconButton onClick={() => setShowColorPicker(prev => !prev)} activated={false} icon={<Palette/>}></IconButton>
            <IconButton onClick={() => { setSelectedTool("pointer") }} activated={selectedTool === "pointer"} icon={<PointerIcon/>}></IconButton>
        </div>
    );
}
