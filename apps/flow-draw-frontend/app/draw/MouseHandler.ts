import { Shape } from './Shape';

export function isClickOnDeleteButton(x: number, y: number, shape: Shape): boolean {
    let shapeX = 0, shapeY = 0, width = 0;

    if (shape.type === "rect") {
        shapeX = shape.x;
        shapeY = shape.y;
        width = shape.width;
    } else if (shape.type === "circle" && 'centerX' in shape) {
        shapeX = shape.centerX - shape.radius;
        shapeY = shape.centerY - shape.radius;
        width = shape.radius * 2;
    } else if (shape.type === "ellipse" && 'centerX' in shape) {
        shapeX = shape.centerX - shape.radiusX;
        shapeY = shape.centerY - shape.radiusY;
        width = shape.radiusX * 2;
    } else if (shape.type === "pencil" && 'points' in shape) {
        const minX = Math.min(...shape.points.map(p => p.x));
        const maxX = Math.max(...shape.points.map(p => p.x));
        shapeX = minX;
        shapeY = Math.min(...shape.points.map(p => p.y));
        width = maxX - minX;
    } else if (shape.type === "arrow" && 'fromX' in shape) {
        const minX = Math.min(shape.fromX, shape.toX);
        const maxX = Math.max(shape.fromX, shape.toX);
        shapeX = minX;
        shapeY = Math.min(shape.fromY, shape.toY);
        width = maxX - minX;
    } else if (shape.type === "text") {
        const fontSize = shape.fontSize || 20;
        const textWidth = shape.text.length * (fontSize * 0.6);
        shapeX = shape.x - 5;
        shapeY = shape.y - fontSize;
        width = textWidth + 10;
    } else if (shape.type === "line" && 'fromX' in shape) {
        const minX = Math.min(shape.fromX, shape.toX);
        const maxX = Math.max(shape.fromX, shape.toX);
        shapeX = minX;
        shapeY = Math.min(shape.fromY, shape.toY);
        width = maxX - minX;
    }

    // Position delete button at top-right corner with padding
    const padding = 5;
    const buttonX = shapeX + width + padding;
    const buttonY = shapeY - padding;

    // Check if click is within button radius
    const buttonRadius = 8;
    const distance = Math.sqrt(Math.pow(x - buttonX, 2) + Math.pow(y - buttonY, 2));
    return distance <= buttonRadius;
}
