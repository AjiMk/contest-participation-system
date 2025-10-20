import { Contest, MultiQuestion, SingleQuestion } from '@/types/domain';

export const scoreSubmission = (contest: Contest, answers: Record<string, string[] | boolean>): number => {
  let score = 0;
  for (const q of contest.questions) {
    const ans = answers[q.id];
    if (ans === undefined) continue;
    if (q.kind === 'boolean') {
      if (typeof ans === 'boolean' && ans === q.answer) score += 1;
    } else if (q.kind === 'single') {
      const correct = (q as SingleQuestion).options.find(o => o.correct)?.id;
      if (Array.isArray(ans) && ans.length === 1 && ans[0] === correct) score += 1;
    } else if (q.kind === 'multi') {
      const correct = new Set((q as MultiQuestion).options.filter(o => o.correct).map(o => o.id));
      if (Array.isArray(ans)) {
        const given = new Set(ans);
        const sameSize = correct.size === given.size;
        const allMatch = sameSize && [...correct].every(id => given.has(id));
        if (allMatch) score += 1;
      }
    }
  }
  return score;
};

