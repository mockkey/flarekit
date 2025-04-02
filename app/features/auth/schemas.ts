import { z } from 'zod'

export const emailSchema = z.object({
    email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
})

export const signInSchema = emailSchema.extend({
    password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(32, "Password is too long")
})

export const signUpSchema = signInSchema.extend({
    name:z.string()
    .min(1,"Name is required")
})

export const resetPasswordSchema =  z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password is too long"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})