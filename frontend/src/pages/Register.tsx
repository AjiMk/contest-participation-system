import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/store/context';

export default function Register() {
  const { register } = useApp();
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!firstName.trim() || !lastName.trim()) { setError('First and last name are required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    const ok = await register(firstName.trim(), lastName.trim(), email.trim(), password);
    if (!ok) { setError('Registration failed'); return; }
    alert('Account created and logged in');
    nav('/');
  };

  return (
    <div className="container">
      <div className="card" style={{maxWidth:520}}>
        <h2>Create account</h2>
        <form onSubmit={onSubmit} className="list">
          <label>First name</label>
          <input type="text" className="panel" value={firstName} onChange={e => setFirstName(e.target.value)} required />
          <label>Last name</label>
          <input type="text" className="panel" value={lastName} onChange={e => setLastName(e.target.value)} required />
          <label>Email</label>
          <input type="email" className="panel" value={email} onChange={e => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" className="panel" value={password} onChange={e => setPassword(e.target.value)} required />
          <label>Confirm password</label>
          <input type="password" className="panel" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          {error && <span className="danger">{error}</span>}
          <button type="submit">Register</button>
        </form>
        <div className="row" style={{marginTop:'.5rem'}}>
          <span className="muted">Already have an account?</span>
          <Link to="/login" className="pill">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
