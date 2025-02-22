import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";
import { deleteChat } from "@/services/authService";

type Shape = {
    id: string;
    selected?: boolean;
    type: "rect" | "circle" | "pencil" | "ellipse";
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
    lineWidth?: number;
} | {
    id: string;
    selected?: boolean;
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
    color?: string;
    lineWidth?: number;
} | {
    id: string;
    selected?: boolean;
    type: "pencil";
    points: Array<{x: number, y: number}>;
    lineWidth: number;
    color: string;
} | {
    id: string;
    selected?: boolean;
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
    private strokeSize: number = 5;
    private strokeColor: string = "rgba(255, 255, 255, 1)";
    private selectedShapeId: string | null = null;
    private isDragging: boolean = false;
    private dragOffsetX: number = 0;
    private dragOffsetY: number = 0;
    private lastFrameTime: number = 0;
    private readonly FPS: number = 30;
    private readonly frameInterval: number = 1000 / 30; // 33.33ms between frames

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
            this.ctx.lineWidth = shape.lineWidth || this.strokeSize;
            this.ctx.strokeStyle = shape.color || this.strokeColor;
            
            if (shape.selected) {
                this.ctx.save();
                this.ctx.strokeStyle = '#00ff00';
                this.ctx.lineWidth += 2;
            }
            
            if (shape.type === "rect") {
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
            
            if (shape.selected) {
                this.ctx.restore();
            }
            
            if (shape.selected) {
                this.drawDeleteButton(shape);
            }
        });
    }

    private drawPencilPath(path: { points: Array<{ x: number, y: number }>, color: string }) {
        this.ctx.strokeStyle = path.color;
        this.ctx.lineWidth = path.lineWidth;
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

    private drawDeleteButton(shape: Shape) {
        if (shape.selected) {
            this.ctx.save();
            
            // Draw X button
            const buttonSize = 20;
            let buttonX, buttonY;
            
            if (shape.type === "rect") {
                buttonX = shape.x + shape.width;
                buttonY = shape.y;
            } else if (shape.type === "circle") {
                buttonX = shape.centerX + shape.radius;
                buttonY = shape.centerY - shape.radius;
            } else if (shape.type === "ellipse") {
                buttonX = shape.centerX + shape.radiusX;
                buttonY = shape.centerY - shape.radiusY;
            } else if (shape.type === "pencil") {
                const maxX = Math.max(...shape.points.map(p => p.x));
                const minY = Math.min(...shape.points.map(p => p.y));
                buttonX = maxX;
                buttonY = minY;
            }

            // Draw circle background
            this.ctx.fillStyle = 'red';
            this.ctx.beginPath();
            this.ctx.arc(buttonX, buttonY, buttonSize/2, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw X
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(buttonX - 5, buttonY - 5);
            this.ctx.lineTo(buttonX + 5, buttonY + 5);
            this.ctx.moveTo(buttonX + 5, buttonY - 5);
            this.ctx.lineTo(buttonX - 5, buttonY + 5);
            this.ctx.stroke();

            this.ctx.restore();
        }
    }

    private async deleteSelectedShape() {
        const selectedShape = this.existingShapes.find(shape => shape.selected);
        if (selectedShape) {
            try {
                await deleteChat(selectedShape.id);
                this.existingShapes = this.existingShapes.filter(shape => shape.id !== selectedShape.id);
                this.clearCanvas();
            } catch (error) {
                console.error("Error deleting shape:", error);
            }
        }
    }

    private isClickOnDeleteButton(x: number, y: number, shape: Shape): boolean {
        let buttonX, buttonY;
        
        if (shape.type === "rect") {
            buttonX = shape.x + shape.width;
            buttonY = shape.y;
        } else if (shape.type === "circle") {
            buttonX = shape.centerX + shape.radius;
            buttonY = shape.centerY - shape.radius;
        } else if (shape.type === "ellipse") {
            buttonX = shape.centerX + shape.radiusX;
            buttonY = shape.centerY - shape.radiusY;
        } else if (shape.type === "pencil") {
            const maxX = Math.max(...shape.points.map(p => p.x));
            const minY = Math.min(...shape.points.map(p => p.y));
            buttonX = maxX;
            buttonY = minY;
        }

        const distance = Math.sqrt(Math.pow(x - buttonX, 2) + Math.pow(y - buttonY, 2));
        return distance <= 10; // 10 is the radius of click detection
    }

    mouseDownHandler = async (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Only handle shape selection and deletion when pointer tool is selected
        if (this.selectedTool === "pointer") {
            const selectedShape = this.existingShapes.find(shape => shape.selected);
            if (selectedShape && this.isClickOnDeleteButton(x, y, selectedShape)) {
                await this.deleteSelectedShape();
                return;
            }
            
            const clickedShape = this.findShapeAtPoint(x, y);
            if (clickedShape) {
                this.selectedShapeId = clickedShape.id;
                this.existingShapes.forEach(shape => shape.selected = shape.id === clickedShape.id);
                
                // Set up dragging
                this.isDragging = true;
                if (clickedShape.type === "rect") {
                    this.dragOffsetX = x - clickedShape.x;
                    this.dragOffsetY = y - clickedShape.y;
                } else if (clickedShape.type === "circle" || clickedShape.type === "ellipse") {
                    this.dragOffsetX = x - clickedShape.centerX;
                    this.dragOffsetY = y - clickedShape.centerY;
                } else if (clickedShape.type === "pencil") {
                    const minX = Math.min(...clickedShape.points.map(p => p.x));
                    const minY = Math.min(...clickedShape.points.map(p => p.y));
                    this.dragOffsetX = x - minX;
                    this.dragOffsetY = y - minY;
                }
                
                this.clearCanvas();
                return;
            } else {
                // Deselect all shapes when clicking empty space
                this.existingShapes.forEach(shape => shape.selected = false);
                this.selectedShapeId = null;
                this.clearCanvas();
            }
            return;
        }
        
        // Clear any selected shapes when using other tools
        this.existingShapes.forEach(shape => shape.selected = false);
        this.selectedShapeId = null;
        
        // Original drawing logic
        if (this.selectedTool === "pencil") {
            this.currentPencilPath = {
                id: crypto.randomUUID(),
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
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastFrameTime;

        // Only update if enough time has passed (33.33ms for 30 FPS)
        if (elapsed < this.frameInterval) return;
        
        this.lastFrameTime = currentTime;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Only handle dragging when pointer tool is selected
        if (this.selectedTool === "pointer" && this.isDragging) {
            const selectedShape = this.existingShapes.find(shape => shape.selected);
            if (selectedShape) {
                // Remove the shape from existingShapes while dragging
                this.existingShapes = this.existingShapes.filter(shape => !shape.selected);
                
                if (selectedShape.type === "rect") {
                    selectedShape.x = x - this.dragOffsetX;
                    selectedShape.y = y - this.dragOffsetY;
                } else if (selectedShape.type === "circle" || selectedShape.type === "ellipse") {
                    selectedShape.centerX = x - this.dragOffsetX;
                    selectedShape.centerY = y - this.dragOffsetY;
                } else if (selectedShape.type === "pencil") {
                    const minX = Math.min(...selectedShape.points.map(p => p.x));
                    const minY = Math.min(...selectedShape.points.map(p => p.y));
                    const dx = x - this.dragOffsetX - minX;
                    const dy = y - this.dragOffsetY - minY;
                    selectedShape.points = selectedShape.points.map(p => ({
                        x: p.x + dx,
                        y: p.y + dy
                    }));
                }
                
                // Add the shape back to existingShapes at its new position
                this.existingShapes.push(selectedShape);
                this.clearCanvas();
                return;
            }
        }

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

    mouseUpHandler = async (e: MouseEvent) => {
        if (this.isDragging) {
            const selectedShape = this.existingShapes.find(shape => shape.selected);
            if (selectedShape) {
                try {
                    // Delete the old shape from the server
                    await deleteChat(selectedShape.id);
                    
                    // Create a new shape with updated position
                    const newShape = { ...selectedShape, id: crypto.randomUUID() };
                    
                    // Remove the old shape and add the new one
                    this.existingShapes = this.existingShapes.filter(shape => shape.id !== selectedShape.id);
                    this.existingShapes.push(newShape);
                    
                    // Send the new shape to the server
                    this.socket.send(JSON.stringify({
                        type: "chat",
                        message: JSON.stringify({ shape: newShape }),
                        roomId: this.roomId
                    }));
                } catch (error) {
                    console.error("Error updating shape position:", error);
                }
                
                // Clean up dragging state
                this.isDragging = false;
                this.dragOffsetX = 0;
                this.dragOffsetY = 0;
                return;
            }
        }

        if (this.selectedTool === "pencil" && this.currentPencilPath) {
            this.currentPencilPath.lineWidth = this.strokeSize;
            this.currentPencilPath.id = crypto.randomUUID();
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
                    id: crypto.randomUUID(),
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
                    id: crypto.randomUUID(),
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
                    id: crypto.randomUUID(),
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
                shape.lineWidth = this.strokeSize;
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

    private findShapeAtPoint(x: number, y: number): Shape | null {
        for (let i = this.existingShapes.length - 1; i >= 0; i--) {
            const shape = this.existingShapes[i];
            if (this.isPointInShape(x, y, shape)) {
                return shape;
            }
        }
        return null;
    }

    private isPointInShape(x: number, y: number, shape: Shape): boolean {
        const strokeThreshold = (shape.lineWidth || this.strokeSize) / 2 + 2; // Added tolerance for easier selection

        if (shape.type === "rect") {
            // Check if point is near any of the four edges
            const left = shape.x;
            const right = shape.x + shape.width;
            const top = shape.y;
            const bottom = shape.y + shape.height;

            // Check horizontal edges
            if (x >= left && x <= right && 
                (Math.abs(y - top) <= strokeThreshold || Math.abs(y - bottom) <= strokeThreshold)) {
                return true;
            }
            // Check vertical edges
            if (y >= top && y <= bottom && 
                (Math.abs(x - left) <= strokeThreshold || Math.abs(x - right) <= strokeThreshold)) {
                return true;
            }
            return false;

        } else if (shape.type === "circle") {
            const dx = x - shape.centerX;
            const dy = y - shape.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return Math.abs(distance - shape.radius) <= strokeThreshold;

        } else if (shape.type === "ellipse") {
            // For ellipse, we check if point is near the ellipse border
            const dx = x - shape.centerX;
            const dy = y - shape.centerY;
            const normalizedX = dx / shape.radiusX;
            const normalizedY = dy / shape.radiusY;
            const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
            return Math.abs(distance - 1) <= strokeThreshold / Math.min(shape.radiusX, shape.radiusY);

        } else if (shape.type === "pencil") {
            // Pencil stroke detection remains the same as it already checks the stroke
            for (let i = 1; i < shape.points.length; i++) {
                const p1 = shape.points[i - 1];
                const p2 = shape.points[i];
                const distance = this.pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
                if (distance < strokeThreshold) return true;
            }
        }
        return false;
    }

    private pointToLineDistance(x: number, y: number, x1: number, y1: number, x2: number, y2: number): number {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;
        
        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
}