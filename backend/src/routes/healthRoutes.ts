import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/health
 * Basic health check — confirms the backend is running.
 */
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Backend running',
  });
});

export default router;
