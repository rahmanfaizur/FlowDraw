import z from "zod";
//zod schemas
export const createUserSchema = z.object({
    username: z.string().min(3, "Username is Required!"),
    password: z.string().min(5, "Password must be at least 6 character long!"),
    name: z.string()
});

export const signInSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(5, "Password must be at least 6 character long!")
})

export const roomQuerySchema = z.object({
    name: z.string().min(3).max(20);
});
