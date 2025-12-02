import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input.jsx';
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

const Register = () => {
  const [formData, setFormData] = useState(initialForm);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentLoaded, setStudentLoaded] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLookup = async () => {
    if (!formData.mssv.trim()) {
      setError('Vui lòng nhập Mã sinh viên.');
      return;
    }
    setError('');
    setLoadingStudent(true);
    try {
      const data = await getStudentById(formData.mssv.trim());
      setFormData((prev) => ({
        ...prev,
        fullName: data.fullName || '',
        dob: data.dob || '',
        gender: data.gender || '',
        faculty: data.faculty || data.className || '',
        email: data.email || '',
        phone: data.phone || '',
      }));
      setStudentLoaded(true);
    } catch (err) {
      setError(err.message);
      setStudentLoaded(false);
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!studentLoaded) {
      setError('Vui lòng tra cứu Mã sinh viên trước khi đăng ký.');
      return;
    }
    if (!formData.email || !formData.phone) {
      setError('Email và số điện thoại là bắt buộc.');
      return;
    }
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
      setFormData(initialForm);
      setStudentLoaded(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="card space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Đăng ký thi</h1>
          <p className="text-sm text-slate-500">
            Nhập Mã sinh viên để đồng bộ thông tin sinh viên. Bạn vẫn có thể cập nhật email và
            số điện thoại.
          </p>
        </div>
        <div className="grid gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-end">
          <Input
            label="Mã số sinh viên"
            name="mssv"
            value={formData.mssv}
            onChange={handleChange}
            required
            placeholder="VD: 20123456"
          />
          <button
            type="button"
            onClick={handleLookup}
            className="btn-primary"
            disabled={loadingStudent}
          >
            {loadingStudent ? 'Đang tra cứu...' : 'Tra cứu'}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Họ tên"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={!studentLoaded}
            />
            <Input
              label="Ngày sinh"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              disabled={!studentLoaded}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Giới tính"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={!studentLoaded}
            />
            <Input
              label="Khoa / Lớp"
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              disabled={!studentLoaded}
            />
          </div>
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={!studentLoaded}
          />
          <Input
            label="Số điện thoại"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={!studentLoaded}
          />
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
          )}
          <button type="submit" className="btn-primary" disabled={submitLoading}>
            {submitLoading ? 'Đang gửi...' : 'Đăng ký thi'}
          </button>
        </form>
      </div>
      <aside className="space-y-4 text-sm text-slate-600">
        <div className="card space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Lưu ý</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Thông tin phải trùng khớp với hệ thống đào tạo.</li>
            <li>Email dùng để nhận lịch thi và phiếu báo danh.</li>
            <li>Số điện thoại hỗ trợ liên hệ khi có thay đổi lịch.</li>
          </ul>
        </div>
        <div className="card space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Hỗ trợ</h2>
          <p>
            Phòng Đào tạo, Tầng 1, Nhà điều hành. Hotline:{''}
            <a className="text-primary" href="tel:096 516 44 45">
            096 516 44 45
            </a>
          </p>
        </div>
      </aside>
    </section>
  );
};

export default Register;

