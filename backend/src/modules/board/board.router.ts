import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { boardPostLimiter, voteLimiter, uploadLimiter, commentLimiter } from '../../middleware/rateLimit';
import {
  listPostsHandler,
  getPostHandler,
  createPostHandler,
  requestPostImageUrl,
  votePostHandler,
  deletePostHandler,
  addCommentHandler,
  deleteCommentHandler,
  voteCommentHandler,
} from './board.controller';

const router = Router();

// Public (optionally auth for vote state)
router.get('/posts', listPostsHandler);
router.get('/posts/:id', getPostHandler);

// Auth required
router.post('/posts/image-url', requireAuth, uploadLimiter, requestPostImageUrl);
router.post('/posts', requireAuth, boardPostLimiter, createPostHandler);
router.post('/posts/:id/vote', requireAuth, voteLimiter, votePostHandler);
router.delete('/posts/:id', requireAuth, deletePostHandler);
router.post('/posts/:id/comments', requireAuth, commentLimiter, addCommentHandler);
router.delete('/posts/:id/comments/:commentId', requireAuth, deleteCommentHandler);
router.post('/posts/:id/comments/:commentId/vote', requireAuth, voteLimiter, voteCommentHandler);

export default router;
