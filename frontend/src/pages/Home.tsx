import { Link } from 'react-router-dom';
import { useApp } from '@/store/context';

export default function Home() {
  const { currentUser } = useApp();
  return (
    <div className="container">
      <div className="card">
        <h1>Contest Participation System</h1>
        <p className="muted">Join contests, answer questions, and climb the leaderboard.</p>
        {!currentUser && (
          <div className="row">
            <Link to="/login" className="pill">Sign in</Link>
            <span className="muted">Guest users can only view contests.</span>
          </div>
        )}
        {currentUser && (
          <div className="row">
            <Link to="/contests"><button>Browse Contests</button></Link>
            <Link to="/history" className="pill">Your History</Link>
          </div>
        )}
      </div>
    </div>
  );
}

