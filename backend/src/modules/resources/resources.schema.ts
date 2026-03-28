import { z } from 'zod';
import { ResourceType, SubjectCategory } from '@prisma/client';

const ResourceTypeEnum = z.nativeEnum(ResourceType);
const SubjectCategoryEnum = z.nativeEnum(SubjectCategory);

export const GetResourcesQuerySchema = z.object({
  subjectId: z.string().optional(),
  type: ResourceTypeEnum.optional(),
  category: SubjectCategoryEnum.optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['newest', 'popular']).optional().default('newest'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const CreateResourceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(300),
  type: ResourceTypeEnum,
  subjectId: z.string().min(1, 'subjectId is required'),
  year: z.number().int().min(2000).max(2100).optional(),
  isAiGenerated: z.boolean().optional().default(false),
});

export const ResourceIdParamSchema = z.object({
  id: z.string().min(1, 'Resource id is required'),
});

export const RequestUploadUrlSchema = z.object({
  fileName: z.string().min(1, 'fileName is required'),
  contentType: z.enum(['application/pdf'], {
    errorMap: () => ({ message: 'Only PDF files are allowed.' }),
  }),
});

export type GetResourcesQuery = z.infer<typeof GetResourcesQuerySchema>;
export type CreateResource = z.infer<typeof CreateResourceSchema>;
export type RequestUploadUrl = z.infer<typeof RequestUploadUrlSchema>;
export { SubjectCategoryEnum };
