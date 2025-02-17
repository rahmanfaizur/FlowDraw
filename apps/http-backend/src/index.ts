import express from "express";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { createUserSchema, signInSchema, roomQuerySchema} from "@repo/common/commonPackages";
import userMiddleware from "./middleware";
import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";
import { JWT_SECRET } from "@repo/backend-common/config";
import cors from 'cors';

const app = express();

app.use(express.json());

app.use(cors())

//routes
app.post('/api/v1/signup', async (req: Request, res: Response) => {
    try {
        const { email, name, password } = createUserSchema.parse(req.body);
        const existingUser = await prismaClient.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            res.status(400).json({
                message: "Email Already Exists!"
            });
            return;  //use a void return rather than on the res object!
        }

        const hashedPassword: string = await bcrypt.hash(password, 10);
        await prismaClient.user.create({
            data: { email, name, password: hashedPassword }
        });
        res.status(201).json({
            message: "User created successfully!"
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            message: "An error occurred during signup."
        });
    }
});

app.post('/api/v1/signin', async (req: Request, res: Response) => {
    try {
        const { email, password } = signInSchema.parse(req.body);
        const user = await prismaClient.user.findUnique({
            where: { email }
        });

        if (!user) {
            res.status(400).json({
                message: "User doesn't exist!"
            });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                message: "Invalid Credentials!"
            });
            return;
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET as string,
        );
        res.status(200).json({
            token
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            message: "An error occurred during sign-in."
        });
    }
});

app.post('/api/v1/room', userMiddleware, async (req, res) => {
    const parsedData = roomQuerySchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect Inputs!"
        });
        return;
    }
    const userId = req.userId;
    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        });
        res.json({
            roomId: room.id
        });
    } catch (error) {
        res.json({
            message: "Validation Error!"
        });
    }
});

app.get("/api/v1/chats/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 1000
        });
        res.json({
            messages
        });
    } catch (error) {
        console.log(error);
        res.json({
            messages: []
        });
    }
});

app.get("/api/v1/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
        where: {
            slug
        }
    });
    res.json({
        room
    });
});

app.listen(3001, () => {
    console.log("connected to port 3001!");
});
