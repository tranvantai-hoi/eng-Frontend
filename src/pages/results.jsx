import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
// Import API
import { getRegistrationById, getActiveExamRound } from '../services/api.js';

const Results = () => {
  const location = useLocation(); 
  
  // State Search
  const [studentId, setStudentId] = useState('');
  const [selectedRoundId, setSelectedRoundId] = useState('');
  const [activeRounds, setActiveRounds] = useState([]);
  
  // State Data
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // 1. Load danh sách đợt thi để đổ vào dropdown tìm kiếm
  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const res = await getActiveExamRound();
        const data = Array.isArray(res) ? res : (res.data || []);
        const validRounds = data.filter(r => r && (r.id || r._id || r.MaDot));
        setActiveRounds(validRounds);
        
        // Nếu chỉ có 1 đợt thì chọn luôn
        if (validRounds.length === 1) {
             setSelectedRoundId(validRounds[0].id || validRounds[0].MaDot);
        }
      } catch (err) {
        console.error("Lỗi tải đợt thi:", err);
      }
    };
    fetchRounds();
  }, []);

  // 2. Tự động load dữ liệu nếu được chuyển từ trang Register
  useEffect(() => {
    if (location.state && location.state.autoFetch) {
        const { mssv, roundId } = location.state;
        setStudentId(mssv);
        setSelectedRoundId(roundId);
        
        // Gọi hàm tìm kiếm ngay lập tức
        performSearch(mssv, roundId);
    }
  }, [location]);

  // Hàm gọi API tìm kiếm chi tiết
  const performSearch = async (mssv, roundId) => {
    if (!mssv || !roundId) {
        setError('Vui lòng nhập Mã sinh viên và chọn Đợt thi.');
        return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
        // Gọi API getRegistrationById (yêu cầu mssv và roundId)
        const res = await getRegistrationById(mssv, roundId);
        
        if (res && res.data) {
            setResult(res.data);
        } else {
            setError('Không tìm thấy thông tin đăng ký.');
        }

    } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
        setError(err.message || 'Không tìm thấy hồ sơ hoặc lỗi kết nối.');
    } finally {
        setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(studentId, selectedRoundId);
  };

  // Helper Format Tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Helper Format Ngày
  const formatDateDisplay = (isoString) => {
    if (!isoString) return '---';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('vi-VN');
    } catch { return isoString; }
  };

  // Logic tạo Nội dung và QR Code theo yêu cầu mới
  const getQrData = () => {
    if (!result) return { content: '', url: '' };
    // Nội dung: TA_Năm_Đợt_Mã sinh viên
    const year = result.NgayThi ? new Date(result.NgayThi).getFullYear() : new Date().getFullYear();
    const content = `TA ${year} Dot ${result.RoundId} ${result.MaSV}`;
    // Link API VietQR Agribank (BIN 970405)
    const url = `https://img.vietqr.io/image/agribank-5200205598317-compact2.jpg?amount=${result.lephi}&addInfo=${encodeURIComponent(content)}&accountName=PHONG%20DAO%20TAO`;
    return { content, url };
  };

  const qrData = getQrData();

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-fade-in py-10 px-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Tra cứu kết quả & Hồ sơ</h1>
        <p className="text-slate-600">Nhập mã sinh viên và chọn đợt để tra cứu</p>
      </div>

      {/* Form tìm kiếm */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Nhập mã sinh viên (Ví dụ: 20123456)"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          
          <select
             className="flex-1 rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none bg-white"
             value={selectedRoundId}
             onChange={(e) => setSelectedRoundId(e.target.value)}
          >
             <option value="">-- Chọn đợt kiểm tra --</option>
             {activeRounds.map(r => (
                 <option key={r.id} value={r.id}>
                    {r.TenDot} ({formatDateDisplay(r.NgayThi)})
                 </option>
             ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Tra cứu'}
          </button>
        </form>
        {error && <p className="mt-4 text-sm text-red-600 text-center font-medium bg-red-50 p-2 rounded border border-red-100">{error}</p>}
      </div>

      {/* Kết quả hiển thị */}
      {result && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100 animate-fade-in-up">
          
          {/* Header Card: Trạng thái */}
          <div className={`px-6 py-4 border-b flex justify-between items-center ${
              result.TrangThai === 'paid' ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'
          }`}>
            <div>
              <h2 className="text-lg font-bold text-slate-800">HỒ SƠ ĐĂNG KÝ</h2>
              <p className="text-sm text-slate-500">Mã hồ sơ: #{result.id}</p>
            </div>
            
            {result.TrangThai === 'paid' ? (
                 <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-green-100 text-green-700 border border-green-200 shadow-sm flex items-center gap-2">
                    <i className="fas fa-check-circle"></i> ĐÃ ĐÓNG LỆ PHÍ
                 </span>
            ) : (
                <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-sm flex items-center gap-2">
                    <i className="fas fa-exclamation-triangle"></i> CHƯA NỘP LỆ PHÍ
                </span>
            )}
          </div>

          {/* Body Card: Thông tin chi tiết */}
          <div className="p-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-6">
                <InfoRow label="Mã sinh viên" value={result.MaSV} bold />
                <InfoRow label="Họ và tên" value={result.HoTen} bold />
                <InfoRow label="Ngày sinh" value={formatDateDisplay(result.NgaySinh)} />
                <InfoRow label="Email" value={result.email} />
                <InfoRow label="Số điện thoại" value={result.dienthoai} />
                <InfoRow label="Giới tính" value={result.GioiTinh} />
            </div>

            <div className="border-t border-dashed border-slate-200 my-4"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                 <InfoRow label="Đợt kiểm tra" value={result.TenDot} highlight />
                 <InfoRow label="Ngày kiểm tra" value={formatDateDisplay(result.NgayThi)} highlight />
                 <InfoRow label="Giờ kiểm tra" value={result.GioThi} />
                 <InfoRow label="Địa điểm" value={result.DiaDiem} />
                 <div className="md:col-span-2 mt-2 bg-slate-50 p-3 rounded-lg flex justify-between items-center border border-slate-200">
                    <span className="text-slate-600 font-medium">Lệ phí:</span>
                    <span className={`text-xl font-bold ${result.TrangThai === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(result.lephi)} 
                        <span className="text-xs font-normal text-slate-500 ml-2">
                            ({result.TrangThai === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'})
                        </span>
                    </span>
                 </div>
            </div>

            {/* HƯỚNG DẪN THANH TOÁN (Chỉnh sửa phần VietQR) */}
            {result.TrangThai !== 'paid' && (
                <div className="mt-8 bg-orange-50 rounded-xl p-5 border border-orange-200">
                    <h4 className="font-bold text-orange-800 mb-3 flex items-center">
                        <i className="fas fa-bullhorn mr-2"></i> THÔNG BÁO QUAN TRỌNG
                    </h4>
                    <ul className="text-sm text-slate-700 space-y-2 list-disc list-inside mb-4">
                        <li>Sinh viên đóng lệ phí qua tài khoản bên dưới hoặc trực tiếp tại phòng Đào tạo.</li>
                        <li>Sinh viên phải hoàn thành việc đóng lệ phí <span className="font-bold text-red-600">trước ngày kiểm tra 1 tuần</span>.</li>
                        <li>Quá thời gian trên coi như sinh viên không tham gia thi.</li>
                    </ul>
                    
                    <div className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm">
                        <p className="text-sm text-slate-500 mb-4 italic">Sử dụng ứng dụng Ngân hàng quét mã QR để thanh toán nhanh:</p>
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            {/* Cột mã QR */}
                            <div className="flex-shrink-0 bg-white p-2 border border-slate-100 rounded-lg shadow-sm">
                                <img src={qrData.url} alt="VietQR Agribank" className="w-40 h-40" />
                            </div>
                            
                            {/* Cột thông tin chữ */}
                            <div className="flex-1 space-y-3">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Ngân hàng nhận</p>
                                    <p className="font-bold text-blue-800">Agribank</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Số tài khoản</p>
                                    <p className="font-bold text-slate-800 text-lg">5200205598317</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Nội dung chuyển khoản</p>
                                    <p className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 inline-block">
                                        {qrData.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* HIỂN THỊ ĐIỂM (Giữ nguyên) */}
            {(result.total !== null && result.total !== undefined) && (
                 <div className="mt-6 pt-6 border-t border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 text-center">KẾT QUẢ KIỂM TRA</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <span className="block text-xs text-slate-500">Đọc</span>
                            <span className="font-bold text-lg text-blue-700">{result.reading || '-'}</span>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <span className="block text-xs text-slate-500">Nghe</span>
                            <span className="font-bold text-lg text-blue-700">{result.listening || '-'}</span>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                            <span className="block text-xs text-slate-500">Tổng điểm</span>
                            <span className="font-bold text-xl text-indigo-700">{result.total || '-'}</span>
                        </div>
                    </div>
                 </div>
            )}

          </div>
        </div>
      )}

      {/* Nút quay lại */}
      <div className="text-center pt-4">
        <Link to="/" className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors">
          ← Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
};

// Component con để hiển thị từng dòng thông tin
const InfoRow = ({ label, value, bold = false, highlight = false }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-slate-50 sm:border-none pb-2 sm:pb-0">
        <span className="text-sm text-slate-500 min-w-[120px]">{label}:</span>
        <span className={`text-sm text-right ${bold ? 'font-bold text-slate-800' : 'text-slate-700'} ${highlight ? 'text-blue-700 font-semibold' : ''}`}>
            {value || '---'}
        </span>
    </div>
);

export default Results;