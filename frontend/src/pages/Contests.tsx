import { Link } from 'react-router-dom';
import { useApp } from '@/store/context';

const canView = (access: 'normal'|'vip', role: string) => {
  if (access === 'normal') return ['user','vip','admin'].includes(role);
  if (access === 'vip') return ['vip','admin'].includes(role);
  return false;
};

export default function Contests() {
  const { contests, currentUser } = useApp();
  const role = currentUser?.role ?? 'guest';
  return (
    <div className="container">
      <h2>Contests</h2>
      <div className="grid">
        {contests.map(c => {
          const view = canView(c.access, role);
          return (
            <div className="card" key={c.id}>
              <div className="row">
                <span className="tag">{c.access.toUpperCase()}</span>
                <span className="muted">{new Date(c.startAt).toLocaleString()} - {new Date(c.endAt).toLocaleString()}</span>
              </div>
              <h3>{c.name}</h3>
              <p className="muted">{c.description}</p>
              <div className="row">
                <span className="pill">Prize: {c.prize}</span>
              </div>
              <div className="row" style={{marginTop: '.5rem'}}>
                <Link to={`/contests/${c.id}`} className="pill">{view ? 'View' : 'Preview'}</Link>
                {!view && <span className="danger">Sign in with proper role to participate</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

