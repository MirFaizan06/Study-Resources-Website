import { Router } from 'express';
import {
  createRequestHandler,
  getRequestsHandler,
  updateRequestStatusHandler,
} from './requests.controller';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import { generalLimiter } from '../../middleware/rateLimit';

const router = Router();

// POST /api/requests — public, rate limited
router.post('/', generalLimiter, createRequestHandler);

// GET /api/requests — admin only
router.get('/', requireAuth, requireAdmin, getRequestsHandler);

// PATCH /api/requests/:id/status — admin only
router.patch('/:id/status', requireAuth, requireAdmin, updateRequestStatusHandler);

export default router;
