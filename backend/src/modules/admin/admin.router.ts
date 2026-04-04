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
  listAdminProfilesPublicHandler,
  listAdminProfilesFullHandler,
  createAdminHandler,
  generateAdminHandler,
  revokeAdminHandler,
  reinstateAdminHandler,
  deleteAdminHandler,
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
import { requireAuth, requireAdmin, requireSuperAdmin } from '../../middleware/auth';
import { authLimiter, uploadLimiter } from '../../middleware/rateLimit';

const router = Router();

// POST /api/admin/login — public but rate limited
router.post('/login', authLimiter, adminLogin);

// Public: admin profiles (contact info hidden for revoked admins)
router.get('/admins/public', listAdminProfilesPublicHandler);

// All routes below require authentication and admin role
router.use(requireAuth, requireAdmin);

// Admin: manage academic hierarchy
router.post('/institutions', createInstitutionHandler);
router.post('/programs', createProgramHandler);
router.post('/subjects', createSubjectHandler);

// GET /api/admin/dashboard
router.get('/dashboard', getDashboard);

// GET /api/admin/stats (alias)
router.get('/stats', getDashboard);

// Requests
router.get('/requests', getRequestsHandler);
router.patch('/requests/:id/fulfill', (req, res, next) => {
  req.body = { ...req.body, status: 'FULFILLED' };
  return updateRequestStatusHandler(req, res, next);
});

// Contributions
router.get('/contributions/pending', getPendingContributionsHandler);
router.patch('/contributions/:id/approve', approveContributionHandler);
router.delete('/contributions/:id', rejectContributionHandler);

// Resources
router.post('/resources/upload-url', uploadLimiter, adminRequestUploadUrl);
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

// ─── Admin Profiles (full, for super admin UI) ────────────────────────────────
router.get('/admins', requireSuperAdmin, listAdminProfilesFullHandler);
router.post('/admins/create', requireSuperAdmin, createAdminHandler);
router.post('/admins/generate', requireSuperAdmin, generateAdminHandler);
router.patch('/admins/:id/revoke', requireSuperAdmin, revokeAdminHandler);
router.patch('/admins/:id/reinstate', requireSuperAdmin, reinstateAdminHandler);
router.delete('/admins/:id', requireSuperAdmin, deleteAdminHandler);

export default router;
