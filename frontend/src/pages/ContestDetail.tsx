import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/store/context';

const canParticipate = (access: 'normal'|'vip', role: string) => {
  if (access === 'normal') return ['user','vip','admin'].includes(role);
  if (access === 'vip') return ['vip','admin'].includes(role);
  return false;
};

export default function ContestDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { contests, currentUser, joinContest, joined } = useApp();
  const contest = contests.find(c => c.id === id);
  const role = currentUser?.role ?? 'guest';
  if (!contest) return <div className="container"><p>Contest not found.</p></div>;

  const can = canParticipate(contest.access, role);
  const inProgress = !!joined[contest.id];

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
          <span className="pill">Duration: {new Date(contest.startAt).toLocaleString()} → {new Date(contest.endAt).toLocaleString()}</span>
        </div>
        <div className="spacer" />
        <h3>Questions Preview</h3>
        <ul className="list">
          {contest.questions.map(q => (
            <li key={q.id} className="panel">{q.kind.toUpperCase()} · {q.prompt}</li>
          ))}
        </ul>
        <div className="row" style={{marginTop:'.75rem'}}>
          {can ? (
            inProgress ? (
              <button onClick={() => nav(`/contests/${contest.id}/take`)}>Continue</button>
            ) : (
              <button onClick={() => { joinContest(contest.id); nav(`/contests/${contest.id}/take`); }}>Join & Start</button>
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

