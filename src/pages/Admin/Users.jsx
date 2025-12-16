import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser } from '../../services/api.js';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    username: '',
    fullname: '',
    password: '',
    role: 'staff',
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  // Load danh sách user khi vào trang
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      // Xử lý dữ liệu trả về an toàn
      const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setUsers(list);
    } catch (error) {
      console.error("Lỗi tải users:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user = null) => {
    setMessage({ type: '', text: '' });
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        fullname: user.fullname || '',
        password: '', 
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        fullname: '',
        password: '',
        role: 'staff',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      if (editingUser) {
        await updateUser({ id: editingUser.id, ...formData });
        setMessage({ type: 'success', text: 'Cập nhật thành công!' });
      } else {
        await createUser(formData);
        setMessage({ type: 'success', text: 'Thêm người dùng mới thành công!' });
      }
      fetchUsers();
      setTimeout(closeModal, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra' });
    }
  };

  // [SỬA LỖI] Logic lọc an toàn hơn để tránh crash khi fullname null
  const filteredUsers = users.filter(user => 
    (user.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (user.fullname || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý người dùng</h1>
          <p className="text-slate-500">Xem và quản lý tài khoản hệ thống</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-2.5 h-5 w-5 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>

          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Thêm User
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Người dùng</th>
                <th className="px-6 py-4 font-semibold">Vai trò</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">Không tìm thấy người dùng nào.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold uppercase">
                          {(user.fullname || user.username || 'U').charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{user.fullname || 'Chưa cập nhật tên'}</div>
                          <div className="text-xs text-slate-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize
                        ${user.role === 'admin' || user.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-green-100 text-green-700'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                          Active
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openModal(user)}
                        className="text-slate-400 hover:text-blue-600 transition-colors font-medium text-sm"
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-in-up">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {editingUser ? 'Cập nhật thông tin' : 'Thêm người dùng mới'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {message.text && (
               <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                 {message.text}
               </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tên đăng nhập</label>
                <input
                  type="text"
                  required
                  disabled={!!editingUser}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100 disabled:text-slate-500"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Họ và tên</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={formData.fullname}
                  onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Vai trò</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {editingUser ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••"
                />
              </div>

              <div className="mt-6 flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 shadow-sm"
                >
                  {editingUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;