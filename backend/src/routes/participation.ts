import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/auth';
import { requireRole } from '../middlewares/roles';
import Question from '../models/Question';
import Option from '../models/Option';
import Contest from '../models/Contest';
import { ParticipationStore } from '../services/participationStore';
import { AuthRequest } from '../types';

const router = Router();

// Create a participation entry - authenticated users only
router.post('/', requireAuth, requireRole(['USER', 'VIP', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  const { contestId, answers } = req.body as { contestId: string; answers: Record<string, string[] | string> };
  if (!contestId || !answers) return res.status(400).json({ success: false, message: 'contestId and answers are required' });

  try {
    const userId = String(req.user?.userId || '');
    // Block duplicate submissions for this user/contest
    const existing = ParticipationStore.getParticipationsByUser(userId).find((p) => p.contestId === contestId);
    if (existing) return res.status(409).json({ success: false, message: 'Already submitted for this contest' });

    const questions = await Question.findAll({ where: { contest_id: contestId } });
    const qids = questions.map((q) => q.id);
    const options = await Option.findAll({ where: { question_id: qids } });

    let score = 0;
    for (const q of questions) {
      const given = answers[q.id];
      if (given === undefined) continue;

      const correctIds = new Set(options.filter((o) => o.question_id === q.id && o.is_correct).map((o) => String(o.id)));
      const selectedArray = Array.isArray(given) ? given.map(String) : [String(given)];
      const selectedSet = new Set(selectedArray);

      if (q.type === 'multi') {
        const sameSize = correctIds.size === selectedSet.size;
        const allMatch = sameSize && [...correctIds].every((id) => selectedSet.has(id));
        if (allMatch) score += 1;
      } else {
        // single or boolean: expect exactly one
        if (selectedArray.length === 1 && correctIds.has(selectedArray[0])) score += 1;
      }
    }

    // Save participation for leaderboard/history
    if (userId) ParticipationStore.addOrUpdateParticipation(userId, contestId, score);

    return res.json({ success: true, data: { score } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to score participation' });
  }
});

// List participations - admin can view all; users can view their own
router.get('/', requireAuth, requireRole(['ADMIN', 'VIP', 'USER']), async (req: AuthRequest, res: Response) => {
  const role = (req.user?.role || 'USER').toUpperCase();
  const userId = String(req.user?.userId || '');
  const data = role === 'ADMIN' ? ParticipationStore.getAllParticipations() : ParticipationStore.getParticipationsByUser(userId);
  res.json({ success: true, data });
});

// Mark a contest as joined (for in-progress tracking)
router.post('/join', requireAuth, requireRole(['ADMIN', 'VIP', 'USER']), async (req: AuthRequest, res: Response) => {
  const { contestId } = req.body as { contestId: string };
  const userId = String(req.user?.userId || '');
  if (!contestId) return res.status(400).json({ success: false, message: 'contestId is required' });
  // If already submitted, treat as no-op and forbid marking join
  const already = ParticipationStore.getParticipationsByUser(userId).find((p) => p.contestId === contestId);
  if (!already) ParticipationStore.addJoin(userId, contestId);
  return res.json({ success: true });
});

// Get current user's joined contests, submissions, and computed prizes
router.get('/mine', requireAuth, requireRole(['ADMIN', 'VIP', 'USER']), async (req: AuthRequest, res: Response) => {
  const userId = String(req.user?.userId || '');
  const joined = ParticipationStore.getJoinsByUser(userId);
  const submissions = ParticipationStore.getParticipationsByUser(userId);

  // Compute prizes: user with highest score wins (computed currently regardless of end time)
  const contests = await Contest.findAll();
  const prizes: { userId: string; contestId: string; prize: string }[] = [];

  for (const c of contests) {
    const subs = ParticipationStore.getParticipationsByContest(String(c.id));
    if (!subs.length) continue;
    let top = subs[0];
    for (const s of subs) {
      if (s.score > top.score) top = s;
    }
    if (top.userId === userId) prizes.push({ userId, contestId: String(c.id), prize: c.prize_title || 'Prize' });
  }

  // Filter out references to deleted contests
  const existingIds = new Set(contests.map((c) => String(c.id)));
  const filteredJoined = joined.filter((j) => existingIds.has(j.contestId));
  const filteredSubs = submissions.filter((s) => existingIds.has(s.contestId));

  return res.json({ success: true, data: { joined: filteredJoined, submissions: filteredSubs, prizes } });
});

// Leaderboard for a contest: rank by score desc
router.get('/leaderboard/:contestId', async (req: AuthRequest, res: Response) => {
  const contestId = req.params.contestId;
  const contest = await Contest.findByPk(contestId);
  if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
  const subs = ParticipationStore.getParticipationsByContest(contestId);
  // pick best score per user
  const byUser = new Map<string, number>();
  for (const s of subs) byUser.set(s.userId, Math.max(byUser.get(s.userId) ?? 0, s.score));

  // Load user names
  const { User } = await import('../models/User');
  const uniqIds = Array.from(byUser.keys());
  const users = uniqIds.length
    ? await User.findAll({ where: { id: uniqIds } as any, attributes: ['id', 'firstName', 'lastName', 'email'] })
    : [];
  const items = Array.from(byUser.entries()).map(([userId, score]) => {
    const u = users.find((x: any) => String(x.id) === userId) as any;
    const name = u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || userId : userId;
    return { userId, userName: name, score };
  });
  items.sort((a, b) => b.score - a.score);
  return res.json({ success: true, data: items });
});

export default router;
