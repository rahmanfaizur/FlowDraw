import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
    lineWidth?: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
    color?: string;
    lineWidth?: number;
} | {
    type: "pencil";
    points: Array<{x: number, y: number}>;
    lineWidth: number;
    color: string;
} | {
    type: "ellipse";
    centerX: number;
    centerY: number;
    radiusX: number;
    radiusY: number;
    rotation: number;
    color?: string;
    lineWidth?: number;
}

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";
    private currentPencilPath: Shape | null = null;
    private strokeSize: number = 5; // Default stroke size
    private strokeColor: string = "#000000"; // Default stroke color

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }
    
    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    }

    setTool(tool: "circle" | "pencil" | "rect" | "ellipse") {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type == "chat") {
                const parsedShape = JSON.parse(message.message);
                this.existingShapes.push(parsedShape.shape);
                this.clearCanvas();
            }
        };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.existingShapes.forEach((shape) => {
            this.ctx.lineWidth = shape.lineWidth || this.strokeSize; // Set line width from shape or default
            if (shape.type === "rect") {
                this.ctx.strokeStyle = "rgba(255, 255, 255)";
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "ellipse") {
                this.ctx.beginPath();
                this.ctx.ellipse(shape.centerX, shape.centerY, shape.radiusX, shape.radiusY, shape.rotation, 0, 2 * Math.PI);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "pencil") {
                this.drawPencilPath(shape);
            }
        });
    }

    private drawPencilPath(path: { points: Array<{ x: number, y: number }> }) {
        this.ctx.lineWidth = path.lineWidth; // Set line width
        this.ctx.beginPath();
        const points = path.points;
        this.ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            if (!points[i]) continue;
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        
        this.ctx.stroke();
        this.ctx.closePath();
    }

    mouseDownHandler = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.selectedTool === "pencil") {
            this.currentPencilPath = {
                type: "pencil",
                points: [{x, y}],
                lineWidth: this.strokeSize,
                color: this.strokeColor
            };
            this.clicked = true;
        } else {
            this.clicked = true;
            this.startX = x;
            this.startY = y;
        }
    }

    mouseMoveHandler = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.clicked) {
            if (this.selectedTool === "pencil" && this.currentPencilPath) {
                this.currentPencilPath.points.push({x, y});
                this.clearCanvas();
                this.drawPencilPath(this.currentPencilPath);
            } else {
                const width = x - this.startX;
                const height = y - this.startY;
                this.clearCanvas();
                this.ctx.strokeStyle = this.strokeColor;
                
                if (this.selectedTool === "rect") {
                    this.ctx.strokeRect(this.startX, this.startY, width, height);
                } else if (this.selectedTool === "circle") {
                    const radius = Math.max(width, height) / 2;
                    const centerX = this.startX + radius;
                    const centerY = this.startY + radius;
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.closePath();
                } else if (this.selectedTool === "ellipse") {
                    const radiusX = Math.abs(width) / 2;
                    const radiusY = Math.abs(height) / 2;
                    const centerX = this.startX + (width < 0 ? width : 0) + radiusX;
                    const centerY = this.startY + (height < 0 ? height : 0) + radiusY;
                    this.ctx.beginPath();
                    this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
            }
        }
    }

    mouseUpHandler = (e: MouseEvent) => {
        if (this.selectedTool === "pencil" && this.currentPencilPath) {
            this.currentPencilPath.lineWidth = this.strokeSize;
            this.existingShapes.push(this.currentPencilPath);
            this.socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shape: this.currentPencilPath }),
                roomId: this.roomId
            }));
            this.currentPencilPath = null;
        } else if (this.clicked) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const width = x - this.startX;
            const height = y - this.startY;

            let shape: Shape | null = null;
            if (this.selectedTool === "rect") {
                shape = {
                    type: "rect",
                    x: this.startX,
                    y: this.startY,
                    height,
                    width,
                    color: this.strokeColor,
                    lineWidth: this.strokeSize
                };
            } else if (this.selectedTool === "circle") {
                const radius = Math.max(width, height) / 2;
                shape = {
                    type: "circle",
                    radius: radius,
                    centerX: this.startX + radius,
                    centerY: this.startY + radius,
                    color: this.strokeColor,
                    lineWidth: this.strokeSize
                };
            } else if (this.selectedTool === "ellipse") {
                const radiusX = Math.abs(width) / 2;
                const radiusY = Math.abs(height) / 2;
                shape = {
                    type: "ellipse",
                    centerX: this.startX + (width < 0 ? width : 0) + radiusX,
                    centerY: this.startY + (height < 0 ? height : 0) + radiusY,
                    radiusX: radiusX,
                    radiusY: radiusY,
                    rotation: 0,
                    color: this.strokeColor,
                    lineWidth: this.strokeSize
                };
            }
            
            if (shape) {
                shape.lineWidth = this.strokeSize; // Set line width for the shape
                this.existingShapes.push(shape);
                this.socket.send(JSON.stringify({
                    type: "chat",
                    message: JSON.stringify({ shape }),
                    roomId: this.roomId
                }));
            }
        }
        this.clicked = false;
    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }

    setStrokeSize(size: number) {
        this.strokeSize = size;
    }

    setStrokeColor(color: string) {
        this.strokeColor = color;
    }
}