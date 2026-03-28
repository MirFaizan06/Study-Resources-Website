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
