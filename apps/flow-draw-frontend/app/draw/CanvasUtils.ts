// apps/flow-draw-frontend/app/draw/CanvasUtils.ts
import { Shape } from './Shape';

export function drawArrow(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, strokeSize: number) {
    // const arrowLength = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
    const arrowThickness = strokeSize;
    const arrowHeadLength = arrowThickness * 3; // Made longer for pointier appearance
    const arrowHeadAngle = Math.atan2(toY - fromY, toX - fromX);

    // Draw main line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);

    // Calculate arrow head points with sharper angle (PI/8 instead of PI/6)
    const arrowX1 = toX - arrowHeadLength * Math.cos(arrowHeadAngle - Math.PI / 8);
    const arrowY1 = toY - arrowHeadLength * Math.sin(arrowHeadAngle - Math.PI / 8);
    const arrowX2 = toX - arrowHeadLength * Math.cos(arrowHeadAngle + Math.PI / 8);
    const arrowY2 = toY - arrowHeadLength * Math.sin(arrowHeadAngle + Math.PI / 8);

    // Draw arrow head
    ctx.moveTo(toX, toY);
    ctx.lineTo(arrowX1, arrowY1);
    ctx.moveTo(toX, toY);
    ctx.lineTo(arrowX2, arrowY2);

    ctx.stroke();
    ctx.closePath();
}

export function drawPencilPath(ctx: CanvasRenderingContext2D, path: { points: Array<{ x: number, y: number }>, color: string, lineWidth: number }) {
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.lineWidth;
    ctx.beginPath();
    const points = path.points;
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
        if (!points[i]) continue;
        ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();
    ctx.closePath();
}

export function drawLine(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color?: string, lineWidth?: number) {
    ctx.save();
    
    if (color) ctx.strokeStyle = color;
    if (lineWidth) ctx.lineWidth = lineWidth;
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.closePath();
    
    ctx.restore();
}

export function drawShape(ctx: CanvasRenderingContext2D, shape: Shape) {
    switch (shape.type) {
        case "rect":
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            break;
        case "circle":
            if ("centerX" in shape) {
            ctx.beginPath();
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();
            }
            break;
        case "ellipse":
            if ('centerX' in shape) {
                ctx.beginPath();
                ctx.ellipse(shape.centerX, shape.centerY, shape.radiusX, shape.radiusY, shape.rotation, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.closePath();
                break;
            }
        case "pencil":
            if ("points" in shape)
            drawPencilPath(ctx, shape);
            break;
        case "arrow":
            if ('fromX' in shape)
            drawArrow(ctx, shape.fromX, shape.fromY, shape.toX, shape.toY, shape.lineWidth || 2);
            break;
        case "text":
            ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;
            ctx.fillStyle = shape.color || '#000000';
            ctx.fillText(shape.text, shape.x, shape.y);
            break;
        case "line":
            if ('fromX' in shape)
            drawLine(
                ctx,
                shape.fromX,
                shape.fromY,
                shape.toX,
                shape.toY,
                shape.color || '#000000',
                shape.lineWidth || 2
            );
            break;
    }
}