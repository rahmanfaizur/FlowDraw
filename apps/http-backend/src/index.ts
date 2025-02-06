import express from "express";
import z from "zod";
import bcrypt from "bcrypt";

const app = express();

app.use(express.json());

app.get('/api/v1/signup', async (req, res) => {
    const userSchema = z.object({
        username: z.string().min(1, "Username is Required!"),
        password: z.string().min(6, "Password must be at least 6 character long!")
    });
    try {
        const { username, password } = userSchema.parse(req.body);
        const hashedPassword: string = await bcrypt.hash(password, 10);
        //here comes the duplicate user logic check and hence the db logic!
        //if no then insert the user and the password to the db!
        res.status(400).json({
            message: "User created successfully!"
        })
    }
    catch(err) {
        res.status(500).json({
            message: "You did something wonky!"
        });
        console.error(err);
    }
})

app.get('/api/v1/signin', (req, res) => {
    res.json({
        message: "Http backend hit!"
    })
})

app.get('/api/v1/room', (req, res) => {
    res.json({
        message: "Http backend hit!"
    })
})



app.listen(3001, () => {
    console.log("connected to port 3001!");
})