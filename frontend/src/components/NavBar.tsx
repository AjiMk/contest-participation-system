import { Link } from 'react-router-dom';
import { useApp } from '@/store/context';

export default function NavBar() {
  const { currentUser, signOut } = useApp();
  return (
    <div className="nav">
      <div className="row">
        <Link className="brand" to="/">CPS</Link>
        <Link to="/contests">Contests</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        {currentUser && <Link to="/history">History</Link>}
        {currentUser?.role === 'admin' && <Link to="/admin">Admin</Link>}
      </div>
      <div className="row">
        {!currentUser && <>
          <Link to="/login" className="pill">Sign in</Link>
          <Link to="/register" className="pill">Sign up</Link>
        </>}
        {currentUser && (
          <>
            <span className="tag">{currentUser.name} · {currentUser.role.toUpperCase()}</span>
            <button onClick={signOut}>Sign out</button>
          </>
        )}
      </div>
    </div>
  );
}
