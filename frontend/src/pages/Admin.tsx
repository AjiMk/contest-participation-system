import { useApp } from '@/store/context';

export default function Admin() {
  const { contests } = useApp();
  return (
    <div className="container">
      <h2>Admin</h2>
      <p className="muted">Demo view of all contests. In a real app, you can add create/edit flows.</p>
      <div className="grid">
        {contests.map(c => (
          <div className="card" key={c.id}>
            <div className="row"><strong>{c.name}</strong><span className="tag">{c.access.toUpperCase()}</span></div>
            <div className="muted">{c.description}</div>
            <div className="row"><span className="pill">Prize: {c.prize}</span><span className="pill">Q: {c.questions.length}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

