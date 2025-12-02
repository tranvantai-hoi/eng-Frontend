import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input.jsx';
// QUAN TRỌNG: Import đúng tên hàm từ file api.js
import { getStudentById, registerForExam } from '../services/api.js';

const initialForm = {
  mssv: '',
  fullName: '',
  dob: '',
  gender: '',
  faculty: '',
  email: '',
  phone: '',
};

// Hàm hỗ trợ format ngày (YYYY-MM-DD)
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

const Register = () => {
  // --- STATES ---
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
  const [generatedOtp, setGeneratedOtp] = useState(null); // Mockup OTP (Xóa khi có Backend thật)

  const navigate = useNavigate();

  // --- HANDLERS ---

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Nếu đổi email, bắt buộc xác minh lại
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
      // 1. Gọi API lấy dữ liệu
      const res = await getStudentById(formData.mssv.trim());
      
      // 2. Xử lý dữ liệu trả về (Mảng hoặc Object)
      let data = Array.isArray(res) ? res[0] : (res.data || res);

      if (!data) {
        throw new Error('Không tìm thấy thông tin sinh viên.');
      }

      // 3. Mapping dữ liệu (Giữ nguyên logic bạn yêu cầu)
      setFormData((prev) => ({
        ...prev,
        mssv: data.MaSV || prev.mssv,
        fullName: data.HoTen || data.fullName || '',
        dob: formatDate(data.NgaySinh || data.dob),
        gender: data.GioiTinh || data.gender || '', // Không chuẩn hóa, hiển thị gốc
        faculty: data.Lop || data.lop || data.Khoa || data.faculty || '', // Thử nhiều biến thể tên cột
        email: data.email || '', 
        phone: data.dienthoai || data.phone || '',
      }));
      
      setStudentLoaded(true);
      // Reset trạng thái xác minh khi tìm sinh viên mới
      setIsEmailVerified(false);
      setIsOtpSent(false);
      setOtp('');

    } catch (err) {
      console.error("Lỗi tra cứu:", err);
      if (err.message === 'Failed to fetch') {
         setError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
      } else {
         setError(err.message || 'Lỗi kết nối hoặc không tìm thấy sinh viên.');
      }
      setStudentLoaded(false);
    } finally {
      setLoadingStudent(false);
    }
  };

  // --- OTP LOGIC (MOCKUP - Cần thay bằng API thật sau này) ---
  const handleSendOtp = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Vui lòng nhập Email hợp lệ để nhận mã.');
        return;
    }
    setError('');
    setOtpLoading(true);

    try {
        // [TODO]: Thay đoạn này bằng await apiSendOtp({ email: formData.email })
        await new Promise(resolve => setTimeout(resolve, 1500)); // Giả lập delay mạng
        
        const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(mockOtp); // Lưu tạm OTP (Backend thật sẽ lưu trong Redis/DB)
        
        setIsOtpSent(true);
        alert(`[MÔ PHỎNG] Mã OTP của bạn là: ${mockOtp}\n(Trên thực tế mã này sẽ gửi về email)`);
        
    } catch (err) {
        setError('Gửi mã thất bại. Vui lòng thử lại.');
    } finally {
        setOtpLoading(false);
    }
  };

  const handleVerifyOtp = () => {
      // [TODO]: Thay bằng gọi API verify
      if (otp === generatedOtp) {
          setIsEmailVerified(true);
          setError('');
      } else {
          setError('Mã OTP không chính xác.');
      }
  };

  // --- SUBMIT ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate các bước
    if (!studentLoaded) return setError('Vui lòng hoàn thành Bước 1: Tra cứu.');
    if (!isEmailVerified) return setError('Vui lòng hoàn thành Bước 2: Xác minh Email.');
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
      };
      
      const response = await registerForExam(payload);
      
      navigate('/success', { state: { registration: payload, apiResponse: response } });
      
      // Reset form
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
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Cổng Đăng Ký Thi Tiếng Anh</h1>
        <p className="text-slate-500">Hoàn thành 3 bước bên dưới để đăng ký dự thi</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form Area */}
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
                            <Input
                                label="Nhập Mã số sinh viên (MSSV)"
                                name="mssv"
                                value={formData.mssv}
                                onChange={handleChange}
                                required
                                placeholder="VD: 20123456"
                                disabled={studentLoaded} // Khóa khi đã tìm thấy để user không sửa bậy
                            />
                        </div>
                        {studentLoaded ? (
                            <button 
                                onClick={() => { 
                                    setStudentLoaded(false); 
                                    setIsEmailVerified(false); 
                                    setFormData(initialForm); 
                                }}
                                className="h-[42px] px-4 bg-gray-100 text-gray-600 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Tìm lại
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleLookup}
                                disabled={loadingStudent || !formData.mssv}
                                className="h-[42px] px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 min-w-[120px]"
                            >
                                {loadingStudent ? 'Đang tìm...' : 'Tra cứu'}
                            </button>
                        )}
                    </div>

                    {/* Hiển thị thông tin sau khi tra cứu */}
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

            {/* BƯỚC 2: XÁC MINH EMAIL & SĐT */}
            <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-opacity duration-300 ${!studentLoaded ? 'opacity-50 pointer-events-none' : 'opacity-100'} ${isEmailVerified ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-yellow-500'}`}>
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Bước 2: Xác minh liên hệ</h3>
                    {isEmailVerified && <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">Đã xác minh</span>}
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Cột Email + OTP */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-slate-700">Email nhận thông báo <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isOtpSent || isEmailVerified}
                                    className="flex-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                                    placeholder="email@example.com"
                                />
                                {!isEmailVerified && !isOtpSent && (
                                    <button 
                                        onClick={handleSendOtp}
                                        disabled={otpLoading || !formData.email}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-50"
                                    >
                                        {otpLoading ? '...' : 'Gửi mã'}
                                    </button>
                                )}
                                {(isOtpSent || isEmailVerified) && !isEmailVerified && (
                                    <button 
                                        onClick={() => { setIsOtpSent(false); setOtp(''); }}
                                        className="bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm"
                                    >
                                        Sửa
                                    </button>
                                )}
                            </div>

                            {/* Ô nhập OTP */}
                            {isOtpSent && !isEmailVerified && (
                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 animate-in fade-in">
                                    <p className="text-xs text-yellow-800 mb-2">Mã xác thực đã gửi đến email của bạn.</p>
                                    <div className="flex gap-2">
                                        <input 
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="flex-1 border border-yellow-300 rounded px-2 py-1 text-center font-bold tracking-widest"
                                            placeholder="------"
                                            maxLength={6}
                                        />
                                        <button 
                                            onClick={handleVerifyOtp}
                                            className="bg-yellow-600 text-white px-4 rounded text-sm font-bold hover:bg-yellow-700"
                                        >
                                            OK
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {isEmailVerified && (
                                <p className="text-xs text-green-600 flex items-center mt-1">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                    Email đã được xác thực
                                </p>
                            )}
                        </div>

                        {/* Cột SĐT */}
                        <div>
                            <Input
                                label="Số điện thoại liên hệ"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="09xx..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* BƯỚC 3: ĐĂNG KÝ */}
            <div className={`transition-opacity duration-300 ${isEmailVerified ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start">
                        <span className="font-bold mr-2">!</span> {error}
                    </div>
                )}
                
                <button
                    onClick={handleSubmit}
                    disabled={submitLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Đang xử lý đăng ký...
                        </span>
                    ) : 'XÁC NHẬN ĐĂNG KÝ THI'}
                </button>
            </div>

        </div>

        {/* Sidebar Thông tin */}
        <aside className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-6">
                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Hướng dẫn đăng ký</h3>
                <ul className="text-sm text-slate-600 space-y-4">
                    <li className="flex gap-3">
                        <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                        <span>Nhập MSSV để hệ thống tự động tải thông tin cá nhân.</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                        <span>Kiểm tra kỹ thông tin. Nếu có sai sót về <b>Họ tên</b> hoặc <b>Ngày sinh</b>, vui lòng liên hệ phòng Đào tạo.</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                        <span>Xác thực Email bằng mã OTP để đảm bảo bạn nhận được Phiếu báo dự thi.</span>
                    </li>
                </ul>

                <div className="mt-6 pt-4 border-t border-slate-100">
                    <p className="text-sm font-semibold text-slate-700 mb-1">Cần hỗ trợ?</p>
                    <p className="text-sm text-slate-500">Hotline: <a href="tel:0965164445" className="text-blue-600 font-bold hover:underline">096 516 44 45</a></p>
                    <p className="text-sm text-slate-500">Email: <a href="mailto:support@exam.edu.vn" className="text-blue-600 hover:underline">support@exam.edu.vn</a></p>
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
};

export default Register;