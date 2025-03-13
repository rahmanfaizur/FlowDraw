// apps/flow-draw-frontend/app/draw/Game.ts
import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";
import { deleteChat } from "@/services/authService";
import { Shape } from './Shape';
import { drawArrow, drawPencilPath, drawLine } from './CanvasUtils';
import { handleSocketMessage } from './SocketHandler';
import { isClickOnDeleteButton } from './MouseHandler';

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
    private animationFrameId: number | null = null;
    
    // Add callbacks for text handling
    onTextClick: ((x: number, y: number) => void) | null = null;
    onStartText: ((x: number, y: number) => void) | null = null;

    socket: WebSocket;

    // Add new properties for double-click handling
    private lastClickTime: number = 0;
    private readonly doubleClickThreshold: number = 300; // ms
    private moveInProgress: boolean = false;
    private originalShapePosition: { x: number; y: number } | null = null;

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
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    }

    setTool(tool: Tool) {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers() {
        handleSocketMessage(this.socket, this.existingShapes, () => this.clearCanvas());
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.existingShapes.forEach((shape) => {
            this.ctx.lineWidth = shape.lineWidth || this.strokeSize;
            this.ctx.strokeStyle = shape.color || this.strokeColor;
            
            if (shape.selected) {
                // Draw selection outline with dashed lines
                this.drawSelectionOutline(shape);
                
                // Add a "move in progress" indicator if applicable
                if (this.moveInProgress) {
                    this.drawMoveInProgressIndicator(shape);
                }
            }
            
            if (shape.type === "line" && 'fromX' in shape) {
                drawLine(
                    this.ctx,
                    shape.fromX,
                    shape.fromY,
                    shape.toX,
                    shape.toY,
                    shape.color,
                    shape.lineWidth
                );
            } else if (shape.type === "rect") {
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle" && "centerX" in shape) {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "ellipse" && "centerX" in shape) {
                this.ctx.beginPath();
                this.ctx.ellipse(shape.centerX, shape.centerY, shape.radiusX, shape.radiusY, shape.rotation, 0, 2 * Math.PI);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "pencil" && "points" in shape) {
                drawPencilPath(this.ctx, shape);
            } else if (shape.type === "arrow" && "fromX" in shape) {
                drawArrow(this.ctx, shape.fromX, shape.fromY, shape.toX, shape.toY, shape.lineWidth || this.strokeSize);
            } else if (shape.type === "text") {
                // Draw text with bold style
                const fontSize = shape.fontSize;
                this.ctx.font = `bold ${fontSize}px ${shape.fontFamily}`;
                this.ctx.fillStyle = shape.color || this.strokeColor;
                this.ctx.fillText(shape.text, shape.x, shape.y);
            }
            
            if (shape.selected) {
                this.drawDeleteButton(shape);
            }
        });
    }

    // Draw a dashed selection outline around the shape
    private drawSelectionOutline(shape: Shape) {
        this.ctx.save();
        this.ctx.strokeStyle = '#4285f4'; // Google blue color
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]); // Create dashed line
        
        let x = 0, y = 0, width = 0, height = 0;
        
        if (shape.type === "line" && "fromX" in shape) {
            const minX = Math.min(shape.fromX, shape.toX);
            const maxX = Math.max(shape.fromX, shape.toX);
            const minY = Math.min(shape.fromY, shape.toY);
            const maxY = Math.max(shape.fromY, shape.toY);
            x = minX;
            y = minY;
            width = maxX - minX;
            height = maxY - minY;
        } else if (shape.type === "rect") {
            x = shape.x;
            y = shape.y;
            width = shape.width;
            height = shape.height;
        } else if (shape.type === "circle" && 'centerX' in shape) {
            x = shape.centerX - shape.radius;
            y = shape.centerY - shape.radius;
            width = shape.radius * 2;
            height = shape.radius * 2;
        } else if (shape.type === "ellipse" && 'centerX' in shape) {
            x = shape.centerX - shape.radiusX;
            y = shape.centerY - shape.radiusY;
            width = shape.radiusX * 2;
            height = shape.radiusY * 2;
        } else if (shape.type === "pencil" && "points" in shape) {
            const minX = Math.min(...shape.points.map(p => p.x));
            const maxX = Math.max(...shape.points.map(p => p.x));
            const minY = Math.min(...shape.points.map(p => p.y));
            const maxY = Math.max(...shape.points.map(p => p.y));
            x = minX;
            y = minY;
            width = maxX - minX;
            height = maxY - minY;
        } else if (shape.type === "arrow" && 'fromX' in shape) {
            const minX = Math.min(shape.fromX, shape.toX);
            const maxX = Math.max(shape.fromX, shape.toX);
            const minY = Math.min(shape.fromY, shape.toY);
            const maxY = Math.max(shape.fromY, shape.toY);
            x = minX;
            y = minY;
            width = maxX - minX;
            height = maxY - minY;
        } else if (shape.type === "text") {
            this.ctx.font = `bold ${shape.fontSize}px ${shape.fontFamily}`;
            const textWidth = this.ctx.measureText(shape.text).width;
            const textHeight = shape.fontSize;
            x = shape.x - 5;
            y = shape.y - textHeight;
            width = textWidth + 10;
            height = textHeight + 10;
        }
        
        // Add padding to the selection box
        const padding = 5;
        x -= padding;
        y -= padding;
        width += padding * 2;
        height += padding * 2;
        
        this.ctx.strokeRect(x, y, width, height);
        this.ctx.restore();
    }

    private drawDeleteButton(shape: Shape) {
        if (shape.selected) {
            this.ctx.save();
            
            // Calculate position for delete button
            let buttonX = 0;
            let buttonY = 0;
            let x = 0, y = 0, width = 0, height = 0;
            console.log(height);
            
            if (shape.type === "line" && 'fromX' in shape) {
                const minX = Math.min(shape.fromX, shape.toX);
                const maxX = Math.max(shape.fromX, shape.toX);
                const minY = Math.min(shape.fromY, shape.toY);
                const maxY = Math.max(shape.fromY, shape.toY);
                x = minX;
                y = minY;
                width = maxX - minX;
                height = maxY - minY;
            } else if (shape.type === "rect") {
                x = shape.x;
                y = shape.y;
                width = shape.width;
                height = shape.height;
            } else if (shape.type === "circle" && 'centerX' in shape) {
                x = shape.centerX - shape.radius;
                y = shape.centerY - shape.radius;
                width = shape.radius * 2;
                height = shape.radius * 2;
            } else if (shape.type === "ellipse" && 'centerX' in shape) {
                x = shape.centerX - shape.radiusX;
                y = shape.centerY - shape.radiusY;
                width = shape.radiusX * 2;
                height = shape.radiusY * 2;
            } else if (shape.type === "pencil" && "points" in shape) {
                const minX = Math.min(...shape.points.map(p => p.x));
                const maxX = Math.max(...shape.points.map(p => p.x));
                const minY = Math.min(...shape.points.map(p => p.y));
                const maxY = Math.max(...shape.points.map(p => p.y));
                x = minX;
                y = minY;
                width = maxX - minX;
                height = maxY - minY;
            } else if (shape.type === "arrow" && 'fromX' in shape) {
                const minX = Math.min(shape.fromX, shape.toX);
                const maxX = Math.max(shape.fromX, shape.toX);
                const minY = Math.min(shape.fromY, shape.toY);
                const maxY = Math.max(shape.fromY, shape.toY);
                x = minX;
                y = minY;
                width = maxX - minX;
                height = maxY - minY;
            } else if (shape.type === "text") {
                this.ctx.font = `bold ${shape.fontSize}px ${shape.fontFamily}`;
                const textWidth = this.ctx.measureText(shape.text).width;
                const textHeight = shape.fontSize;
                x = shape.x - 5;
                y = shape.y - textHeight;
                width = textWidth + 10;
                height = textHeight + 10;
            }
            
            // Position delete button at top-right corner
            buttonX = x + width + 5;
            buttonY = y - 5;
            
            // Draw delete button (circle with X)
            const buttonSize = 16;
            
            // Draw circle background
            this.ctx.fillStyle = '#f44336'; // Red background
            this.ctx.beginPath();
            this.ctx.arc(buttonX, buttonY, buttonSize/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw X
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            // First line of X
            this.ctx.moveTo(buttonX - buttonSize/4, buttonY - buttonSize/4);
            this.ctx.lineTo(buttonX + buttonSize/4, buttonY + buttonSize/4);
            // Second line of X
            this.ctx.moveTo(buttonX + buttonSize/4, buttonY - buttonSize/4);
            this.ctx.lineTo(buttonX - buttonSize/4, buttonY + buttonSize/4);
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

    mouseDownHandler = async (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.selectedTool === "eraser") {
            const shapeToErase = this.findShapeAtPoint(x, y);
            if (shapeToErase) {
                try {
                    await deleteChat(shapeToErase.id);
                    this.existingShapes = this.existingShapes.filter(shape => shape.id !== shapeToErase.id);
                    this.clearCanvas();
                } catch (error) {
                    console.error("Error deleting shape:", error);
                }
            }
            return;
        }
        
        // Handle text tool
        if (this.selectedTool === "text") {
            if (this.onStartText) {
                this.onStartText(x, y);
            }
            return;
        }
        
        // Only handle shape selection and deletion when pointer tool is selected
        if (this.selectedTool === "pointer") {
            const currentTime = performance.now();
            const timeSinceLastClick = currentTime - this.lastClickTime;
            this.lastClickTime = currentTime;
            
            const selectedShape = this.existingShapes.find(shape => shape.selected);
            
            // Check if clicking on delete button
            if (selectedShape && isClickOnDeleteButton(x, y, selectedShape)) {
                await this.deleteSelectedShape();
                return;
            }
            
            // Check for double-click on already selected shape
            if (selectedShape && timeSinceLastClick < this.doubleClickThreshold && this.isPointInShape(x, y, selectedShape)) {
                // Double-click detected - finalize the move
                if (this.moveInProgress) {
                    await this.finalizeMove(selectedShape);
                    this.moveInProgress = false;
                    this.originalShapePosition = null;
                }
                return;
            }
            
            const clickedShape = this.findShapeAtPoint(x, y);
            if (clickedShape) {
                // If we're starting to move a new shape, finalize any previous move
                if (selectedShape && this.moveInProgress && selectedShape.id !== clickedShape.id) {
                    await this.finalizeMove(selectedShape);
                }
                
                // Select the clicked shape
                this.selectedShapeId = clickedShape.id;
                this.existingShapes.forEach(shape => shape.selected = shape.id === clickedShape.id);
                
                // Set up dragging
                this.isDragging = true;
                this.moveInProgress = true;
                
                // Store original position for potential cancel
                this.storeOriginalPosition(clickedShape);
                
                // Set drag offsets
                if (clickedShape.type === "rect") {
                    this.dragOffsetX = x - clickedShape.x;
                    this.dragOffsetY = y - clickedShape.y;
                } else if ((clickedShape.type === "circle" || clickedShape.type === "ellipse") && 'centerX' in clickedShape) {
                    this.dragOffsetX = x - clickedShape.centerX;
                    this.dragOffsetY = y - clickedShape.centerY;
                } else if (clickedShape.type === "pencil" && 'points' in clickedShape) {
                    const minX = Math.min(...clickedShape.points.map(p => p.x));
                    const minY = Math.min(...clickedShape.points.map(p => p.y));
                    this.dragOffsetX = x - minX;
                    this.dragOffsetY = y - minY;
                } else if (clickedShape.type === "arrow" && 'fromX' in clickedShape) {
                    this.dragOffsetX = x - clickedShape.fromX;
                    this.dragOffsetY = y - clickedShape.fromY;
                } else if (clickedShape.type === "text") {
                    this.dragOffsetX = x - clickedShape.x;
                    this.dragOffsetY = y - clickedShape.y;
                }
                
                this.clearCanvas();
                return;
            } else {
                // Finalize any in-progress move when clicking empty space
                if (selectedShape && this.moveInProgress) {
                    await this.finalizeMove(selectedShape);
                }
                
                // Deselect all shapes when clicking empty space
                this.existingShapes.forEach(shape => shape.selected = false);
                this.selectedShapeId = null;
                this.moveInProgress = false;
                this.originalShapePosition = null;
                this.clearCanvas();
            }
            return;
        }
        
        // Clear any selected shapes when using other tools
        if (this.moveInProgress) {
            const selectedShape = this.existingShapes.find(shape => shape.selected);
            if (selectedShape) {
                await this.finalizeMove(selectedShape);
            }
        }
        
        this.existingShapes.forEach(shape => shape.selected = false);
        this.selectedShapeId = null;
        this.moveInProgress = false;
        this.originalShapePosition = null;
        
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
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Handle cursor changes for eraser and pointer tools
        if (this.selectedTool === "eraser" || this.selectedTool === "pointer") {
            const shapeUnderCursor = this.findShapeAtPoint(x, y);
            if (shapeUnderCursor) {
                if (this.selectedTool === "eraser") {
                    this.canvas.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="8" stroke="white" stroke-width="2" fill="none"/></svg>') 0 24, auto`;
                } else { // pointer tool
                    this.canvas.style.cursor = this.isDragging ? 'grabbing' : 'grab';
                }
            } else {
                this.canvas.style.cursor = 'default';
            }
            
            // If it's eraser tool, return early as we don't need drag handling
            if (this.selectedTool === "eraser") return;
        }

        const currentTime = performance.now();
        const elapsed = currentTime - this.lastFrameTime;

        if (elapsed < this.frameInterval) return;
        
        this.lastFrameTime = currentTime;

        // Add eraser hover detection
        if (this.selectedTool as string === "eraser") {
            const shapeUnderCursor = this.findShapeAtPoint(x, y);
            if (shapeUnderCursor) {
                this.canvas.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="8" stroke="white" stroke-width="2" fill="none"/></svg>') 0 24, auto`;
            } else {
                this.canvas.style.cursor = 'default';
            }
            return;
        }

        if (this.selectedTool === "pencil") {
            this.canvas.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>') 0 24, auto`;
        }

        // Only handle dragging when pointer tool is selected
        if (this.selectedTool === "pointer" && this.isDragging) {
            const selectedShape = this.existingShapes.find(shape => shape.selected);
            if (selectedShape) {
                if (this.animationFrameId) {
                    cancelAnimationFrame(this.animationFrameId);
                }

                this.animationFrameId = requestAnimationFrame(() => {
                    this.existingShapes = this.existingShapes.filter(shape => !shape.selected);
                    
                    if ((selectedShape.type === "line" || selectedShape.type === "arrow") && 'fromX' in selectedShape) {
                        const dx = x - this.dragOffsetX - selectedShape.fromX;
                        const dy = y - this.dragOffsetY - selectedShape.fromY;
                        selectedShape.fromX += dx;
                        selectedShape.fromY += dy;
                        selectedShape.toX += dx;
                        selectedShape.toY += dy;
                    } else if (selectedShape.type === "rect") {
                        selectedShape.x = x - this.dragOffsetX;
                        selectedShape.y = y - this.dragOffsetY;
                    } else if ((selectedShape.type === "circle" || selectedShape.type === "ellipse") && 'centerX' in selectedShape) {
                        selectedShape.centerX = x - this.dragOffsetX;
                        selectedShape.centerY = y - this.dragOffsetY;
                    } else if (selectedShape.type === "pencil" && 'points' in selectedShape) {
                        const minX = Math.min(...selectedShape.points.map(p => p.x));
                        const minY = Math.min(...selectedShape.points.map(p => p.y));
                        const dx = x - this.dragOffsetX - minX;
                        const dy = y - this.dragOffsetY - minY;
                        selectedShape.points = selectedShape.points.map(p => ({
                            x: p.x + dx,
                            y: p.y + dy
                        }));
                    } else if (selectedShape.type === "text") {
                        // For text, simply update the x/y position
                        selectedShape.x = x - this.dragOffsetX;
                        selectedShape.y = y - this.dragOffsetY;
                    }
                    
                    this.existingShapes.push(selectedShape);
                    this.clearCanvas();
                    this.animationFrameId = null;
                });
                return;
            }
        }

        if (this.clicked) {
            this.clearCanvas();
            this.ctx.strokeStyle = this.strokeColor;
            this.ctx.lineWidth = this.strokeSize;
            
            if (this.selectedTool === "line") {
                drawLine(
                    this.ctx,
                    this.startX,
                    this.startY,
                    x,
                    y,
                    this.strokeColor,
                    this.strokeSize
                );
            } else if (this.selectedTool === "arrow") {
                // Only draw arrow if there's some minimum distance
                const distance = Math.sqrt(
                    Math.pow(x - this.startX, 2) + 
                    Math.pow(y - this.startY, 2)
                );
                
                if (distance > 5) { // Minimum distance threshold
                    drawArrow(this.ctx, this.startX, this.startY, x, y, this.strokeSize);
                }
            } else if (this.selectedTool === "rect") {
                const width = x - this.startX;
                const height = y - this.startY;
                this.ctx.strokeRect(this.startX, this.startY, width, height);
            } else if (this.selectedTool === "circle") {
                const radius = Math.max(x - this.startX, y - this.startY) / 2;
                this.ctx.beginPath();
                this.ctx.arc(this.startX + radius, this.startY + radius, Math.abs(radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (this.selectedTool === "ellipse") {
                const radiusX = Math.abs(x - this.startX) / 2;
                const radiusY = Math.abs(y - this.startY) / 2;
                const centerX = this.startX + (x - this.startX) / 2;
                const centerY = this.startY + (y - this.startY) / 2;
                
                this.ctx.beginPath();
                this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (this.selectedTool === "pencil" && this.currentPencilPath && 'points' in this.currentPencilPath) {
                this.currentPencilPath.points.push({x, y});
                this.clearCanvas();
                drawPencilPath(this.ctx, this.currentPencilPath);
            }
        }
    }

    mouseUpHandler = async (e: MouseEvent) => {
        // Cancel any pending animation frame when mouse is released
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // For pointer tool, just stop dragging but don't finalize the move yet
        if (this.selectedTool === "pointer") {
            this.isDragging = false;
            return;
        }

        // For other tools, proceed with original logic
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

            let shape: Shape | null = null;

            if (this.selectedTool === "line") {
                // Only create line if there's some minimum distance
                const distance = Math.sqrt(
                    Math.pow(x - this.startX, 2) + 
                    Math.pow(y - this.startY, 2)
                );
                
                if (distance > 5) { // Minimum distance threshold
                    shape = {
                        id: crypto.randomUUID(),
                        type: "line",
                        fromX: this.startX,
                        fromY: this.startY,
                        toX: x,
                        toY: y,
                        color: this.strokeColor,
                        lineWidth: this.strokeSize
                    };
                }
            } else if (this.selectedTool === "arrow") {
                const distance = Math.sqrt(
                    Math.pow(x - this.startX, 2) + 
                    Math.pow(y - this.startY, 2)
                );
                
                // Only create arrow if it has some minimum length
                if (distance > 5) {
                    shape = {
                        id: crypto.randomUUID(),
                        type: "arrow",
                        fromX: this.startX,
                        fromY: this.startY,
                        toX: x,
                        toY: y,
                        color: this.strokeColor,
                        lineWidth: this.strokeSize
                    };
                }
            } else if (this.selectedTool === "rect") {
                shape = {
                    id: crypto.randomUUID(),
                    type: "rect",
                    x: this.startX,
                    y: this.startY,
                    height: y - this.startY,
                    width: x - this.startX,
                    color: this.strokeColor,
                    lineWidth: this.strokeSize
                };
            } else if (this.selectedTool === "circle") {
                const radius = Math.max(x - this.startX, y - this.startY) / 2;
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
                const radiusX = Math.abs(x - this.startX) / 2;
                const radiusY = Math.abs(y - this.startY) / 2;
                const centerX = this.startX + (x - this.startX) / 2;
                const centerY = this.startY + (y - this.startY) / 2;
                
                shape = {
                    id: crypto.randomUUID(),
                    type: "ellipse",
                    centerX: centerX,
                    centerY: centerY,
                    radiusX: radiusX,
                    radiusY: radiusY,
                    rotation: 0,
                    color: this.strokeColor,
                    lineWidth: this.strokeSize
                };
            }
            
            if (shape) {
                // Add the shape to existing shapes
                this.existingShapes.push(shape);
                
                // Send to backend via socket
                this.socket.send(JSON.stringify({
                    type: "chat",
                    message: JSON.stringify({ shape }),
                    roomId: this.roomId
                }));

                // Redraw canvas to show the new shape
                this.clearCanvas();
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
        const strokeThreshold = (shape.lineWidth || this.strokeSize) / 2 + 2;

        if (shape.type === "line" && 'fromX' in shape) {
            // Check if point is near the line
            return this.pointToLineDistance(x, y, shape.fromX, shape.fromY, shape.toX, shape.toY) < strokeThreshold;
        } else if (shape.type === "rect") {
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

        } else if (shape.type === "circle" && 'centerX' in shape) {
            const dx = x - shape.centerX;
            const dy = y - shape.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return Math.abs(distance - shape.radius) <= strokeThreshold;

        } else if (shape.type === "ellipse" && 'centerX' in shape) {
            // For ellipse, we check if point is near the ellipse border
            const dx = x - shape.centerX;
            const dy = y - shape.centerY;
            const normalizedX = dx / shape.radiusX;
            const normalizedY = dy / shape.radiusY;
            const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
            return Math.abs(distance - 1) <= strokeThreshold / Math.min(shape.radiusX, shape.radiusY);

        } else if (shape.type === "pencil" && 'points' in shape) {
            // Pencil stroke detection remains the same as it already checks the stroke
            for (let i = 1; i < shape.points.length; i++) {
                const p1 = shape.points[i - 1];
                const p2 = shape.points[i];
                const distance = this.pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
                if (distance < strokeThreshold) return true;
            }
        } else if (shape.type === "arrow" && 'fromX' in shape) {
            // Check if point is near the arrow line
            const distance = this.pointToLineDistance(x, y, shape.fromX, shape.fromY, shape.toX, shape.toY);
            return distance < strokeThreshold;
        } else if (shape.type === "text") {
            // For text, check if point is within text bounds
            this.ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;
            const textWidth = this.ctx.measureText(shape.text).width;
            const textHeight = shape.fontSize;
            
            // Create a bounding box around the text
            return (
                x >= shape.x - strokeThreshold &&
                x <= shape.x + textWidth + strokeThreshold &&
                y >= shape.y - textHeight - strokeThreshold &&
                y <= shape.y + strokeThreshold
            );
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

    // Update the addText method to create larger text
    addText(text: string, x: number, y: number) {
        if (!text.trim()) return;
        
        const textShape: Shape = {
            id: crypto.randomUUID(),
            type: "text",
            text: text,
            x: x,
            y: y,
            fontSize: this.strokeSize * 6, // Increased font size multiplier from 4 to 6
            fontFamily: "Arial, sans-serif", // Changed to a more readable font
            color: this.strokeColor,
            lineWidth: this.strokeSize
        };
        
        this.existingShapes.push(textShape);
        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape: textShape }),
            roomId: this.roomId
        }));
        
        this.clearCanvas();
    }

    // Store the original position of a shape before moving
    private storeOriginalPosition(shape: Shape) {
        if (!this.originalShapePosition) {
            if (shape.type === "line" && 'fromX' in shape) {
                this.originalShapePosition = {
                    //@ts-expect-error: need to fix this one! //TODO: FIX!
                    fromX: shape.fromX,
                    fromY: shape.fromY,
                    toX: shape.toX,
                    toY: shape.toY
                };
            } else if (shape.type === "rect") {
                this.originalShapePosition = { x: shape.x, y: shape.y };
            } else if ((shape.type === "circle" || shape.type === "ellipse") && 'centerX' in shape) {
                //@ts-expect-error: need to fix this one!
                this.originalShapePosition = { centerX: shape.centerX, centerY: shape.centerY };
            } else if (shape.type === "pencil" && 'points' in shape) {
                //@ts-expect-error: need to fix this one!
                this.originalShapePosition = { points: [...shape.points.map(p => ({...p}))] };
            } else if (shape.type === "arrow" && 'fromX' in shape) {
                this.originalShapePosition = { 
                    //@ts-expect-error: need to fix this one!
                    fromX: shape.fromX, fromY: shape.fromY,
                    toX: shape.toX, toY: shape.toY 
                };
            } else if (shape.type === "text") {
                this.originalShapePosition = { x: shape.x, y: shape.y };
            }
        }
    }

    // Finalize a move by sending the updated shape to the server
    private async finalizeMove(shape: Shape) {
        if (!this.moveInProgress) return;
        
        try {
            await deleteChat(shape.id);
            
            const newShape = { ...shape, id: crypto.randomUUID() };
            this.existingShapes = this.existingShapes.filter(s => s.id !== shape.id);
            this.existingShapes.push(newShape);
            
            this.socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shape: newShape }),
                roomId: this.roomId
            }));
            
            this.moveInProgress = false;
            this.originalShapePosition = null;
        } catch (error) {
            console.error("Error finalizing shape move:", error);
            // Optionally revert to original position on error
            // this.revertToOriginalPosition(shape);
        }
    }


    //TODO: FIX THIS CODE!
    // Revert a shape to its original position (for error handling)
    // private revertToOriginalPosition(shape: Shape) {
    //     if (!this.originalShapePosition) return;
        
    //     if (shape.type === "line") {
    //         shape.fromX = this.originalShapePosition.fromX;
    //         shape.fromY = this.originalShapePosition.fromY;
    //         shape.toX = this.originalShapePosition.toX;
    //         shape.toY = this.originalShapePosition.toY;
    //     } else if (shape.type === "rect") {
    //         shape.x = this.originalShapePosition.x;
    //         shape.y = this.originalShapePosition.y;
    //     } else if ((shape.type === "circle" || shape.type === "ellipse") && 'centerX' in shape) {
    //         shape.centerX = this.originalShapePosition.centerX;
    //         shape.centerY = this.originalShapePosition.centerY;
    //     } else if (shape.type === "pencil") {
    //         shape.points = [...this.originalShapePosition.points.map(p => ({...p}))];
    //     } else if (shape.type === "arrow") {
    //         shape.fromX = this.originalShapePosition.fromX;
    //         shape.fromY = this.originalShapePosition.fromY;
    //         shape.toX = this.originalShapePosition.toX;
    //         shape.toY = this.originalShapePosition.toY;
    //     } else if (shape.type === "text") {
    //         shape.x = this.originalShapePosition.x;
    //         shape.y = this.originalShapePosition.y;
    //     }
        
    //     this.clearCanvas();
    // }

    // Add a visual indicator that a move is in progress
    private drawMoveInProgressIndicator(shape: Shape) {
        this.ctx.save();
        
        // Draw a small indicator in the corner
        this.ctx.fillStyle = '#4285f4'; // Google blue
        this.ctx.font = '12px Arial';
        
        let x = 0, y = 0;
        
        if (shape.type === "line" && 'fromX' in shape) {
            x = Math.min(shape.fromX, shape.toX);
            y = Math.min(shape.fromY, shape.toY);
        } else if (shape.type === "rect") {
            x = shape.x;
            y = shape.y;
        } else if (shape.type === "circle" && 'centerX' in shape) {
            x = shape.centerX - shape.radius;
            y = shape.centerY - shape.radius;
        } else if (shape.type === "ellipse" && 'centerY' in shape) {
            x = shape.centerX - shape.radiusX;
            y = shape.centerY - shape.radiusY;
        } else if (shape.type === "pencil" && 'points' in shape) {
            const minX = Math.min(...shape.points.map(p => p.x));
            const minY = Math.min(...shape.points.map(p => p.y));
            x = minX;
            y = minY;
        } else if (shape.type === "arrow" && 'fromX' in shape) {
            x = Math.min(shape.fromX, shape.toX);
            y = Math.min(shape.fromY, shape.toY);
        } else if (shape.type === "text") {
            x = shape.x;
            y = shape.y - shape.fontSize;
        }
        
        // Draw a small "moving" indicator
        this.ctx.fillText("Click to place", x, y - 10);
        
        this.ctx.restore();
    }
}