import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';

// Import các trang Public
import Home from './pages/Home.jsx';
import Register from './pages/Register.jsx';
import Success from './pages/Success.jsx';
import Results from './pages/Results.jsx'; 

// Import các trang Admin
import AdminLogin from './pages/Admin/Login.jsx';
import Dashboard from './pages/Admin/Dashboard.jsx';
import Students from './pages/Admin/Students.jsx';
import Sessions from './pages/Admin/Sessions.jsx';
import Registrations from './pages/Admin/Registrations.jsx';
import Users from './pages/Admin/Users.jsx';
// [MỚI] Import trang đổi mật khẩu
import ChangePassword from './pages/Admin/ChangePassword.jsx';

// Helper: Lấy thông tin user an toàn từ localStorage
const getUserInfo = () => {
  const userInfoStr = localStorage.getItem('user_info');
  if (!userInfoStr) return { role: null, fullname: null, username: null };
  
  try {
    const user = JSON.parse(userInfoStr);
    // Logic ưu tiên hiển thị: Fullname -> Username -> 'User'
    const displayName = user.fullname || user.username || 'User';
    
    return { 
      role: user.role, 
      fullname: displayName,
      username: user.username
    };
  } catch (e) {
    return { role: null, fullname: null, username: null };
  }
};

// Component bảo vệ Route Admin (Chưa login thì đá về trang Login)
const AdminRoute = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('exam_token') : null;
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('exam_token'));
  
  // State quản lý thông tin user (Role, Username, Fullname)
  const [userInfo, setUserInfo] = useState(getUserInfo());

  const location = useLocation();

  useEffect(() => {
    // Cập nhật lại state mỗi khi đổi trang (để đồng bộ sau khi login/logout)
    setToken(localStorage.getItem('exam_token'));
    setUserInfo(getUserInfo());
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('exam_token');
    localStorage.removeItem('user_info');
    setToken(null);
    setUserInfo({ role: null, username: null, fullname: null });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar 
        isLoggedIn={!!token} 
        role={userInfo.role} 
        username={userInfo.username} 
        fullname={userInfo.fullname} 
        onLogout={handleLogout} 
      />
      
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/success" element={<Success />} />
          <Route path="/results" element={<Results />} />

          {/* --- ADMIN ROUTES --- */}
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

          <Route
            path="/admin/users" 
            element={
              <AdminRoute>
                  <Users />
              </AdminRoute>
            }
          />

          {/* [MỚI] Route Đổi mật khẩu */}
          <Route
            path="/admin/change-password"
            element={
              <AdminRoute>
                <ChangePassword />
              </AdminRoute>
            }
          />
          
          {/* Fallback route: Nhập linh tinh thì về trang chủ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;