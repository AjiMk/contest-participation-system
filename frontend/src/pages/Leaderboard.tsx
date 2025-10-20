import React from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '@/store/context';
import { get } from '@/utils/api';

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function Leaderboard() {
  const { contests } = useApp();
  const q = useQuery();
  const contestId = q.get('contest') ?? contests[0]?.id;
  const selected = contests.find(c => c.id === contestId) ?? contests[0];
  const [entries, setEntries] = React.useState<{ userId: string; userName: string; score: number }[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!selected) { setEntries([]); return; }
        const data = await get<any[]>(`/participation/leaderboard/${selected.id}`);
        if (!cancelled) setEntries(data);
      } catch {
        if (!cancelled) setEntries([]);
      }
    })();
    return () => { cancelled = true; };
  }, [selected?.id]);

  return (
    <div className="container">
      <h2>Leaderboard</h2>
      <div className="row" style={{marginBottom:'.5rem'}}>
        <label htmlFor="contest">Contest</label>
        <select id="contest" className="panel" defaultValue={selected?.id} onChange={(e) => {
          const id = e.currentTarget.value;
          const url = new URL(window.location.href);
          url.searchParams.set('contest', id);
          window.history.replaceState({}, '', url.toString());
          // force rerender
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}>
          {contests.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <table className="table">
        <thead>
          <tr><th>#</th><th>User</th><th>Score</th></tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={e.userId}>
              <td>{i+1}</td>
              <td>{e.userName}</td>
              <td><strong>{e.score}</strong></td>
            </tr>
          ))}
          {!entries.length && (
            <tr><td colSpan={3} className="muted">No submissions yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
