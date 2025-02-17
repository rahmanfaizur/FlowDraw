import { useEffect, useRef } from "react";
import { useWindowSize } from "@uidotdev/usehooks";
import { IconButton } from "./IconButton";
import { CircleIcon, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { Game } from "@/app/draw/game";

// enum Tool {
//     Circle = "circle",
//     Rectangle = "rect",
//     Line = "pencil"
// }
export type Tool = "circle" | "rect" | "pencil";

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
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");


    //not a good logic to play with the window object, should make make a class instead!
    useEffect(() => {
        // window.selectedTool = selectedTool;
        //should switch this to class later and expose a fn!
        game?.setTool(selectedTool);

    }, [selectedTool, game]);


    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            // initDraw(canvasRef.current, roomId, socket);
            setGame(g);

            return () => {
                g.destroy();
            }
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
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void
}) {
    return (
    <div className="absolute top-4 left-4 flex space-x-2">
        <IconButton onClick={() => {setSelectedTool("pencil")}} activated={selectedTool === "pencil"} icon={<Pencil/>}></IconButton>
        <IconButton onClick={() => {setSelectedTool("rect")}} activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon/>}></IconButton>
        <IconButton onClick={() => {setSelectedTool("circle")}} activated={selectedTool === "circle"} icon={<CircleIcon/>}></IconButton>
    </div>
    )
}