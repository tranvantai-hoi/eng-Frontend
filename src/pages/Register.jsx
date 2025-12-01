import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input.jsx';
import api, { getStudentById } from '../services/api.js'; // Import api instance để gọi post

const initialForm = {
  mssv: '',
  fullName: '',
  dob: '',
  gender: '',
  faculty: '',
  email: '',
  phone: '',
};

const formatDateForInput = (isoDate) => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

const Register = () => {
  const [formData, setFormData] = useState(initialForm);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [studentLoaded, setStudentLoaded] = useState(false);
  
  // OTP States
  const [otp, setOtp] = useState(''); 
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  // Ở đây chúng ta không cần isEmailVerified state nữa vì OTP sẽ được gửi kèm khi bấm Đăng ký
  // Tuy nhiên để giữ flow UX: Gửi OTP -> Nhập -> Bấm Đăng ký (Gửi kèm OTP lên server check)

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Reset trạng thái OTP nếu đổi email
    if (name === 'email' && isOtpSent) {
        setIsOtpSent(false);
        setOtp('');
        setError('');
        setSuccessMsg('');
    }
  };

  const handleLookup = async () => {
    const mssvInput = formData.mssv.trim();
    if (!mssvInput) {
      setError('Vui lòng nhập Mã số sinh viên.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoadingStudent(true);
    setStudentLoaded(false);
    setIsOtpSent(false);
    setOtp('');
    setFormData(prev => ({ ...initialForm, mssv: mssvInput }));

    try {
      const response = await getStudentById(mssvInput);
      const data = response.data || response;

      if (!data || !data.fullName) {
        throw new Error('Không tìm thấy thông tin sinh viên.');
      }

      setFormData(prev => ({
        ...prev,
        fullName: data.fullName,
        dob: formatDateForInput(data.dob),
        gender: data.gender,
        faculty: data.faculty,
        email: data.email || '',
        phone: data.phone || '',
      }));

      setStudentLoaded(true);
      setSuccessMsg(`Đã tìm thấy sinh viên: ${data.fullName}`);

    } catch (err) {
      console.error("Lookup Error:", err);
      const msg = err.response?.status === 404 
        ? 'Không tìm thấy sinh viên này.' 
        : (err.response?.data?.message || 'Lỗi kết nối.');
      setError(msg);
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Email không hợp lệ.');
        return;
    }
    
    setOtpLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
        // Gọi API thực tế để gửi OTP
        const res = await api.post('/registrations/send-otp', {
            mssv: formData.mssv,
            email: formData.email
        });

        setIsOtpSent(true);
        setSuccessMsg(res.data.message);
        
        // --- DEBUG ONLY: Hiển thị OTP lên alert để test ---
        if (res.data.debugOtp) {
            alert(`[DEV MODE] Mã OTP của bạn là: ${res.data.debugOtp}`);
        }
        // -------------------------------------------------

    } catch (err) {
        console.error("OTP Error:", err);
        setError(err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
    } finally {
        setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentLoaded) return setError('Vui lòng tra cứu sinh viên trước.');
    if (!isOtpSent) return setError('Vui lòng gửi mã xác thực trước.');
    if (!otp || otp.length < 6) return setError('Vui lòng nhập đầy đủ mã OTP.');
    
    setSubmitLoading(true);
    setError('');
    
    try {
      // Gửi kèm OTP lên server để xác thực và đăng ký
      await api.post('/registrations', {
        mssv: formData.mssv,
        email: formData.email,
        phone: formData.phone,
        otp: otp
      });
      
      alert('Đăng ký thành công! Chuyển đến trang thanh toán...');
      navigate('/payment');
    } catch (err) {
      console.error("Register Error:", err);
      setError(err.response?.data?.message || 'Đăng ký thất bại. Mã OTP có thể không đúng.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg className="w-8 h-8 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Cổng Đăng Ký Dự Thi
              </h2>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Tra Cứu */}
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100/50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">1. Tra cứu thông tin</h3>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Input
                        label="Mã số sinh viên"
                        name="mssv"
                        value={formData.mssv}
                        onChange={handleChange}
                        placeholder="Nhập MSSV..."
                        required
                        className="bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleLookup}
                      disabled={loadingStudent}
                      className={`h-[42px] px-6 rounded-lg font-medium text-white shadow-sm transition-all min-w-[120px]
                        ${loadingStudent ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}
                    >
                      {loadingStudent ? 'Đang tìm...' : 'Tra cứu'}
                    </button>
                  </div>
                </div>

                {/* Thông Tin */}
                <div className={`space-y-6 transition-all duration-500 ${studentLoaded ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none select-none'}`}>
                  <h3 className="text-lg font-semibold text-slate-800">2. Xác nhận thông tin</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <Input label="Họ và tên" name="fullName" value={formData.fullName} onChange={() => {}} disabled className="bg-slate-50 font-semibold text-slate-700" />
                    <Input label="Ngày sinh" name="dob" type="date" value={formData.dob} onChange={() => {}} disabled className="bg-slate-50 text-slate-700" />
                    <Input label="Giới tính" name="gender" value={formData.gender} onChange={() => {}} disabled className="bg-slate-50 text-slate-700" />
                    <Input label="Lớp" name="faculty" value={formData.faculty} onChange={() => {}} disabled className="bg-slate-50 text-slate-700" />
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-sm text-slate-500 mb-4 italic">* Vui lòng nhập Email để nhận mã xác thực.</p>
                    
                    <div className="flex gap-2 items-end mb-4">
                        <div className="flex-1">
                            <Input
                                label="Email liên hệ"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                // Khóa khi đang gửi OTP để tránh sửa đổi
                                disabled={!studentLoaded || isOtpSent}
                                placeholder="Nhập email..."
                            />
                        </div>
                        {!isOtpSent && (
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={!studentLoaded || otpLoading}
                                className={`h-[42px] px-4 rounded-lg font-medium text-white shadow-sm whitespace-nowrap mb-[2px] min-w-[100px]
                                ${!studentLoaded || otpLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {otpLoading ? 'Đang gửi...' : 'Gửi mã'}
                            </button>
                        )}
                        {isOtpSent && (
                            <button
                                type="button"
                                onClick={() => setIsOtpSent(false)} // Cho phép sửa lại email
                                className="h-[42px] px-4 rounded-lg font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 mb-[2px]"
                            >
                                Gửi lại
                            </button>
                        )}
                    </div>

                    {isOtpSent && (
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 animate-fade-in-down mb-4">
                            <label className="text-xs font-bold text-indigo-800 uppercase block mb-1">Nhập mã OTP (6 số)</label>
                            <input 
                                type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-center tracking-widest text-lg font-bold"
                                placeholder="------"
                                maxLength={6}
                            />
                            <p className="text-xs text-indigo-500 mt-2 text-center">Mã xác thực đã được gửi vào email của bạn.</p>
                        </div>
                    )}

                    <Input
                        label="Số điện thoại"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        disabled={!studentLoaded}
                    />
                  </div>
                </div>

                {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r text-sm">{error}</div>}
                {successMsg && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r text-sm">{successMsg}</div>}

                <button 
                  type="submit" 
                  className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all transform duration-200
                    ${submitLoading || !studentLoaded || !isOtpSent
                        ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                        : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:scale-[1.01] hover:shadow-indigo-300'}`}
                  disabled={submitLoading || !studentLoaded || !isOtpSent}
                >
                  {submitLoading ? 'Đang kiểm tra & Đăng ký...' : 'Xác Thực & Đăng Ký'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 sticky top-6">
                <h3 className="font-bold text-slate-800 mb-3">Lưu ý quan trọng</h3>
                <ul className="text-sm text-slate-600 space-y-3 list-disc pl-4">
                    <li>Thông tin cá nhân được đồng bộ tự động.</li>
                    <li>Email là kênh duy nhất nhận Phiếu báo dự thi.</li>
                    <li>Nếu chưa nhận được OTP, vui lòng kiểm tra hòm thư Spam.</li>
                </ul>
            </div>
        </aside>
      </div>
    </div>
  );
};

export default Register;
