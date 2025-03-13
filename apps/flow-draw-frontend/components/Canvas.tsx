import { useEffect, useRef, useState } from "react";
import { useWindowSize } from "@uidotdev/usehooks";
import { Game } from "@/app/draw/game";
import { SketchPicker, ColorResult } from 'react-color';
import { useRouter } from "next/navigation";
import { ToolbarButtons } from "./ToolbarButtons";


export type Tool = "circle" | "rect" | "pencil" | "ellipse" | "pointer" | "arrow" | "text" | "line" | "eraser" | "stroke" | "pallete";

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
    // const [isGrabbing, setIsGrabbing] = useState<boolean>(false);

    console.log(textInputPosition);

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
    }, [canvasRef, roomId, socket]);

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

    const getCursor = () => {
        return "default";
    };

    return (
        <div style={{ 
            height: "100vh", 
            overflow: "hidden", 
            position: "relative",
            cursor: getCursor()
        }}
        >
            <canvas 
                ref={canvasRef} 
                width={size.width || "2000"} 
                height={size.height || "1000"}
                style={{
                    cursor: getCursor()
                }}
            />
            {isTyping && (
                <div style={{
                    position: 'absolute',
                    left: textPosition.x,
                    top: textPosition.y,
                    border: '1px dotted #4285f4',
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
                            fontSize: `${strokeSize * 6}px`,
                            fontFamily: 'Arial, sans-serif',
                            lineHeight: '1.2',
                            fontWeight: 'bold'
                        }}
                    />
                </div>
            )}
            <TopBar 
                setSelectedTool={setSelectedTool} 
                selectedTool={selectedTool} 
                setShowStrokeSize={setShowStrokeSize}
                setShowColorPicker={setShowColorPicker}
                showColorPicker={showColorPicker}
                showStrokeSize={showStrokeSize}
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

function TopBar({ selectedTool, setSelectedTool, setShowStrokeSize, setShowColorPicker, showColorPicker, showStrokeSize } : {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void,
    setShowStrokeSize: (show: boolean) => void,
    setShowColorPicker: (show: boolean) => void,
    showStrokeSize: boolean,
    showColorPicker: boolean;
}) {
    const router = useRouter();

    function goToDashboard() {
        router.push('/dashboard');
    }
    
    return (
        <div className="absolute top-4 left-4 flex space-x-2">
            <ToolbarButtons
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
                showStrokeSize={showStrokeSize}  // ✅ Added missing prop
                setShowStrokeSize={setShowStrokeSize}
                showColorPicker={showColorPicker}  // ✅ Added missing prop
                setShowColorPicker={setShowColorPicker}
                onHomeClick={goToDashboard}
            />
        </div>
    );
}
