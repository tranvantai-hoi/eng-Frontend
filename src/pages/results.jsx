import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  User, 
  Calendar, 
  CreditCard, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  Trophy,
  Mic,
  Headphones,
  BookOpen,
  PenTool
} from 'lucide-react';

// Import API
import { getRegistrationById, getActiveExamRound } from '../services/api.js';

const Results = () => {
  const [studentId, setStudentId] = useState('');
  const [selectedRoundId, setSelectedRoundId] = useState('');
  const [activeRounds, setActiveRounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // 1. Load danh sách đợt thi
  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const res = await getActiveExamRound();
        const data = Array.isArray(res) ? res : (res.data || []);
        const validRounds = data.filter(r => r && (r.id || r.MaDot));
        setActiveRounds(validRounds);
        
        if (validRounds.length === 1) {
             setSelectedRoundId(validRounds[0].id || validRounds[0].MaDot);
        }
      } catch (err) {
        console.error("Lỗi tải đợt thi:", err);
      }
    };
    fetchRounds();
  }, []);

  // 2. Xử lý tra cứu
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!studentId || !selectedRoundId) {
      setError('Vui lòng nhập MSSV và chọn đợt thi');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await getRegistrationById(studentId, selectedRoundId);
      if (res && res.data) {
        setResult(res.data);
      } else {
        setError('Không tìm thấy thông tin đăng ký của sinh viên này.');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tra cứu.');
    } finally {
      setLoading(false);
    }
  };

  // Helper formats
  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Logic tạo dữ liệu QR Agribank
  const getQrData = () => {
    if (!result) return { content: '', url: '' };
    const year = result.NgayThi ? new Date(result.NgayThi).getFullYear() : new Date().getFullYear();
    const content = `TA_${year}_${result.RoundId}_${result.MaSV}`;
    const url = `https://img.vietqr.io/image/agribank-52002055999999-compact2.jpg?amount=${result.lephi}&addInfo=${encodeURIComponent(content)}&accountName=PHONG%20DAO%20TAO`;
    return { content, url };
  };

  const qrData = getQrData();
  const isPaid = result?.TrangThai === 'paid' || result?.TrangThai === 'complete';
  const hasScores = result?.ketqua || result?.nghe || result?.noi || result?.doc || result?.viet;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Tra cứu kết quả kiểm tra</h1>
      </div>

      {/* Form tìm kiếm */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Đợt kiểm tra</label>
            <select 
              value={selectedRoundId}
              onChange={(e) => setSelectedRoundId(e.target.value)}
              className="w-full rounded-2xl border-slate-200 bg-slate-50 py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Chọn đợt thi --</option>
              {activeRounds.map(r => (
                <option key={r.id || r.MaDot} value={r.id || r.MaDot}>{r.TenDot}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Mã số sinh viên</label>
            <input 
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-2xl border-slate-200 bg-slate-50 py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all">
              {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Search size={18} />}
              Tra cứu
            </button>
          </div>
        </form>
        {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}
      </div>

      {result && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><User size={16}/> Thông tin thí sinh</h3>
              <div className="space-y-3">
                <InfoRow label="Họ và tên" value={result.HoTen} bold />
                <InfoRow label="MSSV" value={result.MaSV} />
                <InfoRow label="Ngày sinh" value={formatDate(result.NgaySinh)} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Calendar size={16}/> Thông tin đợt thi</h3>
              <div className="space-y-3">
                <InfoRow label="Đợt thi" value={result.TenDot} bold />
                <InfoRow label="Ngày thi" value={formatDate(result.NgayThi)} />
                <InfoRow label="Địa điểm" value={result.DiaDiem} />
              </div>
            </div>
          </div>

          {/* KẾT QUẢ KIỂM TRA */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-1 shadow-xl">
            <div className="bg-white rounded-[22px] p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Trophy className="text-orange-500" size={22} /> Kết quả kiểm tra
              </h3>

              {!hasScores ? (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium italic">Hiện chưa có kết quả kiểm tra cho sinh viên này.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ScoreCard icon={<Headphones size={18}/>} label="Nghe" score={result.nghe} color="blue" />
                    <ScoreCard icon={<Mic size={18}/>} label="Nói" score={result.noi} color="purple" />
                    <ScoreCard icon={<BookOpen size={18}/>} label="Đọc" score={result.doc} color="emerald" />
                    <ScoreCard icon={<PenTool size={18}/>} label="Viết" score={result.viet} color="orange" />
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
                    <span className="text-sm font-bold text-slate-500 uppercase">Kết quả / Xếp loại:</span>
                    <span className="text-xl font-black text-blue-700 uppercase">{result.ketqua || 'Đang cập nhật'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PHẦN THANH TOÁN (Logic: Nếu chưa đóng hiện QR, đã đóng hiện thông báo) */}
          {isPaid ? (
            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-200 flex items-center justify-center gap-3 animate-fade-in shadow-sm">
               <CheckCircle2 className="text-emerald-600" size={28} />
               <span className="text-emerald-800 font-bold text-lg uppercase tracking-wider">
                 Đã hoàn tất đóng lệ phí thi
               </span>
            </div>
          ) : (
            <div className="bg-orange-50 rounded-3xl p-6 border border-orange-200 shadow-sm animate-fade-in">
                <h3 className="text-orange-800 font-bold mb-4 flex items-center gap-2">
                  <CreditCard size={20} /> HƯỚNG DẪN THANH TOÁN QUA QRCODE
                </h3>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-shrink-0 bg-white p-3 border border-orange-200 rounded-2xl shadow-sm text-center">
                        <img src={qrData.url} alt="VietQR Agribank" className="w-48 h-48 mx-auto" />
                        <p className="text-[10px] text-slate-400 mt-2 italic">Dùng App Ngân hàng quét mã</p>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-[11px] text-slate-500 uppercase font-bold">Ngân hàng nhận</p>
                                <p className="font-bold text-slate-800">Agribank - CN Hà Tây</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-slate-500 uppercase font-bold">Số tài khoản</p>
                                <p className="font-bold text-slate-800 text-lg">52002055999999</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-slate-500 uppercase font-bold">Số tiền</p>
                                <p className="font-bold text-red-600 text-lg">{formatCurrency(result.lephi)}</p>
                            </div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-orange-100">
                            <p className="text-[11px] text-orange-600 uppercase font-bold mb-1">Nội dung chuyển khoản</p>
                            <p className="font-mono font-bold text-blue-700 text-base break-all select-all">
                                {qrData.content}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      )}

      <div className="text-center pt-4">
        <Link to="/" className="text-sm text-slate-400 hover:text-blue-600 font-medium transition-colors">
          ← Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
};

// Components bổ trợ
const InfoRow = ({ label, value, bold = false }) => (
  <div className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-500">{label}:</span>
    <span className={`text-sm ${bold ? 'font-bold text-slate-800' : 'text-slate-600'}`}>{value}</span>
  </div>
);

const ScoreCard = ({ icon, label, score, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100'
  };
  return (
    <div className={`p-4 rounded-2xl border ${colors[color]} text-center space-y-2`}>
      <div className="flex justify-center">{icon}</div>
      <span className="block text-[10px] font-bold uppercase opacity-70">{label}</span>
      <span className="block text-2xl font-black">{score ?? '--'}</span>
    </div>
  );
};

export default Results;