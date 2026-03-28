import { Router } from 'express';
import {
  getResourcesHandler,
  getResourceByIdHandler,
  getDownloadUrl,
  requestUploadUrl,
  createResourceHandler,
} from './resources.controller';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import { generalLimiter, uploadLimiter } from '../../middleware/rateLimit';

const router = Router();

// GET /api/resources
router.get('/', generalLimiter, getResourcesHandler);

// GET /api/resources/:id
router.get('/:id', getResourceByIdHandler);

// POST /api/resources  — admin only, creates resource record after upload
router.post('/', requireAuth, requireAdmin, createResourceHandler);

// POST /api/resources/upload-url  — must be declared before /:id/download to avoid collision
router.post(
  '/upload-url',
  requireAuth,
  requireAdmin,
  uploadLimiter,
  requestUploadUrl
);

// POST /api/resources/:id/download
router.post('/:id/download', getDownloadUrl);

export default router;
