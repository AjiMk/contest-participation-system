import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/store/context';
import { get } from '@/utils/api';

const canParticipate = (access: 'normal'|'vip', role: string) => {
  if (access === 'normal') return ['user','vip','admin'].includes(role);
  if (access === 'vip') return ['vip','admin'].includes(role);
  return false;
};

type ApiQuestion = { id: string; prompt: string; type: 'single'|'multi'|'boolean'; options: { id: string; label: string }[] };

export default function ContestDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { contests, currentUser, joinContest, joined } = useApp();
  const contest = contests.find(c => c.id === id);
  const role = currentUser?.role ?? 'guest';
  const [questions, setQuestions] = React.useState<ApiQuestion[] | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = React.useState(false);
  if (!contest) return <div className="container"><p>Contest not found.</p></div>;

  const can = canParticipate(contest.access, role);
  const inProgress = !!joined[contest.id];

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!id || !currentUser) { setQuestions(null); return; }
        const data = await get<ApiQuestion[]>(`/questions/${id}`);
        if (!cancelled) setQuestions(data);
      } catch {
        if (!cancelled) setQuestions(null);
      }
    })();
    return () => { cancelled = true; };
  }, [id, currentUser?.id]);

  // Check if user has already submitted for this contest
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!currentUser || !id) { setAlreadySubmitted(false); return; }
        const mine = await get<{ joined: any[]; submissions: any[]; prizes: any[] }>(`/participation/mine`);
        const exists = (mine.submissions || []).some((s: any) => s.contestId === id);
        if (!cancelled) setAlreadySubmitted(!!exists);
      } catch {
        if (!cancelled) setAlreadySubmitted(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, currentUser?.id]);

  return (
    <div className="container">
      <div className="card">
        <div className="row">
          <h2 style={{margin:0}}>{contest.name}</h2>
          <span className="tag">{contest.access.toUpperCase()}</span>
        </div>
        <p className="muted">{contest.description}</p>
        <div className="row">
          <span className="pill">Prize: {contest.prize}</span>
          <span className="pill">Duration: {new Date(contest.startAt).toLocaleString()} - {new Date(contest.endAt).toLocaleString()}</span>
        </div>
        <div className="spacer" />
        <h3>Questions Preview</h3>
        {questions?.length ? (
          <ul className="list">
            {questions.map(q => (
              <li key={q.id} className="panel">{q.type.toUpperCase()} - {q.prompt}</li>
            ))}
          </ul>
        ) : (
          <p className="muted">{currentUser ? 'No questions available or failed to load.' : 'Sign in to view questions.'}</p>
        )}
        <div className="row" style={{marginTop:'.75rem'}}>
          {can ? (
            inProgress ? (
              <button onClick={() => nav(`/contests/${contest.id}/take`)}>Continue</button>
            ) : (
              <>
                <button onClick={() => { joinContest(contest.id); nav(`/contests/${contest.id}/take`); }} disabled={alreadySubmitted}>Join & Start</button>
                {alreadySubmitted && <span className="danger" style={{marginLeft:'.5rem'}}>You already submitted this contest.</span>}
              </>
            )
          ) : (
            <>
              <Link to="/login" className="pill">Sign in</Link>
              <span className="muted">Guest users cannot participate.</span>
            </>
          )}
          <Link to={`/leaderboard?contest=${contest.id}`} className="pill">Leaderboard</Link>
        </div>
      </div>
    </div>
  );
}
