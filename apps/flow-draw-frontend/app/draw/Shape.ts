// apps/flow-draw-frontend/app/draw/Shape.ts
export type Shape = {
    id: string;
    selected?: boolean;
    type: "rect" | "circle" | "pencil" | "ellipse" | "arrow" | "line";
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
} | {
    id: string;
    selected?: boolean;
    type: "text";
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    color?: string;
    lineWidth?: number;
} | {
    id: string;
    selected?: boolean;
    type: "line";
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    color?: string;
    lineWidth?: number;
};