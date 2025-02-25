export type Shape = {
    id: string;
    selected?: boolean;
    type: "rect" | "circle" | "pencil" | "ellipse" | "arrow";
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
} | {
    id: string;
    selected?: boolean;
    type: "arrow";
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    color?: string;
    lineWidth?: number;
}

export class ShapeRenderer {
    private ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    drawShape(shape: Shape, defaultStrokeSize: number, defaultStrokeColor: string) {
        this.ctx.lineWidth = shape.lineWidth || defaultStrokeSize;
        this.ctx.strokeStyle = shape.color || defaultStrokeColor;
        
        if (shape.selected) {
            this.ctx.save();
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.lineWidth += 2;
        }

        switch (shape.type) {
            case "rect":
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                break;
            case "circle":
                this.drawCircle(shape);
                break;
            case "ellipse":
                this.drawEllipse(shape);
                break;
            case "pencil":
                this.drawPencilPath(shape);
                break;
            case "arrow":
                this.drawArrow(shape.fromX, shape.fromY, shape.toX, shape.toY);
                break;
        }

        if (shape.selected) {
            this.ctx.restore();
            this.drawDeleteButton(shape);
        }
    }

    // ... Move all the drawing methods here (drawPencilPath, drawDeleteButton, drawArrow, etc.)

    isPointInShape(x: number, y: number, shape: Shape, strokeSize: number): boolean {
        // ... Move the point detection logic here
    }

    getDeleteButtonPosition(shape: Shape): { x: number, y: number } {
        // ... Move the delete button position calculation here
    }
} 