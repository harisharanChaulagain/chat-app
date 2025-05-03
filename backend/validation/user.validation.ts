import { z } from "zod";

export const userRegister = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm Password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const messageSchema = z.object({
  sender: z.string().uuid("Invalid sender ID format"),  
  receiver: z.string().uuid("Invalid receiver ID format"),
  message: z.string().min(1, "Message cannot be empty").max(500, "Message is too long"), 
});

export type UserRegisterInput = z.infer<typeof userRegister>;
export type LoginInput = z.infer<typeof loginSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
