import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/auth';
import { requireRole } from '../middlewares/roles';

const router = Router();

// Create a participation entry - authenticated users only
router.post('/', requireAuth, requireRole(['USER', 'VIP', 'ADMIN']), async (req: Request, res: Response) => {
  res.json({ success: true, data: req.body, message: 'Participation submitted' });
});

// List participations - admin can view all; users can view their own
router.get('/', requireAuth, requireRole(['ADMIN', 'VIP', 'USER']), async (req: Request, res: Response) => {
  res.json({ success: true, data: [], message: 'List participations (filtered by role/user)' });
});

export default router;
