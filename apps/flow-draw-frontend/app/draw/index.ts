import axios from "axios";

const HTTP_BACKEND = process.env.HTTP_BACKEND;
type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
}

export async function initDraw(canvas : HTMLCanvasElement, roomId : string) {
            const ctx = canvas.getContext("2d");

            let existingShapes : Shape[] = await getExistingShapes(roomId);

            if (!ctx) {
                return;
            }

            clearCanvas(existingShapes, canvas, ctx);

            let clicked = false;
            let startX = 0;
            let startY = 0;

            // ctx.strokeRect(25, 25, 100, 100); 
            canvas.addEventListener("mousedown", (e) => {
                clicked = true;
                startX = e.clientX;
                startY = e.clientY;
            });
            
            canvas.addEventListener("mouseup", (e) => {
                clicked = false;
                const width = e.clientX - startX;
                const height = e.clientY - startY;
                existingShapes.push({
                    type: "rect",
                    x: startX,
                    y: startY,
                    height,
                    width
                })
                // console.log(e.clientX);
                // console.log(e.clientY);
            });

            canvas.addEventListener("mousemove", (e) => {
                if (clicked) {
                    const width = e.clientX - startX;
                    const height = e.clientY - startY;
                    clearCanvas(existingShapes, canvas, ctx);
                    //in canvas u clear the canvas and then re render it! at 30fps!
                    ctx.strokeStyle = "rgba(255, 255, 255)";
                    ctx.strokeRect(startX, startY, width, height);
                }
            });
        }

function clearCanvas(existingShapes: Shape[], canvas : HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    existingShapes.map((shape) => {
        if (shape.type === "rect") {
            ctx.strokeStyle = "rgba(255, 255, 255)";
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
    })
}

async function getExistingShapes(roomId : string) {
    //gets from backend and converts the string to object!
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const messages = res.data.messages;

    const shapes = messages.map((x: {message: string}) => {
        const messageData = JSON.parse(x.message);
        return messageData;
    })
    return shapes;
}

