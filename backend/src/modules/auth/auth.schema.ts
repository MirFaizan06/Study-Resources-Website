import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  university: z.string().min(2, 'University is required').max(120),
  college: z.string().min(2, 'College name is required').max(120),
  semester: z.coerce.number().int().min(1).max(12),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  university: z.string().min(2).max(120).optional(),
  college: z.string().min(2).max(120).optional(),
  semester: z.coerce.number().int().min(1).max(12).optional(),
  profilePicUrl: z.string().url().optional().nullable(),
  nameIsPublic: z.boolean().optional(),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const ProfilePicUploadSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

export type Register = z.infer<typeof RegisterSchema>;
export type Login = z.infer<typeof LoginSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
