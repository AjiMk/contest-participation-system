# Contest Participation Frontend

A React + Vite + TypeScript frontend implementing the Contest Participation System requirements:

- Roles: Admin, VIP, Signed-in User, Guest
- Access control: VIP/Normal contests
- Question types: single-select, multi-select, true/false
- Scoring: +1 per correct question, no penalty for incorrect
- Leaderboard per contest
- User history: in-progress contests, submissions, and prizes won

This demo uses localStorage for persistence and includes mock users and contests.

## Quick Start

1. Install dependencies

   ```bash
   cd frontend
   npm install
   ```

2. Run dev server

   ```bash
   npm run dev
   ```

3. Open the browser URL printed by Vite.

## Demo Accounts

- Ada Admin (`admin`)
- Vera VIP (`vip`)
- Niko Normal (`user`)

Guests can browse contests but cannot participate.

## Notable Paths

- `src/types/domain.ts` — core domain types
- `src/data/mock.ts` — mock users, contests, and questions
- `src/store/context.tsx` — app state, actions, leaderboard logic
- `src/utils/scoring.ts` — scoring rules
- `src/pages/*` — pages for login, contests, detail, taking, leaderboard, history, admin
- `src/components/*` — UI components and role guard

## Extending

- Replace `src/data/mock.ts` and localStorage in `src/store` with real API calls.
- Add admin create/edit flows for contests and questions.
- Harden auth: replace demo sign-in with real authentication.

