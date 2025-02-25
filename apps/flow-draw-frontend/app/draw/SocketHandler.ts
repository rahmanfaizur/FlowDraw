// apps/flow-draw-frontend/app/draw/SocketHandler.ts
import { Shape } from './Shape';

export function handleSocketMessage(socket: WebSocket, existingShapes: Shape[], clearCanvas: () => void) {
    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type == "chat") {
            const parsedShape = JSON.parse(message.message);
            existingShapes.push(parsedShape.shape);
            clearCanvas();
        }
    };
}