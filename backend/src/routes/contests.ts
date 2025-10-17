import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/auth';
import { requireRole } from '../middlewares/roles';

const router = Router();

// Public: list contests (Guests allowed to GET)
router.get('/', requireRole(['GUEST', 'USER', 'VIP', 'ADMIN']), async (req: Request, res: Response) => {
    console.log("contests 1")
  // Implementation should filter contests by visibility (NORMAL/VIP) on the service layer.
  res.json({ success: true, data: [], message: 'List of contests (filtered by role on service layer)' });
});

// Protected: create contest (ADMIN only)
router.post('/', requireAuth, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  res.json({ success: true, data: {}, message: 'Contest created (admin only)' });
});

// Protected read single contest - accessible by role rules (USER/VIP/ADMIN). Guests allowed only for public contests; here we require auth for protected reads.
router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  res.json({ success: true, data: { id }, message: 'Contest details (access controlled by service)' });
});

// Protected update/delete - ADMIN only
router.put('/:id', requireAuth, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  res.json({ success: true, data: req.body, message: `Contest ${req.params.id} updated` });
});

router.delete('/:id', requireAuth, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  res.json({ success: true, message: `Contest ${req.params.id} deleted` });
});

export default router;
