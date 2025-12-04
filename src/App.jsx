import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Register from './pages/Register.jsx';
import Success from './pages/Success.jsx';
import AdminLogin from './pages/Admin/Login.jsx';
import Dashboard from './pages/Admin/Dashboard.jsx';
import Students from './pages/Admin/Students.jsx';
import Sessions from './pages/Admin/Sessions.jsx';
import Registrations from './pages/Admin/Registrations.jsx';

const AdminRoute = ({ children }) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('exam_token') : null;
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const App = () => (
  <div className="flex min-h-screen flex-col bg-slate-50">
    <Navbar />
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/success" element={<Success />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <AdminRoute>
              <Students />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/sessions"
          element={
            <AdminRoute>
              <Sessions />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/registrations"
          element={
            <AdminRoute>
              <Registrations />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  </div>
);

export default App;





