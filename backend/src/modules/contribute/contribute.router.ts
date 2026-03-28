import { Router } from 'express';
import { submitContributionHandler } from './contribute.controller';
import { generalLimiter } from '../../middleware/rateLimit';

const router = Router();

// POST /api/contribute
router.post('/', generalLimiter, submitContributionHandler);

export default router;
