import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/store/context';

export default function Login() {
  const { users, signIn, signInWithCredentials } = useApp();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await signInWithCredentials(email, password);
    if (!ok) { setError('Invalid email or password'); return; }
    alert('Logged in successfully');
    nav('/');
  };
  return (
    <div className="container">
      <div className="grid">
        <div className="card" style={{maxWidth: 520}}>
          <h2>Sign in</h2>
          <form onSubmit={onSubmit} className="list">
            <label>Email</label>
            <input type="text" className="panel" value={email} onChange={e => setEmail(e.target.value)} required />
            <label>Password</label>
            <input type="password" className="panel" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <span className="danger">{error}</span>}
            <button type="submit">Sign in</button>
          </form>
          <div className="row" style={{marginTop:'.5rem'}}>
            <span className="muted">No account?</span>
            <Link to="/register" className="pill">Register</Link>
          </div>
          <div className="spacer" />
          <p className="muted">As a Guest you can only view contests.</p>
        </div>
        <div className="card">
          <h3>Or use a demo account</h3>
          <div className="list">
            {users.map(u => (
              <div className="row" key={u.id}>
                <span className="tag">{u.role.toUpperCase()}</span>
                <strong>{u.name}</strong>
                <button onClick={() => signIn(u.id)} style={{marginLeft:'auto'}}>Use</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
