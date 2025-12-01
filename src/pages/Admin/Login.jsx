import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input.jsx';
import { adminLogin } from '../../services/api.js';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(credentials);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md">
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Admin Login</h1>
          <p className="text-sm text-slate-500">
            Nhập thông tin do phòng Đào tạo cung cấp để quản lý dữ liệu.
          </p>
        </div>
        <Input
          label="Username"
          name="username"
          value={credentials.username}
          onChange={handleChange}
          required
          placeholder="admin"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={credentials.password}
          onChange={handleChange}
          required
          placeholder="••••••••"
        />
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        )}
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </section>
  );
};

export default Login;

