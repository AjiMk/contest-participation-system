const KEY = 'cps_state_v1';

export type PersistedState = {
  userId?: string;
  users?: any[];
  submissions: any[];
  joined: Record<string, string>; // contestId -> iso join time
  prizes: { userId: string; contestId: string; prize: string }[];
};

export const load = (): PersistedState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { submissions: [], joined: {}, prizes: [] };
    const parsed = JSON.parse(raw);
    return { submissions: [], joined: {}, prizes: [], ...parsed } as PersistedState;
  } catch {
    return { submissions: [], joined: {}, prizes: [] };
  }
};

export const save = (state: PersistedState) => {
  localStorage.setItem(KEY, JSON.stringify(state));
};
