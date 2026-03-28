import { Router, Request, Response, NextFunction } from 'express';
import { getPlatformStats } from './stats.service';

const router = Router();

// GET /api/stats — public, no auth required
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getPlatformStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

export default router;
