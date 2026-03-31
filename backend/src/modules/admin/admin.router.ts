import { Router } from 'express';
import {
  adminLogin,
  getDashboard,
  getPendingContributionsHandler,
  approveContributionHandler,
  rejectContributionHandler,
  adminRequestUploadUrl,
  adminCreateResource,
  getModerationPostsHandler,
  setPostStatusHandler,
  getModerationCommentsHandler,
  setCommentStatusHandler,
  getBoardStatsHandler,
  listUsersHandler,
  banUserHandler,
  unbanUserHandler,
} from './admin.controller';
import {
  createInstitutionHandler,
  createProgramHandler,
  createSubjectHandler,
} from '../institutions/institutions.controller';
import {
  getRequestsHandler,
  updateRequestStatusHandler,
} from '../requests/requests.controller';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import { authLimiter, uploadLimiter } from '../../middleware/rateLimit';

const router = Router();

// POST /api/admin/login — public but rate limited
router.post('/login', authLimiter, adminLogin);

// All routes below require authentication and admin role
router.use(requireAuth, requireAdmin);

// Admin: manage academic hierarchy
router.post('/institutions', createInstitutionHandler);
router.post('/programs', createProgramHandler);
router.post('/subjects', createSubjectHandler);

// GET /api/admin/dashboard
router.get('/dashboard', getDashboard);

// GET /api/admin/stats (alias for legacy admin service path)
router.get('/stats', getDashboard);

// Get admin requests via /api/admin/requests
router.get('/requests', getRequestsHandler);

// Fulfill request via /api/admin/requests/:id/fulfill
router.patch('/requests/:id/fulfill', (req, res, next) => {
  // reuse existing request status update logic
  req.body = { ...req.body, status: 'FULFILLED' };
  return updateRequestStatusHandler(req, res, next);
});

// GET /api/admin/contributions/pending
router.get('/contributions/pending', getPendingContributionsHandler);

// PATCH /api/admin/contributions/:id/approve
router.patch('/contributions/:id/approve', approveContributionHandler);

// DELETE /api/admin/contributions/:id
router.delete('/contributions/:id', rejectContributionHandler);

// POST /api/admin/resources/upload-url
router.post('/resources/upload-url', uploadLimiter, adminRequestUploadUrl);

// POST /api/admin/resources
router.post('/resources', adminCreateResource);

// ─── User Management ─────────────────────────────────────────────────────────
router.get('/users', listUsersHandler);
router.patch('/users/:id/ban', banUserHandler);
router.patch('/users/:id/unban', unbanUserHandler);

// ─── Board Moderation ─────────────────────────────────────────────────────────
router.get('/moderation/posts', getModerationPostsHandler);
router.patch('/moderation/posts/:id/status', setPostStatusHandler);
router.get('/moderation/comments', getModerationCommentsHandler);
router.patch('/moderation/comments/:id/status', setCommentStatusHandler);
router.get('/moderation/board-stats', getBoardStatsHandler);

export default router;
