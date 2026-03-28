import { z } from 'zod';
import { RequestStatus } from '@prisma/client';

export const CreateRequestSchema = z.object({
  studentName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  requestedMaterial: z
    .string()
    .min(10, 'Please describe what you need (at least 10 characters)')
    .max(500, 'Description cannot exceed 500 characters'),
  contactEmail: z.string().email('Invalid email address').optional(),
});

export const UpdateRequestStatusSchema = z.object({
  status: z.nativeEnum(RequestStatus),
});

export const RequestIdParamSchema = z.object({
  id: z.string().min(1, 'Request id is required'),
});

export const GetRequestsQuerySchema = z.object({
  status: z.nativeEnum(RequestStatus).optional(),
});

export type CreateRequestInput = z.infer<typeof CreateRequestSchema>;
export type UpdateRequestStatusInput = z.infer<typeof UpdateRequestStatusSchema>;
export type GetRequestsQuery = z.infer<typeof GetRequestsQuerySchema>;
