// Simple in-memory store for participations and joins.
// Note: This is non-persistent and resets on server restart.

export type Participation = {
  userId: string;
  contestId: string;
  score: number;
  submittedAt: string; // ISO
};

export type JoinEntry = {
  userId: string;
  contestId: string;
  joinedAt: string; // ISO
};

const participations: Participation[] = [];
const joins: JoinEntry[] = [];

export const ParticipationStore = {
  addJoin(userId: string, contestId: string) {
    const exists = joins.find((j) => j.userId === userId && j.contestId === contestId);
    if (!exists) joins.push({ userId, contestId, joinedAt: new Date().toISOString() });
    return true;
  },

  getJoinsByUser(userId: string) {
    return joins.filter((j) => j.userId === userId);
  },

  addOrUpdateParticipation(userId: string, contestId: string, score: number) {
    const prev = participations.find((p) => p.userId === userId && p.contestId === contestId);
    const nowIso = new Date().toISOString();
    if (prev) {
      prev.score = score;
      prev.submittedAt = nowIso;
      return prev;
    }
    const p: Participation = { userId, contestId, score, submittedAt: nowIso };
    participations.push(p);
    return p;
  },

  getParticipationsByUser(userId: string) {
    return participations.filter((p) => p.userId === userId);
  },

  getParticipationsByContest(contestId: string) {
    return participations.filter((p) => p.contestId === contestId);
  },

  getAllParticipations() {
    return participations.slice();
  },

  purgeContest(contestId: string) {
    for (let i = participations.length - 1; i >= 0; i--) {
      if (participations[i].contestId === contestId) participations.splice(i, 1);
    }
    for (let i = joins.length - 1; i >= 0; i--) {
      if (joins[i].contestId === contestId) joins.splice(i, 1);
    }
  },
};
