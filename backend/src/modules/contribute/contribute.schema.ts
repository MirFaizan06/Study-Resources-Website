import { z } from 'zod';
import { ResourceType } from '@prisma/client';

export const ContributeSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(300, 'Title cannot exceed 300 characters'),
  type: z.nativeEnum(ResourceType),
  subjectId: z.string().min(1, 'subjectId is required'),
  year: z.number().int().min(2000).max(2100).optional(),
  uploaderName: z
    .string()
    .min(2, 'Your name must be at least 2 characters')
    .max(100),
  uploaderEmail: z.string().email('Invalid email address'),
  fileUrl: z.string().url('fileUrl must be a valid URL'),
});

export type ContributeInput = z.infer<typeof ContributeSchema>;
