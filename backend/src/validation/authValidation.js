import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, periods, and underscores')
    .toLowerCase(),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters'),
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(1, 'Full name cannot be empty')
    .max(60, 'Full name cannot exceed 60 characters')
});

export const loginSchema = z.object({
  identifier: z
    .string({ required_error: 'Username or email is required' })
    .trim()
    .min(1, 'Username or email cannot be empty'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty')
});
