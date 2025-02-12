import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET }  from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({port: 8080});

//ugly room management, TODO: We can do better! (redux, singleton!)
interface User {
    ws: WebSocket,
    rooms: string[],
    userId: string
}

const users : User[] = [];
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
    }
}

wss.on('connection', function connection(ws, request) {
    const url = request.url; //ws://localhost:8080?token=123123

    if (!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    const userId = checkUser(token);

    if (userId == null) {
        ws.close();
        return null;
    }

    //Once a user is authenticated we reach here!

    users.push({
        userId,
        rooms: [],
        //@ts-ignore TODO: FIX!
        ws
    })

    ws.on('message', async function message(data) {
        //the data is usually a string hence we parse it as json!
        // const parsedData = JSON.parse(data as unknown as string);
        //should check the type ideally! TODO:
        let parsedData;
        if (typeof data !== "string") {
          parsedData = JSON.parse(data.toString());
        } else {
          parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
        }
        
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

        console.log("Message Recieved!");
        console.log(parsedData);
        //could add persisting storage ie a db here!
        //a user needs to auth for a particular room! (could do)

        //chat logic!
        if (parsedData.type === "chat") {
            const roomId = parsedData.roomId;
            const message = parsedData.message;
            //should put checks on the text and the length should also be checked!

            if (!roomId || isNaN(Number(roomId))) {
                console.error("Invalid roomId received:", roomId);
                return;
            }
            

            await prismaClient.chat.create({
                data: {
                    roomId: Number(roomId),
                    message,
                    userId
                }
            })
            //ideally we should do a queue here! as this will be a lot slower!

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
    });
});