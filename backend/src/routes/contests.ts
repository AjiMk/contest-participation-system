import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/auth';
import { optionalAuth } from '../middlewares/optionalAuth';
import { requireRole } from '../middlewares/roles';
import Contest from '../models/Contest';
import { AuthRequest } from '../types';
import { Op } from 'sequelize';
import { createContestSchema, updateContestSchema } from '../shared/validation/contests';
import type { ContestInput } from '../models/Contest';
import { ParticipationStore } from '../services/participationStore';

const router = Router();

// Public: list contests (Guests allowed to GET)
router.get('/', optionalAuth, requireRole(['GUEST', 'USER', 'VIP', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  const userRole = (req.user?.role || 'GUEST').toUpperCase();

  // Base where clause: only contests that are currently running (if starts_at/ends_at provided)
  const now = new Date();
  const timeWhere: any = {
    [Op.or]: [
      { starts_at: null, ends_at: null },
      { starts_at: { [Op.lte]: now }, ends_at: { [Op.gte]: now } },
      { starts_at: { [Op.lte]: now }, ends_at: null },
      { starts_at: null, ends_at: { [Op.gte]: now } },
    ],
  };

  // Access level filtering
  const accessLevels: Array<'normal' | 'vip'> = [];
  if (userRole === 'ADMIN' || userRole === 'VIP') {
    accessLevels.push('normal', 'vip');
  } else {
    // USER and GUEST see only normal
    accessLevels.push('normal');
  }

  try {
    const contests = await Contest.findAll({
      where: {
        access_level: accessLevels,
        // merge the timeWhere via sequelize where syntax
        // ...timeWhere,
      },
      order: [['starts_at', 'ASC']],
    });
    return res.json({ success: true, data: contests });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to fetch contests' });
  }
});

// Protected: create contest (ADMIN only)
router.post('/', requireAuth, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  const { error, value } = createContestSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = (error.details as Array<{ message: string }>).map((d) => d.message);
    return res.status(400).json({ success: false, message: 'Validation error', details });
  }
  const payload = value as ContestInput;

  try {
    const created = await Contest.create(payload);
    return res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err?.message || 'Failed to create contest' });
  }
});

// Protected read single contest - accessible by role rules (USER/VIP/ADMIN). Guests allowed only for public contests; here we require auth for protected reads.
router.get('/:id', requireRole(['GUEST', 'USER', 'VIP', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  const userRole = (req.user?.role || 'GUEST').toUpperCase();
  const id = req.params.id;
  try {
    const contest = await Contest.findByPk(id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });

    // Time check
    const now = new Date();
    if (contest.starts_at && contest.starts_at > now) return res.status(403).json({ success: false, message: 'Contest not started' });
    if (contest.ends_at && contest.ends_at < now) return res.status(403).json({ success: false, message: 'Contest ended' });

    const level = (contest.access_level || 'normal').toUpperCase();
    if (userRole === 'ADMIN') return res.json({ success: true, data: contest });
    if (level === 'VIP' && userRole !== 'VIP') return res.status(403).json({ success: false, message: 'Contest is VIP only' });

    return res.json({ success: true, data: contest });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to fetch contest' });
  }
});

// Protected update/delete - ADMIN only
router.patch('/:id', requireAuth, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  const { error, value } = updateContestSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = (error.details as Array<{ message: string }>).map((d) => d.message);
    return res.status(400).json({ success: false, message: 'Validation error', details });
  }
  try {
    const contest = await Contest.findByPk(id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    const updatePayload = value as Partial<ContestInput>;
    await contest.update(updatePayload);
    return res.json({ success: true, data: contest });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err?.message || 'Failed to update contest' });
  }
});

router.delete('/:id', requireAuth, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const contest = await Contest.findByPk(id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    await contest.destroy();
    ParticipationStore.purgeContest(id);
    return res.json({ success: true, message: 'Contest deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to delete contest' });
  }
});

export default router;
