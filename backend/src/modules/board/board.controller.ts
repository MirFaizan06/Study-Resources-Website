import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import path from 'path';
import { AppError } from '../../middleware/errorHandler';
import { generateUploadPresignedUrl } from '../../utils/s3Presign';
import {
  CreatePostSchema,
  ListPostsSchema,
  CreateCommentSchema,
  PostImageUploadSchema,
} from './board.schema';
import {
  listPosts,
  getPost,
  createPost,
  toggleVote,
  deletePost,
  addComment,
  deleteComment,
  toggleCommentVote,
} from './board.service';

// GET /api/board/posts
export async function listPostsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const params = ListPostsSchema.parse(req.query);
    const viewerId = req.user?.id;
    const result = await listPosts(params, viewerId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// GET /api/board/posts/:id
export async function getPostHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params['id'];
    if (!id) throw new AppError('Post id is required.', 400, 'VALIDATION_ERROR');
    const viewerId = req.user?.id;
    const post = await getPost(id, viewerId);
    res.status(200).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

// POST /api/board/posts
export async function createPostHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError('Authentication required.', 401, 'AUTH_REQUIRED');
    const data = CreatePostSchema.parse(req.body);
    const post = await createPost(data, req.user.id);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

// POST /api/board/posts/image-url
export async function requestPostImageUrl(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError('Authentication required.', 401, 'AUTH_REQUIRED');
    const { fileName, contentType } = PostImageUploadSchema.parse(req.body);
    const ext = path.extname(fileName).toLowerCase() || '.jpg';
    const key = `board/${req.user.id}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const { uploadUrl, fileUrl } = await generateUploadPresignedUrl(key, contentType);
    res.status(200).json({ success: true, data: { uploadUrl, fileUrl } });
  } catch (err) {
    next(err);
  }
}

// POST /api/board/posts/:id/vote
export async function votePostHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError('Authentication required.', 401, 'AUTH_REQUIRED');
    const id = req.params['id'];
    if (!id) throw new AppError('Post id is required.', 400, 'VALIDATION_ERROR');
    const result = await toggleVote(id, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/board/posts/:id
export async function deletePostHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError('Authentication required.', 401, 'AUTH_REQUIRED');
    const id = req.params['id'];
    if (!id) throw new AppError('Post id is required.', 400, 'VALIDATION_ERROR');
    const isAdmin = req.user.role === 'ADMIN';
    await deletePost(id, req.user.id, isAdmin);
    res.status(200).json({ success: true, message: 'Post removed.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/board/posts/:id/comments
export async function addCommentHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError('Authentication required.', 401, 'AUTH_REQUIRED');
    const id = req.params['id'];
    if (!id) throw new AppError('Post id is required.', 400, 'VALIDATION_ERROR');
    const data = CreateCommentSchema.parse(req.body);
    const comment = await addComment(id, req.user.id, data);
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/board/posts/:id/comments/:commentId
export async function deleteCommentHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError('Authentication required.', 401, 'AUTH_REQUIRED');
    const commentId = req.params['commentId'];
    if (!commentId) throw new AppError('Comment id is required.', 400, 'VALIDATION_ERROR');
    const isAdmin = req.user.role === 'ADMIN';
    await deleteComment(commentId, req.user.id, isAdmin);
    res.status(200).json({ success: true, message: 'Comment removed.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/board/posts/:id/comments/:commentId/vote
export async function voteCommentHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError('Authentication required.', 401, 'AUTH_REQUIRED');
    const commentId = req.params['commentId'];
    if (!commentId) throw new AppError('Comment id is required.', 400, 'VALIDATION_ERROR');
    const result = await toggleCommentVote(commentId, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
