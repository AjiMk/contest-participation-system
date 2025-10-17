import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/auth';
import { requireRole } from '../middlewares/roles';

const router = Router();

// Questions are managed by admins. Reading should be controlled by contest visibility.
router.get('/', requireRole(['GUEST', 'USER', 'VIP', 'ADMIN']), async (_req: Request, res: Response) => {
  res.json({ success: true, data: [], message: 'List of questions (filtered by contest & role)' });
});

router.post('/', requireAuth, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  res.json({ success: true, data: req.body, message: 'Question created' });
});

router.put('/:id', requireAuth, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  res.json({ success: true, data: req.body, message: `Question ${req.params.id} updated` });
});

router.delete('/:id', requireAuth, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  res.json({ success: true, message: `Question ${req.params.id} deleted` });
});

export default router;
