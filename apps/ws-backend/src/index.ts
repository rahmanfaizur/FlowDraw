import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET }  from "@repo/backend-common/config";

const wss = new WebSocketServer({port: 8080});

//ugly room management, TODO: We can do better! (redux, singleton!)
interface User {
    ws: WebSocket,
    rooms: string[],
    userId: string
}

//The data is like this!
// const users = [{
//     userId: 1,
//     rooms: ['room1', 'room2'],
//     ws: socket
// }, {
//     userId: 2,
//     rooms: ['room1'],
//     ws: socket
// }, {
//     userId: 3,
//     rooms: [],
//     ws: socket
// }]

function checkUser(token: string) : string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded == "string") {
        return null;
    }
    if (!decoded || !(decoded).userId) {
        return null;
    }
    return decoded.userId;
    }
    catch(error) {
        return null;
        console.log("JWT Error!");
    }
}

wss.on('connection', function connection(ws, request) {
    const url = request.url; //ws://localhost:8080?token=123123

    if (!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token');
    if (token == null) {
        return;
    }
    const userId = checkUser(token);

    if (userId == null) {
        ws.close();
        return null;
    }

    //Once a user is authenticated we reach here!

    const users : User[] = [];

    users.push({
        userId,
        rooms: [],
        //@ts-ignore TODO: FIX!
        ws
    })

    ws.on('message', function message(data) {
        //the data is usually a string hence we parse it as json!
        const parsedData = JSON.parse(data as unknown as string);
        //should check the type ideally! TODO:
        
        //join room
        if (parsedData.type === "join_room") {
            //also ideally implement the logic(check if the room the user's trying to join exists!) TODO:
            const user = users.find(x => x.ws === ws as any);
            user?.rooms.push(parsedData.roomId);
        };

        //leave room!
        if (parsedData.type === "leave_room") {
            const user = users.find(x => x.ws === ws as any);
            if (!user) {
                return;
            }
            user.rooms = user.rooms.filter(x => x === parsedData.room);
        };

        //could add persisting storage ie a db here!
        //a user needs to auth for a particular room! (could do)

        //chat logic!
        if (parsedData.type === "chat") {
            const roomId = parsedData.roomId;
            const message = parsedData.message;
            //should put checks on the text and the length should also be checked!

            users.forEach(user => {
                if (user.rooms.includes(roomId)) {
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message: message,
                        roomId
                    }))
                }
            })
        }
        // ws.send('pong');
    });
});