// apps/flow-draw-frontend/app/draw/MouseHandlers.ts
import { Shape } from './Shape';

export function isClickOnDeleteButton(x: number, y: number, shape: Shape): boolean {
    let buttonX, buttonY;
    
    if (shape.type === "arrow") {
        buttonX = shape.fromX;
        buttonY = shape.fromY - 20; // 20 is buttonSize
    } else if (shape.type === "rect") {
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