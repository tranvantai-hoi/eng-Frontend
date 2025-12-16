import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';

// Import các trang
import Home from './pages/Home.jsx';
import Register from './pages/Register.jsx';
import Success from './pages/Success.jsx';
import Results from './pages/results.jsx'; // [MỚI] Thêm trang kết quả (bạn cần tạo file này hoặc trỏ tạm về Home)

// Import Admin pages
import AdminLogin from './pages/Admin/Login.jsx';
import Dashboard from './pages/Admin/Dashboard.jsx';
import Students from './pages/Admin/Students.jsx';
import Sessions from './pages/Admin/Sessions.jsx';
import Registrations from './pages/Admin/Registrations.jsx';

// Component bảo vệ Route Admin
const AdminRoute = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('exam_token') : null;
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const App = () => {
  // [MỚI] Quản lý trạng thái login tại App để đồng bộ giữa Navbar và các trang
  const [token, setToken] = useState(localStorage.getItem('exam_token'));
  const location = useLocation();

  // Mỗi khi đổi trang, kiểm tra lại token để cập nhật giao diện (nếu vừa login/logout)
  useEffect(() => {
    setToken(localStorage.getItem('exam_token'));
  }, [location]);

  // [MỚI] Hàm đăng xuất: Xóa token và cập nhật state
  const handleLogout = () => {
    localStorage.removeItem('exam_token');
    setToken(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Truyền props xuống Navbar để điều khiển nút Đăng nhập/Đăng xuất */}
      <Navbar isLoggedIn={!!token} onLogout={handleLogout} />
      
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/success" element={<Success />} />
          <Route path="/results" element={<Results />} /> {/* [MỚI] Route cho trang kết quả */}

          {/* Admin Routes */}
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
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;