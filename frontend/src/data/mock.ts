import { Contest, Question, Submission, User } from '@/types/domain';

const now = new Date();
const twoHours = 2 * 60 * 60 * 1000;

const mkId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export const users: User[] = [
  { id: 'u_admin', name: 'Ada Admin', role: 'admin', email: 'admin@example.com', password: 'password' },
  { id: 'u_vip', name: 'Vera VIP', role: 'vip', email: 'vip@example.com', password: 'password' },
  { id: 'u_user', name: 'Niko Normal', role: 'user', email: 'user@example.com', password: 'password' },
];

const q1: Question = {
  id: 'q1',
  kind: 'single',
  prompt: 'Which language runs in a web browser?',
  options: [
    { id: 'a', text: 'Java', correct: false },
    { id: 'b', text: 'C', correct: false },
    { id: 'c', text: 'Python', correct: false },
    { id: 'd', text: 'JavaScript', correct: true },
  ],
};

const q2: Question = {
  id: 'q2',
  kind: 'multi',
  prompt: 'Select all CSS layout mechanisms',
  options: [
    { id: 'a', text: 'Flexbox', correct: true },
    { id: 'b', text: 'Grid', correct: true },
    { id: 'c', text: 'Floats', correct: false },
    { id: 'd', text: 'Box Model', correct: false },
  ],
};

const q3: Question = {
  id: 'q3',
  kind: 'boolean',
  prompt: 'TypeScript is a superset of JavaScript.',
  answer: true,
};

export const contests: Contest[] = [
  {
    id: 'c_normal_1',
    name: 'Frontend Fundamentals',
    description: 'Test your web basics across HTML, CSS, and JS.',
    access: 'normal',
    startAt: new Date(now.getTime() - twoHours).toISOString(),
    endAt: new Date(now.getTime() + twoHours).toISOString(),
    prize: 'Swag Pack + $100 Gift Card',
    questions: [q1, q2, q3],
  },
  {
    id: 'c_vip_1',
    name: 'VIP Performance Tuning',
    description: 'Deep dive into performance best practices and patterns.',
    access: 'vip',
    startAt: new Date(now.getTime() - twoHours).toISOString(),
    endAt: new Date(now.getTime() + twoHours).toISOString(),
    prize: 'Exclusive Jacket + $500 Gift Card',
    questions: [q1, q3],
  },
];

export const seedSubmissions: Submission[] = [];

export const newId = mkId;
