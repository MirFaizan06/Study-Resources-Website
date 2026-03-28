import { Router } from 'express';
import {
  adminLogin,
  getDashboard,
  getPendingContributionsHandler,
  approveContributionHandler,
  rejectContributionHandler,
  adminRequestUploadUrl,
  adminCreateResource,
} from './admin.controller';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import { authLimiter, uploadLimiter } from '../../middleware/rateLimit';

const router = Router();

// POST /api/admin/login — public but rate limited
router.post('/login', authLimiter, adminLogin);

// All routes below require authentication and admin role
router.use(requireAuth, requireAdmin);

// GET /api/admin/dashboard
router.get('/dashboard', getDashboard);

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

export default router;
