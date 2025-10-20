import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import RoleGuard from '@/components/RoleGuard';
import { AppProvider } from '@/store/context';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Contests from '@/pages/Contests';
import ContestDetail from '@/pages/ContestDetail';
import TakeContest from '@/pages/TakeContest';
import Leaderboard from '@/pages/Leaderboard';
import History from '@/pages/History';
import Admin from '@/pages/Admin';
import AdminCreate from '@/pages/AdminCreateContest';

export default function App() {
  return (
    <AppProvider>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contests" element={<Contests />} />
        <Route path="/contests/:id" element={<ContestDetail />} />
        <Route path="/contests/:id/take" element={<RoleGuard allow={['user','vip','admin']}><TakeContest /></RoleGuard>} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/history" element={<RoleGuard allow={['user','vip','admin']}><History /></RoleGuard>} />
        <Route path="/admin" element={<RoleGuard allow={['admin']}><Admin /></RoleGuard>} />
        <Route path="/admin/create" element={<RoleGuard allow={['admin']}><AdminCreate /></RoleGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}
