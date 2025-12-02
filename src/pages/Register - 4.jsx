import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input.jsx';
// Import đúng hàm từ api.js mới
import { getStudentById, registerForExam, getActiveExamRound } from '../services/api.js';

const initialForm = {
  mssv: '',
  fullName: '',
  dob: '',
  gender: '',
  faculty: '',
  email: '',
  phone: '',
  sessionId: '', 
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

const Register = () => {
  const [formData, setFormData] = useState(initialForm);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentLoaded, setStudentLoaded] = useState(false);
  
  // OTP States
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState(null); 

  // Session State
  const [activeRound, setActiveRound] = useState(null);
  const [roundLoading, setRoundLoading] = useState(false);

  const navigate = useNavigate();

  // --- Tải đợt thi active ---
  useEffect(() => {
    const fetchActiveRound = async () => {
      setRoundLoading(true);
      try {
        const res = await getActiveExamRound();
        
        // Xử lý dữ liệu trả về (Object hoặc Array)
        // Controller của bạn trả về { success: true, data: { ... } } hoặc { ... }
        const roundData = Array.isArray(res) ? res[0] : (res.data || res);

        // Ưu tiên lấy cột 'id' như bạn yêu cầu
        const roundId = roundData?.id;

        if (roundData && roundId) {
          setActiveRound({
            id: roundId,
            name: roundData.name || roundData.TenDot || 'Đợt thi chính thức',
            date: roundData.date || roundData.NgayThi
          });
          // Tự động chọn vào form
          setFormData(prev => ({ ...prev, sessionId: roundId }));
        }
      } catch (err) {
        console.error("Lỗi lấy đợt thi active:", err);
      } finally {
        setRoundLoading(false);
      }
    };
    fetchActiveRound();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'email' && isEmailVerified) {
        setIsEmailVerified(false);
        setIsOtpSent(false);
        setOtp('');
    }
  };

  const handleLookup = async () => {
    if (!formData.mssv.trim()) {
      setError('Vui lòng nhập Mã sinh viên.');
      return;
    }
    setError('');
    setLoadingStudent(true);
    
    try {
      const res = await getStudentById(formData.mssv.trim());
      let data = Array.isArray(res) ? res[0] : (res.data || res);

      if (!data) {
        throw new Error('Không tìm thấy thông tin sinh viên.');
      }

      setFormData((prev) => ({
        ...prev,
        mssv: data.MaSV || prev.mssv,
        fullName: data.HoTen || data.fullName || '',
        dob: formatDate(data.NgaySinh || data.dob),
        gender: data.GioiTinh || data.gender || '', 
        // Map cả trường hợp Lop, lop, Khoa
        faculty: data.Lop || data.lop || data.Khoa || data.faculty || '', 
        email: data.email || '', 
        phone: data.dienthoai || data.phone || '',
      }));
      
      setStudentLoaded(true);
      setIsEmailVerified(false);
      setIsOtpSent(false);
      setOtp('');

    } catch (err) {
      console.error("Lỗi tra cứu:", err);
      if (err.message === 'Failed to fetch') {
         setError('Lỗi kết nối máy chủ. Vui lòng kiểm tra lại mạng hoặc liên hệ Admin.');
      } else {
         setError(err.message || 'Lỗi kết nối hoặc không tìm thấy sinh viên.');
      }
      setStudentLoaded(false);
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Vui lòng nhập Email hợp lệ để nhận mã.');
        return;
    }
    setError('');
    setOtpLoading(true);

    try {
        // [MOCKUP] Thay bằng await sendOtp({ email: formData.email }) khi backend sẵn sàng
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(mockOtp); 
        setIsOtpSent(true);
        alert(`[MÔ PHỎNG] Mã OTP của bạn là: ${mockOtp}`);
    } catch (err) {
        setError('Gửi mã thất bại. Vui lòng thử lại.');
    } finally {
        setOtpLoading(false);
    }
  };

  const handleVerifyOtp = () => {
      if (otp === generatedOtp) {
          setIsEmailVerified(true);
          setError('');
      } else {
          setError('Mã OTP không chính xác.');
      }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!studentLoaded) return setError('Vui lòng hoàn thành Bước 1: Tra cứu.');
    if (!isEmailVerified) return setError('Vui lòng hoàn thành Bước 2: Xác minh Email.');
    if (!formData.sessionId) return setError('Hiện tại không có đợt thi nào đang mở đăng ký.');
    if (!formData.phone) return setError('Số điện thoại là bắt buộc.');

    setError('');
    setSubmitLoading(true);
    
    try {
      const payload = {
        mssv: formData.mssv.trim(),
        fullName: formData.fullName.trim(),
        dob: formData.dob,
        gender: formData.gender,
        faculty: formData.faculty,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        sessionId: formData.sessionId, // Gửi ID đợt thi
      };
      
      const response = await registerForExam(payload);
      navigate('/success', { state: { registration: payload, apiResponse: response } });
      
      setFormData(initialForm);
      setStudentLoaded(false);
      setIsEmailVerified(false);
      setIsOtpSent(false);
      
    } catch (err) {
      if (err.message === 'Failed to fetch') {
         setError('Mất kết nối server khi đang gửi đơn.');
      } else {
         setError(err.message || "Đăng ký thất bại.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Cổng Đăng Ký Thi Tiếng Anh</h1>
        <p className="text-slate-500">Hoàn thành 3 bước bên dưới để đăng ký dự thi</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            
            {/* BƯỚC 1: TRA CỨU */}
            <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${studentLoaded ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-blue-500'}`}>
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Bước 1: Tra cứu thông tin</h3>
                    {studentLoaded && <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">Đã xong</span>}
                </div>
                <div className="p-6">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1">
                            <Input label="Nhập Mã số sinh viên (MSSV)" name="mssv" value={formData.mssv} onChange={handleChange} required placeholder="VD: 20123456" disabled={studentLoaded} />
                        </div>
                        {studentLoaded ? (
                            <button onClick={() => { setStudentLoaded(false); setIsEmailVerified(false); setFormData(initialForm); }} className="h-[42px] px-4 bg-gray-100 text-gray-600 font-medium rounded-lg hover:bg-gray-200">Tìm lại</button>
                        ) : (
                            <button type="button" onClick={handleLookup} disabled={loadingStudent || !formData.mssv} className="h-[42px] px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 min-w-[120px]">
                                {loadingStudent ? 'Đang tìm...' : 'Tra cứu'}
                            </button>
                        )}
                    </div>
                    {studentLoaded && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                            <Input label="Họ tên" value={formData.fullName} disabled className="bg-slate-50" />
                            <Input label="Ngày sinh" type="date" value={formData.dob} disabled className="bg-slate-50" />
                            <Input label="Giới tính" value={formData.gender} disabled className="bg-slate-50" />
                            <Input label="Lớp / Khoa" value={formData.faculty} disabled className="bg-slate-50" />
                        </div>
                    )}
                </div>
            </div>

            {/* BƯỚC 2: XÁC MINH EMAIL */}
            <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-opacity duration-300 ${!studentLoaded ? 'opacity-50 pointer-events-none' : 'opacity-100'} ${isEmailVerified ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-yellow-500'}`}>
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Bước 2: Xác minh liên hệ</h3>
                    {isEmailVerified && <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">Đã xác minh</span>}
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-slate-700">Email nhận thông báo <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={isOtpSent || isEmailVerified} className="flex-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100" placeholder="email@example.com" />
                                {!isEmailVerified && !isOtpSent && (
                                    <button onClick={handleSendOtp} disabled={otpLoading || !formData.email} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-50">{otpLoading ? '...' : 'Gửi mã'}</button>
                                )}
                                {(isOtpSent || isEmailVerified) && !isEmailVerified && (
                                    <button onClick={() => { setIsOtpSent(false); setOtp(''); }} className="bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm">Sửa</button>
                                )}
                            </div>
                            {isOtpSent && !isEmailVerified && (
                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 animate-in fade-in">
                                    <p className="text-xs text-yellow-800 mb-2">Mã xác thực đã gửi đến email của bạn.</p>
                                    <div className="flex gap-2">
                                        <input value={otp} onChange={(e) => setOtp(e.target.value)} className="flex-1 border border-yellow-300 rounded px-2 py-1 text-center font-bold tracking-widest" placeholder="------" maxLength={6} />
                                        <button onClick={handleVerifyOtp} className="bg-yellow-600 text-white px-4 rounded text-sm font-bold hover:bg-yellow-700">OK</button>
                                    </div>
                                </div>
                            )}
                            {isEmailVerified && <p className="text-xs text-green-600 flex items-center mt-1">Email đã được xác thực</p>}
                        </div>
                        <div>
                            <Input label="Số điện thoại liên hệ" name="phone" value={formData.phone} onChange={handleChange} required placeholder="09xx..." />
                        </div>
                    </div>
                </div>
            </div>

            {/* BƯỚC 3: CHỌN ĐỢT THI */}
            <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-opacity duration-300 ${!isEmailVerified ? 'opacity-50 pointer-events-none' : 'opacity-100'} ${activeRound ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'}`}>
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Bước 3: Xác nhận đợt thi</h3>
                    {activeRound && <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">Đang mở</span>}
                </div>
                <div className="p-6">
                    {roundLoading ? (
                        <p className="text-slate-500 text-sm">Đang tải thông tin đợt thi...</p>
                    ) : activeRound ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">{activeRound.name}</h4>
                                <p className="text-sm text-slate-600 mt-1">Ngày thi: <span className="font-semibold">{formatDate(activeRound.date)}</span></p>
                            </div>
                            <div className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Đã chọn tự động</div>
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                            <p className="text-slate-500">Hiện tại không có đợt thi nào đang mở đăng ký.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* SUBMIT */}
            <div className={`transition-opacity duration-300 ${activeRound ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 font-medium">{error}</div>}
                <button onClick={handleSubmit} disabled={submitLoading || !activeRound} className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitLoading ? 'Đang xử lý đăng ký...' : 'XÁC NHẬN ĐĂNG KÝ THI'}
                </button>
            </div>
        </div>

        <aside className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-6">
                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Hướng dẫn</h3>
                <ul className="text-sm text-slate-600 space-y-4">
                    <li>1. Nhập MSSV để tra cứu.</li>
                    <li>2. Kiểm tra thông tin & Xác thực OTP Email.</li>
                    <li>3. Hệ thống tự chọn đợt thi. Nhấn Xác nhận để hoàn tất.</li>
                </ul>
            </div>
        </aside>
      </div>
    </div>
  );
};

export default Register;