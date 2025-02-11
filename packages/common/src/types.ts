import { z } from 'zod';
//zod schemas
export const createUserSchema = z.object({
    name: z.string().min(2, "Username is Required!"),
    password: z.string().min(5, "Password must be at least 6 character long!"),
    email: z.string().email()
});

export const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(5, "Password must be at least 6 character long!")
})

export const roomQuerySchema = z.object({
    name: z.string().min(3).max(20)
});
