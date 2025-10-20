import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/store/context';
import { get } from '@/utils/api';

export default function History() {
  const { currentUser, contests } = useApp();
  const [inProgress, setInProgress] = React.useState<string[]>([]);
  const [subs, setSubs] = React.useState<{ contestId: string; score: number; submittedAt: string }[]>([]);
  const [won, setWon] = React.useState<{ contestId: string; prize: string }[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!currentUser) { setInProgress([]); setSubs([]); setWon([]); return; }
      try {
        const data = await get<{ joined: any[]; submissions: any[]; prizes: any[] }>(`/participation/mine`);
        if (cancelled) return;
        const joinedCids = (data.joined || []).map((j: any) => j.contestId);
        const submissions = (data.submissions || []).map((s: any) => ({ contestId: s.contestId, score: s.score, submittedAt: s.submittedAt }));
        setSubs(submissions);
        const submittedCids = new Set(submissions.map((s) => s.contestId));
        setInProgress(joinedCids.filter((cid: string) => !submittedCids.has(cid)));
        setWon((data.prizes || []).map((p: any) => ({ contestId: p.contestId, prize: p.prize })));
      } catch {
        if (!cancelled) { setInProgress([]); setSubs([]); setWon([]); }
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  return (
    <div className="container">
      <h2>Your Activity</h2>
      <div className="grid">
        <div className="card">
          <h3>In-Progress</h3>
          <div className="list">
            {inProgress
              .filter(cid => !!contests.find(x => x.id === cid))
              .map(cid => {
                const c = contests.find(x => x.id === cid)!;
                return (
                  <div key={cid} className="row">
                    <span>{c.name}</span>
                    <Link className="pill" to={`/contests/${cid}/take`}>Continue</Link>
                  </div>
                );
              })}
            {!inProgress.length && <span className="muted">No in-progress contests.</span>}
          </div>
        </div>
        <div className="card">
          <h3>Submissions</h3>
          <div className="list">
            {subs
              .filter(s => !!contests.find(x => x.id === s.contestId))
              .map(s => {
                const c = contests.find(x => x.id === s.contestId)!;
                return (
                  <div key={`${s.contestId}-${s.submittedAt}`} className="row">
                    <span>{c.name}</span>
                    <span className="pill">Score: {s.score}</span>
                    <Link className="pill" to={`/leaderboard?contest=${s.contestId}`}>Leaderboard</Link>
                  </div>
                );
              })}
            {!subs.length && <span className="muted">No submissions yet.</span>}
          </div>
        </div>
        <div className="card">
          <h3>Prizes Won</h3>
          <div className="list">
            {won
              .filter(p => !!contests.find(x => x.id === p.contestId))
              .map(p => {
                const c = contests.find(x => x.id === p.contestId)!;
                return (
                  <div key={`${p.contestId}-${p.prize}`} className="row">
                    <span>{c.name}</span>
                    <span className="pill">{p.prize}</span>
                  </div>
                );
              })}
            {!won.length && <span className="muted">No prizes won yet.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
