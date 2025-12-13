const API_URL = import.meta.env.VITE_API_URL;

const defaultHeaders = () => ({
  'Content-Type': 'application/json',
});

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
    throw new Error(message);
  }
  return data;
};

const buildUrl = (path) => {
  if (!API_URL) {
    throw new Error('Thiếu cấu hình VITE_API_URL. Vui lòng kiểm tra file .env');
  }
  const base = API_URL.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
};

const request = async (path, options = {}) => {
  const response = await fetch(buildUrl(path), options);
  return handleResponse(response);
};

// --- PUBLIC APIS (Sinh viên) ---

export const getStudentById = (mssv) =>
  request(`/students?masv=${encodeURIComponent(mssv)}`, {
    method: 'GET',
    headers: defaultHeaders(),
  });

export const registerForExam = (payload) =>
  request('/registrations/register', {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(payload),
  });

// [MỚI] Hàm lấy đợt thi đang Active
// Lưu ý: Đường dẫn này phải khớp với Backend (ví dụ: /exam-rounds/active hoặc /examRoundRoutes/getRoundActive)
export const getActiveExamRound = () =>
  request('/exam-rounds/active', {
    method: 'GET',
    headers: defaultHeaders(),
  });

// [MỚI] Hàm gửi OTP (Để thay thế đoạn Mockup trong Register.jsx khi cần)
export const createOtp = (payload) =>
  request('/otp/create-otp', {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(payload),
  });

  export const verifyOtp = ({ email, otp }) =>
    request(`/otp/verify-otp?email=${email}&otp=${otp}`, {
      method: 'GET',
      headers: defaultHeaders(),
    });

// --- ADMIN APIS (Quản trị viên) ---

export const adminLogin = async (credentials) => {
  const data = await request('/admin/login', {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(credentials),
  });

  if (data?.token) {
    localStorage.setItem('exam_token', data.token);
  }
  return data;
};

const authHeaders = () => {
  const token = localStorage.getItem('exam_token');
  if (!token) return defaultHeaders();
  return {
    ...defaultHeaders(),
    Authorization: `Bearer ${token}`,
  };
};

export const getAdminStudents = () =>
  request('/admin/students', {
    method: 'GET',
    headers: authHeaders(),
  });

export const getAdminSessions = () =>
  request('/admin/sessions', {
    method: 'GET',
    headers: authHeaders(),
  });

export const createAdminSession = (payload) =>
  request('/admin/sessions', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

export const getAdminRegistrations = () =>
  request('/admin/registrations', {
    method: 'GET',
    headers: authHeaders(),
  });