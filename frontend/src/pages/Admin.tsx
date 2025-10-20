import { useApp } from '@/store/context';
import { Link } from 'react-router-dom';
import { del } from '@/utils/api';

export default function Admin() {
  const { contests, refreshContests } = useApp();
  const onDelete = async (id: string, name: string) => {
    if (!confirm(`Delete contest "${name}"? This cannot be undone.`)) return;
    try {
      await del(`/contests/${id}`);
      await refreshContests();
    } catch (e: any) {
      alert(e?.message || 'Failed to delete contest');
    }
  };
  return (
    <div className="container">
      <h2>Admin</h2>
      <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
        <p className="muted" style={{margin:0}}>Manage contests and questions.</p>
        <Link to="/admin/create" className="pill">Create Contest</Link>
      </div>
      <div className="grid">
        {contests.map(c => (
          <div className="card" key={c.id}>
            <div className="row"><strong>{c.name}</strong><span className="tag">{c.access.toUpperCase()}</span></div>
            <div className="muted">{c.description}</div>
            <div className="row"><span className="pill">Prize: {c.prize}</span>
              <button style={{marginLeft:'auto'}} onClick={() => onDelete(c.id, c.name)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
