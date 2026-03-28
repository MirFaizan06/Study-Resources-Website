import { z } from 'zod';

export const PostCategoryValues = [
  'ACADEMICS',
  'INFRASTRUCTURE',
  'ADMINISTRATION',
  'TRANSPORT',
  'HOSTEL',
  'SPORTS_CULTURE',
  'OTHER',
] as const;

export const CreatePostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url('Invalid image URL'),
  category: z.enum(PostCategoryValues).default('OTHER'),
});

export const PostImageUploadSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

export const ListPostsSchema = z.object({
  sort: z.enum(['hot', 'new', 'top']).default('hot'),
  category: z.enum([...PostCategoryValues, 'ALL']).default('ALL'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const CreateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
});

export type CreatePost = z.infer<typeof CreatePostSchema>;
export type ListPosts = z.infer<typeof ListPostsSchema>;
export type CreateComment = z.infer<typeof CreateCommentSchema>;
