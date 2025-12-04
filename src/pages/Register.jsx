import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input.jsx';
// Import API
import { getStudentById, registerForExam, getActiveExamRound, sendOtp } from '../services/api.js';

// --- CẤU HÌNH ---
const STEPS = [
  { id: 1, title: 'Thông tin sinh viên', icon: 'fa-user-graduate' },
  { id: 2, title: 'Xác thực liên hệ', icon: 'fa-envelope-open-text' },
  { id: 3, title: 'Chọn đợt kiểm tra', icon: 'fa-calendar-alt' }, // Sửa nội dung
  { id: 4, title: 'Thanh toán', icon: 'fa-credit-card' },
];

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

// --- HELPERS ---
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

// Hàm hiển thị ngày đẹp (VD: 20/12/2024)
const formatDateDisplay = (dateString) => {
    if (!dateString) return '...';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('vi-VN');
};

const Register = () => {
  // --- STATES ---
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  
  // Loading & Error States
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Logic States
  const [studentLoaded, setStudentLoaded] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [mockOtpMessage, setMockOtpMessage] = useState(''); 

  // Session Data
  const [activeRounds, setActiveRounds] = useState([]); 
  const [roundLoading, setRoundLoading] = useState(false);
  
  // State lưu kết quả đăng ký
  const [registrationResult, setRegistrationResult] = useState(null);
  
  // State để hiển thị màn hình thành công
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  // --- EFFECTS ---
  useEffect(() => {
    const fetchActiveRounds = async () => {
      setRoundLoading(true);
      try {
        const res = await getActiveExamRound();
        let data = [];
        if (Array.isArray(res)) {
            data = res;
        } else if (res && res.data) {
            data = Array.isArray(res.data) ? res.data : [res.data];
        } else {
            data = [res];
        }

        const validRounds = data.filter(r => r && (r.id || r._id || r.MaDot));
        setActiveRounds(validRounds);

        if (validRounds.length === 1) {
            const r = validRounds[0];
            setFormData(prev => ({ ...prev, sessionId: r.id || r._id || r.MaDot }));
        }

      } catch (err) {
        console.error("Lỗi tải đợt kiểm tra:", err); // Sửa log
      } finally {
        setRoundLoading(false);
      }
    };
    fetchActiveRounds();
  }, []);

  // --- HANDLERS ---

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'email' && isEmailVerified) {
        setIsEmailVerified(false);
        setIsOtpSent(false);
        setOtp('');
        setMockOtpMessage('');
    }
  };

  const handleLookup = async () => {
    if (!formData.mssv.trim()) return setError('Vui lòng nhập Mã sinh viên.');
    setError('');
    setLoadingStudent(true);
    
    try {
      const res = await getStudentById(formData.mssv.trim());
      let data = Array.isArray(res) ? res[0] : (res.data || res);

      if (!data) throw new Error('Không tìm thấy thông tin sinh viên.');

      setFormData((prev) => ({
        ...prev,
        mssv: data.MaSV || prev.mssv,
        fullName: data.HoTen || data.fullName || '',
        dob: formatDate(data.NgaySinh || data.dob),
        gender: data.GioiTinh || data.gender || '', 
        faculty: data.Lop || data.lop || data.Khoa || data.faculty || '', 
        email: data.email || '', 
        phone: data.dienthoai || data.phone || '',
      }));
      
      setStudentLoaded(true);
      setError('');

    } catch (err) {
      console.error("Lỗi tra cứu:", err);
      setError(err.message === 'Failed to fetch' ? 'Lỗi kết nối Server.' : (err.message || 'Không tìm thấy sinh viên.'));
      setStudentLoaded(false);
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        return setError('Email không hợp lệ.');
    }
    setError('');
    setOtpLoading(true);
    setMockOtpMessage('');

    try {
        const res = await sendOtp({ email: formData.email });
        setIsOtpSent(true);
        // Sửa thông báo ở đây:
        setMockOtpMessage('Mã OTP đã được gửi đến email đăng ký, vui lòng kiểm tra email');
    } catch (err) {
        console.error("Lỗi gửi OTP:", err);
        setError(err.message || 'Gửi mã thất bại. Vui lòng thử lại.');
    } finally {
        setOtpLoading(false);
    }
  };

  const handleVerifyOtp = () => {
      if (!otp || otp.length < 6) {
          setError('Vui lòng nhập đủ 6 số OTP.');
          return;
      }
      setIsEmailVerified(true);
      setError('');
      setMockOtpMessage('');
  };

  const handleNextStep = async () => {
      if (currentStep === 1) {
          if (!studentLoaded) return setError("Vui lòng tra cứu sinh viên trước.");
      }
      if (currentStep === 2) {
          if (!isEmailVerified) return setError("Vui lòng xác thực Email trước.");
          if (!formData.phone) return setError("Vui lòng nhập số điện thoại.");
      }
      
      if (currentStep === 3) {
          if (!formData.sessionId) return setError("Vui lòng chọn một đợt kiểm tra."); // Sửa nội dung
          
          setError('');
          setSubmitLoading(true); 
          
          try {
              const payload = {
                mssv: formData.mssv.trim(),
                sessionId: formData.sessionId,
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                otp: otp,
                fullName: formData.fullName,
                dob: formData.dob,
                gender: formData.gender,
                faculty: formData.faculty
              };

              const response = await registerForExam(payload);
              setRegistrationResult(response);
              
              const regData = response.data || {};
              const status = regData.TrangThai || 'pending';

              if (status === 'pending') {
                  setCurrentStep(prev => prev + 1);
              } else {
                  setIsSuccess(true); 
              }
              
          } catch (err) {
              console.error("Lỗi đăng ký:", err);
              const msg = err.message || "";

              if (msg.includes('đã đăng ký') || msg.includes('already registered')) {
                  if(window.confirm("Bạn đã có hồ sơ đăng ký cho đợt kiểm tra này. Bạn có muốn chuyển đến bước thanh toán không?")) { // Sửa nội dung
                      setRegistrationResult({
                          success: true,
                          message: 'Đã có bản đăng ký trước đó',
                          data: { ...formData, TrangThai: 'pending' } 
                      });
                      setCurrentStep(prev => prev + 1);
                  }
                  return; 
              }

              setError(msg === 'Failed to fetch' ? 'Mất kết nối server.' : msg);
              return; 
          } finally {
              setSubmitLoading(false);
          }
          return;
      }
      
      setError('');
      setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
      setError('');
      setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setTimeout(() => {
        setSubmitLoading(false);
        setIsSuccess(true);
    }, 1500);
  };

  const selectedRound = activeRounds.find(r => (r.id || r._id || r.MaDot) === formData.sessionId);
  const isPaid = registrationResult?.data?.TrangThai === 'paid' || registrationResult?.data?.TrangThai === 'complete';

  // --- MÀN HÌNH SUCCESS ---
  if (isSuccess) {
      return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans text-slate-800 flex items-center justify-center">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center border border-slate-100">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-check text-4xl text-green-600"></i>
                </div>
                <h2 className="text-3xl font-bold text-blue-900 mb-2">Đăng Ký Thành Công!</h2>
                <p className="text-slate-500 mb-8">Hệ thống đã ghi nhận thông tin và thanh toán của bạn.</p>
                
                <div className="bg-slate-50 rounded-xl p-6 text-left space-y-3 border border-slate-200 mb-8">
                    <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Thông tin dự kiểm tra</h3> {/* Sửa nội dung */}
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Sinh viên:</span>
                        <span className="font-bold text-slate-800">{formData.fullName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">MSSV:</span>
                        <span className="font-bold text-slate-800">{formData.mssv}</span>
                    </div>
                    {selectedRound && (
                        <>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Đợt kiểm tra:</span> {/* Sửa nội dung */}
                                <span className="font-bold text-blue-700">{selectedRound.name || selectedRound.TenDot}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Ngày kiểm tra:</span> {/* Sửa nội dung */}
                                <span className="font-bold text-blue-700">{formatDateDisplay(selectedRound.date || selectedRound.NgayThi)}</span>
                            </div>
                        </>
                    )}
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-200 mt-2">
                        <span className="text-slate-500">Trạng thái:</span>
                        <span className="font-bold text-green-600">Đã thanh toán</span>
                    </div>
                </div>

                <button 
                    onClick={() => window.location.reload()} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
                >
                    Về trang chủ
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2 uppercase tracking-wide">Đăng Ký Kiểm Tra Năng Lực Tiếng Anh</h1> {/* Sửa tiêu đề chính */}
          <p className="text-slate-500">Hệ thống đăng ký trực tuyến & Thanh toán VNPay</p>
        </div>

        {/* STEPPER */}
        <div className="mb-8">
            <div className="flex justify-between items-center relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded"></div>
                <div 
                    className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 rounded transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                ></div>

                {STEPS.map((step) => {
                    const isActive = step.id <= currentStep;
                    const isCurrent = step.id === currentStep;
                    return (
                        <div key={step.id} className="flex flex-col items-center bg-slate-50 px-2">
                            <div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10
                                ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110' : 'bg-white border-slate-300 text-slate-400'}`}
                            >
                                <i className={`fas ${step.icon} text-sm`}></i>
                            </div>
                            <span className={`mt-2 text-xs font-bold uppercase transition-colors duration-300 ${isCurrent ? 'text-blue-700' : 'text-slate-400'}`}>
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* ERROR BOX */}
        {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm flex items-start animate-pulse">
                <i className="fas fa-exclamation-circle text-red-500 mt-1 mr-3"></i>
                <div>
                    <h4 className="text-sm font-bold text-red-700">Thông báo</h4>
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 relative min-h-[400px]">
            
            {/* --- BƯỚC 1: TRA CỨU --- */}
            {currentStep === 1 && (
                <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3"><i className="fas fa-search"></i></span>
                        Tra cứu thông tin sinh viên
                    </h2>
                    
                    <div className="flex gap-3 items-end mb-6">
                        <div className="flex-1">
                            <Input label="Mã số sinh viên (MSSV)" name="mssv" value={formData.mssv} onChange={handleChange} required placeholder="Ví dụ: 20123456" />
                        </div>
                        <button 
                            onClick={handleLookup} 
                            disabled={loadingStudent || !formData.mssv}
                            className="h-[42px] px-6 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 hover:shadow-lg transition-all min-w-[140px]"
                        >
                            {loadingStudent ? <><i className="fas fa-spinner fa-spin mr-2"></i> Đang tìm</> : 'Tra cứu'}
                        </button>
                    </div>

                    {studentLoaded && (
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-300">
                            <Input label="Họ và tên" value={formData.fullName} disabled className="bg-white font-semibold" />
                            <Input label="Ngày sinh" type="date" value={formData.dob} disabled className="bg-white" />
                            <Input label="Giới tính" value={formData.gender} disabled className="bg-white" />
                            <Input label="Lớp / Khoa" value={formData.faculty} disabled className="bg-white" />
                        </div>
                    )}
                </div>
            )}

            {/* --- BƯỚC 2: XÁC THỰC --- */}
            {currentStep === 2 && (
                <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3"><i className="fas fa-shield-alt"></i></span>
                        Xác thực thông tin liên hệ
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700">Email nhận thông báo <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input 
                                    type="email" name="email" value={formData.email} onChange={handleChange} 
                                    disabled={isOtpSent || isEmailVerified}
                                    className="flex-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
                                    placeholder="email@example.com"
                                />
                                {!isEmailVerified && !isOtpSent && (
                                    <button onClick={handleSendOtp} disabled={otpLoading || !formData.email} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all whitespace-nowrap disabled:opacity-50">
                                        {otpLoading ? '...' : 'Gửi mã'}
                                    </button>
                                )}
                                {(isOtpSent || isEmailVerified) && !isEmailVerified && (
                                    <button onClick={() => { setIsOtpSent(false); setOtp(''); setMockOtpMessage(''); }} className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-all">Sửa</button>
                                )}
                            </div>

                            {/* OTP Input & Message */}
                            {isOtpSent && !isEmailVerified && (
                                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 animate-in fade-in">
                                    {mockOtpMessage && (
                                        <div className="mb-3 p-3 bg-white rounded-lg border border-orange-200 text-sm text-orange-800 shadow-sm flex items-start">
                                            <i className="fas fa-info-circle mt-0.5 mr-2 text-orange-500"></i>
                                            {mockOtpMessage}
                                        </div>
                                    )}
                                    <p className="text-xs text-orange-800 mb-3 font-bold uppercase tracking-wide">Nhập mã xác thực:</p>
                                    <div className="flex gap-3">
                                        <input 
                                            value={otp} onChange={(e) => setOtp(e.target.value)}
                                            className="flex-1 border-2 border-orange-200 rounded-lg px-3 py-2 text-center font-bold tracking-[0.5em] text-lg focus:border-orange-500 outline-none"
                                            placeholder="------" maxLength={6}
                                        />
                                        <button onClick={handleVerifyOtp} className="bg-orange-600 text-white px-6 rounded-lg text-sm font-bold hover:bg-orange-700 shadow-md">OK</button>
                                    </div>
                                </div>
                            )}

                            {isEmailVerified && (
                                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-200 flex items-center text-sm font-medium">
                                    <i className="fas fa-check-circle text-lg mr-3"></i> Email đã được xác thực thành công.
                                </div>
                            )}
                        </div>

                        <div>
                            <Input label="Số điện thoại liên hệ" name="phone" value={formData.phone} onChange={handleChange} required placeholder="09xx..." />
                            <p className="text-xs text-slate-500 mt-2 italic">* Số điện thoại dùng để liên hệ khẩn cấp khi có thay đổi lịch kiểm tra.</p> {/* Sửa nội dung */}
                        </div>
                    </div>
                </div>
            )}

            {/* --- BƯỚC 3: CHỌN ĐỢT KIỂM TRA --- */}
            {currentStep === 3 && (
                <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3"><i className="fas fa-calendar-check"></i></span>
                        Lựa chọn đợt kiểm tra {/* Sửa nội dung */}
                    </h2>

                    {roundLoading ? (
                        <div className="text-center py-10"><i className="fas fa-circle-notch fa-spin text-3xl text-blue-500 mb-3"></i><p className="text-slate-500">Đang tải danh sách đợt kiểm tra...</p></div> // Sửa nội dung
                    ) : activeRounds.length > 0 ? (
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Danh sách đợt kiểm tra đang mở:</label> {/* Sửa nội dung */}
                            
                            <div className="relative">
                                <select 
                                    value={formData.sessionId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, sessionId: e.target.value }))}
                                    className="block w-full appearance-none rounded-xl border-2 border-slate-300 bg-white py-3 px-4 pr-10 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-0 font-medium text-lg cursor-pointer hover:border-blue-400 transition-colors"
                                >
                                    <option value="">-- Vui lòng chọn đợt kiểm tra --</option> {/* Sửa nội dung */}
                                    {activeRounds.map(round => (
                                        <option key={round.id || round._id || round.MaDot} value={round.id || round._id || round.MaDot}>
                                            {round.name || round.TenDot} (Ngày kiểm tra: {formatDate(round.date || round.NgayThi)}) {/* Sửa nội dung */}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    <i className="fas fa-chevron-down"></i>
                                </div>
                            </div>

                            {/* Thông tin chi tiết đợt thi đã chọn */}
                            {formData.sessionId && (
                                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h4 className="font-bold text-blue-800 text-lg mb-1">
                                            {activeRounds.find(r => (r.id || r._id || r.MaDot) === formData.sessionId)?.name || activeRounds.find(r => (r.id || r._id || r.MaDot) === formData.sessionId)?.TenDot}
                                        </h4>
                                        <p className="text-sm text-blue-600">
                                            <i className="far fa-clock mr-2"></i>
                                            Thời gian kiểm tra: <span className="font-bold">{formatDate(activeRounds.find(r => (r.id || r._id || r.MaDot) === formData.sessionId)?.date || activeRounds.find(r => (r.id || r._id || r.MaDot) === formData.sessionId)?.NgayThi)}</span> {/* Sửa nội dung */}
                                        </p>
                                    </div>
                                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-center border border-blue-100">
                                        <p className="text-xs text-slate-500 uppercase font-bold">Lệ phí kiểm tra</p> {/* Sửa nội dung */}
                                        <p className="text-xl font-bold text-red-600">500.000 VNĐ</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                            <i className="far fa-calendar-times text-4xl text-slate-300 mb-3"></i>
                            <p className="text-slate-500 font-medium">Hiện tại không có đợt kiểm tra nào đang mở đăng ký.</p> {/* Sửa nội dung */}
                        </div>
                    )}
                </div>
            )}

            {/* --- BƯỚC 4: THANH TOÁN --- */}
            {currentStep === 4 && (
                <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3"><i className="fas fa-money-check-alt"></i></span>
                        Thanh toán & Hoàn tất
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Thông tin tóm tắt */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                            <h3 className="font-bold text-slate-700 border-b border-slate-200 pb-2">Thông tin đăng ký</h3>
                            <div className="text-sm space-y-2">
                                <p className="flex justify-between"><span className="text-slate-500">Sinh viên:</span> <span className="font-semibold">{formData.fullName}</span></p>
                                <p className="flex justify-between"><span className="text-slate-500">MSSV:</span> <span className="font-semibold">{formData.mssv}</span></p>
                                
                                {selectedRound && (
                                    <div className="py-2 border-t border-b border-slate-100 my-2">
                                        <p className="flex justify-between mb-1"><span className="text-slate-500">Đợt kiểm tra:</span> <span className="font-bold text-blue-700">{selectedRound.name || selectedRound.TenDot}</span></p> {/* Sửa nội dung */}
                                        <p className="flex justify-between"><span className="text-slate-500">Ngày kiểm tra:</span> <span className="font-bold text-blue-700">{formatDateDisplay(selectedRound.date || selectedRound.NgayThi)}</span></p> {/* Sửa nội dung */}
                                    </div>
                                )}
                                
                                <div className="pt-2 text-lg">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-700">Tổng tiền:</span>
                                        <span className="font-bold text-red-600">500.000 đ</span>
                                    </div>
                                    
                                    {/* TRẠNG THÁI THANH TOÁN */}
                                    <div className="mt-3 flex justify-end">
                                        {isPaid ? (
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-green-200 shadow-sm flex items-center">
                                                <i className="fas fa-check-circle mr-2"></i> Đã thanh toán
                                            </span>
                                        ) : (
                                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-yellow-200 shadow-sm flex items-center">
                                                <i className="fas fa-clock mr-2"></i> Chưa thanh toán
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chọn phương thức thanh toán */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-700">Phương thức thanh toán</h3>
                            
                            <label className={`flex items-center p-4 border-2 border-blue-500 bg-blue-50 rounded-xl cursor-pointer shadow-sm relative overflow-hidden ${isPaid ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">KHUYÊN DÙNG</div>
                                <input type="radio" name="payment" defaultChecked disabled={isPaid} className="w-5 h-5 text-blue-600 focus:ring-blue-500 mr-4" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800">Ví VNPAY-QR</span>
                                        <img src="https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg" alt="VNPAY" className="h-6 object-contain" />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Quét mã QR trên ứng dụng ngân hàng hoặc ví VNPAY.</p>
                                </div>
                            </label>

                            <label className="flex items-center p-4 border border-slate-200 rounded-xl cursor-not-allowed opacity-60">
                                <input type="radio" name="payment" disabled className="w-5 h-5 text-slate-400 mr-4" />
                                <div className="flex-1">
                                    <span className="font-bold text-slate-500">Thẻ ATM / Visa / Master</span>
                                    <p className="text-xs text-slate-400 mt-1">Chức năng đang bảo trì.</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ACTION BUTTONS (Footer) --- */}
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-between items-center">
                {currentStep > 1 ? (
                    <button onClick={prevStep} className="px-6 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-200 transition-colors">
                        <i className="fas fa-arrow-left mr-2"></i> Quay lại
                    </button>
                ) : <div></div>}

                {currentStep < 4 ? (
                    <button 
                        onClick={handleNextStep} 
                        disabled={submitLoading} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitLoading ? 'Đang lưu...' : <>Tiếp theo <i className="fas fa-arrow-right ml-2"></i></>}
                    </button>
                ) : (
                    <button 
                        onClick={handleSubmit} 
                        disabled={submitLoading || isPaid}
                        className={`text-white px-10 py-3 rounded-lg font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                            ${isPaid ? 'bg-green-600 cursor-default' : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 hover:shadow-orange-200'}`}
                    >
                        {submitLoading ? 'Đang xử lý...' : isPaid ? 'ĐÃ THANH TOÁN THÀNH CÔNG' : 'THANH TOÁN NGAY'}
                    </button>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default Register;