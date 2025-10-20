import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { Contest, LeaderboardEntry, Submission, User } from '@/types/domain';
import { contests as seedContests, users as seedUsers, seedSubmissions, newId } from '@/data/mock';
import { load, save } from './storage';
import { post, get, type AuthResult } from '@/utils/api';
import { getCookie, setCookie, deleteCookie } from '@/utils/cookies';

type State = {
  currentUser?: User;
  users: User[];
  contests: Contest[];
  submissions: Submission[];
  joined: Record<string, string>;
  prizes: { userId: string; contestId: string; prize: string }[];
};

type Actions = {
  signIn: (userId: string) => void;
  signInWithCredentials: (email: string, password: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  joinContest: (contestId: string) => void;
  submitAnswers: (contestId: string, answers: Submission['answers'], score: number) => void;
  refreshContests: () => Promise<void>;
};

const AppCtx = createContext<(State & Actions) | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const persisted = load();
  const [users, setUsers] = useState<User[]>(persisted.users && persisted.users.length ? (persisted.users as User[]) : seedUsers);
  const [contests, setContests] = useState<Contest[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>(persisted.submissions.length ? persisted.submissions : seedSubmissions);
  const [joined, setJoined] = useState<Record<string,string>>(persisted.joined);
  const [prizes, setPrizes] = useState(persisted.prizes);
  // Initialize currentUser from cookie snapshot first to avoid redirect on refresh
  let initialUser: User | undefined = undefined;
  try {
    const cookieUser = getCookie('cps_user');
    if (cookieUser) initialUser = JSON.parse(cookieUser) as User;
  } catch {
    // ignore
  }
  const [currentUser, setCurrentUser] = useState<User | undefined>(initialUser ?? users.find(u => u.id === persisted.userId));

  // Try bootstrap auth from cookies first (token + user snapshot), fallback to local storage mock
  useEffect(() => {
    const token = getCookie('cps_token');
    const userJson = getCookie('cps_user');
    if (token && userJson) {
      try {
        const parsed = JSON.parse(userJson) as User;
        setCurrentUser(parsed);
        return; // prefer cookie state
      } catch {
        // ignore parse errors
      }
    }
    // fallback is already applied via initial state
  }, []);

  const refreshContests = async () => {
    try {
      const data = await get<any[]>('/contests');
      const mapped: Contest[] = (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description ?? '',
        access: (c.access_level as 'normal' | 'vip') ?? 'normal',
        startAt: c.starts_at ? new Date(c.starts_at).toISOString() : new Date().toISOString(),
        endAt: c.ends_at ? new Date(c.ends_at).toISOString() : new Date().toISOString(),
        prize: c.prize_title ?? '—',
        questions: [],
      }));
      setContests(mapped);
    } catch (e) {
      setContests(seedContests);
    }
  };

  // Load contests from backend; re-fetch when role changes to reflect VIP visibility
  useEffect(() => { void refreshContests(); }, [currentUser?.role]);

  const signIn = (userId: string) => {
    const u = users.find(x => x.id === userId);
    setCurrentUser(u);
    save({ userId: u?.id, users, submissions, joined, prizes });
  };

  const signInWithCredentials = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await post<AuthResult>('/auth/login', { email, password });
      const mapped: User = {
        id: res.user.id,
        name: `${res.user.firstName} ${res.user.lastName}`.trim(),
        role: res.user.role,
        email: res.user.email,
      };
      // Persist auth in cookies; keep local storage for app state
      setCookie('cps_token', res.token, 7);
      setCookie('cps_user', JSON.stringify(mapped), 7);
      setCurrentUser(mapped);
      // ensure user catalog contains this user for local features
      const nextUsers = users.some(u => u.id === mapped.id) ? users : [...users, { ...mapped }];
      setUsers(nextUsers);
      save({ userId: mapped.id, users: nextUsers, submissions, joined, prizes });
      return true;
    } catch (err) {
      return false;
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await post<AuthResult>('/auth/register', { firstName, lastName, email, password });
      const mapped: User = {
        id: res.user.id,
        name: `${res.user.firstName} ${res.user.lastName}`.trim(),
        role: res.user.role,
        email: res.user.email,
      };
      // Persist auth in cookies
      setCookie('cps_token', res.token, 7);
      setCookie('cps_user', JSON.stringify(mapped), 7);
      setCurrentUser(mapped);
      // Keep local mock users for demo features that depend on it
      const nextUsers = users.some(u => u.id === mapped.id) ? users : [...users, { ...mapped }];
      setUsers(nextUsers);
      save({ userId: mapped.id, users: nextUsers, submissions, joined, prizes });
      return true;
    } catch (err) {
      return false;
    }
  };

  const signOut = () => {
    setCurrentUser(undefined);
    save({ userId: undefined, users, submissions, joined, prizes });
    deleteCookie('cps_token');
    deleteCookie('cps_user');
  };

  const joinContest = (contestId: string) => {
    setJoined(j => {
      const next = { ...j, [contestId]: new Date().toISOString() };
      save({ userId: currentUser?.id, users, submissions, joined: next, prizes });
      return next;
    });
    // Notify backend for in-progress tracking (best-effort)
    try { void post('/participation/join', { contestId }); } catch {}
  };

  const submitAnswers = (contestId: string, answers: Submission['answers'], score: number) => {
    if (!currentUser) return;
    const sub: Submission = {
      id: newId('sub'),
      userId: currentUser.id,
      contestId,
      answers,
      score,
      submittedAt: new Date().toISOString(),
    };
    setSubmissions(s => {
      const next = [...s.filter(x => !(x.userId === sub.userId && x.contestId === sub.contestId)), sub];
      save({ userId: currentUser?.id, users, submissions: next, joined, prizes });
      return next;
    });

    // Prize awarding is computed server-side at contest end; no local assignment here
  };

  const value = useMemo(() => ({ currentUser, users, contests, submissions, joined, prizes, signIn, signInWithCredentials, register, signOut, joinContest, submitAnswers, refreshContests }), [currentUser, users, contests, submissions, joined, prizes]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const computeLeaderboard = (contestId: string, subs: Submission[]): LeaderboardEntry[] => {
  const filtered = subs.filter(s => s.contestId === contestId);
  const byUser = new Map<string, number>();
  for (const s of filtered) byUser.set(s.userId, Math.max(byUser.get(s.userId) ?? 0, s.score));
  const persistedUsers = (load().users as User[] | undefined) ?? [];
  return Array.from(byUser.entries())
    .map(([userId, score]) => ({
      userId,
      userName:
        persistedUsers.find(u => u.id === userId)?.name ??
        seedUsers.find(u => u.id === userId)?.name ??
        userId,
      score,
    }))
    .sort((a, b) => b.score - a.score);
};
