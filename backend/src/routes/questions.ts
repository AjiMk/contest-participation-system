import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/auth';
import { requireRole } from '../middlewares/roles';
import Question from '../models/Question';
import Option from '../models/Option';
import { AuthRequest } from '../types';
import { bulkQuestionsSchema } from '../shared/validation/questions';
import { sequelize } from '../config/database';

const router = Router();

// Bulk insert questions + options for a contest (ADMIN only)
router.post('/:contestId', requireAuth, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  const contestId = req.params.contestId;
  const { error, value } = bulkQuestionsSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = (error.details as Array<{ message: string }>).map((d) => d.message);
    return res.status(400).json({ success: false, message: 'Validation error', details });
  }

  const questions = value as Array<any>;

  const t = await sequelize.transaction();
  try {
    const createdQuestions = [];
    for (const q of questions) {
      const createdQ = await Question.create({ contest_id: contestId, prompt: q.prompt, type: q.type }, { transaction: t });
      const opts = q.options.map((o: any) => ({ question_id: createdQ.id, label: o.label, is_correct: o.is_correct }));
      await Option.bulkCreate(opts, { transaction: t });
      createdQuestions.push(createdQ);
    }
    await t.commit();
    return res.status(201).json({ success: true, data: createdQuestions });
  } catch (err: any) {
    await t.rollback();
    return res.status(500).json({ success: false, message: err?.message || 'Failed to insert questions' });
  }
});

// Get questions for contest (hide is_correct for non-admins)
router.get('/:contestId', requireAuth, requireRole(['USER', 'VIP', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  const contestId = req.params.contestId;
  const userRole = (req.user?.role || 'USER').toUpperCase();

  try {
    const questions = await Question.findAll({ where: { contest_id: contestId }, order: [['createdAt', 'ASC']] });
    const qids = questions.map((q) => q.id);
    const options = await Option.findAll({ where: { question_id: qids } });

    const grouped = questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      type: q.type,
      options: options
        .filter((o) => o.question_id === q.id)
        .map((o) => ({ id: o.id, label: o.label, is_correct: userRole === 'ADMIN' ? o.is_correct : undefined })),
    }));

    // Remove is_correct keys for non-admins (undefined will be stripped by JSON)
    const response = grouped.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      type: q.type,
      options: q.options.map((o: any) => (userRole === 'ADMIN' ? o : { id: o.id, label: o.label })),
    }));

    return res.json({ success: true, data: response });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to fetch questions' });
  }
});

// Admin: update a question and its options (replace options)
router.patch('/:contestId/questions/:id', requireAuth, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  const { error, value } = bulkQuestionsSchema.validate([req.body], { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = (error.details as Array<{ message: string }>).map((d) => d.message);
    return res.status(400).json({ success: false, message: 'Validation error', details });
  }

  const q = value[0];
  const t = await sequelize.transaction();
  try {
    const question = await Question.findByPk(id);
    if (!question) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    await question.update({ prompt: q.prompt, type: q.type }, { transaction: t });
    // Replace options
    await Option.destroy({ where: { question_id: id }, transaction: t });
    const opts = q.options.map((o: any) => ({ question_id: id, label: o.label, is_correct: o.is_correct }));
    await Option.bulkCreate(opts, { transaction: t });
    await t.commit();
    return res.json({ success: true, data: question });
  } catch (err: any) {
    await t.rollback();
    return res.status(500).json({ success: false, message: err?.message || 'Failed to update question' });
  }
});

// Admin: delete question and its options
router.delete('/:contestId/questions/:id', requireAuth, requireRole(['ADMIN']), async (_req: AuthRequest, res: Response) => {
  const id = _req.params.id;
  const t = await sequelize.transaction();
  try {
    const question = await Question.findByPk(id);
    if (!question) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    await Option.destroy({ where: { question_id: id }, transaction: t });
    await question.destroy({ transaction: t });
    await t.commit();
    return res.json({ success: true, message: 'Question deleted' });
  } catch (err: any) {
    await t.rollback();
    return res.status(500).json({ success: false, message: err?.message || 'Failed to delete question' });
  }
});

export default router;
