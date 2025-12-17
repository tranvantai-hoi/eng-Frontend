import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx'; 
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  CheckCircle, 
  Clock, 
  Download,
  User,
  Calendar,
  X,
  Save,
  ListFilter,
  AlertCircle
} from 'lucide-react';

// Import API
import { 
  getAdminSessions,       
  getRegistrationsByRound,
  getRegistrationById,    
  updateRegistrationStatus,
  deleteRegistration,
  changeRegistrationround // Đảm bảo hàm này đã được export trong api.js
} from '../../services/api.js';

const Registrations = () => {
  // --- STATE ---
  const [registrations, setRegistrations] = useState([]);
  const [sessions, setSessions] = useState([]); 
  
  // Filter & Search
  const [selectedSession, setSelectedSession] = useState(''); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // --- HELPER: FORMAT DATE ---
  const formatDateDisplay = (isoString) => {
      if (!isoString) return '---';
      try {
          const date = new Date(isoString);
          if (isNaN(date.getTime())) return isoString;
          return date.toLocaleDateString('vi-VN');
      } catch { return isoString; }
  };

  // --- 1. FETCH DANH SÁCH ĐỢT THI (INIT) ---
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await getAdminSessions();
        
        let roundList = [];
        if (Array.isArray(res)) {
            roundList = res;
        } else if (res && Array.isArray(res.data)) {
            roundList = res.data;
        }

        // Sắp xếp giảm dần theo ngày thi
        roundList.sort((a, b) => new Date(b.NgayThi) - new Date(a.NgayThi));
        
        setSessions(roundList);

        // --- LOGIC TÌM ĐỢT THI MẶC ĐỊNH ---
        if (roundList.length > 0) {
            // Tìm đợt active hoặc gần nhất
            let targetRound = roundList.find(r => r.TrangThai === 'active');
            
            if (!targetRound) {
                const now = new Date().getTime();
                let minDiff = Infinity;
                roundList.forEach(r => {
                    const diff = Math.abs(new Date(r.NgayThi).getTime() - now);
                    if (diff < minDiff) {
                        minDiff = diff;
                        targetRound = r;
                    }
                });
            }

            if (targetRound) {
                const roundId = targetRound.id || targetRound.MaDot || targetRound._id;
                setSelectedSession(String(roundId));
            }
        }
      } catch (err) {
        console.error("Lỗi tải đợt thi:", err);
        setError('Không thể kết nối đến máy chủ để lấy danh sách đợt thi.');
      }
    };
    fetchSessions();
  }, []);

  // --- 2. FETCH ĐĂNG KÝ KHI ĐỢT THI THAY ĐỔI ---
  useEffect(() => {
    if (!selectedSession) return;

    const fetchRegistrations = async () => {
      setLoading(true);
      setError('');
      setRegistrations([]); 
      
      try {
        const res = await getRegistrationsByRound(selectedSession);
        const rawList = Array.isArray(res) ? res : (res.data || []);
        
        const safeRegs = rawList.map(r => ({
            mssv: r.MaSV || r.mssv,
            fullName: r.HoTen || r.fullName,
            dob: r.NgaySinh || r.dob,
            gender: r.GioiTinh || r.gender,
            email: r.email || r.Email, 
            phone: r.dienthoai || r.phone || r.DienThoai,
            
            roundId: r.RoundId || selectedSession,
            roundName: r.TenDot || r.roundName, 
            status: r.TrangThai || r.status || 'pending'
        }));

        setRegistrations(safeRegs);
      } catch (err) {
        console.error("Lỗi tải danh sách đăng ký:", err);
        setError('Không thể tải dữ liệu đăng ký. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [selectedSession]);

  // --- FILTER SEARCH ---
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = (item.fullName || '').toLowerCase().includes(searchLower);
      const mssvMatch = (item.mssv || '').toLowerCase().includes(searchLower);
      return nameMatch || mssvMatch;
    });
  }, [registrations, searchTerm]);

  // --- HANDLERS ---
  
  // Mở Modal Sửa
  const handleEditClick = async (item) => {
      try {
          // Gọi API lấy chi tiết để có thông tin mới nhất
          const res = await getRegistrationById(item.mssv, selectedSession);
          let dataToEdit = { ...item };
          
          if (res && res.data) {
             const d = res.data;
             dataToEdit = {
                 ...dataToEdit,
                 fullName: d.HoTen || item.fullName,
                 dob: d.NgaySinh || item.dob,
                 status: d.TrangThai || item.status,
                 roundName: d.TenDot || item.roundName,
                 roundId: item.roundId, // ID đợt thi hiện tại
             };
          }
          // Lưu lại ID đợt thi gốc để so sánh nếu có thay đổi
          dataToEdit.originalRoundId = item.roundId;
          
          setEditingItem(dataToEdit);
          setIsEditModalOpen(true);
      } catch (err) {
          console.error("Lỗi lấy chi tiết:", err);
          // Fallback nếu API lỗi
          setEditingItem({ ...item, originalRoundId: item.roundId });
          setIsEditModalOpen(true);
      }
  };

  // Lưu thay đổi (Trạng thái & Đợt thi)
  const handleSaveStatus = async () => {
      if (!editingItem) return;
      
      const { mssv, roundId, originalRoundId, status } = editingItem;

      try {
          // 1. Nếu thay đổi đợt thi -> Gọi API chuyển đợt
          if (String(roundId) !== String(originalRoundId)) {
              await changeRegistrationround(mssv, originalRoundId, roundId);
          }

          // 2. Cập nhật trạng thái (Gọi API update status với roundId MỚI)
          await updateRegistrationStatus(mssv, roundId, status);
          
          alert("Cập nhật thông tin thành công!");
          setIsEditModalOpen(false);

          // 3. Cập nhật giao diện (Optimistic UI Update)
          setRegistrations(prev => {
              // Nếu đợt thi MỚI khác với đợt thi đang chọn xem (selectedSession)
              // -> Xóa sinh viên khỏi danh sách hiện tại
              if (String(roundId) !== String(selectedSession)) {
                  return prev.filter(item => item.mssv !== mssv);
              }

              // Ngược lại, cập nhật thông tin tại chỗ
              return prev.map(item => {
                  if (item.mssv === mssv) {
                      // Tìm tên đợt thi mới để hiển thị
                      const newRoundName = sessions.find(s => String(s.id || s.MaDot) === String(roundId))?.TenDot;
                      return { 
                          ...item, 
                          status: status,
                          roundId: roundId,
                          roundName: newRoundName || item.roundName
                      };
                  }
                  return item;
              });
          });

      } catch (err) {
          console.error(err);
          alert("Lỗi cập nhật: " + (err.message || "Lỗi server"));
      }
  };

  // Xóa đăng ký
  const handleDeleteClick = async (item) => {
      if(window.confirm(`Bạn chắc chắn muốn xóa đăng ký của ${item.fullName}?`)) {
          try {
              await deleteRegistration(item.mssv, selectedSession);
              setRegistrations(prev => prev.filter(r => r.mssv !== item.mssv));
              alert("Đã xóa thành công.");
          } catch (err) {
              alert("Lỗi xóa: " + (err.message || "Lỗi server"));
          }
      }
  };

  // Xuất Excel
  const handleExport = () => {
      if (filteredRegistrations.length === 0) return alert("Không có dữ liệu để xuất");
      
      const data = filteredRegistrations.map(r => ({
          'MSSV': r.mssv,
          'Họ tên': r.fullName,
          'Ngày sinh': formatDateDisplay(r.dob),
          'Giới tính': r.gender,
          'SĐT': r.phone,
          'Đợt thi': r.roundName,
          'Trạng thái': r.status === 'paid' ? 'Đã đóng phí' : 'Chưa đóng phí'
      }));

      const currentRoundName = sessions.find(s => String(s.id || s.MaDot) === String(selectedSession))?.TenDot || 'DanhSach';
      
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "DS_DangKy");
      XLSX.writeFile(wb, `${currentRoundName}.xlsx`);
  };

  const StatusBadge = ({ status }) => {
      const isPaid = status === 'paid' || status === 'complete';
      return (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide border ${
              isPaid 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
          }`}>
              {isPaid ? <CheckCircle size={14} /> : <Clock size={14} />}
              {isPaid ? 'Đã đóng phí' : 'Chưa đóng phí'}
          </span>
      );
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      
      {/* HEADER */}
      <div className="rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white shadow-xl shadow-indigo-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Quản lý danh sách đăng ký</h1>
            <p className="text-indigo-100 mt-1">Xem danh sách sinh viên theo từng đợt.</p>
          </div>
          <button 
             onClick={handleExport}
             disabled={filteredRegistrations.length === 0}
             className="flex items-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm px-5 py-2.5 font-semibold text-white transition-all border border-white/30 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
             <Download size={18} /> Xuất Excel
          </button>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
         
         {/* SELECT ROUND */}
         <div className="flex items-center gap-3 w-full md:w-auto flex-1">
            <div className="flex items-center gap-2 text-slate-500 font-medium whitespace-nowrap">
                <ListFilter size={20} />
                <span>Chọn đợt thi:</span>
            </div>
            <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="block w-full max-w-md rounded-xl border-0 bg-indigo-50 py-3 pl-4 pr-10 text-indigo-900 font-semibold ring-1 ring-inset ring-indigo-200 focus:ring-2 focus:ring-indigo-500 sm:text-sm cursor-pointer"
            >
                {sessions.length === 0 && <option value="">Đang tải danh sách...</option>}
                {sessions.map((session) => (
                    <option key={session.id || session.MaDot} value={session.id || session.MaDot}>
                        {session.TenDot} ({formatDateDisplay(session.NgayThi)}) {session.TrangThai === 'active' ? '(Đang mở)' : ''}
                    </option>
                ))}
            </select>
         </div>

         {/* SEARCH LOCAL */}
         <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
                type="text"
                placeholder="Tìm tên hoặc MSSV..."
                className="block w-full rounded-xl border-0 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-violet-500 sm:text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      {/* ALERT ERROR */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-red-700 flex items-center gap-2">
            <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* TABLE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
            <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/80">
                <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Mã SV</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Họ tên</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Ngày sinh</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Giới tính</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Liên hệ</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                    <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                            <div className="flex justify-center items-center gap-2">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-violet-600"></div>
                                Đang tải danh sách...
                            </div>
                        </td>
                    </tr>
                ) : filteredRegistrations.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500 italic">
                            {sessions.length === 0 
                                ? 'Chưa có đợt thi nào được tạo.' 
                                : 'Chưa có sinh viên nào đăng ký trong đợt này.'}
                        </td>
                    </tr>
                ) : (
                    filteredRegistrations.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-mono text-sm font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                    {item.mssv}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3 border border-violet-200">
                                        {item.fullName ? item.fullName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900">{item.fullName}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-400" />
                                    {formatDateDisplay(item.dob)}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                {item.gender || '---'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                <div className="flex flex-col text-xs">
                                    <span>{item.phone || '---'}</span>
                                    <span className="text-slate-400">{item.email}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                <StatusBadge status={item.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleEditClick(item)}
                                        className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors border border-transparent hover:border-violet-100"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(item)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                        title="Xóa đăng ký"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center font-medium">
             <span>Hiển thị <span className="text-slate-900">{filteredRegistrations.length}</span> kết quả</span>
             <span>Tổng số: {registrations.length}</span>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && editingItem && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-zoom-in">
                <div className="bg-violet-50 px-6 py-4 border-b border-violet-100 flex justify-between items-center">
                    <h3 className="font-bold text-violet-900 flex items-center gap-2">
                        <Edit size={18} /> Cập nhật đăng ký
                    </h3>
                    <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 space-y-2">
                        <p className="flex justify-between"><span>Sinh viên:</span> <span className="font-bold">{editingItem.fullName}</span></p>
                        <p className="flex justify-between"><span>MSSV:</span> <span className="font-mono font-bold text-slate-500">{editingItem.mssv}</span></p>
                    </div>

                    {/* Chọn Đợt Thi */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Đợt thi</label>
                        <select 
                            className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all cursor-pointer"
                            value={editingItem.roundId}
                            onChange={(e) => setEditingItem({...editingItem, roundId: e.target.value})}
                        >
                            {sessions.map(s => (
                                <option key={s.id || s.MaDot} value={s.id || s.MaDot}>
                                    {s.TenDot} ({formatDateDisplay(s.NgayThi)})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Chọn Trạng Thái */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Trạng thái lệ phí</label>
                        <select 
                            className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all cursor-pointer"
                            value={editingItem.status}
                            onChange={(e) => setEditingItem({...editingItem, status: e.target.value})}
                        >
                            <option value="pending">⏳ Pending (Chưa đóng phí)</option>
                            <option value="paid">✅ Paid (Đã đóng phí)</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button onClick={() => setIsEditModalOpen(false)} className="flex-1 rounded-xl border border-slate-300 py-2.5 text-slate-600 hover:bg-slate-50 font-medium transition-colors">Hủy</button>
                        <button onClick={handleSaveStatus} className="flex-1 rounded-xl bg-violet-600 py-2.5 text-white hover:bg-violet-700 font-bold shadow-md shadow-violet-200 transition-colors flex items-center justify-center gap-2"><Save size={18} /> Lưu thay đổi</button>
                    </div>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Registrations;