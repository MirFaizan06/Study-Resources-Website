import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { authLimiter, uploadLimiter } from '../../middleware/rateLimit';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  patchProfile,
  requestProfilePicUrl,
  postAcceptBoardTos,
} from './auth.controller';

const router = Router();

// POST /api/auth/register
router.post('/register', authLimiter, register);

// POST /api/auth/login
router.post('/login', authLimiter, login);

// POST /api/auth/refresh — exchange refresh token for new access + refresh token
router.post('/refresh', refreshToken);

// POST /api/auth/logout — revoke refresh token
router.post('/logout', logout);

// GET /api/auth/me — requires auth
router.get('/me', requireAuth, getProfile);

// PATCH /api/auth/profile — requires auth
router.patch('/profile', requireAuth, patchProfile);

// POST /api/auth/accept-board-tos — record board ToS acceptance
router.post('/accept-board-tos', requireAuth, postAcceptBoardTos);

// POST /api/auth/profile-pic-url — get presigned URL for avatar upload
router.post('/profile-pic-url', requireAuth, uploadLimiter, requestProfilePicUrl);

export default router;
