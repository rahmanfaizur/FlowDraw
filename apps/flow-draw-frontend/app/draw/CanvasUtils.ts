// apps/flow-draw-frontend/app/draw/CanvasUtils.ts
import { Shape } from './Shape';

export function drawArrow(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, strokeSize: number) {
    const arrowLength = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
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