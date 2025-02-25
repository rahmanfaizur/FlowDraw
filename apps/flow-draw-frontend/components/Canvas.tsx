import { useEffect, useRef, useState } from "react";
import { useWindowSize } from "@uidotdev/usehooks";
import { IconButton } from "./IconButton";
import { ArrowUp10Icon, ArrowUpIcon, CircleIcon, EggIcon, EllipsisIcon, EraserIcon, HomeIcon, LetterText, LetterTextIcon, Palette, Pencil, PointerIcon, RectangleHorizontalIcon, TextIcon } from "lucide-react";
import { Game } from "@/app/draw/game";
import { SketchPicker, ColorResult } from 'react-color';
import { useRouter } from "next/navigation";


export type Tool = "circle" | "rect" | "pencil" | "ellipse" | "pointer" | "arrow" | "text";

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
    const [textInputPosition, setTextInputPosition] = useState<{x: number, y: number} | null>(null);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [currentText, setCurrentText] = useState<string>("");
    const [textPosition, setTextPosition] = useState<{x: number, y: number}>({ x: 0, y: 0 });

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

            const handleTextClick = (x: number, y: number) => {
                setTextInputPosition({ x, y });
            };

            g.onTextClick = handleTextClick;

            g.onStartText = (x: number, y: number) => {
                setIsTyping(true);
                setTextPosition({ x, y });
                setCurrentText("");
            };

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

    const handleTextKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (currentText.trim() && game) {
                game.addText(currentText, textPosition.x, textPosition.y);
                setIsTyping(false);
                setCurrentText("");
            }
        }
    };

    return (
        <div style={{ height: "100vh", overflow: "hidden", position: "relative" }}>
            <canvas ref={canvasRef} width={size.width || "2000"} height={size.height || "1000"} />
            {isTyping && (
                <div style={{
                    position: 'absolute',
                    left: textPosition.x,
                    top: textPosition.y,
                    border: '1px dotted white',
                    minWidth: '200px',
                    minHeight: '40px',
                    padding: '8px'
                }}>
                    <textarea
                        value={currentText}
                        onChange={(e) => setCurrentText(e.target.value)}
                        onKeyDown={handleTextKeyDown}
                        autoFocus
                        style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: strokeColor,
                            resize: 'none',
                            width: '100%',
                            fontSize: `${strokeSize * 4}px`,
                            fontFamily: 'Brush Script MT, cursive',
                            lineHeight: '1.2'
                        }}
                    />
                </div>
            )}
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
            <IconButton onClick={() => { setSelectedTool("arrow") }} activated={selectedTool === "arrow"} icon={<ArrowUpIcon/>}></IconButton>
            <IconButton onClick={() => { setSelectedTool("text") }} activated={selectedTool === "text"} icon={<LetterText/>}></IconButton>
        </div>
    );
}
