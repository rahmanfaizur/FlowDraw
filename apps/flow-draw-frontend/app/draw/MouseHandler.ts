// apps/flow-draw-frontend/app/draw/MouseHandlers.ts
import { Shape } from './Shape';

export function isClickOnDeleteButton(x: number, y: number, shape: Shape): boolean {
    let buttonX, buttonY;
    let shapeX, shapeY, width, height;
    
    if (shape.type === "rect") {
        shapeX = shape.x;
        shapeY = shape.y;
        width = shape.width;
        height = shape.height;
    } else if (shape.type === "circle") {
        shapeX = shape.centerX - shape.radius;
        shapeY = shape.centerY - shape.radius;
        width = shape.radius * 2;
        height = shape.radius * 2;
    } else if (shape.type === "ellipse") {
        shapeX = shape.centerX - shape.radiusX;
        shapeY = shape.centerY - shape.radiusY;
        width = shape.radiusX * 2;
        height = shape.radiusY * 2;
    } else if (shape.type === "pencil") {
        const minX = Math.min(...shape.points.map(p => p.x));
        const maxX = Math.max(...shape.points.map(p => p.x));
        const minY = Math.min(...shape.points.map(p => p.y));
        const maxY = Math.max(...shape.points.map(p => p.y));
        shapeX = minX;
        shapeY = minY;
        width = maxX - minX;
        height = maxY - minY;
    } else if (shape.type === "arrow") {
        const minX = Math.min(shape.fromX, shape.toX);
        const maxX = Math.max(shape.fromX, shape.toX);
        const minY = Math.min(shape.fromY, shape.toY);
        const maxY = Math.max(shape.fromY, shape.toY);
        shapeX = minX;
        shapeY = minY;
        width = maxX - minX;
        height = maxY - minY;
    } else if (shape.type === "text") {
        // For text shapes, we need to estimate the width and height
        // This should match the logic in drawDeleteButton
        const fontSize = shape.fontSize || 20;
        const textWidth = shape.text.length * (fontSize * 0.6); // Rough estimate
        shapeX = shape.x - 5;
        shapeY = shape.y - fontSize;
        width = textWidth + 10;
        height = fontSize + 10;
    }
    
    // Position delete button at top-right corner with padding
    const padding = 5;
    buttonX = shapeX + width + padding;
    buttonY = shapeY - padding;
    
    // Check if click is within button radius
    const buttonRadius = 8; // Half of button size
    const distance = Math.sqrt(Math.pow(x - buttonX, 2) + Math.pow(y - buttonY, 2));
    return distance <= buttonRadius;
}