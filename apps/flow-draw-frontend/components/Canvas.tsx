import { initDraw } from "@/app/draw";
import { useEffect, useRef } from "react";
import { useScript, useWindowSize } from "@uidotdev/usehooks";
import { IconButton } from "./IconButton";
import { CircleIcon, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { useState } from "react";

// enum Tool {
//     Circle = "circle",
//     Rectangle = "rect",
//     Line = "line"
// }
type Shape = "circle" | "rect" | "line";

export function Canvas({
    roomId,
    socket
} : {
    roomId: string,
    socket: WebSocket
}) {
    const size = useWindowSize();
    // console.log(size.width);
    // console.log(size.height);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedTool, setSelectedTool] = useState<Shape>("circle");

    //not a good logic to play with the window object, should amke make a class instead!
    useEffect(() => {

    }, [selectedTool]);
    useEffect(() => {
        if (canvasRef.current) {
            initDraw(canvasRef.current, roomId, socket);
        }
    }, [canvasRef]);

    return (
        <div style={{ height: "100vh", overflow: "hidden", position: "relative" }}>
        <canvas ref={canvasRef} width={size.width || "2000"} height={size.height || "1000"} />
        <TopBar setSelectedTool={setSelectedTool} selectedTool={selectedTool}/>

</div>

    );    
}
function TopBar({selectedTool, setSelectedTool} : {
    selectedTool: Shape,
    setSelectedTool: (s: Shape) => void
}) {
    return (
    <div className="absolute top-4 left-4 flex space-x-2">
        <IconButton onClick={() => {setSelectedTool("line")}} activated={selectedTool === "line"} icon={<Pencil/>}></IconButton>
        <IconButton onClick={() => {setSelectedTool("rect")}} activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon/>}></IconButton>
        <IconButton onClick={() => {setSelectedTool("circle")}} activated={selectedTool === "circle"} icon={<CircleIcon/>}></IconButton>
    </div>
    )
}