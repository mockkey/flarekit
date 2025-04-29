import { type Schema, z } from "zod";

export const signUpSchema: Schema<{
  name: string;
  email: string;
  password: string;
}> = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const signInSchema: Schema<{
  email: string;
  password: string;
}> = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
