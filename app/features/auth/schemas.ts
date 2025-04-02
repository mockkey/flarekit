import { z } from 'zod'

export const signUpSchema = z.object({
    name:z.string()
    .min(1,"Name is required"),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
})