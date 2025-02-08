import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUserSchema, signInSchema, roomQuerySchema} from "@repo/common/commonPackages"
import { userMiddleware } from "./middleware";

const app = express();

app.use(express.json());


//routes

app.post('/api/v1/signup', async (req, res) => {
    try {
        const { username, password, name } = createUserSchema.parse(req.body);
        const hashedPassword: string = await bcrypt.hash(password, 10);
        //here comes the duplicate user logic check and hence the db logic!
        //if no then insert the user and the password to the db!
        res.status(201).json({
            message: "User created successfully!"
        })
    }
    catch(err) {
            res.status(400).json({
                message: "Validation Error"
            });
        }
        res.status(500).json({
            message: "You did something wonky!"
        });
        console.error(err);
    }
})

app.post('/api/v1/signin', async (req, res) => {
    try {
        const { username, password } = req.body;

        //find user with the same username in the database
        //if not give an error

        //password check from d (the hashed password)

        //jwt logic
        // const token = jwt.sign(
        //     //id
        //     // JWT_PASS
        // )
    }
    catch (err) {
        res.status(400).json({
            message: "Error caught!"
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