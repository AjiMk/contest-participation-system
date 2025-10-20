export type Role = 'guest' | 'user' | 'vip' | 'admin';

export type QuestionKind = 'single' | 'multi' | 'boolean';

export interface User {
  id: string;
  name: string;
  role: Role;
  email?: string;
  password?: string; // mock only, do not store plaintext in real apps
}

export interface Contest {
  id: string;
  name: string;
  description: string;
  access: 'normal' | 'vip';
  startAt: string; // ISO string
  endAt: string;   // ISO string
  prize: string;
  questions: Question[];
}

export interface QuestionBase {
  id: string;
  prompt: string;
  kind: QuestionKind;
}

export interface SingleQuestion extends QuestionBase {
  kind: 'single';
  options: { id: string; text: string; correct: boolean }[];
}

export interface MultiQuestion extends QuestionBase {
  kind: 'multi';
  options: { id: string; text: string; correct: boolean }[];
}

export interface BooleanQuestion extends QuestionBase {
  kind: 'boolean';
  answer: boolean; // true = True, false = False
}

export type Question = SingleQuestion | MultiQuestion | BooleanQuestion;

export interface Submission {
  id: string;
  userId: string;
  contestId: string;
  submittedAt: string; // ISO
  answers: Record<string, string[] | boolean>; // qid -> selection(s) or boolean
  score: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
}
