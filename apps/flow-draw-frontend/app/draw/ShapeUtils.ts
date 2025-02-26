import { Shape, ShapeType } from './Shape';

// Get the bounding box of any shape
export function getShapeBounds(shape: Shape): { x: number, y: number, width: number, height: number } {
  switch (shape.type) {
    case "rect":
      return {
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height
      };
    case "circle":
      return {
        x: shape.centerX - shape.radius,
        y: shape.centerY - shape.radius,
        width: shape.radius * 2,
        height: shape.radius * 2
      };
    case "ellipse":
      return {
        x: shape.centerX - shape.radiusX,
        y: shape.centerY - shape.radiusY,
        width: shape.radiusX * 2,
        height: shape.radiusY * 2
      };
    case "pencil":
      const minX = Math.min(...shape.points.map(p => p.x));
      const maxX = Math.max(...shape.points.map(p => p.x));
      const minY = Math.min(...shape.points.map(p => p.y));
      const maxY = Math.max(...shape.points.map(p => p.y));
      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      };
    case "arrow":
      const arrowMinX = Math.min(shape.fromX, shape.toX);
      const arrowMaxX = Math.max(shape.fromX, shape.toX);
      const arrowMinY = Math.min(shape.fromY, shape.toY);
      const arrowMaxY = Math.max(shape.fromY, shape.toY);
      return {
        x: arrowMinX,
        y: arrowMinY,
        width: arrowMaxX - arrowMinX,
        height: arrowMaxY - arrowMinY
      };
    case "text":
      // For text, we need to estimate the width
      // This is a rough estimate and should be replaced with actual text measurement
      return {
        x: shape.x - 5,
        y: shape.y - shape.fontSize,
        width: shape.text.length * (shape.fontSize * 0.6) + 10, // Rough estimate
        height: shape.fontSize + 10
      };
  }
}

// Calculate distance from a point to a line segment
export function pointToLineDistance(
  x: number, y: number, 
  x1: number, y1: number, 
  x2: number, y2: number
): number {
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

// Check if a point is inside or near a shape
export function isPointInShape(x: number, y: number, shape: Shape, strokeThreshold: number): boolean {
  const bounds = getShapeBounds(shape);
  
  switch (shape.type) {
    case "rect":
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

    case "circle":
      const dx = x - shape.centerX;
      const dy = y - shape.centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return Math.abs(distance - shape.radius) <= strokeThreshold;

    case "ellipse":
      // For ellipse, we check if point is near the ellipse border
      const edx = x - shape.centerX;
      const edy = y - shape.centerY;
      const normalizedX = edx / shape.radiusX;
      const normalizedY = edy / shape.radiusY;
      const ellipseDistance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
      return Math.abs(ellipseDistance - 1) <= strokeThreshold / Math.min(shape.radiusX, shape.radiusY);

    case "pencil":
      // Check if point is near any line segment in the pencil path
      for (let i = 1; i < shape.points.length; i++) {
        const p1 = shape.points[i - 1];
        const p2 = shape.points[i];
        const distance = pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
        if (distance < strokeThreshold) return true;
      }
      return false;

    case "arrow":
      // Check if point is near the arrow line
      return pointToLineDistance(x, y, shape.fromX, shape.fromY, shape.toX, shape.toY) < strokeThreshold;

    case "text":
      // For text, check if point is within text bounds
      return (
        x >= bounds.x - strokeThreshold &&
        x <= bounds.x + bounds.width + strokeThreshold &&
        y >= bounds.y - strokeThreshold &&
        y <= bounds.y + bounds.height + strokeThreshold
      );
  }
}

// Clone a shape (deep copy)
export function cloneShape(shape: Shape): Shape {
  const clone = { ...shape };
  
  if (shape.type === "pencil") {
    (clone as any).points = [...shape.points.map(p => ({...p}))];
  }
  
  return clone;
}

// Get drag offset for a shape
export function getDragOffset(
  x: number, y: number, shape: Shape
): { offsetX: number, offsetY: number } {
  switch (shape.type) {
    case "rect":
      return { offsetX: x - shape.x, offsetY: y - shape.y };
    case "circle":
    case "ellipse":
      return { offsetX: x - shape.centerX, offsetY: y - shape.centerY };
    case "pencil":
      const bounds = getShapeBounds(shape);
      return { offsetX: x - bounds.x, offsetY: y - bounds.y };
    case "arrow":
      return { offsetX: x - shape.fromX, offsetY: y - shape.fromY };
    case "text":
      return { offsetX: x - shape.x, offsetY: y - shape.y };
  }
}

// Update shape position during drag
export function updateShapePosition(shape: Shape, newX: number, newY: number, offsetX: number, offsetY: number): void {
  switch (shape.type) {
    case "rect":
      shape.x = newX - offsetX;
      shape.y = newY - offsetY;
      break;
    case "circle":
    case "ellipse":
      shape.centerX = newX - offsetX;
      shape.centerY = newY - offsetY;
      break;
    case "pencil":
      const bounds = getShapeBounds(shape);
      const dx = newX - offsetX - bounds.x;
      const dy = newY - offsetY - bounds.y;
      shape.points = shape.points.map(p => ({
        x: p.x + dx,
        y: p.y + dy
      }));
      break;
    case "arrow":
      const dx2 = newX - offsetX - shape.fromX;
      const dy2 = newY - offsetY - shape.fromY;
      shape.fromX += dx2;
      shape.fromY += dy2;
      shape.toX += dx2;
      shape.toY += dy2;
      break;
    case "text":
      shape.x = newX - offsetX;
      shape.y = newY - offsetY;
      break;
  }
} 