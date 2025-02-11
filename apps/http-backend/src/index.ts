import express from "express";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { createUserSchema, signInSchema, roomQuerySchema} from "@repo/common/commonPackages";
import userMiddleware from "./middleware";
import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";

const app = express();

app.use(express.json());


//routes
//@ts-ignore
app.post('/api/v1/signup', async (req: Request, res : Response) => {
    try {
        const { email, name, password } = createUserSchema.parse(req.body);
        const existingUser = await prismaClient.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email Already Exists!"
            })
        }
        // no duplicate email exists!
        const hashedPassword: string = await bcrypt.hash(password, 10);
        await prismaClient.user.create({
            data: {email, name, password: hashedPassword}
        })
        res.status(201).json({
            message: "User created successfully!"
        })
        //here comes the duplicate user logic check and hence the db logic!
        //if no then insert the user and the password to the db!
    }
    catch(err) {
            res.status(400).json({
                message: "Validation Error"
            });
            console.error(err);
        }
    }
)
//@ts-ignore
app.post('/api/v1/signin', async (req : Request, res: Response) => {
    try {
        const { email, password } = signInSchema.parse(req.body);

        //find user with the same username in the database
        //if not give an error
        const user = await prismaClient.user.findUnique({
            where: {email}
        });

        if (!user) {
            return res.status(400).json({
                message: "User doesn't exists!"
            })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid Credentials!"
            })
        }

        //password check from db (the hashed password)

        // jwt logic
        const token = jwt.sign(
            {userId: user.id, email: user.email},
            process.env.JWT_SECRET as string,
            { expiresIn: "1h"}
        );
        return res.status(200).json({
            message: "Sign-in successful!",
            token
        })
    }
    catch (err) {
        res.status(400).json({
            message: "Sign-in error caught!"
        })
    }
})

app.post('/api/v1/room', userMiddleware, (req, res) => {
    // const validation = roomQuerySchema.safeParse(req.body);
    //db call!
    res.json({
        message: "Connected to the Db!"
    })
})



app.listen(3001, () => {
    console.log("connected to port 3001!");
})