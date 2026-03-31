import { z } from 'zod';

export const GetInstitutionsQuerySchema = z.object({});

export const GetProgramsQuerySchema = z.object({
  institutionId: z.string().min(1, 'institutionId is required'),
});

export const GetProgramParamsSchema = z.object({
  programId: z.string().min(1, 'programId is required'),
});

export const GetSubjectParamsSchema = z.object({
  subjectId: z.string().min(1, 'subjectId is required'),
});

export const GetInstitutionBySlugParamsSchema = z.object({
  slug: z.string().min(1, 'slug is required'),
});

export type GetProgramsQuery = z.infer<typeof GetProgramsQuerySchema>;
export type GetProgramParams = z.infer<typeof GetProgramParamsSchema>;
export type GetSubjectParams = z.infer<typeof GetSubjectParamsSchema>;
export type GetInstitutionBySlugParams = z.infer<typeof GetInstitutionBySlugParamsSchema>;

export const CreateInstitutionSchema = z.object({
  name: z.string().min(2, 'Name is required').max(255),
  type: z.enum(['UNIVERSITY', 'COLLEGE', 'SCHOOL']),
  logoUrl: z.string().url().optional(),
});

export const CreateProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required').max(255),
  institutionId: z.string().min(1, 'institutionId is required'),
});

export const CreateSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(255),
  programId: z.string().min(1, 'programId is required'),
  semester: z.coerce.number().int().min(1).max(12),
  category: z.enum(['MAJOR', 'MINOR', 'MD', 'AEC', 'VAC', 'SEC']).optional(),
});

export type CreateInstitution = z.infer<typeof CreateInstitutionSchema>;
export type CreateProgram = z.infer<typeof CreateProgramSchema>;
export type CreateSubject = z.infer<typeof CreateSubjectSchema>;
