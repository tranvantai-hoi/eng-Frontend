// src/pages/Admin/ChangePassword.jsx
import { useState } from 'react';
import { changePassword } from '../../services/api.js'; // Đảm bảo hàm này đã có trong api.js

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới không khớp!' });
      return;
    }

    setLoading(true);
    try {
      // Lấy ID user từ localStorage
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      if (!userInfo.id) throw new Error('Không tìm thấy thông tin user (vui lòng đăng nhập lại)');

      // Gọi API
      await changePassword({
        id: userInfo.id,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Lỗi khi đổi mật khẩu' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md mt-10 p-6 bg-white rounded-xl shadow-md border border-slate-100 animate-fade-in-up">
      <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Đổi mật khẩu</h2>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu cũ</label>
          <input 
            type="password" name="oldPassword" required
            value={formData.oldPassword} onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu mới</label>
          <input 
            type="password" name="newPassword" required
            value={formData.newPassword} onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
          <input 
            type="password" name="confirmPassword" required
            value={formData.confirmPassword} onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="••••••"
          />
        </div>
        <button 
          type="submit" disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 shadow-sm"
        >
          {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;