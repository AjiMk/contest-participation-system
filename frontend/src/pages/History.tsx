import { Link } from 'react-router-dom';
import { useApp } from '@/store/context';

export default function History() {
  const { currentUser, submissions, contests, prizes, joined } = useApp();
  const mySubs = currentUser ? submissions.filter(s => s.userId === currentUser.id) : [];
  const inProgress = currentUser ? Object.keys(joined).filter(cid => !mySubs.find(s => s.contestId === cid)) : [];

  return (
    <div className="container">
      <h2>Your Activity</h2>
      <div className="grid">
        <div className="card">
          <h3>In-Progress</h3>
          <div className="list">
            {inProgress.map(cid => {
              const c = contests.find(x => x.id === cid);
              if (!c) return null;
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
            {mySubs.map(s => {
              const c = contests.find(x => x.id === s.contestId);
              return (
                <div key={s.id} className="row">
                  <span>{c?.name}</span>
                  <span className="pill">Score: {s.score}</span>
                  <Link className="pill" to={`/leaderboard?contest=${s.contestId}`}>Leaderboard</Link>
                </div>
              );
            })}
            {!mySubs.length && <span className="muted">No submissions yet.</span>}
          </div>
        </div>
        <div className="card">
          <h3>Prizes Won</h3>
          <div className="list">
            {prizes.filter(p => p.userId === currentUser?.id).map(p => {
              const c = contests.find(x => x.id === p.contestId);
              return (
                <div key={`${p.userId}-${p.contestId}`} className="row">
                  <span>{c?.name}</span>
                  <span className="pill">{p.prize}</span>
                </div>
              );
            })}
            {!prizes.filter(p => p.userId === currentUser?.id).length && <span className="muted">No prizes won yet.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

