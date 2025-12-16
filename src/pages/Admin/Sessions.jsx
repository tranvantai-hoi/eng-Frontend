import { useState, useEffect } from 'react';
import { getAdminSessions, createAdminSession, updateAdminSession, deleteAdminSession } from '../../services/api';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    TenDot: '',
    NgayThi: '',
    GioThi: '',
    DiaDiem: '',
    SoLuongToiDa: '',
    LePhi: '', 
    TrangThai: 'active'
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await getAdminSessions();
      const list = Array.isArray(data.data) ? data.data : [];
      setSessions(list);
    } catch (error) {
      console.error("Lỗi tải đợt thi:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toISOString().split('T')[0];
  };

  const formatDateDisplay = (isoString) => {
    if (!isoString) return '---';
    return new Date(isoString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const openModal = (session = null) => {
    setMessage({ type: '', text: '' });
    if (session) {
      setCurrentSession(session);
      setFormData({
        TenDot: session.TenDot,
        NgayThi: formatDateForInput(session.NgayThi),
        GioThi: session.GioThi || '',
        DiaDiem: session.DiaDiem || '',
        SoLuongToiDa: session.SoLuongToiDa || 0,
        // [SỬA LỖI] Đọc từ session.lephi (do DB trả về chữ thường)
        LePhi: session.lephi || session.LePhi || 0, 
        TrangThai: session.TrangThai || 'active'
      });
    } else {
      setCurrentSession(null);
      setFormData({
        TenDot: '',
        NgayThi: '',
        GioThi: '',
        DiaDiem: '',
        SoLuongToiDa: '',
        LePhi: '', 
        TrangThai: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSession(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        ...formData,
        SoLuongToiDa: parseInt(formData.SoLuongToiDa) || 0,
        LePhi: parseInt(formData.LePhi) || 0
      };

      if (currentSession) {
        await updateAdminSession(currentSession.id, payload);
        setMessage({ type: 'success', text: 'Cập nhật thành công!' });
      } else {
        await createAdminSession(payload);
        setMessage({ type: 'success', text: 'Tạo đợt thi mới thành công!' });
      }
      
      fetchSessions();
      setTimeout(closeModal, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa đợt thi này?')) {
      try {
        await deleteAdminSession(id);
        fetchSessions();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      
      {/* HEADER */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Quản lý Đợt Thi</h1>
            <p className="text-orange-100 mt-1">Danh sách các kỳ thi năng lực tiếng Anh</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="group flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-orange-600 shadow-md hover:bg-orange-50 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
            Tạo Đợt Thi
          </button>
        </div>
      </div>

      {/* GRID VIEW */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Đang tải dữ liệu...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500">Chưa có đợt thi nào được tạo.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <div key={session.id} className="group relative flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md hover:ring-orange-200">
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide
                  ${session.TrangThai === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  <span className={`h-2 w-2 rounded-full ${session.TrangThai === 'active' ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                  {session.TrangThai}
                </span>
              </div>

              {/* Title */}
              <div className="mb-4 pr-16">
                <h3 className="text-lg font-bold text-slate-800 line-clamp-2" title={session.TenDot}>
                  {session.TenDot}
                </h3>
              </div>
              
              {/* Info Details */}
              <div className="space-y-3 text-sm text-slate-600 flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Ngày thi</p>
                    <p className="font-semibold text-slate-700">{formatDateDisplay(session.NgayThi)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Giờ thi</p>
                    <p className="font-semibold text-slate-700">{session.GioThi}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Địa điểm</p>
                    <p className="font-semibold text-slate-700 truncate" title={session.DiaDiem}>{session.DiaDiem}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Số lượng tối đa</p>
                    <p className="font-semibold text-slate-700">{session.SoLuongToiDa} thí sinh</p>
                  </div>
                </div>

                {/* Hiển thị Lệ phí - [SỬA LỖI] Đọc từ session.lephi */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Lệ phí thi</p>
                    <p className="font-semibold text-slate-700">
                        {formatCurrency(session.lephi || session.LePhi)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <button 
                  onClick={() => openModal(session)}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-orange-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg>
                  Chỉnh sửa
                </button>
                <button 
                  onClick={() => handleDelete(session.id)}
                  className="flex items-center gap-1 text-sm font-semibold text-red-400 hover:text-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-fade-in-up">
            
            <div className="bg-orange-50 px-6 py-4 flex items-center justify-between border-b border-orange-100 rounded-t-2xl">
              <h3 className="text-lg font-bold text-orange-800">
                {currentSession ? 'Cập nhật Đợt Thi' : 'Tạo Đợt Thi Mới'}
              </h3>
              <button onClick={closeModal} className="text-orange-400 hover:text-orange-600">✕</button>
            </div>

            <div className="p-6">
              {message.text && (
                <div className={`mb-5 p-3 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Tên đợt thi *</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 mt-1 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                    value={formData.TenDot}
                    onChange={(e) => setFormData({...formData, TenDot: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Ngày thi *</label>
                    <input
                      type="date"
                      required
                      className="w-full rounded-xl border border-slate-300 px-4 py-2 mt-1 focus:ring-2 focus:ring-orange-200 outline-none"
                      value={formData.NgayThi}
                      onChange={(e) => setFormData({...formData, NgayThi: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Giờ thi *</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: 08:00"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2 mt-1 focus:ring-2 focus:ring-orange-200 outline-none"
                      value={formData.GioThi}
                      onChange={(e) => setFormData({...formData, GioThi: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">Địa điểm *</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 mt-1 focus:ring-2 focus:ring-orange-200 outline-none"
                    value={formData.DiaDiem}
                    onChange={(e) => setFormData({...formData, DiaDiem: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Số lượng tối đa *</label>
                    <input
                      type="number"
                      required
                      className="w-full rounded-xl border border-slate-300 px-4 py-2 mt-1 focus:ring-2 focus:ring-orange-200 outline-none"
                      value={formData.SoLuongToiDa}
                      onChange={(e) => setFormData({...formData, SoLuongToiDa: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Lệ phí thi</label>
                    <input
                      type="number"
                      placeholder="VD: 500000"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2 mt-1 focus:ring-2 focus:ring-orange-200 outline-none"
                      value={formData.LePhi}
                      onChange={(e) => setFormData({...formData, LePhi: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">Trạng thái</label>
                  <select
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 mt-1 focus:ring-2 focus:ring-orange-200 outline-none bg-white"
                    value={formData.TrangThai}
                    onChange={(e) => setFormData({...formData, TrangThai: e.target.value})}
                  >
                    <option value="active">Active (Đang mở)</option>
                    <option value="closed">Closed (Đã đóng)</option>
                    <option value="upcoming">Upcoming (Sắp tới)</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 rounded-xl border py-2.5 font-semibold text-slate-600 hover:bg-slate-50">Hủy bỏ</button>
                  <button type="submit" className="flex-1 rounded-xl bg-orange-500 py-2.5 font-semibold text-white hover:bg-orange-600 shadow-md">
                    {currentSession ? 'Lưu Thay Đổi' : 'Tạo Mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;